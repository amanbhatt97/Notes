// notes/dsa/dsa_trees.js — Trees
Object.assign(TOPIC_CONTENT, {
  "dsa_trees": `<main>
<h1>Trees</h1>
  <div class="where"><span>DSA</span><span>Trees &amp; Graphs</span><span>Trees</span></div>
  <p class="lead">A tree is data with a "belongs to" shape: categories inside categories, people under a manager, folders inside folders. It is also the shape that keeps data sorted <em>and</em> cheap to insert into. Binary trees and binary search trees are the most asked interview topic after arrays, and almost every tree problem is solved by one short recursive function that asks its two children a question. The whole note uses one running example: Biteful's 8 charges of the day (the same numbers as Complexity, Arrays, Hashing and Linked Lists), placed into a tree. Every output below is a real run (Python 3.13).</p>

  <h2 id="dsa-tr-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 640 262" width="640">
<defs><marker id="dsa-tr-ga" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="40" y="6" width="560" height="36" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="22" text-anchor="middle" class="tm" font-size="10">came from</text>
<text x="320" y="36" text-anchor="middle" font-size="11">Functions (recursion) · Linked Lists (nodes) · Stacks &amp; Queues (DFS, BFS) · Binary Search (halving)</text>
<line x1="320" y1="42" x2="320" y2="60" stroke="currentColor" marker-end="url(#dsa-tr-ga)"/>
<rect x="190" y="62" width="260" height="44" rx="8" class="fg sg" stroke-width="2.5"/>
<text x="320" y="80" text-anchor="middle" font-size="12" font-weight="700">Trees</text>
<text x="320" y="96" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE · hierarchies + ordered lookups</text>
<line x1="320" y1="106" x2="110" y2="136" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-tr-ga)"/>
<line x1="320" y1="106" x2="320" y2="136" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-tr-ga)"/>
<line x1="320" y1="106" x2="530" y2="136" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-tr-ga)"/>
<rect x="20" y="138" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="110" y="155" text-anchor="middle" font-size="12">Heaps</text>
<text x="110" y="170" text-anchor="middle" class="tm" font-size="10">a complete tree in a list</text>
<rect x="230" y="138" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="320" y="155" text-anchor="middle" font-size="12">Tries</text>
<text x="320" y="170" text-anchor="middle" class="tm" font-size="10">a tree of letters</text>
<rect x="440" y="138" width="180" height="40" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="530" y="155" text-anchor="middle" font-size="12">Graphs</text>
<text x="530" y="170" text-anchor="middle" class="tm" font-size="10">trees with cycles allowed</text>
<line x1="320" y1="178" x2="320" y2="208" stroke="currentColor" stroke-opacity="0.5" marker-end="url(#dsa-tr-ga)"/>
<rect x="60" y="210" width="520" height="44" rx="8" fill="none" stroke="currentColor" stroke-dasharray="4 4" stroke-opacity="0.5"/>
<text x="320" y="227" text-anchor="middle" class="tm" font-size="10">used again in</text>
<text x="320" y="245" text-anchor="middle" font-size="11">Backtracking (recursion trees) · DP on trees · database indexes (B-trees) · decision trees in ML</text>
</svg><figcaption>Trees opens the "Trees &amp; Graphs" group. It reuses recursion, the node idea from Linked Lists, the stack and queue from Stacks &amp; Queues, and the halving of Binary Search. Heaps (next) store a special tree inside a list.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="py_functions">Functions</a>, <a class="xref" data-note="dsa_linkedlist">Linked Lists</a>, <a class="xref" data-note="dsa_stacks">Stacks &amp; Queues</a>, <a class="xref" data-note="dsa_binsearch">Binary Search</a></b><span>You can write a recursive function, link nodes with <code>next</code> pointers, walk with a stack or a queue, and find an item in a sorted list in O(log n). But a sorted list costs O(n) for every insert, and none of these structures can show "this is inside that".</span></li>
    <li><b>This note adds: nodes with two children</b><span>Traversals (DFS three ways, BFS), the "ask your children" style of recursion, the binary search tree (sorted order with O(log n) insert when balanced), and the classic problem families: paths, lowest common ancestor, rebuilding a tree from its traversals.</span></li>
    <li><b>Leads to: <a class="xref" data-note="dsa_heaps">Heaps</a></b><span>A heap is a complete binary tree stored in a list, with a weaker order than a BST. Then <a class="xref" data-note="dsa_tries">Tries</a> and <a class="xref" data-note="dsa_graphs">Graphs</a>. Practice problems are in the <a class="xref" data-note="dsa_problems">Problem Tracker</a>.</span></li>
  </ol>

  <h2 id="dsa-tr-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it, and its weakness raises the next question. All numbers come from Biteful's charge tree and real runs.</p>
  <ol class="story">
    <li><b>The need</b><span>Q: how do we store "Desserts is inside Menu", and keep charges sorted while new ones keep arriving? → A list can show neither "inside" nor cheap sorted inserts (1 lakh <code>insort</code>s took about half a second, roughly 4× more for each doubling). We need nodes that point to children.</span></li>
    <li><b>Binary tree nodes</b><span>Q: how do we write such a structure in Python? → A <code>TreeNode</code> with <code>val, left, right</code>. The 8 charges make a 7-node tree with root 120 (the second ₹80 is a duplicate), height 3. But there is no single "next" node; in what order do we visit them?</span></li>
    <li><b>DFS: pre, in, post</b><span>Q: how do we visit every node? → Go deep first; "me" before, between or after the children. Pre 120 80 40 60 250 200 310; in 40 60 80 120 200 250 310 (sorted!); post 60 40 80 200 310 250 120. Traced recursively and with an explicit stack. But DFS mixes levels…</span></li>
    <li><b>BFS: level order</b><span>Q: what is on each level? → A queue: [[120], [80, 250], [40, 200, 310], [60]]. Now we can visit; how do we compute things about the whole tree?</span></li>
    <li><b>Post-order thinking</b><span>Q: height, longest path, balanced? → Ask both children first, then combine: height 3, diameter 5 (60 … 200), not balanced (at 80 the sides differ by 2). Why did inorder come out sorted?</span></li>
    <li><b>BST</b><span>Q: what rule makes lookups fast? → Left &lt; node &lt; right for whole subtrees. Our tree is exactly the charges inserted in arrival order. Search 200: 3 nodes. Insert 90: 2 steps. Validate with (low, high) bounds. But inserting sorted charges gives a 7-level chain…</span></li>
    <li><b>Balance</b><span>Q: why does shape matter? → Every BST cost is O(height): 500 sorted inserts give height 499, the balanced build 8. Self-balancing trees keep O(log n). Now: questions about paths from the root…</span></li>
    <li><b>Path problems</b><span>Q: which root-to-leaf path sums to ₹570? → Carry the remaining sum down: [120, 250, 200]. Paths are 300, 570, 680. What about the meeting point of two nodes?</span></li>
    <li><b>Lowest common ancestor</b><span>Q: deepest node above both 60 and 200? → 120 (they split there); for 40 and 60 it is 40 itself. Last: can we rebuild the tree if we only saved its traversals?</span></li>
    <li><b>Build from traversals</b><span>Q: rebuild from pre + in order? → Preorder gives the root (120), inorder splits left [40, 60, 80] from right [200, 250, 310]; recurse. Serialize with "#" for empty children to save and load a tree.</span></li>
  </ol>

  <h2 id="dsa-tr-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Trees</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Words</div>
        <ul>
          <li><b>Root</b>: the top node, no parent · <b>leaf</b>: no children</li>
          <li><b>Depth</b> of a node: edges from the root down to it</li>
          <li><b>Height</b> of a node: edges from it down to its deepest leaf</li>
          <li>⚠ LeetCode "max depth" counts <em>nodes</em>; textbooks count <em>edges</em></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Binary tree</div>
        <ul>
          <li><b>TreeNode</b>: <code>val, left, right</code>; missing child = <code>None</code></li>
          <li><b>Balanced</b>: height ≈ log₂ n · <b>skewed</b>: height ≈ n (a linked list)</li>
          <li><b>Complete</b>: levels full, last filled from left (heaps)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Traversals</div>
        <ul>
          <li><b>Preorder</b>: me, left, right (copy / serialize)</li>
          <li><b>Inorder</b>: left, me, right (BST → sorted)</li>
          <li><b>Postorder</b>: left, right, me (sizes, heights, delete)</li>
          <li><b>Level order (BFS)</b>: <code>deque</code>, loop <code>len(q)</code> times per level</li>
          <li>All are O(n) time; space O(h) for DFS, O(width) for BFS</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">BST</div>
        <ul>
          <li><b>Rule</b>: everything left &lt; node &lt; everything right (whole subtrees, not just children)</li>
          <li><b>Search / insert / delete</b>: O(h): O(log n) balanced, O(n) skewed</li>
          <li><b>Delete with 2 children</b>: copy the inorder successor, delete it below</li>
          <li><b>Validate</b>: pass (low, high) bounds down</li>
          <li><b>AVL / red-black</b>: rotate to keep h = O(log n)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Patterns</div>
        <ul>
          <li><b>Bottom-up</b>: ask children, combine (height, diameter, balanced)</li>
          <li><b>Top-down</b>: pass info down (bounds, running sum, depth)</li>
          <li><b>Backtracking path</b>: append, recurse, pop (all root-to-leaf paths)</li>
          <li><b>BFS</b>: "level", "right side view", "minimum depth"</li>
          <li><b>BST + inorder</b>: "kth smallest", "sorted", "successor"</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Running example</div>
        <ul>
          <li>Charges in arrival order: <b>120, 80, 250, 40, 310, 80, 60, 200</b></li>
          <li>Tree: 120 → (80 → (40 → right 60), 250 → (200, 310))</li>
          <li>Height 3 · diameter 5 · not balanced at 80</li>
          <li>Paths: 300, 570, 680 · LCA(60, 200) = 120</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Classic problems</div>
        <ul>
          <li><b>Max Depth, Invert</b>: 3-line recursion</li>
          <li><b>Validate BST</b>: bounds, not parent-only check</li>
          <li><b>LCA</b>: BST: walk by values · any tree: the node where both sides return something</li>
          <li><b>Diameter</b>: max of left + right depth at every node</li>
          <li><b>Construct, Serialize, Kth Smallest, Path Sum II</b></li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dsa-tr-need"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Hierarchies &amp; Ordered Lookups</span><span class="rm-sub">Why some data is not a line</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tr-vocab"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Words You Must Know</span><span class="rm-sub">Root, leaf, depth, height</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tr-node"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Binary Tree Nodes in Python</span><span class="rm-sub">TreeNode and a build helper</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tr-dfs"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Depth-First Traversals</span><span class="rm-sub">Pre, in, post; recursive and stack</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tr-bfs"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Breadth-First: Level Order</span><span class="rm-sub">deque, one level at a time</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tr-recur"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Post-Order Thinking</span><span class="rm-sub">Height, diameter, balanced</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tr-bst"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Binary Search Tree</span><span class="rm-sub">Search, insert, delete, validate</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tr-balance"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Balanced Trees</span><span class="rm-sub">Why height matters; AVL &amp; red-black idea</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tr-paths"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Path Problems</span><span class="rm-sub">Top-down sums, backtracking</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tr-lca"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Lowest Common Ancestor</span><span class="rm-sub">BST walk; any-tree recursion</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tr-build"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Build From Traversals</span><span class="rm-sub">Preorder + inorder; serialize</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tr-python"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Trees in Real Python</span><span class="rm-sub">No built-in; dicts, bisect, recursion limit</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tr-patterns"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Patterns</span><span class="rm-sub">Trigger words and templates</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tr-problems"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">More Classic Problems</span><span class="rm-sub">Max depth, invert, kth smallest</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tr-traps"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Parent-only BST check, edges vs nodes</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tr-connect"><span class="rm-num">16</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One diagram, one table</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tr-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note on one page</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tr-qa"><span class="rm-num">17</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="dsa-tr-need"><span class="num">01</span>Hierarchies and Fast Ordered Lookups</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Lists, stacks and queues are all lines: every item has at most one "next". Biteful has data that is not a line (categories inside categories) and a sorted collection that keeps growing (charges). What goes wrong if we force both into a list?</p>
  </div>
  <h3>Need 1: "inside", not "after"</h3>
  <p>Biteful's app shows restaurants by category. Indian holds North Indian and South Indian; Desserts holds Ice cream and Cakes. Every category sits inside exactly one parent, and can hold many categories of its own.</p>
<figure class="viz"><svg viewBox="0 0 600 226" width="600">
<line x1="300" y1="30" x2="110" y2="100" stroke="currentColor"/>
<line x1="300" y1="30" x2="300" y2="100" stroke="currentColor"/>
<line x1="300" y1="30" x2="490" y2="100" stroke="currentColor"/>
<line x1="110" y1="100" x2="50" y2="170" stroke="currentColor"/>
<line x1="110" y1="100" x2="170" y2="170" stroke="currentColor"/>
<line x1="490" y1="100" x2="430" y2="170" stroke="currentColor"/>
<line x1="490" y1="100" x2="550" y2="170" stroke="currentColor"/>
<rect x="254" y="16" width="92" height="28" rx="6" class="fb sb"/><text x="300" y="34" text-anchor="middle" font-size="11">Menu</text>
<rect x="64" y="86" width="92" height="28" rx="6" class="ft st"/><text x="110" y="104" text-anchor="middle" font-size="11">Indian</text>
<rect x="254" y="86" width="92" height="28" rx="6" class="fg sg"/><text x="300" y="104" text-anchor="middle" font-size="11">Chinese</text>
<rect x="444" y="86" width="92" height="28" rx="6" class="ft st"/><text x="490" y="104" text-anchor="middle" font-size="11">Desserts</text>
<rect x="4" y="156" width="92" height="28" rx="6" class="fg sg"/><text x="50" y="174" text-anchor="middle" font-size="11">North</text>
<rect x="124" y="156" width="92" height="28" rx="6" class="fg sg"/><text x="170" y="174" text-anchor="middle" font-size="11">South</text>
<rect x="384" y="156" width="92" height="28" rx="6" class="fg sg"/><text x="430" y="174" text-anchor="middle" font-size="11">Ice cream</text>
<rect x="504" y="156" width="92" height="28" rx="6" class="fg sg"/><text x="550" y="174" text-anchor="middle" font-size="11">Cakes</text>
<text x="300" y="214" text-anchor="middle" class="tm" font-size="11">every category sits inside exactly one parent; a list cannot show "inside"</text>
</svg><figcaption>Biteful's restaurant categories: a hierarchy. Menu is the root; Indian and Desserts have sub-categories; North, South, Chinese, Ice cream and Cakes are leaves.</figcaption></figure>
  <p>A list cannot show this well. A list says "this comes after that". Categories say "this is <strong>inside</strong> that". File folders, family trees (one father each), company org charts (one boss each), the HTML of a web page (the DOM) and the moves of a chess game all have the same shape.</p>
  <h3>Need 2: sorted, and cheap to insert into</h3>
  <p>Finance keeps the day's charges sorted to answer "the next charge above ₹100?" with binary search (previous note). But charges arrive all day, and inserting into a sorted list shifts every bigger item: O(n) per insert.</p>
<div class="fx" data-lang="py">import random, time
from bisect import insort

def build_sorted(n):
    random.seed(3)
    a, t = [], time.perf_counter()
    for _ in range(n):
        insort(a, random.randint(1, 10**9))        # binary search for the spot, then shift
    return time.perf_counter() - t

for n in [25_000, 50_000, 100_000]:
    print(f"{n:&gt;7,} sorted inserts: {build_sorted(n):.2f} s")</div>
  <div class="fx" data-lang="text"> 25,000 sorted inserts: 0.04 s
 50,000 sorted inserts: 0.15 s
100,000 sorted inserts: 0.53 s</div>
  <p>Each doubling makes it roughly 4× slower: O(n) per insert, O(n²) in total. A tree where each node sends smaller values left and bigger values right keeps the data sorted and lets an insert walk just one path from the top. If the tree is bushy, that path is short: a million items fit in about 20 levels.</p>
  <h3>The running example</h3>
  <p>Biteful's 8 charges of the day, in the order they arrived (the same numbers as the other DSA notes):</p>
  <table class="tbl"><caption>The running example</caption>
    <tr><th>arrival</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th></tr>
    <tr><td>charge (₹)</td><td>120</td><td>80</td><td>250</td><td>40</td><td>310</td><td>80</td><td>60</td><td>200</td></tr>
  </table>
  <p>From section 02 on, these charges live in one binary tree (the second ₹80 is a duplicate and is not stored twice). Section 07 reveals the simple rule that produced its shape.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Finding a flat in a city: state → city → area → building → floor → flat. At each step you pick one branch and ignore all the others. Six choices find one flat among millions. Where it breaks: a real address is fixed; in a tree program, you must decide the rule for "which branch" (that is what a binary search tree does).</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>tree</strong> is a set of nodes joined by parent → child links, with exactly one node at the top (the root), every other node having exactly one parent, and no loops. A tree with n nodes has n − 1 links.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Thinking a tree must be "sorted". A tree is only a shape. The category tree has no order at all; only a binary <em>search</em> tree adds the left-smaller, right-bigger rule.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Words You Must Know.</b> We have pictures of trees but no precise words for "how deep is this node" or "how tall is that branch". Every later section and every interviewer uses them.</div>

  <h2 id="dsa-tr-vocab"><span class="num">02</span>Words You Must Know</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>To talk about cost ("a search walks one path from the root") we need names for positions and sizes in a tree. What exactly are depth, height, leaf and subtree, measured on our charge tree?</p>
  </div>
  <p>Interviewers use these words without explaining them. Learn them on one picture: Biteful's charge tree.</p>
<figure class="viz"><svg viewBox="0 0 600 304" width="600">
<line x1="320" y1="40" x2="180" y2="110" stroke="currentColor"/>
<line x1="320" y1="40" x2="460" y2="110" stroke="currentColor"/>
<line x1="180" y1="110" x2="110" y2="180" stroke="currentColor"/>
<line x1="110" y1="180" x2="160" y2="250" stroke="currentColor"/>
<line x1="460" y1="110" x2="400" y2="180" stroke="currentColor"/>
<line x1="460" y1="110" x2="520" y2="180" stroke="currentColor"/>
<circle cx="320" cy="40" r="17" class="fb sb"/><text x="320" y="44" text-anchor="middle" font-size="12">120</text>
<circle cx="180" cy="110" r="17" class="fb sb"/><text x="180" y="114" text-anchor="middle" font-size="12">80</text>
<circle cx="460" cy="110" r="17" class="fb sb"/><text x="460" y="114" text-anchor="middle" font-size="12">250</text>
<circle cx="110" cy="180" r="17" class="fb sb"/><text x="110" y="184" text-anchor="middle" font-size="12">40</text>
<circle cx="400" cy="180" r="17" class="fg sg"/><text x="400" y="184" text-anchor="middle" font-size="12">200</text>
<circle cx="520" cy="180" r="17" class="fg sg"/><text x="520" y="184" text-anchor="middle" font-size="12">310</text>
<circle cx="160" cy="250" r="17" class="fg sg"/><text x="160" y="254" text-anchor="middle" font-size="12">60</text>
<rect x="80" y="84" width="140" height="190" rx="10" fill="none" class="sg" stroke-dasharray="5 4"/>
<text x="344" y="44" class="tb" font-size="11">root (no parent)</text>
<text x="20" y="44" class="tm" font-size="11">depth 0</text>
<text x="20" y="114" class="tm" font-size="11">depth 1</text>
<text x="20" y="184" class="tm" font-size="11">depth 2</text>
<text x="20" y="254" class="tm" font-size="11">depth 3</text>
<text x="186" y="254" class="tg" font-size="11">leaf · height 0</text>
<text x="400" y="214" text-anchor="middle" class="tg" font-size="11">leaf</text>
<text x="520" y="214" text-anchor="middle" class="tg" font-size="11">leaf</text>
<text x="484" y="114" class="tm" font-size="11">height 1</text>
<text x="204" y="104" class="tm" font-size="11">height 2</text>
<text x="460" y="150" text-anchor="middle" class="tm" font-size="10">← siblings →</text>
<text x="250" y="66" class="tm" font-size="10">edge</text>
<text x="150" y="294" text-anchor="middle" class="tg" font-size="11">subtree of 80</text>
<text x="420" y="290" text-anchor="middle" font-size="12">7 nodes · 6 edges · height of the tree = 3</text>
</svg><figcaption>Biteful's charge tree with all the words. Depth is counted from the top down, height from the bottom up. The dashed box is the subtree rooted at 80. Leaves (green): 60, 200, 310.</figcaption></figure>
  <table class="tbl">
    <tr><th>Word</th><th>Plain meaning</th><th>On the charge tree</th></tr>
    <tr><td><strong>Edge</strong></td><td>One parent → child link</td><td>6 edges (always n − 1 for n = 7 nodes)</td></tr>
    <tr><td><strong>Root / leaf</strong></td><td>No parent / no children</td><td>120 / 60, 200, 310</td></tr>
    <tr><td><strong>Ancestor / descendant</strong></td><td>Anyone on the path up / anyone below</td><td>120, 80, 40 are ancestors of 60</td></tr>
    <tr><td><strong>Depth</strong> of a node</td><td>Edges from the root down to it</td><td>depth(60) = 3; level 2 = {40, 200, 310}</td></tr>
    <tr><td><strong>Height</strong> of a node</td><td>Edges on the longest path from it down to a leaf</td><td>height(80) = 2, height(250) = 1, height(leaf) = 0</td></tr>
    <tr><td><strong>Height of the tree</strong></td><td>Height of the root = max depth of any node</td><td>3</td></tr>
    <tr><td><strong>Subtree</strong></td><td>A node and everything below it</td><td>subtree of 80 = {80, 40, 60}</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Depth</strong>(v) = number of edges from the root to v. <strong>Height</strong>(v) = number of edges on the longest downward path from v to a leaf. The height of the tree is height(root), which equals the largest depth.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Edges or nodes? Textbooks: a lone leaf has height 0 (edges). LeetCode "Maximum Depth": a lone node has depth 1 (nodes). Our tree: height 3 in edges, "max depth" 4 in nodes. Both are fine; say which one you use before you code. The two differ by exactly 1.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Binary Tree Nodes in Python.</b> We can describe the tree on paper. Now we need it in code: what object is a node, and how do we build the charge tree without typing a dozen lines?</div>

  <h2 id="dsa-tr-node"><span class="num">03</span>Binary Tree Nodes in Python</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A linked list node has one <code>next</code>. What does a node with children look like in Python, and how do we measure size and height of the whole tree from the root alone?</p>
  </div>
  <p>A <strong>binary tree</strong> is a tree where every node has at most two children, called <code>left</code> and <code>right</code>. Interviews use it 90% of the time because two children make code short. In Python it is one tiny class: a value and two links, exactly like a linked list node with two <code>next</code> pointers.</p>
<div class="fx" data-lang="py">class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val = val
        self.left = left       # left child, or None
        self.right = right     # right child, or None

#          120
#         /    \\
#       80      250
#      /       /   \\
#    40      200   310
#      \\
#       60
root = TreeNode(120,
                TreeNode(80, TreeNode(40, None, TreeNode(60))),
                TreeNode(250, TreeNode(200), TreeNode(310)))
print(root.val, root.left.val, root.right.val, root.left.left.right.val)
print(root.left.right)            # a missing child is just None</div>
  <div class="fx" data-lang="text">120 80 250 60
None</div>
  <p>Typing nested <code>TreeNode(...)</code> calls gets painful. LeetCode writes trees as a list read level by level, with <code>None</code> for a missing child. Our tree is <code>[120, 80, 250, 40, None, 200, 310, None, 60]</code>: level 1 is 80, 250; then 80's children 40 and None, 250's children 200 and 310; then 40's children None and 60. This helper turns that list into nodes. Every example below uses it, along with two tiny measuring functions.</p>
<div class="fx" data-lang="py">from collections import deque

def build(values):
    """[1, 2, 3, None, 5] -&gt; tree, filled level by level (LeetCode format)."""
    if not values or values[0] is None:
        return None
    root = TreeNode(values[0])
    q, i = deque([root]), 1
    while q and i &lt; len(values):
        node = q.popleft()
        if i &lt; len(values) and values[i] is not None:
            node.left = TreeNode(values[i])
            q.append(node.left)
        i += 1
        if i &lt; len(values) and values[i] is not None:
            node.right = TreeNode(values[i])
            q.append(node.right)
        i += 1
    return root

def height(node):          # edges on the longest path down to a leaf
    if node is None:
        return -1          # so a lone leaf gets 0
    return 1 + max(height(node.left), height(node.right))

def size(node):            # number of nodes
    if node is None:
        return 0
    return 1 + size(node.left) + size(node.right)

CHARGES = [120, 80, 250, 40, None, 200, 310, None, 60]
t = build(CHARGES)
print("size", size(t), "height", height(t))
print("one node:", height(build([7])), " empty:", height(build([])))</div>
  <div class="fx" data-lang="text">size 7 height 3
one node: 0  empty: -1</div>
  <p>Look at <code>height</code>: "my height is one more than my taller child". The empty tree returns −1 so that a leaf gets −1 + 1 = 0. On our tree: 60 → 0, 40 → 1, 80 → 2, root → 1 + max(2, 1) = 3. This "ask the children, add myself" shape is the whole of tree programming. You will see it again in every problem.</p>
  <p>Four shape names you will hear: <strong>full</strong> (every node has 0 or 2 children), <strong>complete</strong> (every level full except the last, filled from the left; heaps), <strong>perfect</strong> (every level full: 2<sup>h+1</sup> − 1 nodes) and <strong>skewed</strong> (one child each: really a linked list, height n − 1). Our tree is none of the first three: 80 has one child.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>binary tree</strong> is either empty (<code>None</code>) or a node with a value and two binary trees, its left and right subtrees. This recursive definition is why recursive functions fit trees so well.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Reading <code>node.left.val</code> without checking <code>node.left</code>. A missing child is <code>None</code>, and <code>None.val</code> crashes with <code>AttributeError</code>. Every function starts with "if node is None: return …".</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Depth-First Traversals.</b> We can build the tree and measure it. But "print every charge in the tree" has no obvious order: after 120, is the next node 80, 250, or 40?</div>

  <h2 id="dsa-tr-dfs"><span class="num">04</span>Depth-First Traversals</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A list is visited left to right. A tree has no single "next", so we must pick an order. Which orders exist, what does each one give on the charge tree, and how does recursion (or our own stack) produce them?</p>
  </div>
  <p><strong>Depth-first</strong> means: go as deep as possible down one branch before trying the next one, like exploring a maze by always taking the leftmost corridor until it ends, then stepping back. At every node there are three jobs: handle me, visit my left subtree, visit my right subtree. The three classic orders differ only in <strong>when "me" happens</strong>.</p>
<figure class="viz"><svg viewBox="0 0 650 172" width="650">
<line x1="109" y1="39" x2="51" y2="68" stroke="currentColor"/>
<line x1="109" y1="39" x2="168" y2="68" stroke="currentColor"/>
<line x1="51" y1="68" x2="21" y2="98" stroke="currentColor"/>
<line x1="21" y1="98" x2="42" y2="127" stroke="currentColor"/>
<line x1="168" y1="68" x2="143" y2="98" stroke="currentColor"/>
<line x1="168" y1="68" x2="193" y2="98" stroke="currentColor"/>
<circle cx="109" cy="39" r="12" class="fb sb"/><text x="109" y="43" text-anchor="middle" font-size="10">120</text>
<circle cx="51" cy="68" r="12" class="fb sb"/><text x="51" y="72" text-anchor="middle" font-size="10">80</text>
<circle cx="168" cy="68" r="12" class="fb sb"/><text x="168" y="72" text-anchor="middle" font-size="10">250</text>
<circle cx="21" cy="98" r="12" class="fb sb"/><text x="21" y="102" text-anchor="middle" font-size="10">40</text>
<circle cx="143" cy="98" r="12" class="fb sb"/><text x="143" y="102" text-anchor="middle" font-size="10">200</text>
<circle cx="193" cy="98" r="12" class="fb sb"/><text x="193" y="102" text-anchor="middle" font-size="10">310</text>
<circle cx="42" cy="127" r="12" class="fb sb"/><text x="42" y="131" text-anchor="middle" font-size="10">60</text>
<text x="122" y="28" class="tr" font-size="10">#1</text>
<text x="64" y="57" class="tr" font-size="10">#2</text>
<text x="34" y="87" class="tr" font-size="10">#3</text>
<text x="55" y="116" class="tr" font-size="10">#4</text>
<text x="181" y="57" class="tr" font-size="10">#5</text>
<text x="156" y="87" class="tr" font-size="10">#6</text>
<text x="206" y="87" class="tr" font-size="10">#7</text>
<text x="110" y="16" text-anchor="middle" class="tb" font-size="11">preorder: me, L, R</text>
<text x="110" y="160" text-anchor="middle" font-size="11">120 80 40 60 250 200 310</text>
<line x1="324" y1="39" x2="266" y2="68" stroke="currentColor"/>
<line x1="324" y1="39" x2="383" y2="68" stroke="currentColor"/>
<line x1="266" y1="68" x2="236" y2="98" stroke="currentColor"/>
<line x1="236" y1="98" x2="257" y2="127" stroke="currentColor"/>
<line x1="383" y1="68" x2="358" y2="98" stroke="currentColor"/>
<line x1="383" y1="68" x2="408" y2="98" stroke="currentColor"/>
<circle cx="324" cy="39" r="12" class="fb sb"/><text x="324" y="43" text-anchor="middle" font-size="10">120</text>
<circle cx="266" cy="68" r="12" class="fb sb"/><text x="266" y="72" text-anchor="middle" font-size="10">80</text>
<circle cx="383" cy="68" r="12" class="fb sb"/><text x="383" y="72" text-anchor="middle" font-size="10">250</text>
<circle cx="236" cy="98" r="12" class="fb sb"/><text x="236" y="102" text-anchor="middle" font-size="10">40</text>
<circle cx="358" cy="98" r="12" class="fb sb"/><text x="358" y="102" text-anchor="middle" font-size="10">200</text>
<circle cx="408" cy="98" r="12" class="fb sb"/><text x="408" y="102" text-anchor="middle" font-size="10">310</text>
<circle cx="257" cy="127" r="12" class="fb sb"/><text x="257" y="131" text-anchor="middle" font-size="10">60</text>
<text x="249" y="87" class="tr" font-size="10">#1</text>
<text x="270" y="116" class="tr" font-size="10">#2</text>
<text x="279" y="57" class="tr" font-size="10">#3</text>
<text x="337" y="28" class="tr" font-size="10">#4</text>
<text x="371" y="87" class="tr" font-size="10">#5</text>
<text x="396" y="57" class="tr" font-size="10">#6</text>
<text x="421" y="87" class="tr" font-size="10">#7</text>
<text x="325" y="16" text-anchor="middle" class="tb" font-size="11">inorder: L, me, R</text>
<text x="325" y="160" text-anchor="middle" font-size="11">40 60 80 120 200 250 310</text>
<line x1="539" y1="39" x2="481" y2="68" stroke="currentColor"/>
<line x1="539" y1="39" x2="598" y2="68" stroke="currentColor"/>
<line x1="481" y1="68" x2="451" y2="98" stroke="currentColor"/>
<line x1="451" y1="98" x2="472" y2="127" stroke="currentColor"/>
<line x1="598" y1="68" x2="573" y2="98" stroke="currentColor"/>
<line x1="598" y1="68" x2="623" y2="98" stroke="currentColor"/>
<circle cx="539" cy="39" r="12" class="fb sb"/><text x="539" y="43" text-anchor="middle" font-size="10">120</text>
<circle cx="481" cy="68" r="12" class="fb sb"/><text x="481" y="72" text-anchor="middle" font-size="10">80</text>
<circle cx="598" cy="68" r="12" class="fb sb"/><text x="598" y="72" text-anchor="middle" font-size="10">250</text>
<circle cx="451" cy="98" r="12" class="fb sb"/><text x="451" y="102" text-anchor="middle" font-size="10">40</text>
<circle cx="573" cy="98" r="12" class="fb sb"/><text x="573" y="102" text-anchor="middle" font-size="10">200</text>
<circle cx="623" cy="98" r="12" class="fb sb"/><text x="623" y="102" text-anchor="middle" font-size="10">310</text>
<circle cx="472" cy="127" r="12" class="fb sb"/><text x="472" y="131" text-anchor="middle" font-size="10">60</text>
<text x="485" y="116" class="tr" font-size="10">#1</text>
<text x="464" y="87" class="tr" font-size="10">#2</text>
<text x="494" y="57" class="tr" font-size="10">#3</text>
<text x="586" y="87" class="tr" font-size="10">#4</text>
<text x="636" y="87" class="tr" font-size="10">#5</text>
<text x="611" y="57" class="tr" font-size="10">#6</text>
<text x="552" y="28" class="tr" font-size="10">#7</text>
<text x="540" y="16" text-anchor="middle" class="tb" font-size="11">postorder: L, R, me</text>
<text x="540" y="160" text-anchor="middle" font-size="11">60 40 80 200 310 250 120</text>
</svg><figcaption>The same tree visited three ways. Red #k is the step at which that node is handled. Only the position of "me" changes: before, between, or after the two subtrees. Inorder comes out sorted; section 07 explains why.</figcaption></figure>
  <h3>Recognise it</h3>
  <p>Trigger words: "traverse", "visit every node", "copy / serialize" (pre), "sorted order of a BST" (in), "compute from children first: height, size, delete" (post).</p>
  <h3>Recursive: three functions, one line moved</h3>
<div class="fx" data-lang="py">def preorder(node, out):
    if node:
        out.append(node.val)          # 1. me
        preorder(node.left, out)      # 2. left subtree
        preorder(node.right, out)     # 3. right subtree
    return out

def inorder(node, out):
    if node:
        inorder(node.left, out)       # 1. left subtree
        out.append(node.val)          # 2. me
        inorder(node.right, out)      # 3. right subtree
    return out

def postorder(node, out):
    if node:
        postorder(node.left, out)     # 1. left subtree
        postorder(node.right, out)    # 2. right subtree
        out.append(node.val)          # 3. me, last
    return out

t = build(CHARGES)
print("pre ", preorder(t, []))
print("in  ", inorder(t, []))
print("post", postorder(t, []))</div>
  <div class="fx" data-lang="text">pre  [120, 80, 40, 60, 250, 200, 310]
in   [40, 60, 80, 120, 200, 250, 310]
post [60, 40, 80, 200, 310, 250, 120]</div>
  <p>Notice the inorder line: 40, 60, 80, 120, 200, 250, 310 is the charges <strong>sorted</strong>. That is not luck; section 07 explains it.</p>
  <h3>Traced recursively</h3>
  <p>What does Python actually do for preorder? Each call is pushed on the call stack and waits while its children run. This version prints one line per call, indented by depth:</p>
<div class="fx" data-lang="py">def preorder_trace(node, depth=0):
    pad = "    " * depth
    if node is None:
        return
    print(f"{pad}visit {node.val}  (call stack depth {depth + 1})")
    preorder_trace(node.left, depth + 1)
    preorder_trace(node.right, depth + 1)

preorder_trace(t)</div>
  <div class="fx" data-lang="text">visit 120  (call stack depth 1)
    visit 80  (call stack depth 2)
        visit 40  (call stack depth 3)
            visit 60  (call stack depth 4)
    visit 250  (call stack depth 2)
        visit 200  (call stack depth 3)
        visit 310  (call stack depth 3)</div>
  <p>The deepest line is 60 at depth 4: four calls (120, 80, 40, 60) were waiting on the call stack at that moment. That is the "O(h) space" of DFS: one frame per level of the current path.</p>
  <h3>Iterative: your own stack</h3>
  <p>Recursion uses Python's call stack behind the scenes. Python stops at about 1000 nested calls (<code>RecursionError</code>). A skewed tree of 5,000 nodes breaks the recursive version. The cure: keep the stack yourself in a list (the stack from the previous group of notes). Interviewers also ask for this to check you understand what recursion really does.</p>
  <table class="tbl out"><caption>Preorder with an explicit stack on the charge tree (stack written bottom → top)</caption>
    <tr><th>pop</th><th>output so far</th><th>push (right first, then left)</th><th>stack after</th></tr>
    <tr><td>–</td><td>–</td><td>120</td><td>120</td></tr>
    <tr><td>120</td><td>120</td><td>250, 80</td><td>250 80</td></tr>
    <tr><td>80</td><td>120 80</td><td>40 (no right child)</td><td>250 40</td></tr>
    <tr><td>40</td><td>120 80 40</td><td>60 (no left child)</td><td>250 60</td></tr>
    <tr><td>60</td><td>… 40 60</td><td>–</td><td>250</td></tr>
    <tr><td>250</td><td>… 60 250</td><td>310, 200</td><td>310 200</td></tr>
    <tr><td>200</td><td>… 250 200</td><td>–</td><td>310</td></tr>
    <tr><td>310</td><td>120 80 40 60 250 200 310</td><td>–</td><td>(empty)</td></tr>
  </table>
<div class="fx" data-lang="py">def preorder_iter(root, trace=False):
    out, stack = [], [root] if root else []
    while stack:
        node = stack.pop()
        out.append(node.val)
        if node.right: stack.append(node.right)   # push right first...
        if node.left:  stack.append(node.left)    # ...so left pops first
        if trace: print(f"pop {node.val:3}  stack={[n.val for n in stack]}")
    return out

def inorder_iter(root, trace=False):
    out, stack, cur = [], [], root
    while cur or stack:
        while cur:                  # walk left as far as possible
            stack.append(cur)
            cur = cur.left
        cur = stack.pop()           # leftmost node not yet visited
        out.append(cur.val)
        if trace: print(f"pop {cur.val:3}  stack={[n.val for n in stack]}  out={out}")
        cur = cur.right             # now do its right subtree
    return out

def postorder_iter(root):
    out, stack = [], [root] if root else []
    while stack:
        node = stack.pop()
        out.append(node.val)        # builds me, right, left ...
        if node.left:  stack.append(node.left)
        if node.right: stack.append(node.right)
    return out[::-1]                # ... reversed: left, right, me

print(preorder_iter(t, trace=True))
print(inorder_iter(t, trace=True))
print(postorder_iter(t))
print(preorder_iter(None), inorder_iter(None), postorder_iter(None))</div>
  <div class="fx" data-lang="text">pop 120  stack=[250, 80]
pop  80  stack=[250, 40]
pop  40  stack=[250, 60]
pop  60  stack=[250]
pop 250  stack=[310, 200]
pop 200  stack=[310]
pop 310  stack=[]
[120, 80, 40, 60, 250, 200, 310]
pop  40  stack=[120, 80]  out=[40]
pop  60  stack=[120, 80]  out=[40, 60]
pop  80  stack=[120]  out=[40, 60, 80]
pop 120  stack=[]  out=[40, 60, 80, 120]
pop 200  stack=[250]  out=[40, 60, 80, 120, 200]
pop 250  stack=[]  out=[40, 60, 80, 120, 200, 250]
pop 310  stack=[]  out=[40, 60, 80, 120, 200, 250, 310]
[40, 60, 80, 120, 200, 250, 310]
[60, 40, 80, 200, 310, 250, 120]
[] [] []</div>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>A stack is last-in-first-out, so push the child you want <em>later</em> first. Inorder is the odd one: "slide left, pushing everything; pop one; go right once; repeat". On our tree it first pushes 120, 80, 40, pops 40, then slides into 40's right child 60. Postorder has a cheat: preorder with the children swapped gives me-right-left, and reversing that gives left-right-me.</p>
  </div>
  <h3>Complexity</h3>
  <p>All three are O(n) time: every node is pushed and popped once. Extra space is O(h), the height, because the stack holds at most one path (plus waiting right children). That is O(log n) for a balanced tree and O(n) for a skewed one.</p>
  <table class="tbl">
    <tr><th>Order</th><th>Me is handled</th><th>On the charge tree</th><th>Use it when</th></tr>
    <tr><td><strong>Preorder</strong></td><td>before the children</td><td>120 80 40 60 250 200 310</td><td>Copying or saving a tree (serialize), printing categories with indentation, passing info down</td></tr>
    <tr><td><strong>Inorder</strong></td><td>between left and right</td><td>40 60 80 120 200 250 310</td><td>BST: gives values in <strong>sorted</strong> order. Kth smallest, validate BST</td></tr>
    <tr><td><strong>Postorder</strong></td><td>after both children</td><td>60 40 80 200 310 250 120</td><td>Need the children's answers first: height, size, diameter, deleting a tree, folder disk usage</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Depth-first search (DFS)</strong> on a tree visits a whole subtree before moving to its sibling. <strong>Preorder</strong> = node, left, right; <strong>inorder</strong> = left, node, right; <strong>postorder</strong> = left, right, node.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Pushing left before right in iterative preorder. The stack then pops right first and you get 120 250 310 200 80 40 60: a valid DFS, but not preorder.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p>From the <a class="xref" data-note="dsa_problems">Problem Tracker</a>: <b>144 Binary Tree Preorder Traversal</b>, <b>94 Binary Tree Inorder Traversal</b>, <b>145 Binary Tree Postorder Traversal</b>. Write each twice: recursive, then with an explicit stack.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Breadth-First.</b> DFS dives: it handles 60, four levels down, before 250, one level down. Biteful's app shows categories one level at a time. How do we visit the tree floor by floor?</div>

  <h2 id="dsa-tr-bfs"><span class="num">05</span>Breadth-First: Level Order</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A stack always continues with the newest node, so DFS goes deep. What do we need so that every node on level 1 is handled before any node on level 2, and how do we know where one level ends?</p>
  </div>
  <p>Sometimes you want the tree floor by floor: the CEO, then everyone reporting to the CEO, then everyone below them. That is <strong>breadth-first search (BFS)</strong>. A stack goes deep; a <strong>queue</strong> goes wide. Take a node from the front, put its children at the back.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A wedding invitation chain. Dada-ji calls his 3 children first. Each of them, after hanging up, adds their own children to the "to call" list at the end. The whole family is reached generation by generation, never jumping ahead.</p>
  </div>
  <h3>Recognise it</h3>
  <p>Trigger words: "level", "row", "right side view", "zigzag", "average of each level", "minimum depth", "nearest leaf".</p>
  <h3>Template</h3>
  <p>Use <code>collections.deque</code>, not a list: <code>list.pop(0)</code> shifts every item (O(n)); <code>deque.popleft()</code> is O(1). To group nodes by level, read <code>len(q)</code> at the start of each round. That number is exactly the size of the current level, because the queue holds nothing else yet.</p>
  <h3>Traced on the running example</h3>
  <table class="tbl out"><caption>Level order on the charge tree</caption>
    <tr><th>queue at start of round</th><th>len(q)</th><th>pops</th><th>pushes</th><th>level</th></tr>
    <tr><td>[120]</td><td>1</td><td>120</td><td>80, 250</td><td>[120]</td></tr>
    <tr><td>[80, 250]</td><td>2</td><td>80, 250</td><td>40; 200, 310</td><td>[80, 250]</td></tr>
    <tr><td>[40, 200, 310]</td><td>3</td><td>40, 200, 310</td><td>60</td><td>[40, 200, 310]</td></tr>
    <tr><td>[60]</td><td>1</td><td>60</td><td>–</td><td>[60]</td></tr>
  </table>
<div class="fx" data-lang="py">def level_order(root):
    if root is None:
        return []
    out, q = [], deque([root])
    while q:
        level = []
        for _ in range(len(q)):       # exactly the nodes of this level
            node = q.popleft()
            level.append(node.val)
            if node.left:  q.append(node.left)
            if node.right: q.append(node.right)
        out.append(level)
    return out

print(level_order(t))
print(level_order(build([3, 9, 20, None, None, 15, 7])))
print(level_order(build([1])), level_order(build([])))</div>
  <div class="fx" data-lang="text">[[120], [80, 250], [40, 200, 310], [60]]
[[3], [9, 20], [15, 7]]
[[1]] []</div>
  <p>This is LeetCode 102 <strong>Binary Tree Level Order Traversal</strong>, solved. Small changes give many other problems: keep only <code>level[-1]</code> (Right Side View: 120, 250, 310, 60), reverse every second level (Zigzag), stop at the first leaf (Minimum Depth), average each level.</p>
  <h3>Complexity</h3>
  <p>Time O(n). Space O(w), where w is the widest level (3 on our tree); for a full tree the last level holds about n/2 nodes.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Breadth-first search (BFS)</strong> on a tree visits nodes in order of depth, using a FIFO queue: pop the oldest node, push its children. Reading <code>len(q)</code> at the start of each round separates the levels.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Writing <code>for _ in range(len(q))</code> is safe because <code>range</code> is computed once. Writing <code>while q:</code> for the inner loop instead mixes levels, because children are being added while you loop.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p>From the <a class="xref" data-note="dsa_problems">Problem Tracker</a>: <b>102 Binary Tree Level Order Traversal</b>, <b>199 Binary Tree Right Side View</b>, <b>637 Average of Levels in Binary Tree</b>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Post-Order Thinking.</b> We can visit every node in any order. But the interesting questions are about the tree as a whole: how tall is it, what is its longest path, is it lopsided? Visiting is not computing.</div>

  <h2 id="dsa-tr-recur"><span class="num">06</span>Post-Order Thinking: Height, Diameter, Balanced</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"How tall is the tree?" or "is any branch too long?" depends on every node below. Writing such code by imagining the whole tree is hard. Is there a way to think about just one node at a time?</p>
  </div>
  <p>Most tree problems look scary until you stop thinking about the whole tree. Stand at <strong>one node</strong> and ask: "If my left child and right child already gave me their answers, how do I make mine?" Then add the empty-tree case. That is the entire method, and because the children answer <em>before</em> the node, it is post-order.</p>
  <div class="flow"><span>Base case: node is None → return the "nothing" answer</span><span>Ask left child</span><span>Ask right child</span><span>Combine with my value → return</span></div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A school principal wants the total number of students. She asks each class teacher, each teacher asks each row monitor, each monitor counts their row. Nobody counts the whole school. Every person only adds up the numbers handed to them, plus themselves.</p>
  </div>
  <h3>Recognise it</h3>
  <p>Trigger words: "maximum / minimum depth", "height", "is balanced", "diameter", "longest path", "sum of subtree", "count nodes".</p>
  <h3>Traced on the running example</h3>
  <p>One post-order pass computes everything. <code>depth</code> below counts nodes (None = 0); the "bend" at a node is the longest path that turns there, left + right; "balanced here?" compares the two heights.</p>
  <table class="tbl out"><caption>Post-order on the charge tree: children answer first</caption>
    <tr><th>node (post-order)</th><th>left depth</th><th>right depth</th><th>returns 1 + max</th><th>bend = left + right (edges)</th><th>|left − right| ≤ 1?</th></tr>
    <tr><td>60</td><td>0</td><td>0</td><td>1</td><td>0</td><td>yes</td></tr>
    <tr><td>40</td><td>0</td><td>1</td><td>2</td><td>1</td><td>yes</td></tr>
    <tr><td>80</td><td>2</td><td>0</td><td>3</td><td>2</td><td><b>no: 2 vs 0</b></td></tr>
    <tr><td>200</td><td>0</td><td>0</td><td>1</td><td>0</td><td>yes</td></tr>
    <tr><td>310</td><td>0</td><td>0</td><td>1</td><td>0</td><td>yes</td></tr>
    <tr><td>250</td><td>1</td><td>1</td><td>2</td><td>2</td><td>yes</td></tr>
    <tr><td>120</td><td>3</td><td>2</td><td><b>4</b> (height 3 in edges)</td><td><b>5</b></td><td>yes</td></tr>
  </table>
  <p>Read the answers off the table: max depth 4 nodes (height 3 edges), diameter 5 (the best bend is at the root), and the tree is <strong>not balanced</strong>, because at 80 the left side is 2 deep and the right side is empty.</p>
<figure class="viz"><svg viewBox="0 0 600 290" width="600">
<line x1="320" y1="40" x2="180" y2="110" class="sg" stroke-width="3.5"/>
<line x1="320" y1="40" x2="460" y2="110" class="sg" stroke-width="3.5"/>
<line x1="180" y1="110" x2="110" y2="180" class="sg" stroke-width="3.5"/>
<line x1="110" y1="180" x2="160" y2="250" class="sg" stroke-width="3.5"/>
<line x1="460" y1="110" x2="400" y2="180" class="sg" stroke-width="3.5"/>
<line x1="460" y1="110" x2="520" y2="180" stroke="currentColor"/>
<circle cx="320" cy="40" r="17" class="fg sg"/><text x="320" y="44" text-anchor="middle" font-size="12">120</text>
<circle cx="180" cy="110" r="17" class="fg sg"/><text x="180" y="114" text-anchor="middle" font-size="12">80</text>
<circle cx="460" cy="110" r="17" class="fg sg"/><text x="460" y="114" text-anchor="middle" font-size="12">250</text>
<circle cx="110" cy="180" r="17" class="fg sg"/><text x="110" y="184" text-anchor="middle" font-size="12">40</text>
<circle cx="400" cy="180" r="17" class="fg sg"/><text x="400" y="184" text-anchor="middle" font-size="12">200</text>
<circle cx="520" cy="180" r="17" class="fb sb"/><text x="520" y="184" text-anchor="middle" font-size="12">310</text>
<circle cx="160" cy="250" r="17" class="fg sg"/><text x="160" y="254" text-anchor="middle" font-size="12">60</text>
<text x="344" y="30" class="tg" font-size="11">bend here: left 3 + right 2 = 5 edges</text>
<text x="204" y="126" class="tm" font-size="10">left 2 + right 0 = 2</text>
<text x="430" y="250" font-size="11">green path: 60-40-80-120-250-200</text>
<text x="430" y="270" font-size="11">diameter = 5 edges</text>
</svg><figcaption>At each node, "left depth + right depth" (depths counted in nodes) is the longest path that bends there, measured in edges. On the charge tree the best bend is at the root: 3 + 2 = 5. (The path could end at 310 instead of 200; same length.)</figcaption></figure>
  <h3>The code</h3>
<div class="fx" data-lang="py"># bottom-up: ask both children, combine their answers
def tree_sum(node):
    if node is None:
        return 0                                   # base case: empty tree
    return node.val + tree_sum(node.left) + tree_sum(node.right)

def diameter(root):
    best = 0
    def depth(node):                               # nodes on the longest downward path
        nonlocal best
        if node is None:
            return 0
        l, r = depth(node.left), depth(node.right)
        best = max(best, l + r)                    # longest path that bends at this node
        return 1 + max(l, r)
    depth(root)
    return best                                    # counted in edges

def is_balanced(root):
    def h(node):                                   # height, or -2 for "unbalanced"
        if node is None:
            return -1
        lh, rh = h(node.left), h(node.right)
        if lh == -2 or rh == -2 or abs(lh - rh) &gt; 1:
            return -2
        return 1 + max(lh, rh)
    return h(root) != -2

# top-down: pass information from parent to child
def depths(node, d=0, out=None):
    out = {} if out is None else out
    if node:
        out[node.val] = d                          # my depth = parent's + 1
        depths(node.left, d + 1, out)
        depths(node.right, d + 1, out)
    return out

print("sum", tree_sum(t), "| height", height(t), "| diameter", diameter(t), "| balanced", is_balanced(t))
print("depths", depths(t))
for vals in [[1, 2, 3, 4, 5], [1, 2], [1], [1, 2, None, 3, 4, 5, None, None, None, 6, None, None, 7]]:
    print(vals, "diameter -&gt;", diameter(build(vals)))
print("[3, 9, 20, None, None, 15, 7] balanced?", is_balanced(build([3, 9, 20, None, None, 15, 7])))</div>
  <div class="fx" data-lang="text">sum 1060 | height 3 | diameter 5 | balanced False
depths {120: 0, 80: 1, 40: 2, 60: 3, 250: 1, 200: 2, 310: 2}
[1, 2, 3, 4, 5] diameter -&gt; 3
[1, 2] diameter -&gt; 1
[1] diameter -&gt; 0
[1, 2, None, 3, 4, 5, None, None, None, 6, None, None, 7] diameter -&gt; 5
[3, 9, 20, None, None, 15, 7] balanced? True</div>
  <p>Why does <code>l + r</code> count edges when <code>depth</code> counts nodes? The left side has l nodes, so l edges from me down to its bottom; same on the right. Total l + r edges. <code>is_balanced</code> shows a useful trick: return a special value (−2) to mean "already failed", so one pass gives both the height and the yes/no answer. Calling a separate <code>height()</code> at every node instead would be O(n²) on a skewed tree.</p>
  <p>There are two directions information can flow:</p>
  <ul>
    <li><strong>Bottom-up</strong> (postorder): answers flow up from the leaves. Size, sum, height, "is it balanced", diameter.</li>
    <li><strong>Top-down</strong> (preorder): facts flow down from the root as extra arguments. Current depth (the <code>depths</code> function), running path sum (section 09), the allowed (low, high) range in a BST (section 07).</li>
  </ul>
  <h3>Complexity</h3>
  <p>Each function visits every node once: O(n) time, O(h) space for the recursion.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A binary tree is <strong>height-balanced</strong> when, at every node, the heights of the left and right subtrees differ by at most 1. The <strong>diameter</strong> is the number of edges on the longest path between any two nodes.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Returning the wrong thing. Diameter: the function returns the one-sided depth (what the parent can extend), while <code>best</code> records the two-sided bend. Returning <code>l + r</code> upward lets a parent build a path that bends twice, which is not a path. And "balanced" must hold at <em>every</em> node: our root is fine (3 vs 2), but 80 is not.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p>From the <a class="xref" data-note="dsa_problems">Problem Tracker</a>: <b>104 Maximum Depth of Binary Tree</b>, <b>543 Diameter of Binary Tree</b>, <b>110 Balanced Binary Tree</b>, then <b>124 Binary Tree Maximum Path Sum</b> (diameter with values).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Binary Search Tree.</b> Section 04 printed the inorder walk as 40, 60, 80, 120, 200, 250, 310: sorted. Nothing we have learned explains why. What rule did the charge tree follow, and can that rule make lookups as fast as binary search?</div>

  <h2 id="dsa-tr-bst"><span class="num">07</span>Binary Search Tree</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>In a plain binary tree, finding ₹200 means checking every node: O(n). Section 01 promised a tree that keeps charges sorted and cheap to insert. What rule gives that, and why did our inorder walk come out sorted?</p>
  </div>
  <p>Look at the charge tree again: everything left of 120 (80, 40, 60) is smaller; everything right (250, 200, 310) is bigger. The same holds at 80 and at 250. That is the rule.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Binary search tree (BST)</strong>: for every node, <em>all</em> values in its left subtree are smaller and <em>all</em> values in its right subtree are bigger. (Duplicates: either not allowed, or always sent to one side; say which.)</p>
  </div>
  <p>And here is the reveal: our tree is simply the 8 charges <strong>inserted in arrival order</strong>. 120 becomes the root; 80 &lt; 120 goes left; 250 goes right; 40 goes left of 80; 310 right of 250; the second 80 is a duplicate and is ignored; 60 goes 120 → 80 → 40 → right; 200 goes 120 → 250 → left.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>"Guess my number between 1 and 100" with hints "higher / lower". A BST is that game frozen into a structure: the root is your first guess, each child is the next guess after the hint. It is the previous note's binary search, stored as nodes so new values can be added without shifting anything.</p>
  </div>
  <h3>Recognise it</h3>
  <p>Trigger words: "BST", "binary search tree", "kth smallest", "in sorted order", "successor", "closest value", "range sum of BST", "validate".</p>
  <h3>Search and insert, traced</h3>
<figure class="viz"><svg viewBox="0 0 600 290" width="600">
<line x1="320" y1="40" x2="180" y2="110" stroke="currentColor"/>
<line x1="320" y1="40" x2="460" y2="110" class="sg" stroke-width="3.5"/>
<line x1="180" y1="110" x2="110" y2="180" stroke="currentColor"/>
<line x1="110" y1="180" x2="160" y2="250" stroke="currentColor"/>
<line x1="460" y1="110" x2="400" y2="180" class="sg" stroke-width="3.5"/>
<line x1="460" y1="110" x2="520" y2="180" stroke="currentColor"/>
<line x1="180" y1="110" x2="250" y2="180" stroke="currentColor"/>
<circle cx="320" cy="40" r="17" class="fg sg"/><text x="320" y="44" text-anchor="middle" font-size="12">120</text>
<circle cx="180" cy="110" r="17" class="fb sb"/><text x="180" y="114" text-anchor="middle" font-size="12">80</text>
<circle cx="460" cy="110" r="17" class="fg sg"/><text x="460" y="114" text-anchor="middle" font-size="12">250</text>
<circle cx="110" cy="180" r="17" class="fb sb"/><text x="110" y="184" text-anchor="middle" font-size="12">40</text>
<circle cx="400" cy="180" r="17" class="fg sg"/><text x="400" y="184" text-anchor="middle" font-size="12">200</text>
<circle cx="520" cy="180" r="17" class="fb sb"/><text x="520" y="184" text-anchor="middle" font-size="12">310</text>
<circle cx="160" cy="250" r="17" class="fb sb"/><text x="160" y="254" text-anchor="middle" font-size="12">60</text>
<circle cx="250" cy="180" r="17" class="fv"/><text x="250" y="184" text-anchor="middle" font-size="12">90</text>
<text x="344" y="44" class="tg" font-size="11">200 &gt; 120 → right</text>
<text x="484" y="114" class="tg" font-size="11">200 &lt; 250 → left</text>
<text x="400" y="214" text-anchor="middle" class="tg" font-size="11">found</text>
<text x="250" y="214" text-anchor="middle" class="tm" font-size="11">new 90 lands here</text>
<text x="210" y="160" class="tm" font-size="10">90 &gt; 80 → right: empty</text>
</svg><figcaption>The charge tree is a binary search tree. Searching 200 visits 120, 250, 200 (green): each step drops a whole subtree. Inserting 90 walks 120 → 80, falls off at 80's empty right side, and the new node goes there.</figcaption></figure>
  <table class="tbl out"><caption>Search 200 and insert 90 on the charge tree</caption>
    <tr><th>operation</th><th>at node</th><th>compare</th><th>go</th></tr>
    <tr><td>search 200</td><td>120</td><td>200 &gt; 120</td><td>right</td></tr>
    <tr><td></td><td>250</td><td>200 &lt; 250</td><td>left</td></tr>
    <tr><td></td><td>200</td><td>equal</td><td>found (3 nodes visited)</td></tr>
    <tr><td>insert 90</td><td>120</td><td>90 &lt; 120</td><td>left</td></tr>
    <tr><td></td><td>80</td><td>90 &gt; 80</td><td>right: empty → put 90 here</td></tr>
  </table>
  <p>Each step throws away a whole subtree, exactly like binary search on a sorted list. The cost is the number of levels walked, O(h).</p>
  <h3>Delete: three cases</h3>
  <table class="tbl">
    <tr><th>Node to delete has</th><th>What to do</th><th>On the charge tree</th></tr>
    <tr><td>0 children (leaf)</td><td>Just remove it: return <code>None</code> to the parent</td><td>delete 310</td></tr>
    <tr><td>1 child</td><td>Lift that child up into its place</td><td>delete 40 (60 moves up)</td></tr>
    <tr><td>2 children</td><td>Find the <strong>inorder successor</strong> (smallest value in the right subtree: go right once, then left until you can't). Copy its value here, then delete the successor from the right subtree. It has no left child, so that delete is case 1 or 2.</td><td>delete 120: successor 200 moves up</td></tr>
  </table>
<figure class="viz"><svg viewBox="0 0 600 228" width="600"><defs><marker id="tr-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tg"/></marker></defs><text x="150" y="20" text-anchor="middle">1. delete 50 (two children)</text><line x1="150" y1="55" x2="90" y2="120" stroke="currentColor"/><line x1="150" y1="55" x2="210" y2="120" stroke="currentColor"/><line x1="210" y1="120" x2="170" y2="185" stroke="currentColor"/><line x1="210" y1="120" x2="250" y2="185" stroke="currentColor"/><circle cx="150" cy="55" r="17" class="fr sr"/><text x="150" y="59" text-anchor="middle">50</text><circle cx="90" cy="120" r="17" class="fb sb"/><text x="90" y="124" text-anchor="middle">40</text><circle cx="210" cy="120" r="17" class="fb sb"/><text x="210" y="124" text-anchor="middle">70</text><circle cx="170" cy="185" r="17" class="fg sg"/><text x="170" y="189" text-anchor="middle">60</text><circle cx="250" cy="185" r="17" class="fb sb"/><text x="250" y="189" text-anchor="middle">80</text><path d="M155,170 Q120,125 143,73" fill="none" class="sg" stroke-width="1.5" stroke-dasharray="4 3" marker-end="url(#tr-a1)"/><text x="170" y="220" text-anchor="middle" class="tg">successor = min of right side</text><text x="300" y="120" text-anchor="middle">→</text><text x="465" y="20" text-anchor="middle">2. copy 60 up, delete old 60</text><line x1="465" y1="55" x2="405" y2="120" stroke="currentColor"/><line x1="465" y1="55" x2="525" y2="120" stroke="currentColor"/><line x1="525" y1="120" x2="565" y2="185" stroke="currentColor"/><circle cx="465" cy="55" r="17" class="fg sg"/><text x="465" y="59" text-anchor="middle">60</text><circle cx="405" cy="120" r="17" class="fb sb"/><text x="405" y="124" text-anchor="middle">40</text><circle cx="525" cy="120" r="17" class="fb sb"/><text x="525" y="124" text-anchor="middle">70</text><circle cx="565" cy="185" r="17" class="fb sb"/><text x="565" y="189" text-anchor="middle">80</text><text x="465" y="220" text-anchor="middle" class="tm">still: left &lt; 60 &lt; right</text></svg><figcaption>Deleting a node with two children. 60 is the next bigger value, so it can sit where 50 was: everything on the left is still smaller, everything on the right still bigger.</figcaption></figure>
  <h3>The code</h3>
<div class="fx" data-lang="py">def bst_search(node, x):
    while node and node.val != x:
        node = node.left if x &lt; node.val else node.right
    return node                      # the node, or None if absent

def bst_insert(node, x):
    if node is None:
        return TreeNode(x)           # found the empty spot
    if x &lt; node.val:
        node.left = bst_insert(node.left, x)
    elif x &gt; node.val:
        node.right = bst_insert(node.right, x)
    return node                      # duplicates are ignored

def bst_delete(node, x):
    if node is None:
        return None
    if x &lt; node.val:
        node.left = bst_delete(node.left, x)
    elif x &gt; node.val:
        node.right = bst_delete(node.right, x)
    else:
        if node.left is None:        # 0 or 1 child: lift the other child up
            return node.right
        if node.right is None:
            return node.left
        succ = node.right            # 2 children: find the successor,
        while succ.left:             # the smallest value on the right
            succ = succ.left
        node.val = succ.val          # copy it into this node
        node.right = bst_delete(node.right, succ.val)   # remove the copy below
    return node

root = None
for charge in [120, 80, 250, 40, 310, 80, 60, 200]:      # arrival order
    root = bst_insert(root, charge)
print("level order:", level_order(root), "| same as CHARGES tree:", level_order(root) == level_order(build(CHARGES)))
print("inorder    :", inorder(root, []))
print("find 200:", bst_search(root, 200).val, " find 90:", bst_search(root, 90))
root = bst_insert(root, 90)
print("insert 90  :", level_order(root))
for x in [40, 60, 120]:
    root = bst_delete(root, x)
    print(f"delete {x:3}:", level_order(root))</div>
  <div class="fx" data-lang="text">level order: [[120], [80, 250], [40, 200, 310], [60]] | same as CHARGES tree: True
inorder    : [40, 60, 80, 120, 200, 250, 310]
find 200: 200  find 90: None
insert 90  : [[120], [80, 250], [40, 90, 200, 310], [60]]
delete  40: [[120], [80, 250], [60, 90, 200, 310]]
delete  60: [[120], [80, 250], [90, 200, 310]]
delete 120: [[200], [80, 250], [90, 310]]</div>
  <p>Inserting the charges in arrival order rebuilds exactly the tree we have used since section 03. The inorder walk prints them sorted, and now we can say why: "left subtree, me, right subtree" with "left &lt; me &lt; right" must give sorted order. <strong>Inorder of a BST is sorted</strong> is the single most useful BST fact. Delete 40 is the one-child case (60 moves up into its place under 80), delete 60 is then a plain leaf, and delete 120 is the two-children case: 200, the smallest value right of 120, moves up to the root.</p>
  <h3>Validate a BST (LeetCode 98)</h3>
  <p>The tempting check is "left child &lt; node &lt; right child" at every node. It is wrong. Suppose a typo stored ₹100 where ₹200 should be: <code>[120, 80, 250, 40, None, 100, 310, None, 60]</code>. Node 250 has children 100 and 310, which look fine locally, but 100 sits in the right subtree of 120 and is smaller than 120. Fix: pass down the range each node must fall in. Going left, the upper bound becomes the node's value; going right, the lower bound does.</p>
  <table class="tbl out"><caption>Bounds passed down in the typo tree</caption>
    <tr><th>node</th><th>allowed range (lo, hi)</th><th>inside?</th></tr>
    <tr><td>120</td><td>(−∞, +∞)</td><td>yes</td></tr>
    <tr><td>80</td><td>(−∞, 120)</td><td>yes</td></tr>
    <tr><td>40</td><td>(−∞, 80)</td><td>yes</td></tr>
    <tr><td>60</td><td>(40, 80)</td><td>yes</td></tr>
    <tr><td>250</td><td>(120, +∞)</td><td>yes</td></tr>
    <tr><td>100</td><td>(120, 250)</td><td><b>no → invalid</b></td></tr>
  </table>
<div class="fx" data-lang="py">def is_valid_bst(root):
    def ok(node, lo, hi):            # every value here must be in (lo, hi)
        if node is None:
            return True
        if not (lo &lt; node.val &lt; hi):
            return False
        return ok(node.left, lo, node.val) and ok(node.right, node.val, hi)
    return ok(root, float("-inf"), float("inf"))

for vals in [CHARGES, [120, 80, 250, 40, None, 100, 310, None, 60], [2, 1, 3], [5, 4, 6, None, None, 3, 7], [2, 2, 2], []]:
    print(vals, is_valid_bst(build(vals)))</div>
  <div class="fx" data-lang="text">[120, 80, 250, 40, None, 200, 310, None, 60] True
[120, 80, 250, 40, None, 100, 310, None, 60] False
[2, 1, 3] True
[5, 4, 6, None, None, 3, 7] False
[2, 2, 2] False
[] True</div>
  <p>O(n) time, O(h) space. Equal values fail because of strict <code>&lt;</code>, which matches LeetCode. Another correct way: do an inorder walk and check that every value is bigger than the previous one.</p>
  <h3>Complexity</h3>
  <p>Search, insert, delete, min, max and successor all walk one path, so they are O(h): O(log n) when balanced, O(n) when skewed. A full inorder walk is O(n).</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Checking a BST only against the parent. Every node must respect <em>all</em> its ancestors, which is why the bounds narrow as you go down.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p>From the <a class="xref" data-note="dsa_problems">Problem Tracker</a>: <b>700 Search in a Binary Search Tree</b>, <b>701 Insert into a Binary Search Tree</b>, <b>98 Validate Binary Search Tree</b>, then <b>450 Delete Node in a BST</b>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Balanced Trees.</b> Every BST cost is O(h). Our tree has height 3 for 7 charges, which is fine. But what if the charges had arrived already sorted? Does "O(log n)" still hold?</div>

  <h2 id="dsa-tr-balance"><span class="num">08</span>Balanced Trees</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The BST promised binary-search speed, but its cost is the height, and the height depends on the insert order. How bad can it get, and how do real libraries guarantee O(log n)?</p>
  </div>
  <p>Here is the danger: insert values that are already sorted, and each new value is bigger than all before it, so it always goes right. The "tree" becomes a straight line. On our 7 charges, sorted first: 40 → 60 → 80 → 120 → 200 → 250 → 310, height 6 instead of 3.</p>
<div class="fx" data-lang="py">def sorted_to_bst(a, lo=0, hi=None):
    if hi is None:
        hi = len(a) - 1
    if lo &gt; hi:
        return None
    mid = (lo + hi) // 2                     # middle value becomes the root
    return TreeNode(a[mid], sorted_to_bst(a, lo, mid - 1), sorted_to_bst(a, mid + 1, hi))

chain = None
for charge in sorted([120, 80, 250, 40, 310, 60, 200]):
    chain = bst_insert(chain, charge)
print("charges inserted sorted :", level_order(chain), "height", height(chain))
best = sorted_to_bst(sorted([120, 80, 250, 40, 310, 60, 200]))
print("balanced build          :", level_order(best), "height", height(best))

n = 500
skewed = None
for x in range(n):                           # inserting sorted data
    skewed = bst_insert(skewed, x)
balanced = sorted_to_bst(list(range(n)))
print("500 values, skewed height  :", height(skewed))
print("500 values, balanced height:", height(balanced))</div>
  <div class="fx" data-lang="text">charges inserted sorted : [[40], [60], [80], [120], [200], [250], [310]] height 6
balanced build          : [[120], [60, 250], [40, 80, 200, 310]] height 2
500 values, skewed height  : 499
500 values, balanced height: 8</div>
  <p>Same 500 values. One shape needs up to 499 steps per search, the other 8. With a million values the gap is 999,999 vs 19. Sorted input is common in real life (IDs, timestamps), so a plain BST is risky. The balanced build of our 7 charges puts the median 120 at the root and has height 2, the best possible for 7 nodes.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A <em>tarazu</em> (balance scale) in a kirana shop. Keep adding weight on one side and it tips. The shopkeeper moves weights across to level it. Self-balancing trees do the same: after each insert or delete, if one side got too heavy, they move a few nodes across.</p>
  </div>
  <p>The "moving across" is called a <strong>rotation</strong>: a parent and child swap roles in O(1), keeping the BST order. Two famous designs decide when to rotate:</p>
  <table class="tbl">
    <tr><th></th><th>AVL tree</th><th>Red-black tree</th></tr>
    <tr><td>Rule</td><td>At every node, left and right heights differ by at most 1 (our charge tree breaks it at 80)</td><td>Nodes coloured red/black; no two reds in a row; same number of blacks on every root-to-leaf path</td></tr>
    <tr><td>Height</td><td>≤ ~1.44 log₂ n (stricter)</td><td>≤ 2 log₂ n (looser)</td></tr>
    <tr><td>Used in</td><td>Some databases, in-memory indexes</td><td>Java <code>TreeMap</code>, C++ <code>std::map</code>, Linux scheduler</td></tr>
  </table>
  <p>For interviews you only need the idea: "a self-balancing BST guarantees O(log n) search, insert and delete by rotating after updates". Nobody expects you to code red-black insert on a whiteboard.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>self-balancing BST</strong> (AVL, red-black) restores a balance rule after every insert and delete using O(1) rotations along the updated path, so its height stays O(log n) whatever the insert order.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Quoting "BST search is O(log n)" without the word <em>balanced</em>. A plain BST is O(h), and h = n − 1 for sorted input. Say "O(h): O(log n) if balanced, O(n) worst case".</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p>From the <a class="xref" data-note="dsa_problems">Problem Tracker</a>: <b>108 Convert Sorted Array to Binary Search Tree</b> (the balanced build above), <b>110 Balanced Binary Tree</b> (the check from section 06).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Path Problems.</b> So far each question had one number as the answer. Finance now asks about whole routes from the root: "which chain of charges from the top down adds up to ₹570?" That needs information carried <em>down</em>, not up.</div>

  <h2 id="dsa-tr-paths"><span class="num">09</span>Path Problems</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Post-order passes answers up from the leaves. A root-to-leaf sum is different: each node needs to know what happened <em>above</em> it. How do we carry that down, and how do we list every path without copying the whole path at each step?</p>
  </div>
  <h3>Recognise it</h3>
  <p>Trigger words: "root-to-leaf", "path sum", "all paths", "sum root to leaf numbers", "good nodes" (no ancestor bigger), "max difference between node and ancestor".</p>
  <h3>Template</h3>
  <div class="flow"><span>f(node, info_from_above)</span><span>update info with my value</span><span>at a real leaf: check / record</span><span>f(left, info), f(right, info)</span><span>(backtracking: undo my change)</span></div>
  <h3>Traced on the running example</h3>
  <p>Path Sum with target ₹570: carry "remaining = target − values so far" down the tree.</p>
  <table class="tbl out"><caption>Top-down remaining sum, target 570 (preorder)</caption>
    <tr><th>node</th><th>remaining after this node</th><th>leaf?</th><th>result</th></tr>
    <tr><td>120</td><td>570 − 120 = 450</td><td>no</td><td></td></tr>
    <tr><td>80</td><td>370</td><td>no</td><td></td></tr>
    <tr><td>40</td><td>330</td><td>no (has right child 60)</td><td></td></tr>
    <tr><td>60</td><td>270</td><td>yes</td><td>≠ 0: path 120-80-40-60 sums to 300</td></tr>
    <tr><td>250</td><td>200</td><td>no</td><td></td></tr>
    <tr><td>200</td><td>0</td><td>yes</td><td><b>found: [120, 250, 200]</b></td></tr>
    <tr><td>310</td><td>−110</td><td>yes</td><td>≠ 0: sums to 680</td></tr>
  </table>
  <h3>The code</h3>
  <p>Three related problems. <code>has_path_sum</code> only answers yes/no. <code>path_sum</code> lists every matching path, using one shared <code>path</code> list: append on the way in, pop on the way out (backtracking). <code>all_paths</code> prints every root-to-leaf route.</p>
<div class="fx" data-lang="py">def has_path_sum(node, remaining):
    if node is None:
        return False
    remaining -= node.val
    if node.left is None and node.right is None:     # a real leaf
        return remaining == 0
    return has_path_sum(node.left, remaining) or has_path_sum(node.right, remaining)

def path_sum(root, target):
    res, path = [], []
    def dfs(node, remaining):
        if node is None:
            return
        path.append(node.val)                       # choose
        remaining -= node.val
        if node.left is None and node.right is None and remaining == 0:
            res.append(path[:])                     # copy! path keeps changing
        dfs(node.left, remaining)
        dfs(node.right, remaining)
        path.pop()                                  # un-choose (backtrack)
    dfs(root, target)
    return res

def all_paths(root):
    out = []
    def dfs(node, so_far):
        if node is None:
            return
        so_far = so_far + [node.val]
        if node.left is None and node.right is None:
            out.append(("-&gt;".join(map(str, so_far)), sum(so_far)))
        dfs(node.left, so_far)
        dfs(node.right, so_far)
    dfs(root, [])
    return out

t = build(CHARGES)
print(has_path_sum(t, 570), has_path_sum(t, 400))
print(path_sum(t, 570))
print(all_paths(t))
print(path_sum(build([5, 4, 8, 11, None, 13, 4, 7, 2, None, None, 5, 1]), 22))
print(path_sum(build([1, 2, 3]), 5), path_sum(build([1, 2]), 1), path_sum(build([-2, None, -3]), -5))</div>
  <div class="fx" data-lang="text">True False
[[120, 250, 200]]
[('120-&gt;80-&gt;40-&gt;60', 300), ('120-&gt;250-&gt;200', 570), ('120-&gt;250-&gt;310', 680)]
[[5, 4, 11, 2], [5, 8, 4, 5]]
[] [] [[-2, -3]]</div>
  <p>Biteful's three routes sum to 300, 570 and 680. Edge cases in the last line: <code>[1, 2]</code> with target 1 gives nothing, because node 1 is not a leaf. Negative values are allowed, so you cannot stop early when the sum passes the target.</p>
  <h3>Complexity</h3>
  <p><code>has_path_sum</code>: O(n) time, O(h) space. <code>path_sum</code>: O(n·h) time in the worst case, because copying a path costs up to h; O(h) space besides the output.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>root-to-leaf path</strong> starts at the root and ends at a node with no children. <strong>Backtracking</strong> keeps one shared path: add the node before recursing, remove it after, so the list always holds exactly the current route.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>res.append(path)</code> without the copy stores the same list object every time; after backtracking it ends up empty, and you return <code>[[]]</code>. And test leaves with <code>node.left is None and node.right is None</code>: node 40 has a right child, so 120-80-40 is <em>not</em> a root-to-leaf path.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p>From the <a class="xref" data-note="dsa_problems">Problem Tracker</a>: <b>112 Path Sum</b>, <b>113 Path Sum II</b>, <b>257 Binary Tree Paths</b>, then <b>1448 Count Good Nodes in Binary Tree</b> (carry the max so far).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Lowest Common Ancestor.</b> Paths start at the root. Another common question starts at two nodes: "where do the routes to ₹60 and ₹200 meet?" That is the root of the smallest subtree holding both.</div>

  <h2 id="dsa-tr-lca"><span class="num">10</span>Lowest Common Ancestor</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Given two nodes, we want the deepest node that has both below it. Walking up needs parent pointers, which <code>TreeNode</code> doesn't have. Can we find the meeting point from the root, and does the BST rule make it easier?</p>
  </div>
  <p>The LCA of p and q is the deepest node that has both below it (a node counts as its own descendant). Family version: the closest common grandparent of two cousins. Category version: the smallest category containing both "South Indian" and "Cakes" is "Menu".</p>
  <h3>Recognise it</h3>
  <p>Trigger words: "lowest common ancestor", "distance between two nodes" (= depth(p) + depth(q) − 2 · depth(LCA)), "smallest subtree containing".</p>
  <h3>Traced on the running example</h3>
  <p><strong>In a BST</strong> the values tell you the way. If both are smaller than the node, the LCA is on the left; both bigger, on the right. Otherwise they split here, so this node is the answer.</p>
  <table class="tbl out"><caption>BST walk</caption>
    <tr><th>pair</th><th>at 120</th><th>at 80</th><th>at 40</th><th>LCA</th></tr>
    <tr><td>60, 200</td><td>60 &lt; 120 &lt; 200: split</td><td></td><td></td><td><b>120</b></td></tr>
    <tr><td>40, 60</td><td>both smaller → left</td><td>both smaller → left</td><td>40 is one of them</td><td><b>40</b></td></tr>
    <tr><td>200, 310</td><td>both bigger → right (250 splits them)</td><td></td><td></td><td><b>250</b></td></tr>
  </table>
  <p><strong>In any binary tree</strong>, search both sides. A side returns the p or q node it found, or <code>None</code>. If both sides return something, p and q are on different sides, so I am the LCA. Otherwise pass up whatever was found.</p>
  <table class="tbl out"><caption>Any-tree recursion for (60, 200): returns flow up (post-order)</caption>
    <tr><th>node</th><th>left returns</th><th>right returns</th><th>this node returns</th></tr>
    <tr><td>60</td><td colspan="2">is p → stop</td><td>60</td></tr>
    <tr><td>40</td><td>None</td><td>60</td><td>60</td></tr>
    <tr><td>80</td><td>60</td><td>None</td><td>60</td></tr>
    <tr><td>200</td><td colspan="2">is q → stop</td><td>200</td></tr>
    <tr><td>310</td><td>None</td><td>None</td><td>None</td></tr>
    <tr><td>250</td><td>200</td><td>None</td><td>200</td></tr>
    <tr><td>120</td><td>60</td><td>200</td><td><b>120: both sides found one</b></td></tr>
  </table>
<div class="fx" data-lang="py">def lca_bst(root, p, q):                   # p, q are values here
    node = root
    while node:
        if p &lt; node.val and q &lt; node.val:
            node = node.left               # both smaller: go left
        elif p &gt; node.val and q &gt; node.val:
            node = node.right              # both bigger: go right
        else:
            return node                    # they split here (or one IS here)

def lca(root, p, q):                       # any binary tree
    if root is None or root.val == p or root.val == q:
        return root                        # found one of them (or nothing)
    left = lca(root.left, p, q)
    right = lca(root.right, p, q)
    if left and right:
        return root                        # one on each side: I am the LCA
    return left or right                   # pass up whichever side found something

t = build(CHARGES)
print("BST walk :", lca_bst(t, 60, 200).val, lca_bst(t, 40, 60).val, lca_bst(t, 200, 310).val)
print("any tree :", lca(t, 60, 200).val, lca(t, 40, 60).val, lca(t, 200, 310).val)
bt = build([3, 5, 1, 6, 2, 0, 8, None, None, 7, 4])
print("LeetCode 236 example:", lca(bt, 5, 1).val, lca(bt, 5, 4).val, lca(bt, 7, 8).val)</div>
  <div class="fx" data-lang="text">BST walk : 120 40 250
any tree : 120 40 250
LeetCode 236 example: 3 5 3</div>
  <p>Both methods agree on the charge tree. In <code>lca(bt, 5, 4)</code>, 4 is below 5, so the search stops at 5 and returns it; that is correct because the problem guarantees both exist.</p>
  <h3>Complexity</h3>
  <p>BST: O(h) time, O(1) space (one path). Any tree: O(n) time, O(h) space (it may visit everything).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>The <strong>lowest common ancestor</strong> LCA(p, q) is the deepest node that is an ancestor of both p and q, where a node counts as an ancestor of itself.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Using the BST walk on a tree that is not a BST. It relies on values to choose a side; on an arbitrary tree it walks the wrong way. Ask "is it a BST?" first, then pick the method.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p>From the <a class="xref" data-note="dsa_problems">Problem Tracker</a>: <b>235 Lowest Common Ancestor of a Binary Search Tree</b>, <b>236 Lowest Common Ancestor of a Binary Tree</b>, <b>1123 Lowest Common Ancestor of Deepest Leaves</b>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Build From Traversals.</b> We can walk, measure and query a tree in memory. To save the charge tree to a file or send it to another service we must turn it into a flat sequence and back. Are traversal lists enough to rebuild the exact shape?</div>

  <h2 id="dsa-tr-build"><span class="num">11</span>Build a Tree From Traversals</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Section 04 turned the tree into lists. Is that reversible? Preorder alone, <code>120 80 40 60 …</code>, does not say whether 40 is 80's left or right child. Which combination of traversals pins down the shape?</p>
  </div>
  <h3>Recognise it</h3>
  <p>Trigger words: "construct / rebuild from preorder and inorder", "from inorder and postorder", "serialize and deserialize", "encode a tree as a string", "same tree", "subtree of another tree".</p>
  <h3>Traced on the running example</h3>
  <p>Preorder <code>[120, 80, 40, 60, 250, 200, 310]</code>, inorder <code>[40, 60, 80, 120, 200, 250, 310]</code>. Preorder's first value is the root (120). Find 120 in inorder: everything to its left is the left subtree, everything to its right is the right subtree. Preorder then hands out the next roots in order. Values are unique, so a dict gives each inorder position in O(1).</p>
  <table class="tbl out"><caption>Preorder hands out roots; inorder splits</caption>
    <tr><th>next preorder value</th><th>inorder window</th><th>split</th><th>becomes</th></tr>
    <tr><td>120</td><td>[40, 60, 80, 120, 200, 250, 310]</td><td>[40, 60, 80] | 120 | [200, 250, 310]</td><td>root</td></tr>
    <tr><td>80</td><td>[40, 60, 80]</td><td>[40, 60] | 80 | []</td><td>left of 120</td></tr>
    <tr><td>40</td><td>[40, 60]</td><td>[] | 40 | [60]</td><td>left of 80</td></tr>
    <tr><td>60</td><td>[60]</td><td>leaf</td><td>right of 40</td></tr>
    <tr><td>250</td><td>[200, 250, 310]</td><td>[200] | 250 | [310]</td><td>right of 120</td></tr>
    <tr><td>200</td><td>[200]</td><td>leaf</td><td>left of 250</td></tr>
    <tr><td>310</td><td>[310]</td><td>leaf</td><td>right of 250</td></tr>
  </table>
<div class="fx" data-lang="py">def build_tree(preorder, inorder):
    pos = {v: i for i, v in enumerate(inorder)}     # value -&gt; index in inorder
    it = iter(preorder)                             # preorder gives roots in order
    def make(lo, hi):                               # subtree uses inorder[lo..hi]
        if lo &gt; hi:
            return None
        val = next(it)
        node = TreeNode(val)
        mid = pos[val]
        node.left = make(lo, mid - 1)               # left part first: preorder is me, LEFT, right
        node.right = make(mid + 1, hi)
        return node
    return make(0, len(inorder) - 1)

t = build(CHARGES)
rebuilt = build_tree(preorder(t, []), inorder(t, []))
print(level_order(rebuilt), "| identical:", level_order(rebuilt) == level_order(t), "| postorder:", postorder(rebuilt, []))
print(level_order(build_tree([3, 9, 20, 15, 7], [9, 3, 15, 20, 7])))
print(level_order(build_tree([1, 2, 3], [3, 2, 1])), level_order(build_tree([], [])))</div>
  <div class="fx" data-lang="text">[[120], [80, 250], [40, 200, 310], [60]] | identical: True | postorder: [60, 40, 80, 200, 310, 250, 120]
[[3], [9, 20], [15, 7]]
[[1], [2], [3]] []</div>
  <p>The charge tree comes back exactly, and its postorder matches section 04. O(n) time and space. Using slices (<code>preorder[1:mid+1]</code>) and <code>inorder.index</code> also works but is O(n²). The left subtree must be built before the right, because preorder lists the whole left subtree first.</p>
  <h3>Serialize and Deserialize (LeetCode 297)</h3>
  <p>To save one tree with a single list, write a <code>#</code> for every empty child. Then preorder alone is unambiguous: after 40 comes <code>#</code> (no left child), then 60. Reading back follows the same order: me, then left, then right.</p>
<div class="fx" data-lang="py">def serialize(root):
    out = []
    def go(node):
        if node is None:
            out.append("#")                # mark the empty spot
            return
        out.append(str(node.val))
        go(node.left)
        go(node.right)
    go(root)
    return ",".join(out)

def deserialize(data):
    it = iter(data.split(","))
    def make():
        v = next(it)
        if v == "#":
            return None
        node = TreeNode(int(v))
        node.left = make()                 # same order as serialize: me, left, right
        node.right = make()
        return node
    return make()

for vals in [CHARGES, [1, 2, 3, None, None, 4, 5], [], [-7, None, 10]]:
    s = serialize(build(vals))
    print(repr(s), "-&gt;", level_order(deserialize(s)))</div>
  <div class="fx" data-lang="text">'120,80,40,#,60,#,#,#,250,200,#,#,310,#,#' -&gt; [[120], [80, 250], [40, 200, 310], [60]]
'1,2,#,#,3,4,#,#,5,#,#' -&gt; [[1], [2, 3], [4, 5]]
'#' -&gt; []
'-7,#,10,#,#' -&gt; [[-7], [10]]</div>
  <p>Both directions O(n) time and space. A level-order version with <code>None</code> markers (like LeetCode's own format, our <code>CHARGES</code> list) is also correct. The same "preorder with markers" string lets you check if two trees are identical or one is a subtree of another.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p>With <strong>distinct values</strong>, preorder + inorder (or postorder + inorder) determine a binary tree uniquely: pre/postorder identify each subtree's root, inorder splits its left and right parts. <strong>Serialization</strong> is any reversible conversion of a tree to a flat string; preorder with null markers is the simplest.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Preorder + postorder without markers do <em>not</em> fix the shape: a root with a single child gives the same two lists whether that child is left or right. And duplicates break the inorder split (which 80 is the root?), which is why our tree stores ₹80 once.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p>From the <a class="xref" data-note="dsa_problems">Problem Tracker</a>: <b>105 Construct Binary Tree from Preorder and Inorder Traversal</b>, <b>106 Construct Binary Tree from Inorder and Postorder Traversal</b>, <b>297 Serialize and Deserialize Binary Tree</b>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Trees in Real Python.</b> All of this used our own <code>TreeNode</code>. In real Python code, is there a built-in tree, how do we store the category hierarchy, and what limits must we respect?</div>

  <h2 id="dsa-tr-python"><span class="num">12</span>Trees in Real Python</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Interview trees are hand-made <code>TreeNode</code>s with at most two children. Biteful's category tree has any number of children, and production code rarely defines node classes. What do Python programmers actually use?</p>
  </div>
  <p>Python has <strong>no built-in tree or sorted-map type</strong>. In interviews you write <code>TreeNode</code> yourself. In real code you usually reach for something else. For general trees (any number of children: categories, org charts, folders, comment threads) a plain dict <code>{parent: [children]}</code> is enough, and the same preorder/postorder ideas apply.</p>
<div class="fx" data-lang="py">categories = {
    "Menu": ["Indian", "Chinese", "Desserts"],
    "Indian": ["North Indian", "South Indian"],
    "Desserts": ["Ice cream", "Cakes"],
}

def show(node, depth=0):                       # preorder: me first, then children
    print("    " * depth + node)
    for child in categories.get(node, []):
        show(child, depth + 1)

def count_leaves(node):                        # postorder: children first, then add up
    kids = categories.get(node, [])
    return 1 if not kids else sum(count_leaves(k) for k in kids)

show("Menu")
print("leaf categories:", count_leaves("Menu"))</div>
  <div class="fx" data-lang="text">Menu
    Indian
        North Indian
        South Indian
    Chinese
    Desserts
        Ice cream
        Cakes
leaf categories: 5</div>
  <p>For a sorted collection with fast lookups, a sorted list with <code>bisect</code> (previous note) is the usual stand-in for a BST in interviews.</p>
<div class="fx" data-lang="py">import bisect

charges = []
for c in [120, 80, 250, 40, 310, 60, 200]:
    bisect.insort(charges, c)                  # O(n) shift, but very fast in C
print(charges)
i = bisect.bisect_left(charges, 100)
print("smallest &gt;= 100:", charges[i], " largest &lt; 100:", charges[i - 1])</div>
  <div class="fx" data-lang="text">[40, 60, 80, 120, 200, 250, 310]
smallest &gt;= 100: 120  largest &lt; 100: 80</div>
  <div class="cards">
    <div><b>bisect on a sorted list</b><p>Search, floor, ceiling in O(log n). Insert is O(n) but a fast C memory shift; fine up to ~10⁵ items.</p><small>The usual BST replacement in interviews</small></div>
    <div><b>sortedcontainers</b><p><code>SortedList</code>, <code>SortedDict</code>: O(log n) add/remove, used like a balanced BST.</p><small>Third-party (pip install); allowed on LeetCode</small></div>
    <div><b>dict of children</b><p>General trees with any number of children; recursion works the same way.</p><small>Add a parent dict if you need to walk up</small></div>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>An <strong>n-ary (general) tree</strong> lets a node have any number of children. It is usually stored as an adjacency dict <code>{node: [children]}</code>; a binary tree is the special case with at most two, named left and right.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Recursion depth. Python allows about 1000 nested calls. A skewed tree from LeetCode can have 10⁴ nodes in a line. Either use the iterative versions (section 04) or call <code>sys.setrecursionlimit(10**5)</code> at the top. Mention this in interviews; it shows you know Python's limits.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Patterns.</b> We have seen a dozen tree techniques. In an interview, which words in the problem point to which one?</div>

  <h2 id="dsa-tr-patterns"><span class="num">13</span>Patterns</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Each section solved one Biteful question with one technique. Facing a new tree problem, how do we choose bottom-up, top-down, BFS, BST order, LCA or rebuild, and what is the skeleton for each?</p>
  </div>
  <table class="tbl">
    <tr><th>Trigger words</th><th>Pattern</th><th>Shape of the code</th><th>Section</th></tr>
    <tr><td>"maximum / minimum / longest", "height", "is balanced", "diameter"</td><td><strong>Bottom-up DFS</strong></td><td><code>l = f(left); r = f(right); return combine(l, r, node)</code>, often with a <code>nonlocal best</code></td><td>06</td></tr>
    <tr><td>"root-to-leaf", "path from root", "good nodes", "valid range"</td><td><strong>Top-down DFS</strong></td><td><code>f(node, info_so_far)</code>, update info, pass to children</td><td>07, 09</td></tr>
    <tr><td>"all paths", "list every path"</td><td><strong>Backtracking</strong></td><td><code>path.append(v); recurse; path.pop()</code>, save <code>path[:]</code> at leaves</td><td>09</td></tr>
    <tr><td>"level", "row", "right side view", "zigzag", "minimum depth", "nearest"</td><td><strong>BFS with level size</strong></td><td><code>for _ in range(len(q))</code></td><td>05</td></tr>
    <tr><td>"BST" + "kth", "sorted", "closest", "successor", "range"</td><td><strong>Use the BST order</strong></td><td>Inorder = sorted; or walk left/right by comparing</td><td>07, 14</td></tr>
    <tr><td>"lowest common ancestor", "distance between two nodes"</td><td><strong>LCA</strong></td><td>Return the node found from each side; the split point is the answer</td><td>10</td></tr>
    <tr><td>"construct / rebuild from traversals"</td><td><strong>Divide by the root</strong></td><td>Root from pre/postorder, split by its index in inorder</td><td>11</td></tr>
    <tr><td>"serialize", "encode", "same tree", "subtree"</td><td><strong>Traversal with None markers</strong></td><td>Preorder with <code>"#"</code> for empty children</td><td>11</td></tr>
  </table>
  <p>The two DFS skeletons as runnable functions, each tested on the charge tree:</p>
<div class="fx" data-lang="py">def bottom_up(node):
    """Template: answer for a subtree from its children's answers. Here: (size, total)."""
    if node is None:
        return (0, 0)                              # the "nothing" answer
    ls, lt = bottom_up(node.left)
    rs, rt = bottom_up(node.right)
    return (ls + rs + 1, lt + rt + node.val)       # combine with me

def top_down(node, info, out):
    """Template: pass what the parent knows. Here: max charge on the path so far ('good nodes')."""
    if node is None:
        return out
    if node.val &gt;= info:
        out.append(node.val)                       # no ancestor is bigger than me
    info = max(info, node.val)
    top_down(node.left, info, out)
    top_down(node.right, info, out)
    return out

t = build(CHARGES)
print("size and total:", bottom_up(t))
print("good nodes    :", top_down(t, float("-inf"), []))</div>
  <div class="fx" data-lang="text">size and total: (7, 1060)
good nodes    : [120, 250, 310]</div>
  <p>7 nodes worth ₹1,060 in total; the "good" charges (no bigger charge above them) are 120, 250 and 310.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>When the answer is not "returned upward" but can appear anywhere (diameter, max path sum), use two things: the function <em>returns</em> what the parent needs (one-sided depth), and a separate <code>best</code> variable <em>records</em> what the question asks (two-sided path). Mixing those two is the classic bug.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Picking BFS for "maximum depth" because it says "depth". Both work, but bottom-up DFS is 3 lines. Use BFS when the answer is <em>per level</em> or "the first leaf you meet" (minimum depth), where it can stop early.</p>
  </div>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p>From the <a class="xref" data-note="dsa_problems">Problem Tracker</a>: <b>1448 Count Good Nodes in Binary Tree</b> (the top-down template), <b>1026 Maximum Difference Between Node and Ancestor</b> (carry min and max down), <b>572 Subtree of Another Tree</b> (serialize or compare).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: More Classic Problems.</b> Let us check the patterns on three famous problems not yet solved: maximum depth, invert, and kth smallest in a BST.</div>

  <h2 id="dsa-tr-problems"><span class="num">14</span>More Classic Problems</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Level order (05), diameter and balanced (06), validate BST (07), path sums (09), LCA (10), construct and serialize (11) are done. Do the remaining interview favourites need anything new, or are they the same templates?</p>
  </div>
  <p>If you arrived here from a tracker problem about building or encoding a tree (105, 106, 108, 297, 606), its lesson is section 11 (and 08 for 108); path problems are in section 09, LCA in section 10.</p>
  <h3>1. Maximum Depth of Binary Tree (LeetCode 104)</h3>
  <p>Number of nodes on the longest root-to-leaf path. Bottom-up: "my depth = 1 + the deeper child". Without recursion: <code>len(level_order(root))</code>.</p>
<div class="fx" data-lang="py">def max_depth(root):                       # counts NODES on the longest path
    if root is None:
        return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))

for vals in [CHARGES, [3, 9, 20, None, None, 15, 7], [1, None, 2], [], [0]]:
    print(vals, "-&gt;", max_depth(build(vals)))</div>
  <div class="fx" data-lang="text">[120, 80, 250, 40, None, 200, 310, None, 60] -&gt; 4
[3, 9, 20, None, None, 15, 7] -&gt; 3
[1, None, 2] -&gt; 2
[] -&gt; 0
[0] -&gt; 1</div>
  <p>O(n) time, O(h) space. It counts nodes, so on the charge tree it gives 4 = textbook height 3 + 1.</p>

  <h3>2. Invert Binary Tree (LeetCode 226)</h3>
  <p>Mirror the tree: every left child becomes a right child. At each node, swap the two children, after inverting them.</p>
<div class="fx" data-lang="py">def invert_tree(root):
    if root is None:
        return None
    root.left, root.right = invert_tree(root.right), invert_tree(root.left)
    return root

for vals in [CHARGES, [4, 2, 7, 1, 3, 6, 9], [2, 1, 3], []]:
    t2 = invert_tree(build(vals))
    print(vals, "-&gt;", level_order(t2), "| inorder", inorder(t2, []))</div>
  <div class="fx" data-lang="text">[120, 80, 250, 40, None, 200, 310, None, 60] -&gt; [[120], [250, 80], [310, 200, 40], [60]] | inorder [310, 250, 200, 120, 80, 60, 40]
[4, 2, 7, 1, 3, 6, 9] -&gt; [[4], [7, 2], [9, 6, 3, 1]] | inorder [9, 7, 6, 4, 3, 2, 1]
[2, 1, 3] -&gt; [[2], [3, 1]] | inorder [3, 2, 1]
[] -&gt; [] | inorder []</div>
  <p>O(n) time, O(h) space. The tuple assignment evaluates both right-hand calls first, so nothing is overwritten too early. Inverting a BST turns its inorder from ascending into descending: the charges come out 310 … 40.</p>

  <h3>3. Kth Smallest Element in a BST (LeetCode 230)</h3>
  <p>Inorder of a BST is sorted, so the kth value visited is the answer. Use the iterative inorder so you can stop the moment you reach it. On the charge tree, the 3rd smallest charge is ₹80.</p>
<div class="fx" data-lang="py">def kth_smallest(root, k):
    stack, cur = [], root
    while cur or stack:
        while cur:
            stack.append(cur)
            cur = cur.left
        cur = stack.pop()
        k -= 1
        if k == 0:
            return cur.val              # stop early: no need to visit the rest
        cur = cur.right

t = build(CHARGES)
print([kth_smallest(t, k) for k in range(1, 8)])
print(kth_smallest(build([5, 3, 6, 2, 4, None, None, 1]), 3), kth_smallest(build([3, 1, 4, None, 2]), 1))</div>
  <div class="fx" data-lang="text">[40, 60, 80, 120, 200, 250, 310]
3 1</div>
  <p>O(h + k) time, O(h) space. Follow-up interviewers love: "the tree changes often and you query often". Answer: store the subtree size in every node; then at each node compare k with the left size and go left, answer, or go right with k reduced. That is O(h) per query.</p>
  <div class="callout pred"><span class="label">Practice in the tracker</span>
    <p>From the <a class="xref" data-note="dsa_problems">Problem Tracker</a>: <b>104 Maximum Depth of Binary Tree</b>, <b>226 Invert Binary Tree</b>, <b>230 Kth Smallest Element in a BST</b>, then <b>100 Same Tree</b> and <b>101 Symmetric Tree</b> (two trees walked together).</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> The solutions are short, which makes small slips deadly: one wrong base case or one missing copy gives a silently wrong answer.</div>

  <h2 id="dsa-tr-traps"><span class="num">15</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The templates are right, so why do tree solutions still fail hidden tests? Almost always because of one of these five slips.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: checking a BST only against the parent</span>
    <p>Every node must respect <em>all</em> its ancestors. Pass (low, high) bounds down, or check that the inorder walk is strictly increasing. The typo tree with ₹100 under 250 passes the parent-only check and fails the real one.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: forgetting the None base case</span>
    <p><code>node.left.val</code> on a leaf crashes with <code>AttributeError: 'NoneType' object has no attribute 'val'</code>. Start every recursive function with <code>if node is None: return ...</code>, and choose that return value carefully (0, −1, True, <code>[]</code>).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: leaf vs None</span>
    <p>"Root-to-leaf" problems must test <code>node.left is None and node.right is None</code>. Testing for <code>node is None</code> instead counts a node with one child as the end of a path (wrong for Path Sum and Minimum Depth; on our tree it would wrongly end a path at 80 or 40).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: returning the wrong thing</span>
    <p>Diameter and max-path-sum: the function returns the one-sided depth, while the global <code>best</code> holds the two-sided path. Returning <code>l + r</code> upward lets a parent use a path that bends twice, which is not a path.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: edges vs nodes</span>
    <p>Height 3 or max depth 4? Diameter 5 edges or 6 nodes? Decide the unit before coding; off-by-one answers are the most common wrong submissions.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> We have nodes, traversals, recursion styles, the BST, balance, paths, LCA and rebuilding. How does each grow out of the previous ones, and what does each give on the charge tree?</div>

  <h2 id="dsa-tr-connect"><span class="num">16</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>How is each concept in this note built from the one before, which question does each answer, and when do you reach for it?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 660 300" width="660">
<defs><marker id="dsa-tr-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="10" width="190" height="44" rx="7" class="fr sr"/><text x="105" y="29" text-anchor="middle" font-size="11.5" font-weight="700">the need</text><text x="105" y="45" text-anchor="middle" class="tm" font-size="10">"inside" + sorted inserts</text>
<line x1="200" y1="32" x2="238" y2="32" stroke="currentColor" marker-end="url(#dsa-tr-a9)"/>
<rect x="240" y="10" width="180" height="44" rx="7" class="fb sb"/><text x="330" y="29" text-anchor="middle" font-size="11.5" font-weight="700">TreeNode</text><text x="330" y="45" text-anchor="middle" class="tm" font-size="10">7 nodes · height 3</text>
<line x1="420" y1="32" x2="458" y2="32" stroke="currentColor" marker-end="url(#dsa-tr-a9)"/>
<rect x="460" y="10" width="190" height="44" rx="7" class="fb sb"/><text x="555" y="29" text-anchor="middle" font-size="11.5" font-weight="700">DFS (stack) · BFS (queue)</text><text x="555" y="45" text-anchor="middle" class="tm" font-size="10">pre / in / post · levels</text>
<line x1="555" y1="54" x2="555" y2="86" stroke="currentColor" marker-end="url(#dsa-tr-a9)"/>
<rect x="460" y="88" width="190" height="44" rx="7" class="ft st"/><text x="555" y="107" text-anchor="middle" font-size="11.5" font-weight="700">post-order thinking</text><text x="555" y="123" text-anchor="middle" class="tm" font-size="10">height 3 · diameter 5</text>
<line x1="460" y1="110" x2="422" y2="110" stroke="currentColor" marker-end="url(#dsa-tr-a9)"/>
<rect x="240" y="88" width="180" height="44" rx="7" class="ft st"/><text x="330" y="107" text-anchor="middle" font-size="11.5" font-weight="700">BST rule</text><text x="330" y="123" text-anchor="middle" class="tm" font-size="10">inorder sorted · search O(h)</text>
<line x1="240" y1="110" x2="202" y2="110" stroke="currentColor" marker-end="url(#dsa-tr-a9)"/>
<rect x="10" y="88" width="190" height="44" rx="7" class="ft st"/><text x="105" y="107" text-anchor="middle" font-size="11.5" font-weight="700">balance</text><text x="105" y="123" text-anchor="middle" class="tm" font-size="10">sorted input: height 6 vs 2</text>
<line x1="555" y1="132" x2="555" y2="164" stroke="currentColor" marker-end="url(#dsa-tr-a9)"/>
<line x1="330" y1="132" x2="330" y2="164" stroke="currentColor" marker-end="url(#dsa-tr-a9)"/>
<line x1="555" y1="54" x2="140" y2="164" stroke="currentColor" stroke-opacity="0.4" stroke-dasharray="4 3" marker-end="url(#dsa-tr-a9)"/>
<rect x="10" y="166" width="190" height="44" rx="7" class="fg sg"/><text x="105" y="185" text-anchor="middle" font-size="11.5" font-weight="700">build from traversals</text><text x="105" y="201" text-anchor="middle" class="tm" font-size="10">pre root + in split</text>
<rect x="240" y="166" width="180" height="44" rx="7" class="fg sg"/><text x="330" y="185" text-anchor="middle" font-size="11.5" font-weight="700">top-down paths</text><text x="330" y="201" text-anchor="middle" class="tm" font-size="10">570 = 120 + 250 + 200</text>
<rect x="460" y="166" width="190" height="44" rx="7" class="fg sg"/><text x="555" y="185" text-anchor="middle" font-size="11.5" font-weight="700">LCA</text><text x="555" y="201" text-anchor="middle" class="tm" font-size="10">(60, 200) → 120</text>
<line x1="105" y1="210" x2="240" y2="244" stroke="currentColor" marker-end="url(#dsa-tr-a9)"/>
<line x1="330" y1="210" x2="330" y2="242" stroke="currentColor" marker-end="url(#dsa-tr-a9)"/>
<line x1="555" y1="210" x2="420" y2="244" stroke="currentColor" marker-end="url(#dsa-tr-a9)"/>
<rect x="160" y="244" width="340" height="48" rx="7" class="fv"/><text x="330" y="264" text-anchor="middle" font-size="11.5" font-weight="700">one move: "ask my children, combine with me"</text><text x="330" y="281" text-anchor="middle" class="tm" font-size="10">base case None · O(n) time · O(h) space</text>
</svg><figcaption>Nodes make traversals possible; traversals become computations when children answer first (post-order); the BST rule explains the sorted inorder and makes search O(h); balance keeps h small. Paths (information down), LCA (answers up) and rebuilding (divide by the root) are all the same recursive move.</figcaption></figure>
  <table class="tbl"><caption>Every concept on Biteful's charge tree</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on the running example</th><th>Use when</th></tr>
    <tr><td>Tree / TreeNode</td><td>nodes with left, right</td><td>how to store "inside" and branching?</td><td>7 nodes, 6 edges, root 120</td><td>hierarchies, ordered data</td></tr>
    <tr><td>Depth / height</td><td>edges counted down / up</td><td>how deep, how tall?</td><td>depth(60) = 3; height = 3</td><td>every cost statement</td></tr>
    <tr><td>DFS pre/in/post</td><td>recursion or an explicit stack</td><td>visit every node, in which order?</td><td>pre 120 80 40 60 250 200 310; in sorted</td><td>serialize (pre), sorted (in), compute (post)</td></tr>
    <tr><td>BFS</td><td>queue + len(q) per round</td><td>what is on each level?</td><td>[[120], [80, 250], [40, 200, 310], [60]]</td><td>per-level answers, min depth</td></tr>
    <tr><td>Post-order thinking</td><td>children's answers + me</td><td>height, diameter, balanced?</td><td>height 3, diameter 5, unbalanced at 80</td><td>any whole-tree measure</td></tr>
    <tr><td>BST</td><td>left &lt; node &lt; right everywhere</td><td>fast ordered search/insert?</td><td>search 200: 3 nodes; insert 90: 2 steps</td><td>sorted data with updates</td></tr>
    <tr><td>Balance</td><td>height control (rotations)</td><td>does O(h) stay O(log n)?</td><td>sorted inserts: height 6; balanced build: 2</td><td>always ask about input order</td></tr>
    <tr><td>Paths</td><td>top-down info + backtracking</td><td>which root-to-leaf route?</td><td>sums 300, 570, 680; target 570 → [120, 250, 200]</td><td>path sums, ancestor conditions</td></tr>
    <tr><td>LCA</td><td>BST walk or both-sides recursion</td><td>where do two routes meet?</td><td>(60, 200) → 120; (40, 60) → 40</td><td>distances, shared ancestors</td></tr>
    <tr><td>Build / serialize</td><td>preorder roots + inorder split</td><td>can we rebuild the shape?</td><td>"120,80,40,#,60,#,#,#,250,200,#,#,310,#,#"</td><td>saving, comparing trees</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>One sentence holds the note: <strong>stand at one node, decide what you need from your children (or what you pass down to them), handle the empty tree, and let recursion do the rest.</strong> The BST adds one rule that turns that walk into binary search, and balance keeps the walk short.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet</b>, then <a class="xref" data-note="dsa_heaps">Heaps</a>: a BST keeps <em>everything</em> sorted, which is more than many problems need. If we only ever want the most urgent delivery next, a weaker order is enough, and it fits in a plain list.</div>

  <h2 id="dsa-tr-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: charges <b>120, 80, 250, 40, 310, 80, 60, 200</b> inserted in arrival order give the BST 120 → (80 → (40 → right 60), 250 → (200, 310)); LeetCode list <code>[120, 80, 250, 40, None, 200, 310, None, 60]</code>.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question</th><th>On our data</th><th>Weakness → next</th></tr>
    <tr><td>Need</td><td>"inside" + cheap sorted inserts?</td><td>insort: 2× n → ~4× time</td><td>need linked nodes</td></tr>
    <tr><td>TreeNode</td><td>how to code it?</td><td>7 nodes, height 3</td><td>no single "next"</td></tr>
    <tr><td>DFS</td><td>visit order?</td><td>pre 120 80 40 60 250 200 310; in sorted; post 60 40 80 200 310 250 120</td><td>mixes levels</td></tr>
    <tr><td>BFS</td><td>per level?</td><td>[[120], [80, 250], [40, 200, 310], [60]]</td><td>visiting ≠ computing</td></tr>
    <tr><td>Post-order</td><td>height, diameter, balanced?</td><td>3, 5, no (at 80)</td><td>why is inorder sorted?</td></tr>
    <tr><td>BST</td><td>fast ordered lookups?</td><td>search 200: 3 nodes; validate with bounds</td><td>sorted input → chain</td></tr>
    <tr><td>Balance</td><td>keep O(log n)?</td><td>height 6 vs 2; 500 values: 499 vs 8</td><td>questions about routes</td></tr>
    <tr><td>Paths</td><td>root-to-leaf sum?</td><td>570 → [120, 250, 200]</td><td>meeting point of two nodes</td></tr>
    <tr><td>LCA</td><td>where do routes meet?</td><td>(60, 200) → 120</td><td>save and rebuild?</td></tr>
    <tr><td>Build</td><td>rebuild from lists?</td><td>pre + in → identical tree</td><td>→ Heaps</td></tr>
  </table>
  <h3>Rules and formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Rule</th><th>Symbols / notes</th></tr>
    <tr><td>Edges</td><td>n − 1</td><td>n = number of nodes</td></tr>
    <tr><td>Height</td><td>h(None) = −1; h(v) = 1 + max(h(left), h(right))</td><td>edges; LeetCode "depth" = h + 1 nodes</td></tr>
    <tr><td>Level size</td><td>at most 2<sup>d</sup> nodes on level d</td><td>perfect tree: 2<sup>h+1</sup> − 1 nodes</td></tr>
    <tr><td>Height bounds</td><td>⌊log₂ n⌋ ≤ h ≤ n − 1</td><td>balanced vs skewed</td></tr>
    <tr><td>Diameter</td><td>max over nodes of depth(left) + depth(right)</td><td>depth counted in nodes, result in edges</td></tr>
    <tr><td>Balanced</td><td>|h(left) − h(right)| ≤ 1 at every node</td><td>AVL rule</td></tr>
    <tr><td>BST</td><td>all left &lt; node &lt; all right</td><td>validate: node in (lo, hi), narrowing</td></tr>
    <tr><td>BST costs</td><td>search/insert/delete O(h)</td><td>O(log n) balanced, O(n) skewed</td></tr>
    <tr><td>Traversal costs</td><td>O(n) time; DFS O(h) space, BFS O(w)</td><td>w = widest level</td></tr>
    <tr><td>Distance(p, q)</td><td>depth(p) + depth(q) − 2·depth(LCA)</td><td>(60, 200): 3 + 2 − 0 = 5</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Bottom-up DFS</b><p>Height, size, diameter, balanced, any "combine children".</p><small>Not for "per level" answers (BFS)</small></div>
    <div><b>Top-down DFS</b><p>Path sums, bounds, ancestors' max/min.</p><small>Copy the path only at leaves</small></div>
    <div><b>BFS</b><p>Levels, right view, minimum depth, nearest.</p><small>O(width) memory on bushy trees</small></div>
    <div><b>BST</b><p>Ordered data with inserts, kth, successor.</p><small>Unbalanced on sorted input: use a balanced tree or sorted list</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p>Parent-only BST check; missing None base case; <code>node is None</code> instead of a real leaf test; returning l + r upward in diameter; edges vs nodes; <code>res.append(path)</code> without a copy; pushing left before right in iterative preorder; BST LCA on a non-BST; "O(log n)" without "balanced"; Python's recursion limit on skewed trees.</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Inorder of the charge tree?</td><td>40 60 80 120 200 250 310 (sorted, because it is a BST)</td></tr>
    <tr><td>Why is the charge tree not balanced?</td><td>At 80: left height 1, right height −1 (empty), difference 2</td></tr>
    <tr><td>Diameter, and where does it bend?</td><td>5 edges, at the root: 3 + 2</td></tr>
    <tr><td>LCA(40, 60)?</td><td>40: a node is its own ancestor and 60 is below it</td></tr>
    <tr><td>Space of DFS vs BFS on a tree?</td><td>O(h) vs O(w)</td></tr>
  </table>

  <h2 id="dsa-tr-qa"><span class="num">17</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Define depth and height. What is the height of a single node, and of an empty tree?</summary><div class="qa-body">Depth of a node = edges from the root down to it. Height of a node = edges on its longest path down to a leaf. A single node has height 0; an empty tree is −1 by convention. LeetCode's "max depth" counts nodes instead, so it gives 1 and 0. The charge tree: height 3, max depth 4.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A tree has n nodes. How many edges? Max nodes on level d? Min and max height of a binary tree?</summary><div class="qa-body">n − 1 edges (every node except the root has one parent edge). At most 2<sup>d</sup> nodes on level d. Height is at least ⌊log₂ n⌋ (packed full) and at most n − 1 (a chain).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Time and space of DFS vs BFS on a tree?</summary><div class="qa-body">Both O(n) time. DFS space O(h): one root-to-leaf path on the stack (log n balanced, n skewed). BFS space O(w), the widest level, up to about n/2 for a full tree. A deep narrow tree favours BFS; a wide shallow tree favours DFS.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is the inorder traversal of a BST sorted?</summary><div class="qa-body">Inorder visits the left subtree, then the node, then the right subtree. By the BST rule all of the left is smaller than the node and all of the right is bigger. Apply that at every node and the output is increasing.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you delete a BST node with two children?</summary><div class="qa-body">Find the inorder successor (go right once, then left as far as possible), copy its value into the node, then delete the successor from the right subtree. The successor has no left child, so that second delete is the easy 0- or 1-child case. Deleting 120 from the charge tree moves 200 to the root. The predecessor (max of the left) works too.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does "left child &lt; node &lt; right child at every node" fail to validate a BST?</summary><div class="qa-body">The rule is about whole subtrees. In the typo tree, ₹100 is a valid left child of 250 but lies in 120's right subtree while being smaller than 120. Pass the allowed (low, high) range down, narrowing it at each step: 100 must be in (120, 250) and is not.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does a self-balancing BST guarantee, and how?</summary><div class="qa-body">Height O(log n) after every insert or delete, so search, insert, delete are O(log n) worst case. It checks a balance rule (AVL: child heights differ by ≤ 1; red-black: colour rules) and repairs it with O(1) rotations along the update path.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>LCA in a BST vs a general binary tree: approach and cost?</summary><div class="qa-body">BST: from the root, go left if both values are smaller, right if both bigger, else stop; O(h) time, O(1) space. General: recurse; return the node if it is p or q; if both sides return non-None, this node is the LCA; else return the non-None side. O(n) time, O(h) space.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why must diameter use a separate "best" variable?</summary><div class="qa-body">The longest path may bend at any node, not only the root. The parent needs my one-sided depth (1 + max(l, r)) to extend a path, but the answer at my node is the two-sided l + r. So return one, record the other.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which pairs of traversals rebuild a binary tree uniquely?</summary><div class="qa-body">Preorder + inorder, or postorder + inorder, when values are distinct: pre/post give each root, inorder splits left from right. Preorder + postorder alone are ambiguous for nodes with one child; a single preorder with "#" markers for empty children is enough.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does iterative DFS need a stack and BFS a queue?</summary><div class="qa-body">DFS must return to the most recently postponed node (the deepest unfinished branch): newest first, LIFO. BFS must finish older (shallower) nodes before newer (deeper) ones: oldest first, FIFO. Swapping the two structures swaps the traversal, exactly as in the Stacks &amp; Queues note.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what would break if you computed "balanced" top-down, calling height() at every node?</summary><div class="qa-body">It would still be correct, but each height() call walks the whole subtree again. On a skewed tree that is n + (n − 1) + … = O(n²). Post-order computes every height once on the way up and checks balance in the same pass: O(n).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how is a BST related to binary search on a sorted list?</summary><div class="qa-body">Both discard half the candidates per comparison. The sorted list does it with indices lo/hi/mid but pays O(n) per insert (shifting). The BST stores the same decisions as nodes, so an insert just walks one path, O(h). Its inorder walk recovers the sorted list. If the tree is unbalanced, h grows to n and the advantage disappears.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does Path Sum pass information down while Diameter passes it up?</summary><div class="qa-body">A root-to-leaf sum depends on the ancestors (what is above me), so the parent must hand it down as an argument (top-down, preorder). The diameter at a node depends on the depths below it, which only the children know, so they must return them (bottom-up, postorder). Ask "who knows what I need?" to choose the direction.</div></details>
</main>
`
});
