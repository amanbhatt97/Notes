// notes/dsa/dsa_trees.js — Trees
Object.assign(TOPIC_CONTENT, {
  "dsa_trees": `<main>
  <h1>Trees</h1>
  <p class="lead">A tree is data with a "belongs to" shape: folders inside folders, people under a manager, moves after a move. Binary trees and binary search trees are the most asked interview topic after arrays. Almost every tree problem is solved by one short recursive function that asks its two children a question. Builds on recursion, stacks and queues.</p>

  <h2 id="dsa-tr-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Trees</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Words</div>
        <ul>
          <li><b>Root</b> — the top node, no parent · <b>leaf</b> — no children</li>
          <li><b>Depth</b> of a node — edges from the root down to it</li>
          <li><b>Height</b> of a node — edges from it down to its deepest leaf</li>
          <li>⚠ LeetCode "max depth" counts <em>nodes</em>; textbooks count <em>edges</em></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Binary tree</div>
        <ul>
          <li><b>TreeNode</b> — <code>val, left, right</code>; missing child = <code>None</code></li>
          <li><b>Balanced</b> — height ≈ log₂ n · <b>skewed</b> — height ≈ n (a linked list)</li>
          <li><b>Complete</b> — levels full, last filled from left (heaps)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Traversals</div>
        <ul>
          <li><b>Preorder</b> — me, left, right (copy / serialize)</li>
          <li><b>Inorder</b> — left, me, right (BST → sorted)</li>
          <li><b>Postorder</b> — left, right, me (sizes, heights, delete)</li>
          <li><b>Level order (BFS)</b> — <code>deque</code>, loop <code>len(q)</code> times per level</li>
          <li>All are O(n) time; space O(h) for DFS, O(width) for BFS</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">BST</div>
        <ul>
          <li><b>Rule</b> — everything left &lt; node &lt; everything right (whole subtrees, not just children)</li>
          <li><b>Search / insert / delete</b> — O(h): O(log n) balanced, O(n) skewed</li>
          <li><b>Delete with 2 children</b> — copy the inorder successor, delete it below</li>
          <li><b>Validate</b> — pass (low, high) bounds down</li>
          <li><b>AVL / red-black</b> — rotate to keep h = O(log n)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Patterns</div>
        <ul>
          <li><b>Bottom-up</b> — ask children, combine (height, diameter, balanced)</li>
          <li><b>Top-down</b> — pass info down (bounds, running sum, depth)</li>
          <li><b>Backtracking path</b> — append, recurse, pop (all root-to-leaf paths)</li>
          <li><b>BFS</b> — "level", "right side view", "minimum depth"</li>
          <li><b>BST + inorder</b> — "kth smallest", "sorted", "successor"</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Classic problems</div>
        <ul>
          <li><b>Max Depth, Invert</b> — 3-line recursion</li>
          <li><b>Validate BST</b> — bounds, not parent-only check</li>
          <li><b>LCA</b> — BST: walk by values · any tree: the node where both sides return something</li>
          <li><b>Diameter</b> — max of left + right depth at every node</li>
          <li><b>Construct, Serialize, Kth Smallest, Path Sum II</b></li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dsa-tr-need"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Folders &amp; Family Trees</span><span class="rm-sub">Why some data is not a line</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tr-vocab"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Words You Must Know</span><span class="rm-sub">Root, leaf, depth, height</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tr-node"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Binary Tree in Python</span><span class="rm-sub">TreeNode and a build helper</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tr-dfs"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Depth-First Traversals</span><span class="rm-sub">Pre, in, post; recursive and iterative</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tr-bfs"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Breadth-First: Level Order</span><span class="rm-sub">deque, one level at a time</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tr-recur"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Think Recursively</span><span class="rm-sub">Bottom-up vs top-down</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tr-bst"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Binary Search Tree</span><span class="rm-sub">Search, insert, delete, validate</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tr-balance"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Balanced Trees</span><span class="rm-sub">Why height matters; AVL &amp; red-black idea</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tr-python"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Trees in Real Python</span><span class="rm-sub">No built-in; bisect, dicts, recursion limit</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tr-patterns"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Patterns</span><span class="rm-sub">Signal words and templates</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tr-problems"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Classic Problems</span><span class="rm-sub">8 solved, tested</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tr-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Parent-only BST check, edges vs nodes</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tr-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="dsa-tr-need"><span class="num">01</span>Folders &amp; Family Trees</h2>
  <p>Open the file explorer on your laptop. <code>C:</code> holds <code>Users</code> and <code>Program Files</code>. <code>Users</code> holds <code>Aman</code>. <code>Aman</code> holds <code>Documents</code> and <code>Downloads</code>. Every folder sits inside exactly one parent folder, and can hold many folders of its own.</p>
  <p>A list cannot show this well. A list says "this comes after that". Folders say "this is <strong>inside</strong> that".</p>
  <p>Family trees (one father each), company org charts (one boss each), the HTML of a web page (the DOM tree), and the moves of a chess game all have it.</p>
  <p>That shape is a <strong>tree</strong>: items (nodes) joined by "parent → child" links, with one item at the top and no loops. The reason programmers love it: if the tree is bushy, the path from the top to any item is short. A million items fit in a tree only about 20 levels deep, so "walk down from the top" is fast. That is how databases (B-trees), file systems, and <code>TreeMap</code> in Java find things.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Finding a flat in a city: state → city → area → building → floor → flat. At each step you pick one branch and ignore all the others. Six choices find one flat among millions. Where it breaks: a real address is fixed; in a tree program, you must decide the rule for "which branch" (that is what a binary search tree does).</p>
  </div>

  <h2 id="dsa-tr-vocab"><span class="num">02</span>Words You Must Know</h2>
  <p>Interviewers use these words without explaining them. Learn them on one picture.</p>
  <figure class="viz"><svg viewBox="0 0 600 272" width="600"><rect x="118" y="84" width="164" height="140" rx="10" fill="none" class="sg" stroke-dasharray="5 4"/><line x1="300" y1="40" x2="200" y2="110" stroke="currentColor"/><line x1="300" y1="40" x2="400" y2="110" stroke="currentColor"/><line x1="200" y1="110" x2="150" y2="180" stroke="currentColor"/><line x1="200" y1="110" x2="250" y2="180" stroke="currentColor"/><line x1="400" y1="110" x2="450" y2="180" stroke="currentColor"/><circle cx="300" cy="40" r="18" class="fb sb"/><text x="300" y="44" text-anchor="middle">1</text><circle cx="200" cy="110" r="18" class="fb sb"/><text x="200" y="114" text-anchor="middle">2</text><circle cx="400" cy="110" r="18" class="fb sb"/><text x="400" y="114" text-anchor="middle">3</text><circle cx="150" cy="180" r="18" class="fg sg"/><text x="150" y="184" text-anchor="middle">4</text><circle cx="250" cy="180" r="18" class="fg sg"/><text x="250" y="184" text-anchor="middle">5</text><circle cx="450" cy="180" r="18" class="fg sg"/><text x="450" y="184" text-anchor="middle">6</text><text x="324" y="44" class="tb">root (no parent)</text><text x="300" y="114" text-anchor="middle" class="tm">← siblings →</text><text x="356" y="70" class="tm">edge</text><text x="150" y="214" text-anchor="middle" class="tg">leaf</text><text x="250" y="214" text-anchor="middle" class="tg">leaf</text><text x="450" y="214" text-anchor="middle" class="tg">leaf</text><text x="20" y="44" class="tm">depth 0</text><text x="20" y="114" class="tm">depth 1</text><text x="20" y="184" class="tm">depth 2</text><text x="426" y="114" class="tm">depth 1, height 1</text><text x="474" y="184" class="tm">depth 2, height 0</text><text x="200" y="242" text-anchor="middle" class="tg">subtree of 2</text><text x="300" y="264" text-anchor="middle">height of the tree = 2 (edges, root to deepest leaf)</text></svg><figcaption>One tree, all the words. Depth is measured from the top down; height is measured from the bottom up. The dashed box is the subtree rooted at node 2.</figcaption></figure>
  <table class="tbl">
    <tr><th>Word</th><th>Plain meaning</th><th>In the picture</th></tr>
    <tr><td><strong>Edge</strong></td><td>One parent → child link</td><td>5 edges (always n − 1 for n nodes)</td></tr>
    <tr><td><strong>Root / leaf</strong></td><td>No parent / no children</td><td>1 / 4, 5, 6</td></tr>
    <tr><td><strong>Ancestor / descendant</strong></td><td>Anyone on the path up / anyone below</td><td>1 and 2 are ancestors of 5</td></tr>
    <tr><td><strong>Depth</strong> of a node</td><td>Edges from the root down to it</td><td>depth(6) = 2; level 1 = {2, 3}</td></tr>
    <tr><td><strong>Height</strong> of a node</td><td>Edges on the longest path from it down to a leaf</td><td>height(3) = 1, height(leaf) = 0</td></tr>
    <tr><td><strong>Height of the tree</strong></td><td>Height of the root = max depth of any node</td><td>2</td></tr>
  </table>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Edges or nodes? Textbooks: a lone leaf has height 0 (edges). LeetCode "Maximum Depth": a lone node has depth 1 (nodes). Both are fine; say which one you use before you code. The two differ by exactly 1.</p>
  </div>

  <h2 id="dsa-tr-node"><span class="num">03</span>Binary Tree in Python</h2>
  <p>A <strong>binary tree</strong> is a tree where every node has at most two children, called <code>left</code> and <code>right</code>. Interviews use it 90% of the time because two children make code short. In Python it is one tiny class: a value and two links, exactly like a linked list node with two <code>next</code> pointers.</p>
  <div class="fx" data-lang="py">class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val = val
        self.left = left       # left child, or None
        self.right = right     # right child, or None

#        1
#       / \\
#      2   3
#     / \\
#    4   5
root = TreeNode(1, TreeNode(2, TreeNode(4), TreeNode(5)), TreeNode(3))
print(root.val, root.left.val, root.right.val, root.left.right.val)
print(root.right.left)            # a missing child is just None</div>
  <div class="fx" data-lang="text">1 2 3 5
None</div>
  <p>Typing nested <code>TreeNode(...)</code> calls gets painful. LeetCode writes trees as a list read level by level, with <code>None</code> for a missing child: <code>[1, 2, 3, 4, 5, None, 6]</code>. This helper turns that list into nodes. Every example below uses it, along with two tiny measuring functions.</p>
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

t = build([1, 2, 3, 4, 5, None, 6])
print("size", size(t), "height", height(t))
print("one node:", height(build([7])), " empty:", height(build([])))</div>
  <div class="fx" data-lang="text">size 6 height 2
one node: 0  empty: -1</div>
  <p>Look at <code>height</code>: "my height is one more than my taller child". The empty tree returns −1 so that a leaf gets −1 + 1 = 0. This "ask the children, add myself" shape is the whole of tree programming. You will see it again in every problem.</p>
  <p>Four shape names you will hear: <strong>full</strong> (every node has 0 or 2 children), <strong>complete</strong> (every level full except the last, filled from the left; heaps), <strong>perfect</strong> (every level full: 2<sup>h+1</sup> − 1 nodes) and <strong>skewed</strong> (one child each: really a linked list, height n − 1).</p>

  <h2 id="dsa-tr-dfs"><span class="num">04</span>Depth-First Traversals</h2>
  <p>A list is visited left to right. A tree has no single "next", so we must pick an order. <strong>Depth-first</strong> means: go as deep as possible down one branch before trying the next one, like exploring a maze by always taking the leftmost corridor until it ends, then stepping back.</p>
  <p>At every node there are three jobs: handle me, visit my left subtree, visit my right subtree. The three classic orders differ only in <strong>when "me" happens</strong>.</p>
  <figure class="viz"><svg viewBox="0 0 612 228" width="612"><defs><g id="tr-t3"><line x1="100" y1="55" x2="55" y2="115" stroke="currentColor"/><line x1="100" y1="55" x2="145" y2="115" stroke="currentColor"/><line x1="55" y1="115" x2="30" y2="175" stroke="currentColor"/><line x1="55" y1="115" x2="80" y2="175" stroke="currentColor"/><line x1="145" y1="115" x2="170" y2="175" stroke="currentColor"/><circle cx="100" cy="55" r="15" class="fb sb"/><text x="100" y="59" text-anchor="middle">1</text><circle cx="55" cy="115" r="15" class="fb sb"/><text x="55" y="119" text-anchor="middle">2</text><circle cx="145" cy="115" r="15" class="fb sb"/><text x="145" y="119" text-anchor="middle">3</text><circle cx="30" cy="175" r="15" class="fb sb"/><text x="30" y="179" text-anchor="middle">4</text><circle cx="80" cy="175" r="15" class="fb sb"/><text x="80" y="179" text-anchor="middle">5</text><circle cx="170" cy="175" r="15" class="fb sb"/><text x="170" y="179" text-anchor="middle">6</text></g></defs><use href="#tr-t3"/><text x="100" y="20" text-anchor="middle" class="tb">preorder: me, L, R</text><text x="117" y="43" class="tr">#1</text><text x="72" y="103" class="tr">#2</text><text x="162" y="103" class="tr">#5</text><text x="47" y="163" class="tr">#3</text><text x="97" y="163" class="tr">#4</text><text x="187" y="163" class="tr">#6</text><text x="100" y="215" text-anchor="middle">1 2 4 5 3 6</text><use href="#tr-t3" x="200"/><text x="300" y="20" text-anchor="middle" class="tb">inorder: L, me, R</text><text x="317" y="43" class="tr">#4</text><text x="272" y="103" class="tr">#2</text><text x="362" y="103" class="tr">#5</text><text x="247" y="163" class="tr">#1</text><text x="297" y="163" class="tr">#3</text><text x="387" y="163" class="tr">#6</text><text x="300" y="215" text-anchor="middle">4 2 5 1 3 6</text><use href="#tr-t3" x="400"/><text x="500" y="20" text-anchor="middle" class="tb">postorder: L, R, me</text><text x="517" y="43" class="tr">#6</text><text x="472" y="103" class="tr">#3</text><text x="562" y="103" class="tr">#5</text><text x="447" y="163" class="tr">#1</text><text x="497" y="163" class="tr">#2</text><text x="587" y="163" class="tr">#4</text><text x="500" y="215" text-anchor="middle">4 5 2 6 3 1</text></svg><figcaption>The same tree visited three ways. Red #k is the step at which that node is "handled". Only the position of "me" changes: before, between, or after the two subtrees.</figcaption></figure>
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

t = build([1, 2, 3, 4, 5, None, 6])
print("pre ", preorder(t, []))
print("in  ", inorder(t, []))
print("post", postorder(t, []))</div>
  <div class="fx" data-lang="text">pre  [1, 2, 4, 5, 3, 6]
in   [4, 2, 5, 1, 3, 6]
post [4, 5, 2, 6, 3, 1]</div>
  <table class="tbl">
    <tr><th>Order</th><th>Me is handled</th><th>Use it when</th></tr>
    <tr><td><strong>Preorder</strong></td><td>before the children</td><td>Copying or saving a tree (serialize), printing folders with indentation, passing info down</td></tr>
    <tr><td><strong>Inorder</strong></td><td>between left and right</td><td>BST: gives values in <strong>sorted</strong> order. Kth smallest, validate BST</td></tr>
    <tr><td><strong>Postorder</strong></td><td>after both children</td><td>Need the children's answers first: height, size, diameter, deleting a tree, folder disk usage</td></tr>
  </table>
  <h3>Iterative: your own stack</h3>
  <p>Recursion uses Python's call stack behind the scenes. Python stops at about 1000 nested calls (<code>RecursionError</code>). A skewed tree of 5,000 nodes breaks the recursive version. The cure: keep the stack yourself in a list. Interviewers also ask for this to check you understand what recursion really does.</p>
  <div class="fx" data-lang="py">def preorder_iter(root):
    out, stack = [], [root] if root else []
    while stack:
        node = stack.pop()
        out.append(node.val)
        if node.right: stack.append(node.right)   # push right first...
        if node.left:  stack.append(node.left)    # ...so left pops first
    return out

def inorder_iter(root):
    out, stack, cur = [], [], root
    while cur or stack:
        while cur:                  # walk left as far as possible
            stack.append(cur)
            cur = cur.left
        cur = stack.pop()           # leftmost node not yet visited
        out.append(cur.val)
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

t = build([1, 2, 3, 4, 5, None, 6])
print(preorder_iter(t), inorder_iter(t), postorder_iter(t))
print(preorder_iter(None), inorder_iter(None), postorder_iter(None))</div>
  <div class="fx" data-lang="text">[1, 2, 4, 5, 3, 6] [4, 2, 5, 1, 3, 6] [4, 5, 2, 6, 3, 1]
[] [] []</div>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>A stack is last-in-first-out, so push the child you want <em>later</em> first. Inorder is the odd one: "slide left, pushing everything; pop one; go right once; repeat". Postorder has a cheat: preorder with the children swapped gives me-right-left, and reversing that gives left-right-me.</p>
  </div>
  <p>All three are O(n) time: every node is pushed and popped once. Extra space is O(h), the height, because the stack holds at most one path. That is O(log n) for a balanced tree and O(n) for a skewed one.</p>

  <h2 id="dsa-tr-bfs"><span class="num">05</span>Breadth-First: Level Order</h2>
  <p>Sometimes you want the tree floor by floor: the CEO, then everyone reporting to the CEO, then everyone below them. That is <strong>breadth-first search (BFS)</strong>. A stack goes deep; a <strong>queue</strong> goes wide. Take a node from the front, put its children at the back.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A wedding invitation chain. Dada-ji calls his 3 children first. Each of them, after hanging up, adds their own children to the "to call" list at the end. The whole family is reached generation by generation, never jumping ahead.</p>
  </div>
  <p>Use <code>collections.deque</code>, not a list: <code>list.pop(0)</code> shifts every item (O(n)); <code>deque.popleft()</code> is O(1). To group nodes by level, read <code>len(q)</code> at the start of each round. That number is exactly the size of the current level, because the queue holds nothing else yet.</p>
  <div class="fx" data-lang="py">from collections import deque

def level_order(root):
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

print(level_order(build([3, 9, 20, None, None, 15, 7])))
print(level_order(build([1, 2, 3, 4, 5, None, 6])))
print(level_order(build([1])), level_order(build([])))</div>
  <div class="fx" data-lang="text">[[3], [9, 20], [15, 7]]
[[1], [2, 3], [4, 5, 6]]
[[1]] []</div>
  <table class="tbl out"><caption>Dry run on [3, 9, 20, None, None, 15, 7]</caption>
    <tr><th>queue at start of round</th><th>len(q)</th><th>pops</th><th>pushes</th><th>level</th></tr>
    <tr><td>[3]</td><td>1</td><td>3</td><td>9, 20</td><td>[3]</td></tr>
    <tr><td>[9, 20]</td><td>2</td><td>9, 20</td><td>15, 7</td><td>[9, 20]</td></tr>
    <tr><td>[15, 7]</td><td>2</td><td>15, 7</td><td>–</td><td>[15, 7]</td></tr>
  </table>
  <p>This is LeetCode 102 <strong>Binary Tree Level Order Traversal</strong>, solved. Time O(n). Space O(w), where w is the widest level; for a full tree the last level holds about n/2 nodes. Small changes give many other problems: keep only <code>level[-1]</code> (Right Side View), reverse every second level (Zigzag), stop at the first leaf (Minimum Depth), average each level.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Writing <code>for _ in range(len(q))</code> is safe because <code>range</code> is computed once. Writing <code>while q:</code> for the inner loop instead mixes levels, because children are being added while you loop.</p>
  </div>

  <h2 id="dsa-tr-recur"><span class="num">06</span>Think Recursively</h2>
  <p>Most tree problems look scary until you stop thinking about the whole tree. Stand at <strong>one node</strong> and ask: "If my left child and right child already gave me their answers, how do I make mine?" Then add the empty-tree case. That is the entire method.</p>
  <div class="flow"><span>Base case: node is None → return the "nothing" answer</span><span>Ask left child</span><span>Ask right child</span><span>Combine with my value → return</span></div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A school principal wants the total number of students. She asks each class teacher, each teacher asks each row monitor, each monitor counts their row. Nobody counts the whole school. Every person only adds up the numbers handed to them, plus themselves.</p>
  </div>
  <p>There are two directions information can flow:</p>
  <ul>
    <li><strong>Bottom-up</strong> (postorder): answers flow up from the leaves. Size, sum, height, "is it balanced", diameter.</li>
    <li><strong>Top-down</strong> (preorder): facts flow down from the root as extra arguments. Current depth, running path sum, the allowed (low, high) range in a BST.</li>
  </ul>
  <div class="fx" data-lang="py"># bottom-up: ask both children, combine their answers
def tree_sum(node):
    if node is None:
        return 0                                   # base case: empty tree
    return node.val + tree_sum(node.left) + tree_sum(node.right)

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

t = build([1, 2, 3, 4, 5, None, 6])
print("sum", tree_sum(t), "balanced", is_balanced(t), "depths", depths(t))
print("chain balanced?", is_balanced(build([1, 2, None, 3])))</div>
  <div class="fx" data-lang="text">sum 21 balanced True depths {1: 0, 2: 1, 4: 2, 5: 2, 3: 1, 6: 2}
chain balanced? False</div>
  <p><code>is_balanced</code> shows a useful trick: return a special value (−2) to mean "already failed", so one pass gives both the height and the yes/no answer. Calling a separate <code>height()</code> at every node instead would be O(n²) on a skewed tree.</p>

  <h2 id="dsa-tr-bst"><span class="num">07</span>Binary Search Tree</h2>
  <p>A plain binary tree has no order, so finding a value means checking every node: O(n). Now add one rule and searching becomes like a phone book.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Binary search tree (BST)</strong>: for every node, <em>all</em> values in its left subtree are smaller and <em>all</em> values in its right subtree are bigger. (Duplicates: either not allowed, or always sent to one side; say which.)</p>
  </div>
  <p>To find 60 in the tree 50 → (30, 70): 60 &gt; 50, go right. 60 &lt; 70, go left. Found. Each step throws away a whole subtree, exactly like binary search on a sorted list (see the Binary Search note). The cost is the number of levels walked, O(h).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>"Guess my number between 1 and 100" with hints "higher / lower". A BST is that game frozen into a structure: the root is your first guess, each child is the next guess after the hint.</p>
  </div>
  <h3>Insert</h3>
  <p>Walk down as if searching. Where you fall off the tree (a <code>None</code>), the new node goes. The recursive version returns the (possibly new) subtree root, so the parent can hook it in with <code>node.left = ...</code>.</p>
  <h3>Delete: three cases</h3>
  <table class="tbl">
    <tr><th>Node to delete has</th><th>What to do</th></tr>
    <tr><td>0 children (leaf)</td><td>Just remove it: return <code>None</code> to the parent</td></tr>
    <tr><td>1 child</td><td>Lift that child up into its place</td></tr>
    <tr><td>2 children</td><td>Find the <strong>inorder successor</strong> (smallest value in the right subtree: go right once, then left until you can't). Copy its value here, then delete the successor from the right subtree. It has no left child, so that delete is case 1 or 2.</td></tr>
  </table>
  <figure class="viz"><svg viewBox="0 0 600 228" width="600"><defs><marker id="tr-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tg"/></marker></defs><text x="150" y="20" text-anchor="middle">1. delete 50 (two children)</text><line x1="150" y1="55" x2="90" y2="120" stroke="currentColor"/><line x1="150" y1="55" x2="210" y2="120" stroke="currentColor"/><line x1="210" y1="120" x2="170" y2="185" stroke="currentColor"/><line x1="210" y1="120" x2="250" y2="185" stroke="currentColor"/><circle cx="150" cy="55" r="17" class="fr sr"/><text x="150" y="59" text-anchor="middle">50</text><circle cx="90" cy="120" r="17" class="fb sb"/><text x="90" y="124" text-anchor="middle">40</text><circle cx="210" cy="120" r="17" class="fb sb"/><text x="210" y="124" text-anchor="middle">70</text><circle cx="170" cy="185" r="17" class="fg sg"/><text x="170" y="189" text-anchor="middle">60</text><circle cx="250" cy="185" r="17" class="fb sb"/><text x="250" y="189" text-anchor="middle">80</text><path d="M155,170 Q120,125 143,73" fill="none" class="sg" stroke-width="1.5" stroke-dasharray="4 3" marker-end="url(#tr-a1)"/><text x="170" y="220" text-anchor="middle" class="tg">successor = min of right side</text><text x="300" y="120" text-anchor="middle">→</text><text x="465" y="20" text-anchor="middle">2. copy 60 up, delete old 60</text><line x1="465" y1="55" x2="405" y2="120" stroke="currentColor"/><line x1="465" y1="55" x2="525" y2="120" stroke="currentColor"/><line x1="525" y1="120" x2="565" y2="185" stroke="currentColor"/><circle cx="465" cy="55" r="17" class="fg sg"/><text x="465" y="59" text-anchor="middle">60</text><circle cx="405" cy="120" r="17" class="fb sb"/><text x="405" y="124" text-anchor="middle">40</text><circle cx="525" cy="120" r="17" class="fb sb"/><text x="525" y="124" text-anchor="middle">70</text><circle cx="565" cy="185" r="17" class="fb sb"/><text x="565" y="189" text-anchor="middle">80</text><text x="465" y="220" text-anchor="middle" class="tm">still: left &lt; 60 &lt; right</text></svg><figcaption>Deleting a node with two children. 60 is the next bigger value, so it can sit where 50 was: everything on the left is still smaller, everything on the right still bigger.</figcaption></figure>
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
for x in [50, 30, 70, 20, 40, 60, 80]:
    root = bst_insert(root, x)
print("inorder", inorder(root, []))
print("find 60:", bst_search(root, 60).val, " find 65:", bst_search(root, 65))
for x in [20, 30, 50]:
    root = bst_delete(root, x)
    print(f"delete {x}:", level_order(root))</div>
  <div class="fx" data-lang="text">inorder [20, 30, 40, 50, 60, 70, 80]
find 60: 60  find 65: None
delete 20: [[50], [30, 70], [40, 60, 80]]
delete 30: [[50], [40, 70], [60, 80]]
delete 50: [[60], [40, 70], [80]]</div>
  <p>The inorder walk prints 20 … 80 sorted. That is not luck: "left subtree, me, right subtree" with "left &lt; me &lt; right" must give sorted order. <strong>Inorder of a BST is sorted</strong> is the single most useful BST fact. Delete 20 is a leaf, delete 30 has one child (40 moves up), delete 50 is the two-children case in the picture.</p>
  <h3>Validate a BST (LeetCode 98)</h3>
  <p>The tempting check is "left child &lt; node &lt; right child" at every node. It is wrong. In <code>[5, 4, 6, None, None, 3, 7]</code>, node 6 has children 3 and 7, which look fine locally, but 3 sits in the right subtree of 5 and is smaller than 5. Fix: pass down the range each node must fall in. Going left, the upper bound becomes the node's value; going right, the lower bound does.</p>
  <div class="fx" data-lang="py">def is_valid_bst(root):
    def ok(node, lo, hi):            # every value here must be in (lo, hi)
        if node is None:
            return True
        if not (lo &lt; node.val &lt; hi):
            return False
        return ok(node.left, lo, node.val) and ok(node.right, node.val, hi)
    return ok(root, float("-inf"), float("inf"))

for vals in [[2, 1, 3], [5, 1, 4, None, None, 3, 6], [5, 4, 6, None, None, 3, 7], [2, 2, 2], []]:
    print(vals, is_valid_bst(build(vals)))</div>
  <div class="fx" data-lang="text">[2, 1, 3] True
[5, 1, 4, None, None, 3, 6] False
[5, 4, 6, None, None, 3, 7] False
[2, 2, 2] False
[] True</div>
  <p>O(n) time, O(h) space. Equal values fail because of strict <code>&lt;</code>, which matches LeetCode. Another correct way: do an inorder walk and check that every value is bigger than the previous one.</p>
  <p><strong>Cost summary:</strong> search, insert, delete, min, max and successor all walk one path, so they are O(h): O(log n) when balanced, O(n) when skewed. A full inorder walk is O(n).</p>

  <h2 id="dsa-tr-balance"><span class="num">08</span>Balanced Trees</h2>
  <p>Every BST cost above is O(h). So everything depends on the height. Here is the danger: insert values that are already sorted, and each new value is bigger than all before it, so it always goes right. The "tree" becomes a straight line.</p>
  <div class="fx" data-lang="py">def sorted_to_bst(a, lo=0, hi=None):
    if hi is None:
        hi = len(a) - 1
    if lo &gt; hi:
        return None
    mid = (lo + hi) // 2                     # middle value becomes the root
    return TreeNode(a[mid], sorted_to_bst(a, lo, mid - 1), sorted_to_bst(a, mid + 1, hi))

n = 500
skewed = None
for x in range(n):                           # inserting sorted data
    skewed = bst_insert(skewed, x)
balanced = sorted_to_bst(list(range(n)))
print("skewed height  :", height(skewed))
print("balanced height:", height(balanced))</div>
  <div class="fx" data-lang="text">skewed height  : 499
balanced height: 8</div>
  <p>Same 500 values. One shape needs up to 499 steps per search, the other 8. With a million values the gap is 999,999 vs 19. Sorted input is common in real life (IDs, timestamps), so a plain BST is risky.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A <em>tarazu</em> (balance scale) in a kirana shop. Keep adding weight on one side and it tips. The shopkeeper moves weights across to level it. Self-balancing trees do the same: after each insert or delete, if one side got too heavy, they move a few nodes across.</p>
  </div>
  <p>The "moving across" is called a <strong>rotation</strong>: a parent and child swap roles in O(1), keeping the BST order. Two famous designs decide when to rotate:</p>
  <table class="tbl">
    <tr><th></th><th>AVL tree</th><th>Red-black tree</th></tr>
    <tr><td>Rule</td><td>At every node, left and right heights differ by at most 1</td><td>Nodes coloured red/black; no two reds in a row; same number of blacks on every root-to-leaf path</td></tr>
    <tr><td>Height</td><td>≤ ~1.44 log₂ n (stricter)</td><td>≤ 2 log₂ n (looser)</td></tr>
    <tr><td>Used in</td><td>Some databases, in-memory indexes</td><td>Java <code>TreeMap</code>, C++ <code>std::map</code>, Linux scheduler</td></tr>
  </table>
  <p>For interviews you only need the idea: "a self-balancing BST guarantees O(log n) search, insert and delete by rotating after updates". Nobody expects you to code red-black insert on a whiteboard.</p>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>Building a balanced BST from a sorted list is easy: the middle element becomes the root, the left half builds the left subtree, the right half the right subtree. That is <code>sorted_to_bst</code> above and LeetCode 108.</p>
  </div>

  <h2 id="dsa-tr-python"><span class="num">09</span>Trees in Real Python</h2>
  <p>Python has <strong>no built-in tree or sorted-map type</strong>. In interviews you write <code>TreeNode</code> yourself. In real code you usually reach for something else. For general trees (any number of children: org charts, folders, comment threads) a plain dict <code>{parent: [children]}</code> is enough.</p>
  <div class="fx" data-lang="py">import bisect

# A sorted list + bisect: a simple "ordered set"
marks = []
for m in [67, 92, 45, 88, 73]:
    bisect.insort(marks, m)                  # O(n) shift, but very fast in C
print(marks)
i = bisect.bisect_left(marks, 80)
print("smallest &gt;= 80:", marks[i], " largest &lt; 80:", marks[i - 1])</div>
  <div class="fx" data-lang="text">[45, 67, 73, 88, 92]
smallest &gt;= 80: 88  largest &lt; 80: 73</div>
  <div class="cards">
    <div><b>bisect on a sorted list</b><p>Search, floor, ceiling in O(log n). Insert is O(n) but a fast C memory shift; fine up to ~10⁵ items.</p><small>The usual BST replacement in interviews</small></div>
    <div><b>sortedcontainers</b><p><code>SortedList</code>, <code>SortedDict</code>: O(log n) add/remove, used like a balanced BST.</p><small>Third-party (pip install); allowed on LeetCode</small></div>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Recursion depth. Python allows about 1000 nested calls. A skewed tree from LeetCode can have 10⁴ nodes in a line. Either use the iterative versions or call <code>sys.setrecursionlimit(10**5)</code> at the top. Mention this in interviews; it shows you know Python's limits.</p>
  </div>

  <h2 id="dsa-tr-patterns"><span class="num">10</span>Patterns</h2>
  <table class="tbl">
    <tr><th>Signal words</th><th>Pattern</th><th>Shape of the code</th></tr>
    <tr><td>"maximum / minimum / longest", "height", "is balanced", "diameter"</td><td><strong>Bottom-up DFS</strong></td><td><code>l = f(left); r = f(right); return combine(l, r, node)</code>, often with a <code>nonlocal best</code></td></tr>
    <tr><td>"root-to-leaf", "path from root", "good nodes", "valid range"</td><td><strong>Top-down DFS</strong></td><td><code>f(node, info_so_far)</code>, update info, pass to children</td></tr>
    <tr><td>"all paths", "list every path"</td><td><strong>Backtracking</strong></td><td><code>path.append(v); recurse; path.pop()</code>, save <code>path[:]</code> at leaves</td></tr>
    <tr><td>"level", "row", "right side view", "zigzag", "minimum depth", "nearest"</td><td><strong>BFS with level size</strong></td><td><code>for _ in range(len(q))</code></td></tr>
    <tr><td>"BST" + "kth", "sorted", "closest", "successor", "range"</td><td><strong>Use the BST order</strong></td><td>Inorder = sorted; or walk left/right by comparing</td></tr>
    <tr><td>"lowest common ancestor", "distance between two nodes"</td><td><strong>LCA</strong></td><td>Return the node found from each side; the split point is the answer</td></tr>
    <tr><td>"construct / rebuild from traversals"</td><td><strong>Divide by the root</strong></td><td>Root from pre/postorder, split by its index in inorder</td></tr>
    <tr><td>"serialize", "encode", "same tree", "subtree"</td><td><strong>Traversal with None markers</strong></td><td>Preorder with <code>"#"</code> for empty children</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>When the answer is not "returned upward" but can appear anywhere (diameter, max path sum), use two things: the function <em>returns</em> what the parent needs (one-sided depth), and a separate <code>best</code> variable <em>records</em> what the question asks (two-sided path). Mixing those two is the classic bug.</p>
  </div>

  <h2 id="dsa-tr-problems"><span class="num">11</span>Classic Problems</h2>
  <p>Level Order (LeetCode 102) and Validate BST (98) were solved above. Here are eight more. Every one uses <code>TreeNode</code>, <code>build</code> and <code>level_order</code> from earlier.</p>

  <h3>1. Maximum Depth of Binary Tree (LeetCode 104)</h3>
  <p>Number of nodes on the longest root-to-leaf path. Bottom-up: "my depth = 1 + the deeper child". Without recursion: <code>len(level_order(root))</code>.</p>
  <div class="fx" data-lang="py">def max_depth(root):                       # counts NODES on the longest path
    if root is None:
        return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))

for vals in [[3, 9, 20, None, None, 15, 7], [1, None, 2], [], [0]]:
    print(vals, "-&gt;", max_depth(build(vals)))</div>
  <div class="fx" data-lang="text">[3, 9, 20, None, None, 15, 7] -&gt; 3
[1, None, 2] -&gt; 2
[] -&gt; 0
[0] -&gt; 1</div>
  <p>O(n) time, O(h) space. It counts nodes, so it equals textbook height + 1.</p>

  <h3>2. Invert Binary Tree (LeetCode 226)</h3>
  <p>Mirror the tree: every left child becomes a right child. At each node, swap the two children, after inverting them.</p>
  <div class="fx" data-lang="py">def invert_tree(root):
    if root is None:
        return None
    root.left, root.right = invert_tree(root.right), invert_tree(root.left)
    return root

for vals in [[4, 2, 7, 1, 3, 6, 9], [2, 1, 3], []]:
    print(vals, "-&gt;", level_order(invert_tree(build(vals))))</div>
  <div class="fx" data-lang="text">[4, 2, 7, 1, 3, 6, 9] -&gt; [[4], [7, 2], [9, 6, 3, 1]]
[2, 1, 3] -&gt; [[2], [3, 1]]
[] -&gt; []</div>
  <p>O(n) time, O(h) space. The tuple assignment evaluates both right-hand calls first, so nothing is overwritten too early. Inverting a BST turns its inorder from ascending into descending.</p>

  <h3>3. Lowest Common Ancestor (LeetCode 235 for BST, 236 for any tree)</h3>
  <p>The LCA of p and q is the deepest node that has both below it (a node counts as its own descendant). Family version: the closest common grandparent of two cousins.</p>
  <p><strong>In a BST</strong> the values tell you the way. If both are smaller than the node, the LCA is on the left; both bigger, on the right. Otherwise they split here, so this node is the answer. <strong>In any binary tree</strong>, search both sides. A side returns the p or q node it found, or <code>None</code>. If both sides return something, p and q are on different sides, so I am the LCA. Otherwise pass up whatever was found.</p>
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

bst = build([6, 2, 8, 0, 4, 7, 9, None, None, 3, 5])
print("BST:", lca_bst(bst, 2, 8).val, lca_bst(bst, 2, 4).val, lca_bst(bst, 3, 5).val)
bt = build([3, 5, 1, 6, 2, 0, 8, None, None, 7, 4])
print("BT :", lca(bt, 5, 1).val, lca(bt, 5, 4).val, lca(bt, 7, 8).val)</div>
  <div class="fx" data-lang="text">BST: 6 2 4
BT : 3 5 3</div>
  <p>BST: O(h) time, O(1) space. General: O(n) time, O(h) space. In <code>lca(bt, 5, 4)</code>, 4 is below 5, so the search stops at 5 and returns it; that is correct because the problem guarantees both exist.</p>

  <h3>4. Diameter of Binary Tree (LeetCode 543)</h3>
  <p>The longest path (in edges) between any two nodes. It may not pass through the root. At every node, the longest path bending there = depth of left side + depth of right side. Track the best of these; return the one-sided depth to the parent.</p>
  <figure class="viz"><svg viewBox="0 0 600 310" width="600"><line x1="300" y1="35" x2="230" y2="85" stroke="currentColor"/><line x1="230" y1="85" x2="180" y2="135" class="sg" stroke-width="3"/><line x1="230" y1="85" x2="280" y2="135" class="sg" stroke-width="3"/><line x1="180" y1="135" x2="140" y2="185" class="sg" stroke-width="3"/><line x1="140" y1="185" x2="100" y2="235" class="sg" stroke-width="3"/><line x1="100" y1="235" x2="140" y2="285" class="sg" stroke-width="3"/><circle cx="300" cy="35" r="16" class="fb sb"/><text x="300" y="39" text-anchor="middle">1</text><circle cx="230" cy="85" r="16" class="fg sg"/><text x="230" y="89" text-anchor="middle">2</text><circle cx="180" cy="135" r="16" class="fg sg"/><text x="180" y="139" text-anchor="middle">3</text><circle cx="280" cy="135" r="16" class="fg sg"/><text x="280" y="139" text-anchor="middle">4</text><circle cx="140" cy="185" r="16" class="fg sg"/><text x="140" y="189" text-anchor="middle">5</text><circle cx="100" cy="235" r="16" class="fg sg"/><text x="100" y="239" text-anchor="middle">6</text><circle cx="140" cy="285" r="16" class="fg sg"/><text x="140" y="289" text-anchor="middle">7</text><text x="254" y="89" class="tg">left 4 + right 1 = 5</text><text x="324" y="39" class="tm">root: left 5 + right 0 = 5</text><text x="330" y="200">green path: 7-6-5-3-2-4</text><text x="330" y="222">diameter = 5 edges</text><text x="330" y="244" class="tm">the best bend is at node 2,</text><text x="330" y="262" class="tm">not at the root</text></svg><figcaption>At each node, "left depth + right depth" (in nodes) is the longest path that bends there, measured in edges. The answer is the biggest such number anywhere in the tree.</figcaption></figure>
  <div class="fx" data-lang="py">def diameter(root):
    best = 0
    def depth(node):                       # nodes on the longest downward path
        nonlocal best
        if node is None:
            return 0
        l, r = depth(node.left), depth(node.right)
        best = max(best, l + r)            # longest path that bends at this node
        return 1 + max(l, r)
    depth(root)
    return best                            # counted in edges

for vals in [[1, 2, 3, 4, 5], [1, 2], [1], [1, 2, None, 3, 4, 5, None, None, None, 6, None, None, 7]]:
    print(vals, "-&gt;", diameter(build(vals)))</div>
  <div class="fx" data-lang="text">[1, 2, 3, 4, 5] -&gt; 3
[1, 2] -&gt; 1
[1] -&gt; 0
[1, 2, None, 3, 4, 5, None, None, None, 6, None, None, 7] -&gt; 5</div>
  <p>O(n) time, O(h) space. Why does <code>l + r</code> count edges when <code>depth</code> counts nodes? The left side has l nodes, so l edges from me down to its bottom; same on the right. Total l + r edges. The last test is the drawn tree: root 1 also reaches 5, but only by tying with node 2. The brute force "call height at every node" is O(n²).</p>

  <h3>5. Path Sum II (LeetCode 113)</h3>
  <p>Return every root-to-leaf path whose values add up to target. Top-down (carry the remaining sum) plus backtracking (one shared <code>path</code> list, append on the way in, pop on the way out).</p>
  <div class="fx" data-lang="py">def path_sum(root, target):
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

t = build([5, 4, 8, 11, None, 13, 4, 7, 2, None, None, 5, 1])
print(path_sum(t, 22))
print(path_sum(build([1, 2, 3]), 5), path_sum(build([1, 2]), 1), path_sum(build([-2, None, -3]), -5))</div>
  <div class="fx" data-lang="text">[[5, 4, 11, 2], [5, 8, 4, 5]]
[] [] [[-2, -3]]</div>
  <p>Edge cases in the second line: <code>[1, 2]</code> with target 1 gives nothing, because node 1 is not a leaf. Negative values are allowed, so you cannot stop early when the sum passes target. Time O(n·h) because copying a path costs up to h; space O(h) besides the output.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>res.append(path)</code> without the copy stores the same list object every time; after backtracking it ends up empty, and you return <code>[[], []]</code>.</p>
  </div>

  <h3>6. Construct Binary Tree from Preorder and Inorder (LeetCode 105)</h3>
  <p>Preorder <code>[3, 9, 20, 15, 7]</code>, inorder <code>[9, 3, 15, 20, 7]</code>. Preorder's first value is the root (3). Find 3 in inorder: everything to its left (<code>[9]</code>) is the left subtree, everything to its right (<code>[15, 20, 7]</code>) is the right subtree. Repeat for each side. Values are unique, so a dict gives each position in O(1).</p>
  <table class="tbl out"><caption>Dry run: preorder hands out roots in order</caption>
    <tr><th>next preorder value</th><th>inorder window</th><th>split</th><th>becomes</th></tr>
    <tr><td>3</td><td>[9, 3, 15, 20, 7]</td><td>[9] | 3 | [15, 20, 7]</td><td>root</td></tr>
    <tr><td>9</td><td>[9]</td><td>[] | 9 | []</td><td>left of 3</td></tr>
    <tr><td>20</td><td>[15, 20, 7]</td><td>[15] | 20 | [7]</td><td>right of 3</td></tr>
    <tr><td>15</td><td>[15]</td><td>leaf</td><td>left of 20</td></tr>
    <tr><td>7</td><td>[7]</td><td>leaf</td><td>right of 20</td></tr>
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

t = build_tree([3, 9, 20, 15, 7], [9, 3, 15, 20, 7])
print(level_order(t), postorder(t, []))
print(level_order(build_tree([1, 2, 3], [3, 2, 1])), level_order(build_tree([], [])))</div>
  <div class="fx" data-lang="text">[[3], [9, 20], [15, 7]] [9, 15, 7, 20, 3]
[[1], [2], [3]] []</div>
  <p>O(n) time and space. Using slices (<code>preorder[1:mid+1]</code>) and <code>inorder.index</code> also works but is O(n²). The left subtree must be built before the right, because preorder lists the whole left subtree first.</p>

  <h3>7. Kth Smallest Element in a BST (LeetCode 230)</h3>
  <p>Inorder of a BST is sorted, so the kth value visited is the answer. Use the iterative inorder so you can stop the moment you reach it.</p>
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

t = build([5, 3, 6, 2, 4, None, None, 1])
print([kth_smallest(t, k) for k in range(1, 7)], kth_smallest(build([3, 1, 4, None, 2]), 1))</div>
  <div class="fx" data-lang="text">[1, 2, 3, 4, 5, 6] 1</div>
  <p>O(h + k) time, O(h) space. Follow-up interviewers love: "the tree changes often and you query often". Answer: store the subtree size in every node; then at each node compare k with the left size and go left, answer, or go right with k reduced. That is O(h) per query.</p>

  <h3>8. Serialize and Deserialize Binary Tree (LeetCode 297)</h3>
  <p>Turn a tree into a string and back, for saving or sending over a network. Preorder alone is ambiguous (<code>1, 2</code>: is 2 left or right?). Writing a <code>#</code> for every empty child removes the doubt. Reading back follows the same order: me, then left, then right.</p>
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

for vals in [[1, 2, 3, None, None, 4, 5], [], [-7, None, 10]]:
    s = serialize(build(vals))
    print(repr(s), "-&gt;", level_order(deserialize(s)))</div>
  <div class="fx" data-lang="text">'1,2,#,#,3,4,#,#,5,#,#' -&gt; [[1], [2, 3], [4, 5]]
'#' -&gt; []
'-7,#,10,#,#' -&gt; [[-7], [10]]</div>
  <p>Both directions O(n) time and space. A level-order version with <code>None</code> markers (like LeetCode's own format) is also correct. The same "preorder with markers" string lets you check if two trees are identical or one is a subtree of another.</p>

  <h2 id="dsa-tr-traps"><span class="num">12</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: checking a BST only against the parent</span>
    <p>Every node must respect <em>all</em> its ancestors. Pass (low, high) bounds down, or check that the inorder walk is strictly increasing.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: forgetting the None base case</span>
    <p><code>node.left.val</code> on a leaf crashes with <code>AttributeError: 'NoneType' object has no attribute 'val'</code>. Start every recursive function with <code>if node is None: return ...</code>, and choose that return value carefully (0, −1, True, <code>[]</code>).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: leaf vs None</span>
    <p>"Root-to-leaf" problems must test <code>node.left is None and node.right is None</code>. Testing for <code>node is None</code> instead counts a node with one child as the end of a path (wrong for Path Sum and Minimum Depth).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: returning the wrong thing</span>
    <p>Diameter and max-path-sum: the function returns the one-sided depth, while the global <code>best</code> holds the two-sided path. Returning <code>l + r</code> upward lets a parent use a path that bends twice, which is not a path.</p>
  </div>
  <h2 id="dsa-tr-qa"><span class="num">13</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Define depth and height. What is the height of a single node, and of an empty tree?</summary><div class="qa-body">Depth of a node = edges from the root down to it. Height of a node = edges on its longest path down to a leaf. A single node has height 0; an empty tree is −1 by convention. LeetCode's "max depth" counts nodes instead, so it gives 1 and 0.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>A tree has n nodes. How many edges? Max nodes on level d? Min and max height of a binary tree?</summary><div class="qa-body">n − 1 edges (every node except the root has one parent edge). At most 2<sup>d</sup> nodes on level d. Height is at least ⌊log₂ n⌋ (packed full) and at most n − 1 (a chain).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Time and space of DFS vs BFS on a tree?</summary><div class="qa-body">Both O(n) time. DFS space O(h): one root-to-leaf path on the stack (log n balanced, n skewed). BFS space O(w), the widest level, up to about n/2 for a full tree. A deep narrow tree favours BFS; a wide shallow tree favours DFS.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is the inorder traversal of a BST sorted?</summary><div class="qa-body">Inorder visits the left subtree, then the node, then the right subtree. By the BST rule all of the left is smaller than the node and all of the right is bigger. Apply that at every node and the output is increasing.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you delete a BST node with two children?</summary><div class="qa-body">Find the inorder successor (go right once, then left as far as possible), copy its value into the node, then delete the successor from the right subtree. The successor has no left child, so that second delete is the easy 0- or 1-child case. The predecessor (max of the left) works too.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does "left child &lt; node &lt; right child at every node" fail to validate a BST?</summary><div class="qa-body">The rule is about whole subtrees. In [5, 4, 6, None, None, 3, 7], 3 is a valid child of 6 but lies in 5's right subtree while being smaller than 5. Pass the allowed (low, high) range down, narrowing it at each step.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does a self-balancing BST guarantee, and how?</summary><div class="qa-body">Height O(log n) after every insert or delete, so search, insert, delete are O(log n) worst case. It checks a balance rule (AVL: child heights differ by ≤ 1; red-black: colour rules) and repairs it with O(1) rotations along the update path.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>LCA in a BST vs a general binary tree: approach and cost?</summary><div class="qa-body">BST: from the root, go left if both values are smaller, right if both bigger, else stop; O(h) time, O(1) space. General: recurse; return the node if it is p or q; if both sides return non-None, this node is the LCA; else return the non-None side. O(n) time, O(h) space.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why must diameter use a separate "best" variable?</summary><div class="qa-body">The longest path may bend at any node, not the root. The parent needs my one-sided depth (1 + max(l, r)) to extend a path, but the answer at my node is the two-sided l + r. So return one, record the other.</div></details>
</main>
`
});
