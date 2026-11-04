// notes/dsa/dsa_trees.js — Trees
Object.assign(TOPIC_CONTENT, {
  "dsa_trees": `<main>
<h1>Trees</h1>
  <div class="where"><span>DSA</span><span>Trees &amp; Graphs</span><span>Trees</span></div>
  <p class="lead">A tree is a way of storing data that has a "belongs to" shape rather than a "comes after" shape: categories inside categories, employees under a manager, folders inside folders. The same shape, with one extra rule, also gives us a collection that stays sorted while new items keep arriving, which a plain list cannot do cheaply. Binary trees and binary search trees are among the most asked interview topics, and almost every tree problem turns out to be one short recursive function that asks a node's two children a question and combines their answers. The running example is Biteful's 8 charges of the day (the same numbers as the other DSA notes), placed into one tree that we build in section 02 and use on every page after that. All outputs are real runs of Python 3.13; timings are approximate.</p>

  <h2 id="dsa-tr-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Trees</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Words</div>
        <ul>
          <li><b>Root</b>: top node · <b>leaf</b>: no children</li>
          <li><b>Depth</b>: edges from the root down · <b>height</b>: edges down to the deepest leaf</li>
          <li>LeetCode "max depth" counts nodes (height + 1)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Traversals</div>
        <ul>
          <li>Pre (me, L, R) · In (L, me, R) · Post (L, R, me)</li>
          <li>Level order: BFS with a deque, <code>len(q)</code> per level</li>
          <li>O(n) time; DFS O(h) space, BFS O(width)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Recursion styles</div>
        <ul>
          <li>Bottom-up: ask children, combine (height, diameter)</li>
          <li>Top-down: pass info down (bounds, path sums)</li>
          <li>Backtracking: append, recurse, pop</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">BST</div>
        <ul>
          <li>All left &lt; node &lt; all right; inorder is sorted</li>
          <li>Search / insert / delete O(h)</li>
          <li>Balanced h ≈ log n; sorted input → chain, h = n − 1</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="dsa-tr-need"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Trees</span><span class="rm-sub">hierarchies, and sorted data that keeps growing</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tr-node"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Binary Trees in Python</span><span class="rm-sub">nodes, root, leaf, depth, height</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tr-dfs"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Depth-First Traversals</span><span class="rm-sub">preorder, inorder, postorder</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tr-bfs"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Breadth-First: Level Order</span><span class="rm-sub">one level at a time with a queue</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tr-recur"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Thinking Recursively</span><span class="rm-sub">height, diameter, balanced</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tr-bst"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Binary Search Tree</span><span class="rm-sub">search, insert, delete, validate</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tr-balance"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Balanced Trees</span><span class="rm-sub">why the shape decides the speed</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tr-paths"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Path Problems</span><span class="rm-sub">carrying information downward</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tr-lca"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Lowest Common Ancestor</span><span class="rm-sub">where two routes meet</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tr-build"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Building and Saving Trees</span><span class="rm-sub">from traversals, serialize</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tr-patterns"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Recognising the Pattern</span><span class="rm-sub">problem wording to technique</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tr-problems"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">More Classic Problems</span><span class="rm-sub">max depth, invert, kth smallest, practice order</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tr-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">parent-only BST check, leaf tests, copies</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tr-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">terms, costs, templates</span></div></div>
      <div class="rm-item rm-done" data-target="dsa-tr-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">what interviewers ask on trees</span></div></div>
    </div>
  </div>

  <h2 id="dsa-tr-need"><span class="num">01</span>Why Trees</h2>
  <p>Every structure in the earlier notes was a line: a list, a linked list, a stack and a queue all give each item at most one "next" item. Biteful has two kinds of data that do not fit in a line, and seeing why is the best way to understand what a tree is for.</p>
  <p>The first is the app's restaurant categories. Indian holds North Indian and South Indian; Desserts holds Ice cream and Cakes; all of them sit inside the top-level Menu. Each category sits inside exactly one parent and may hold several categories of its own. A list can say "this comes after that", but it has no way to say "this is <em>inside</em> that". File folders, a company's reporting chart (one boss each), the structure of a web page and a family tree all have the same shape.</p>
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
<text x="300" y="214" text-anchor="middle" class="tm" font-size="11">every category sits inside exactly one parent</text>
</svg><figcaption>Biteful's restaurant categories. Menu is at the top; every other category hangs from exactly one parent. The green boxes have nothing inside them.</figcaption></figure>
  <p>The second is the list of charges that finance keeps sorted, so that questions like "the next charge above ₹100" can be answered by binary search. Charges arrive all day, and every new one must be slotted into the right place. In a sorted Python list, inserting in the middle means shifting every bigger item one place to the right. Here is the cost of building a sorted list one insert at a time:</p>
<div class="fx" data-lang="py">import random, time
from bisect import insort

def build_sorted(n):
    random.seed(3)
    a, t = [], time.perf_counter()
    for _ in range(n):
        insort(a, random.randint(1, 10**9))   # binary search for the spot, then shift
    return time.perf_counter() - t

for n in [25_000, 50_000, 100_000]:
    print(f"{n:&gt;7,} sorted inserts: {build_sorted(n):.2f} s")</div>
  <div class="fx" data-lang="text"> 25,000 sorted inserts: 0.04 s
 50,000 sorted inserts: 0.14 s
100,000 sorted inserts: 0.54 s</div>
  <p>Each time n doubles, the time grows about three to four times rather than two (the exact seconds depend on the machine), and the ratio creeps towards four as n grows. That is the signature of O(n) work per insert and O(n²) in total: finding the spot is fast, but the shifting is not.</p>
  <p>Both problems have the same cure. Instead of putting items in a line, let each item point to the items "below" it. A <strong>tree</strong> is exactly that: a set of <strong>nodes</strong> (the items) joined by parent-to-child links, with a single node at the top that has no parent, every other node having exactly one parent, and no loops. The category picture is a tree. For the sorted charges, imagine a tree where each node sends smaller values to one side and bigger values to the other; then inserting a charge just walks down one route from the top, and if the tree is bushy, that route is short. A million items fit in about 20 levels. Think of finding a flat in a city: state, city, area, building, floor, flat. At each step you choose one branch and ignore all the others, so six choices pick out one flat among millions.</p>
  <p>A tree is only a shape; it is not automatically sorted. The category tree has no order at all. The "smaller left, bigger right" rule that keeps data sorted is an extra rule, and a tree that follows it is called a binary search tree (section 06).</p>

  <h2 id="dsa-tr-node"><span class="num">02</span>Binary Trees in Python</h2>
  <p>Most interview trees are <strong>binary trees</strong>: trees in which every node has at most two children, called the <em>left</em> child and the <em>right</em> child. Two named children keep the code short. In Python a node is a tiny class with a value and two links, exactly like a linked list node that has two <code>next</code> pointers instead of one; a missing child is simply <code>None</code>.</p>
  <p>Our running example is a binary tree holding Biteful's charges. In arrival order they were 120, 80, 250, 40, 310, 80, 60, 200; the second ₹80 is a duplicate and is stored only once, so the tree has 7 nodes. Section 06 reveals the simple rule that produced this particular shape; for now just take it as given:</p>
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
  <p><code>root.left.left.right</code> walks left to 80, left to 40, right to 60. Asking for 80's right child gives <code>None</code>, because 80 has only a left child. Every tree function must be ready for that <code>None</code>.</p>
  <p>Before going further we need words for positions in a tree, because every later section and every interviewer uses them. The single node at the top (120) is the <strong>root</strong>. A node with no children (60, 200, 310) is a <strong>leaf</strong>. Each parent-to-child link is an <strong>edge</strong>; a tree with n nodes always has n − 1 edges, because every node except the root has exactly one edge to its parent. The <strong>depth</strong> of a node is the number of edges from the root down to it, so 120 has depth 0 and 60 has depth 3. The <strong>height</strong> of a node is the number of edges on the longest path from it down to a leaf, so every leaf has height 0, 80 has height 2, and the height of the whole tree is the height of the root, 3. A node together with everything below it is a <strong>subtree</strong>; the subtree of 80 is {80, 40, 60}. Depth is measured from the top down; height is measured from the bottom up.</p>
  <figure class="viz"><svg viewBox="0 0 600 304" width="600">
<line x1="320" y1="40" x2="180" y2="110" stroke="currentColor"/>
<line x1="320" y1="40" x2="460" y2="110" stroke="currentColor"/>
<line x1="180" y1="110" x2="110" y2="180" stroke="currentColor"/>
<line x1="110" y1="180" x2="160" y2="250" stroke="currentColor"/>
<line x1="460" y1="110" x2="400" y2="180" stroke="currentColor"/>
<line x1="460" y1="110" x2="520" y2="180" stroke="currentColor"/>
<circle cx="320" cy="40" r="17" style="fill:var(--bg)"/><circle cx="320" cy="40" r="17" class="fb sb"/><text x="320" y="44" text-anchor="middle" font-size="12">120</text>
<circle cx="180" cy="110" r="17" style="fill:var(--bg)"/><circle cx="180" cy="110" r="17" class="fb sb"/><text x="180" y="114" text-anchor="middle" font-size="12">80</text>
<circle cx="460" cy="110" r="17" style="fill:var(--bg)"/><circle cx="460" cy="110" r="17" class="fb sb"/><text x="460" y="114" text-anchor="middle" font-size="12">250</text>
<circle cx="110" cy="180" r="17" style="fill:var(--bg)"/><circle cx="110" cy="180" r="17" class="fb sb"/><text x="110" y="184" text-anchor="middle" font-size="12">40</text>
<circle cx="400" cy="180" r="17" style="fill:var(--bg)"/><circle cx="400" cy="180" r="17" class="fg sg"/><text x="400" y="184" text-anchor="middle" font-size="12">200</text>
<circle cx="520" cy="180" r="17" style="fill:var(--bg)"/><circle cx="520" cy="180" r="17" class="fg sg"/><text x="520" y="184" text-anchor="middle" font-size="12">310</text>
<circle cx="160" cy="250" r="17" style="fill:var(--bg)"/><circle cx="160" cy="250" r="17" class="fg sg"/><text x="160" y="254" text-anchor="middle" font-size="12">60</text>
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
<text x="150" y="294" text-anchor="middle" class="tg" font-size="11">subtree of 80</text>
<text x="420" y="290" text-anchor="middle" font-size="12">7 nodes · 6 edges · height of the tree = 3</text>
</svg><figcaption>The charge tree. Depth counts edges down from the root (left margin); height counts edges up from the deepest leaf below a node. The dashed box is the subtree rooted at 80; the green nodes are leaves.</figcaption></figure>
  <p>Typing nested <code>TreeNode(...)</code> calls quickly gets painful, so LeetCode writes a tree as a list read level by level, with <code>None</code> where a child is missing. Our tree is <code>[120, 80, 250, 40, None, 200, 310, None, 60]</code>: the root 120; its children 80 and 250; then 80's children (40 and nothing) and 250's children (200 and 310); then 40's children (nothing and 60). The helper below turns such a list into nodes, and two small functions measure the tree. Every later example on this page uses them.</p>
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
        return -1          # so that a lone leaf gets 0
    return 1 + max(height(node.left), height(node.right))

def size(node):            # number of nodes
    if node is None:
        return 0
    return 1 + size(node.left) + size(node.right)

CHARGES = [120, 80, 250, 40, None, 200, 310, None, 60]
t = build(CHARGES)
print("size", size(t), "height", height(t))
print("one node:", height(build([7])), " empty tree:", height(build([])))</div>
  <div class="fx" data-lang="text">size 7 height 3
one node: 0  empty tree: -1</div>
  <p>Look closely at <code>height</code>, because its shape is the shape of almost every tree function you will write. It does not try to picture the whole tree. It says: "my height is one more than the taller of my two children's heights", and it handles the empty tree separately. The empty tree returns −1 so that a leaf gets −1 + 1 = 0. On our tree, 60 returns 0, 40 returns 1, 80 returns 2, and the root returns 1 + max(2, 1) = 3. The idea works because a binary tree is itself defined recursively: it is either empty, or a node whose left and right children are themselves binary trees.</p>
  <p>A few shape names come up in interviews. A <strong>complete</strong> tree has every level full except possibly the last, which is filled from the left; heaps use this shape. A <strong>perfect</strong> tree has every level completely full, so a perfect tree of height h has 2<sup>h+1</sup> − 1 nodes. A <strong>skewed</strong> tree has only one child per node; it is really a linked list, with height n − 1. A tree is called <strong>balanced</strong>, loosely, when its height stays close to log₂ n. One more warning about units: textbooks measure height in edges (our tree: 3), but LeetCode's "maximum depth" counts nodes (our tree: 4). Both are fine; just say which one you mean before you code.</p>

  <h2 id="dsa-tr-dfs"><span class="num">03</span>Depth-First Traversals</h2>
  <p>Suppose we want to print every charge in the tree. In a list the order is obvious: left to right. A tree has no single "next" node: after 120, should we visit 80, 250 or 40? Any systematic order that visits every node exactly once is called a <strong>traversal</strong>, and different orders turn out to be useful for different jobs.</p>
  <p>The first family is <strong>depth-first search</strong> (DFS): go as deep as possible down one branch before coming back to try the next one, like exploring a maze by always following one corridor to its end before stepping back. At every node there are three jobs: handle the node itself ("me"), visit its left subtree, and visit its right subtree. The three classic depth-first orders differ only in <em>when</em> "me" happens. In <strong>preorder</strong>, the node is handled before its children (me, left, right). In <strong>inorder</strong>, it is handled between them (left, me, right). In <strong>postorder</strong>, it is handled after both (left, right, me).</p>
  <figure class="viz"><svg viewBox="0 0 650 172" width="650">
<line x1="109" y1="39" x2="51" y2="68" stroke="currentColor"/><line x1="109" y1="39" x2="168" y2="68" stroke="currentColor"/><line x1="51" y1="68" x2="21" y2="98" stroke="currentColor"/><line x1="21" y1="98" x2="42" y2="127" stroke="currentColor"/><line x1="168" y1="68" x2="143" y2="98" stroke="currentColor"/><line x1="168" y1="68" x2="193" y2="98" stroke="currentColor"/>
<circle cx="109" cy="39" r="12" style="fill:var(--bg)"/><circle cx="109" cy="39" r="12" class="fb sb"/><text x="109" y="43" text-anchor="middle" font-size="10">120</text><circle cx="51" cy="68" r="12" style="fill:var(--bg)"/><circle cx="51" cy="68" r="12" class="fb sb"/><text x="51" y="72" text-anchor="middle" font-size="10">80</text><circle cx="168" cy="68" r="12" style="fill:var(--bg)"/><circle cx="168" cy="68" r="12" class="fb sb"/><text x="168" y="72" text-anchor="middle" font-size="10">250</text><circle cx="21" cy="98" r="12" style="fill:var(--bg)"/><circle cx="21" cy="98" r="12" class="fb sb"/><text x="21" y="102" text-anchor="middle" font-size="10">40</text><circle cx="143" cy="98" r="12" style="fill:var(--bg)"/><circle cx="143" cy="98" r="12" class="fb sb"/><text x="143" y="102" text-anchor="middle" font-size="10">200</text><circle cx="193" cy="98" r="12" style="fill:var(--bg)"/><circle cx="193" cy="98" r="12" class="fb sb"/><text x="193" y="102" text-anchor="middle" font-size="10">310</text><circle cx="42" cy="127" r="12" style="fill:var(--bg)"/><circle cx="42" cy="127" r="12" class="fb sb"/><text x="42" y="131" text-anchor="middle" font-size="10">60</text>
<text x="122" y="28" class="tr" font-size="10">#1</text><text x="64" y="57" class="tr" font-size="10">#2</text><text x="34" y="87" class="tr" font-size="10">#3</text><text x="55" y="116" class="tr" font-size="10">#4</text><text x="181" y="57" class="tr" font-size="10">#5</text><text x="156" y="87" class="tr" font-size="10">#6</text><text x="206" y="87" class="tr" font-size="10">#7</text>
<text x="110" y="16" text-anchor="middle" class="tb" font-size="11">preorder: me, L, R</text><text x="110" y="160" text-anchor="middle" font-size="11">120 80 40 60 250 200 310</text>
<line x1="324" y1="39" x2="266" y2="68" stroke="currentColor"/><line x1="324" y1="39" x2="383" y2="68" stroke="currentColor"/><line x1="266" y1="68" x2="236" y2="98" stroke="currentColor"/><line x1="236" y1="98" x2="257" y2="127" stroke="currentColor"/><line x1="383" y1="68" x2="358" y2="98" stroke="currentColor"/><line x1="383" y1="68" x2="408" y2="98" stroke="currentColor"/>
<circle cx="324" cy="39" r="12" style="fill:var(--bg)"/><circle cx="324" cy="39" r="12" class="fb sb"/><text x="324" y="43" text-anchor="middle" font-size="10">120</text><circle cx="266" cy="68" r="12" style="fill:var(--bg)"/><circle cx="266" cy="68" r="12" class="fb sb"/><text x="266" y="72" text-anchor="middle" font-size="10">80</text><circle cx="383" cy="68" r="12" style="fill:var(--bg)"/><circle cx="383" cy="68" r="12" class="fb sb"/><text x="383" y="72" text-anchor="middle" font-size="10">250</text><circle cx="236" cy="98" r="12" style="fill:var(--bg)"/><circle cx="236" cy="98" r="12" class="fb sb"/><text x="236" y="102" text-anchor="middle" font-size="10">40</text><circle cx="358" cy="98" r="12" style="fill:var(--bg)"/><circle cx="358" cy="98" r="12" class="fb sb"/><text x="358" y="102" text-anchor="middle" font-size="10">200</text><circle cx="408" cy="98" r="12" style="fill:var(--bg)"/><circle cx="408" cy="98" r="12" class="fb sb"/><text x="408" y="102" text-anchor="middle" font-size="10">310</text><circle cx="257" cy="127" r="12" style="fill:var(--bg)"/><circle cx="257" cy="127" r="12" class="fb sb"/><text x="257" y="131" text-anchor="middle" font-size="10">60</text>
<text x="249" y="87" class="tr" font-size="10">#1</text><text x="270" y="116" class="tr" font-size="10">#2</text><text x="279" y="57" class="tr" font-size="10">#3</text><text x="337" y="28" class="tr" font-size="10">#4</text><text x="371" y="87" class="tr" font-size="10">#5</text><text x="396" y="57" class="tr" font-size="10">#6</text><text x="421" y="87" class="tr" font-size="10">#7</text>
<text x="325" y="16" text-anchor="middle" class="tb" font-size="11">inorder: L, me, R</text><text x="325" y="160" text-anchor="middle" font-size="11">40 60 80 120 200 250 310</text>
<line x1="539" y1="39" x2="481" y2="68" stroke="currentColor"/><line x1="539" y1="39" x2="598" y2="68" stroke="currentColor"/><line x1="481" y1="68" x2="451" y2="98" stroke="currentColor"/><line x1="451" y1="98" x2="472" y2="127" stroke="currentColor"/><line x1="598" y1="68" x2="573" y2="98" stroke="currentColor"/><line x1="598" y1="68" x2="623" y2="98" stroke="currentColor"/>
<circle cx="539" cy="39" r="12" style="fill:var(--bg)"/><circle cx="539" cy="39" r="12" class="fb sb"/><text x="539" y="43" text-anchor="middle" font-size="10">120</text><circle cx="481" cy="68" r="12" style="fill:var(--bg)"/><circle cx="481" cy="68" r="12" class="fb sb"/><text x="481" y="72" text-anchor="middle" font-size="10">80</text><circle cx="598" cy="68" r="12" style="fill:var(--bg)"/><circle cx="598" cy="68" r="12" class="fb sb"/><text x="598" y="72" text-anchor="middle" font-size="10">250</text><circle cx="451" cy="98" r="12" style="fill:var(--bg)"/><circle cx="451" cy="98" r="12" class="fb sb"/><text x="451" y="102" text-anchor="middle" font-size="10">40</text><circle cx="573" cy="98" r="12" style="fill:var(--bg)"/><circle cx="573" cy="98" r="12" class="fb sb"/><text x="573" y="102" text-anchor="middle" font-size="10">200</text><circle cx="623" cy="98" r="12" style="fill:var(--bg)"/><circle cx="623" cy="98" r="12" class="fb sb"/><text x="623" y="102" text-anchor="middle" font-size="10">310</text><circle cx="472" cy="127" r="12" style="fill:var(--bg)"/><circle cx="472" cy="127" r="12" class="fb sb"/><text x="472" y="131" text-anchor="middle" font-size="10">60</text>
<text x="485" y="116" class="tr" font-size="10">#1</text><text x="464" y="87" class="tr" font-size="10">#2</text><text x="494" y="57" class="tr" font-size="10">#3</text><text x="586" y="87" class="tr" font-size="10">#4</text><text x="636" y="87" class="tr" font-size="10">#5</text><text x="611" y="57" class="tr" font-size="10">#6</text><text x="552" y="28" class="tr" font-size="10">#7</text>
<text x="540" y="16" text-anchor="middle" class="tb" font-size="11">postorder: L, R, me</text><text x="540" y="160" text-anchor="middle" font-size="11">60 40 80 200 310 250 120</text>
</svg><figcaption>The same tree visited three ways; red #k is the step at which each node is handled. In preorder the root is first, in postorder it is last, and inorder handles it in the middle, after its whole left side.</figcaption></figure>
  <p>Walk through the preorder picture: handle 120 (#1), then go down the left side and handle 80 (#2), then 40 (#3), then 40's right child 60 (#4); the left side is finished, so return to the root and do the right side: 250, 200, 310. In postorder, nothing is handled until both of its children are done, so the deepest node, 60, comes first and the root comes last. In recursive Python, the three orders really are the same function with one line moved:</p>
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
  <p>The outputs match the picture. Look at the inorder line: 40, 60, 80, 120, 200, 250, 310 is the charges in <strong>sorted</strong> order. That is not a coincidence, and section 06 explains it.</p>
  <p>Each order has a natural use. Preorder handles a node before anything below it, so it is the order for copying or saving a tree and for printing a hierarchy with indentation. Inorder gives sorted output on a binary search tree. Postorder handles a node only after its children are done, so it is the order whenever a node's answer depends on its children's answers: sizes, heights, the total disk usage of a folder, or deleting a tree from the bottom up. The same orders work on trees with any number of children. Biteful's categories are naturally stored as a dictionary from each category to its list of children, and the indented menu is a preorder walk, while counting the leaf categories is a postorder one:</p>
<div class="fx" data-lang="py">categories = {
    "Menu": ["Indian", "Chinese", "Desserts"],
    "Indian": ["North Indian", "South Indian"],
    "Desserts": ["Ice cream", "Cakes"],
}

def show(node, depth=0):                      # preorder: me first, then children
    print("    " * depth + node)
    for child in categories.get(node, []):
        show(child, depth + 1)

def count_leaves(node):                       # postorder: children first, then add up
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
  <p>Recursion hides a stack. Each call waits on Python's call stack while its children run, and at the moment 60 is being handled, four calls (for 120, 80, 40 and 60) are waiting. That is why a depth-first traversal uses O(h) extra space, one frame per level of the current path. It is also why recursion can fail: Python stops at about 1000 nested calls with <code>RecursionError</code>, and a skewed tree of 5,000 nodes is 5,000 calls deep. The cure, and a favourite interview request, is to manage the stack yourself in a list. For preorder, pop a node, handle it, then push its right child and then its left child; because a stack is last-in-first-out, the left child is pushed last and so comes out first.</p>
  <table class="tbl">
    <tr><th>pop</th><th>output so far</th><th>push (right first, then left)</th><th>stack after</th></tr>
    <tr><td>–</td><td>–</td><td>120</td><td>120</td></tr>
    <tr><td>120</td><td>120</td><td>250, 80</td><td>250 80</td></tr>
    <tr><td>80</td><td>120 80</td><td>40</td><td>250 40</td></tr>
    <tr><td>40</td><td>120 80 40</td><td>60</td><td>250 60</td></tr>
    <tr><td>60</td><td>… 40 60</td><td>–</td><td>250</td></tr>
    <tr><td>250</td><td>… 60 250</td><td>310, 200</td><td>310 200</td></tr>
    <tr><td>200, 310</td><td>120 80 40 60 250 200 310</td><td>–</td><td>(empty)</td></tr>
  </table>
  <p>Inorder is slightly different: slide left as far as possible, pushing every node on the way; pop one node and handle it; then move once to its right child and repeat. Postorder has a neat shortcut: a preorder that pushes the children the other way round produces me, right, left, and reversing that list gives left, right, me.</p>
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
        while cur:                    # slide left as far as possible
            stack.append(cur)
            cur = cur.left
        cur = stack.pop()             # leftmost node not yet handled
        out.append(cur.val)
        cur = cur.right               # then do its right subtree
    return out

def postorder_iter(root):
    out, stack = [], [root] if root else []
    while stack:
        node = stack.pop()
        out.append(node.val)          # builds me, right, left ...
        if node.left:  stack.append(node.left)
        if node.right: stack.append(node.right)
    return out[::-1]                  # ... reversed: left, right, me

print(preorder_iter(t))
print(inorder_iter(t))
print(postorder_iter(t))
print(preorder_iter(None), inorder_iter(None))</div>
  <div class="fx" data-lang="text">[120, 80, 40, 60, 250, 200, 310]
[40, 60, 80, 120, 200, 250, 310]
[60, 40, 80, 200, 310, 250, 120]
[] []</div>
  <p>The iterative versions give exactly the same three lists as the recursive ones, and they handle an empty tree. All three traversals, recursive or not, are O(n) time, since every node is pushed and popped once, and O(h) extra space, since the stack holds at most one root-to-leaf path plus some waiting right children. That is O(log n) on a balanced tree and O(n) on a skewed one.</p>

  <h2 id="dsa-tr-bfs"><span class="num">04</span>Breadth-First: Level Order</h2>
  <p>Depth-first search dives: it handles 60, three levels down, before it gets to 250, which is only one level down. Biteful's app, though, shows categories one level at a time, and many interview questions are about levels: "what is on each level?", "what do you see from the right side?", "how deep is the shallowest leaf?". For these we want <strong>breadth-first search</strong> (BFS), also called <strong>level-order traversal</strong>: visit every node at depth 0, then every node at depth 1, then depth 2, and so on.</p>
  <p>The tool is the queue from the Stacks &amp; Queues note. A stack always continues with the newest node, which is why DFS goes deep. A queue continues with the <em>oldest</em> waiting node, so nodes are handled in the order they were discovered, and nodes on a shallower level are always discovered before deeper ones. Take a node from the front, handle it, and add its children at the back. Think of a family phone chain for a wedding invitation: grandfather calls his three children first, and each of them, after hanging up, adds their own children to the end of the "still to call" list. The family is reached generation by generation.</p>
  <p>To get the nodes grouped by level, there is one small trick: at the start of each round, read <code>len(q)</code>. At that moment the queue holds exactly the nodes of the current level and nothing else, so popping that many nodes handles one complete level, while the children they add wait for the next round.</p>
  <table class="tbl">
    <tr><th>queue at start of round</th><th>len(q)</th><th>pops</th><th>pushes</th><th>level recorded</th></tr>
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
print("right side view:", [lvl[-1] for lvl in level_order(t)])
print(level_order(build([3, 9, 20, None, None, 15, 7])), level_order(build([])))</div>
  <div class="fx" data-lang="text">[[120], [80, 250], [40, 200, 310], [60]]
right side view: [120, 250, 310, 60]
[[3], [9, 20], [15, 7]] []</div>
  <p>The charge tree has four levels: [120], [80, 250], [40, 200, 310] and [60], exactly as traced. The second line takes the last node of each level, which is what you would see looking at the tree from the right: 120, 250, 310, 60. Small changes like this solve a whole group of problems: reverse every other level (zigzag order), average each level, or stop at the first leaf you meet (minimum depth, where BFS can stop early while DFS must explore everything).</p>
  <p><code>for _ in range(len(q))</code> is safe because <code>range</code> reads the length once, before any children are added. Use <code>deque</code>, not a list: <code>list.pop(0)</code> shifts every item and would make the traversal O(n²). BFS takes O(n) time and O(w) space, where w is the widest level; in a full tree the bottom level holds about half the nodes, so BFS can use more memory than DFS on wide, bushy trees, and less on deep, narrow ones.</p>

  <h2 id="dsa-tr-recur"><span class="num">05</span>Thinking Recursively: Height, Diameter, Balanced</h2>
  <p>Visiting nodes is not the same as computing something about the tree. Questions like "how tall is the tree?", "what is the longest path between any two nodes?" or "is any branch much longer than its neighbour?" depend on every node below the one you are looking at, and trying to picture the whole tree at once makes such code hard to write. The trick, which we already saw in <code>height</code>, is to stop thinking about the whole tree. Stand at <em>one</em> node and ask: "if my left child and my right child had already given me their answers, how would I make mine?" Then decide what an empty tree should answer. That is the entire method. Because the children answer before the node does, this is postorder, and it is often called <strong>bottom-up</strong> recursion: answers flow up from the leaves.</p>
  <p>Think of a school principal who wants the total number of students. She does not count everyone herself; she asks each class teacher, each teacher asks each row monitor, and each monitor counts their row. Nobody counts the whole school, and every person only adds up the numbers handed to them, plus themselves.</p>
  <p>The <strong>diameter</strong> of a tree is the number of edges on the longest path between any two nodes. A path can bend at any node: it comes up from the deepest point on that node's left side and goes down to the deepest point on its right side. So at each node, the longest path that bends there has length (depth of the left side) + (depth of the right side), where depth is counted in nodes. The node passes only its one-sided depth up to its parent (a path can't bend twice), and the best bend seen anywhere is kept in a separate variable. A tree is <strong>height-balanced</strong> when, at every node, the heights of the left and right subtrees differ by at most 1. One postorder pass over the charge tree gives all of these numbers:</p>
  <table class="tbl">
    <tr><th>node (postorder)</th><th>left depth</th><th>right depth</th><th>returns 1 + max</th><th>bend = left + right</th><th>balanced here?</th></tr>
    <tr><td>60</td><td>0</td><td>0</td><td>1</td><td>0</td><td>yes</td></tr>
    <tr><td>40</td><td>0</td><td>1</td><td>2</td><td>1</td><td>yes</td></tr>
    <tr><td>80</td><td>2</td><td>0</td><td>3</td><td>2</td><td><b>no: 2 vs 0</b></td></tr>
    <tr><td>200, 310</td><td>0</td><td>0</td><td>1</td><td>0</td><td>yes</td></tr>
    <tr><td>250</td><td>1</td><td>1</td><td>2</td><td>2</td><td>yes</td></tr>
    <tr><td>120</td><td>3</td><td>2</td><td>4</td><td><b>5</b></td><td>yes</td></tr>
  </table>
  <p>The longest path bends at the root and has 5 edges (60, 40, 80, 120, 250, 200), and the tree is not balanced because at 80 the left side is two levels deep while the right side is empty. In code:</p>
<div class="fx" data-lang="py">def diameter(root):
    best = 0
    def depth(node):                   # nodes on the longest downward path
        nonlocal best
        if node is None:
            return 0
        l, r = depth(node.left), depth(node.right)
        best = max(best, l + r)        # longest path that bends at this node
        return 1 + max(l, r)           # what the parent can extend
    depth(root)
    return best                        # counted in edges

def is_balanced(root):
    def h(node):                       # height, or -2 meaning "already unbalanced"
        if node is None:
            return -1
        lh, rh = h(node.left), h(node.right)
        if lh == -2 or rh == -2 or abs(lh - rh) &gt; 1:
            return -2
        return 1 + max(lh, rh)
    return h(root) != -2

def depths(node, d=0, out=None):       # top-down: the parent passes its depth down
    out = {} if out is None else out
    if node:
        out[node.val] = d
        depths(node.left, d + 1, out)
        depths(node.right, d + 1, out)
    return out

print("height", height(t), "| diameter", diameter(t), "| balanced", is_balanced(t))
print("depths", depths(t))
print(diameter(build([1, 2, 3, 4, 5])), is_balanced(build([3, 9, 20, None, None, 15, 7])))</div>
  <div class="fx" data-lang="text">height 3 | diameter 5 | balanced False
depths {120: 0, 80: 1, 40: 2, 60: 3, 250: 1, 200: 2, 310: 2}
3 True</div>
  <p>The charge tree has height 3, diameter 5, and is not balanced, as the table predicted. Two details deserve attention. In <code>diameter</code>, the function <em>returns</em> one thing (the one-sided depth that the parent can extend) and <em>records</em> another (the two-sided bend, in <code>best</code>); mixing these up is the classic bug. In <code>is_balanced</code>, returning the special value −2 means "something below already failed", so a single pass computes every height and the yes/no answer together. Calling a separate <code>height()</code> at every node instead would re-walk each subtree again and again, which is O(n²) on a skewed tree.</p>
  <p>The <code>depths</code> function shows the opposite direction. A node's depth does not depend on its children; it depends on its parent. So here the parent hands information <em>down</em> as an extra argument: "your depth is mine plus one". This is <strong>top-down</strong> recursion, and it is the natural style when the answer at a node depends on what is above it: the current depth, the sum of a path so far (section 08), or the range of values allowed in a binary search tree (section 06). A good way to choose is to ask "who knows what this node needs?" If the children know, go bottom-up; if the ancestors know, go top-down. Either way, every node is visited once, so these functions are O(n) time with O(h) space for the recursion.</p>

  <h2 id="dsa-tr-bst"><span class="num">06</span>Binary Search Tree</h2>
  <p>In an ordinary binary tree, finding the charge ₹200 means checking every node until you find it: O(n). Section 01 promised a tree that keeps data sorted and lets you find and insert quickly. Look at the charge tree once more: everything to the left of 120 (80, 40, 60) is smaller than 120, and everything to its right (250, 200, 310) is bigger. The same is true at 80 and at 250. That is the rule.</p>
  <p>A <strong>binary search tree</strong> (BST) is a binary tree in which, for every node, <em>all</em> the values in its left subtree are smaller than the node and <em>all</em> the values in its right subtree are bigger. (Duplicates are either not allowed or always sent to the same side; say which.) And here is where our tree came from: it is simply the 8 charges inserted into an empty BST in the order they arrived. 120 becomes the root. 80 is smaller, so it goes left. 250 goes right. 40 goes left of 120, then left of 80. 310 goes right, then right of 250. The second 80 is a duplicate and is ignored. 60 goes left of 120, left of 80, then right of 40. 200 goes right of 120 and left of 250.</p>
  <p>Think of the game "guess my number between 1 and 100", where each guess gets the hint "higher" or "lower". A BST is that game frozen into a structure: the root is your first guess, and each child is the next guess after a hint. It is the binary search from the previous note, but stored as linked nodes, so a new value can be added without shifting anything.</p>
  <figure class="viz"><svg viewBox="0 0 600 290" width="600">
<line x1="320" y1="40" x2="180" y2="110" stroke="currentColor"/>
<line x1="320" y1="40" x2="460" y2="110" class="sg" stroke-width="3.5"/>
<line x1="180" y1="110" x2="110" y2="180" stroke="currentColor"/>
<line x1="110" y1="180" x2="160" y2="250" stroke="currentColor"/>
<line x1="460" y1="110" x2="400" y2="180" class="sg" stroke-width="3.5"/>
<line x1="460" y1="110" x2="520" y2="180" stroke="currentColor"/>
<line x1="180" y1="110" x2="250" y2="180" stroke="currentColor" stroke-dasharray="4 3"/>
<circle cx="320" cy="40" r="17" style="fill:var(--bg)"/><circle cx="320" cy="40" r="17" class="fg sg"/><text x="320" y="44" text-anchor="middle" font-size="12">120</text>
<circle cx="180" cy="110" r="17" style="fill:var(--bg)"/><circle cx="180" cy="110" r="17" class="fb sb"/><text x="180" y="114" text-anchor="middle" font-size="12">80</text>
<circle cx="460" cy="110" r="17" style="fill:var(--bg)"/><circle cx="460" cy="110" r="17" class="fg sg"/><text x="460" y="114" text-anchor="middle" font-size="12">250</text>
<circle cx="110" cy="180" r="17" style="fill:var(--bg)"/><circle cx="110" cy="180" r="17" class="fb sb"/><text x="110" y="184" text-anchor="middle" font-size="12">40</text>
<circle cx="400" cy="180" r="17" style="fill:var(--bg)"/><circle cx="400" cy="180" r="17" class="fg sg"/><text x="400" y="184" text-anchor="middle" font-size="12">200</text>
<circle cx="520" cy="180" r="17" style="fill:var(--bg)"/><circle cx="520" cy="180" r="17" class="fb sb"/><text x="520" y="184" text-anchor="middle" font-size="12">310</text>
<circle cx="160" cy="250" r="17" style="fill:var(--bg)"/><circle cx="160" cy="250" r="17" class="fb sb"/><text x="160" y="254" text-anchor="middle" font-size="12">60</text>
<circle cx="250" cy="180" r="17" style="fill:var(--bg)"/><circle cx="250" cy="180" r="17" class="fv"/><text x="250" y="184" text-anchor="middle" font-size="12">90</text>
<text x="344" y="44" class="tg" font-size="11">200 &gt; 120 → right</text>
<text x="484" y="114" class="tg" font-size="11">200 &lt; 250 → left</text>
<text x="400" y="214" text-anchor="middle" class="tg" font-size="11">found</text>
<text x="250" y="214" text-anchor="middle" class="tm" font-size="11">new 90 lands here</text>
<text x="196" y="160" class="tm" font-size="10">90 &gt; 80 → right: empty</text>
</svg><figcaption>Searching for 200 visits only 120, 250 and 200 (green): each comparison throws away a whole subtree. Inserting 90 walks 120 → 80, finds 80's right side empty, and puts the new node there.</figcaption></figure>
  <p>Searching walks down from the root: if the value you want is smaller than the node, go left; if bigger, go right; if equal, you have found it; if you fall off the tree, it is not there. Searching for 200 compares with 120 (bigger, go right), then 250 (smaller, go left), then finds 200 after three nodes. Inserting is the same walk, and the new node goes into the empty spot where the search fell off: inserting 90 goes left at 120, right at 80, and lands as 80's right child. Every step discards a whole subtree, just as binary search discards half a list, so the cost is the number of levels walked: O(h), where h is the height.</p>
  <p>Deleting needs a little more care, and there are three cases. A leaf (no children) is simply removed. A node with one child is replaced by that child, which moves up into its place. A node with two children cannot just disappear, because both subtrees need a parent. Instead, find its <strong>inorder successor</strong>, the smallest value in its right subtree (go right once, then left as far as possible); copy that value into the node; then delete the successor from the right subtree. The successor is the next bigger value, so it can sit where the deleted value was: everything on the left is still smaller, everything on the right still bigger. And the successor has no left child, so deleting it is one of the easy cases.</p>
  <figure class="viz"><svg viewBox="0 0 600 228" width="600"><defs><marker id="tr-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="tg"/></marker></defs><text x="150" y="20" text-anchor="middle">1. delete 120 (two children)</text><line x1="150" y1="55" x2="90" y2="120" stroke="currentColor"/><line x1="150" y1="55" x2="210" y2="120" stroke="currentColor"/><line x1="210" y1="120" x2="170" y2="185" stroke="currentColor"/><line x1="210" y1="120" x2="250" y2="185" stroke="currentColor"/><circle cx="150" cy="55" r="17" style="fill:var(--bg)"/><circle cx="150" cy="55" r="17" class="fr sr"/><text x="150" y="59" text-anchor="middle">120</text><circle cx="90" cy="120" r="17" style="fill:var(--bg)"/><circle cx="90" cy="120" r="17" class="fb sb"/><text x="90" y="124" text-anchor="middle">80</text><circle cx="210" cy="120" r="17" style="fill:var(--bg)"/><circle cx="210" cy="120" r="17" class="fb sb"/><text x="210" y="124" text-anchor="middle">250</text><circle cx="170" cy="185" r="17" style="fill:var(--bg)"/><circle cx="170" cy="185" r="17" class="fg sg"/><text x="170" y="189" text-anchor="middle">200</text><circle cx="250" cy="185" r="17" style="fill:var(--bg)"/><circle cx="250" cy="185" r="17" class="fb sb"/><text x="250" y="189" text-anchor="middle">310</text><path d="M155,170 Q120,125 143,73" fill="none" class="sg" stroke-width="1.5" stroke-dasharray="4 3" marker-end="url(#tr-a1)"/><text x="170" y="220" text-anchor="middle" class="tg">successor = min of right side</text><text x="300" y="120" text-anchor="middle">→</text><text x="465" y="20" text-anchor="middle">2. copy 200 up, delete old 200</text><line x1="465" y1="55" x2="405" y2="120" stroke="currentColor"/><line x1="465" y1="55" x2="525" y2="120" stroke="currentColor"/><line x1="525" y1="120" x2="565" y2="185" stroke="currentColor"/><circle cx="465" cy="55" r="17" style="fill:var(--bg)"/><circle cx="465" cy="55" r="17" class="fg sg"/><text x="465" y="59" text-anchor="middle">200</text><circle cx="405" cy="120" r="17" style="fill:var(--bg)"/><circle cx="405" cy="120" r="17" class="fb sb"/><text x="405" y="124" text-anchor="middle">80</text><circle cx="525" cy="120" r="17" style="fill:var(--bg)"/><circle cx="525" cy="120" r="17" class="fb sb"/><text x="525" y="124" text-anchor="middle">250</text><circle cx="565" cy="185" r="17" style="fill:var(--bg)"/><circle cx="565" cy="185" r="17" class="fb sb"/><text x="565" y="189" text-anchor="middle">310</text><text x="465" y="220" text-anchor="middle" class="tm">still: left &lt; 200 &lt; right</text></svg><figcaption>Deleting the root 120 (80's subtree is drawn as just 80). Its successor 200, the smallest value on the right, is copied up to the root, and the old 200 is removed from below.</figcaption></figure>
<div class="fx" data-lang="py">def bst_search(node, x):
    while node and node.val != x:
        node = node.left if x &lt; node.val else node.right
    return node                        # the node, or None if absent

def bst_insert(node, x):
    if node is None:
        return TreeNode(x)             # found the empty spot
    if x &lt; node.val:
        node.left = bst_insert(node.left, x)
    elif x &gt; node.val:
        node.right = bst_insert(node.right, x)
    return node                        # duplicates are ignored

def bst_delete(node, x):
    if node is None:
        return None
    if x &lt; node.val:
        node.left = bst_delete(node.left, x)
    elif x &gt; node.val:
        node.right = bst_delete(node.right, x)
    else:
        if node.left is None:          # 0 or 1 child: lift the other child up
            return node.right
        if node.right is None:
            return node.left
        succ = node.right              # 2 children: smallest value on the right
        while succ.left:
            succ = succ.left
        node.val = succ.val            # copy it here
        node.right = bst_delete(node.right, succ.val)   # remove the copy below
    return node

root = None
for charge in [120, 80, 250, 40, 310, 80, 60, 200]:      # arrival order
    root = bst_insert(root, charge)
print("same as the charge tree:", level_order(root) == level_order(build(CHARGES)))
print("find 200:", bst_search(root, 200).val, "| find 90:", bst_search(root, 90))
root = bst_insert(root, 90)
print("insert 90 :", level_order(root))
for x in [40, 120]:
    root = bst_delete(root, x)
    print(f"delete {x:3}:", level_order(root))</div>
  <div class="fx" data-lang="text">same as the charge tree: True
find 200: 200 | find 90: None
insert 90 : [[120], [80, 250], [40, 90, 200, 310], [60]]
delete  40: [[120], [80, 250], [60, 90, 200, 310]]
delete 120: [[200], [80, 250], [60, 90, 310]]</div>
  <p>Inserting the charges in arrival order rebuilds exactly the tree we have used since section 02. Searching for 90 before inserting it returns <code>None</code>. After inserting 90 it appears on the third level, as 80's right child. Deleting 40 is the one-child case: 60 moves up to take its place under 80. Deleting 120 is the two-children case: 200, the smallest value to the right of 120, becomes the new root.</p>
  <p>Now the mystery from section 03 is solved. Inorder visits the left subtree, then the node, then the right subtree, and in a BST everything on the left is smaller and everything on the right is bigger. Apply that at every node and the output must come out in increasing order. <strong>The inorder traversal of a BST is sorted</strong>, and it is the single most useful BST fact: it gives the kth smallest value, the sorted list, and an easy way to check whether a tree is a BST at all.</p>
  <p>Checking whether a tree really is a BST is a favourite interview question, and the obvious answer is wrong. It is tempting to check, at every node, that the left child is smaller and the right child is bigger. Suppose a typo stored ₹100 where ₹200 should be: <code>[120, 80, 250, 40, None, 100, 310, None, 60]</code>. Node 250 has children 100 and 310, which looks fine locally, but 100 sits in the right subtree of 120 and is smaller than 120, so the tree is not a BST. The rule is about whole subtrees, so every node must respect all of its ancestors. The fix is top-down: pass down the range of values a node is allowed to have. Going left, the node's value becomes the new upper limit; going right, it becomes the new lower limit. In the typo tree, 100 must lie between 120 and 250, and it does not.</p>
<div class="fx" data-lang="py">def is_valid_bst(root):
    def ok(node, lo, hi):              # every value here must be in (lo, hi)
        if node is None:
            return True
        if not (lo &lt; node.val &lt; hi):
            return False
        return ok(node.left, lo, node.val) and ok(node.right, node.val, hi)
    return ok(root, float("-inf"), float("inf"))

for vals in [CHARGES, [120, 80, 250, 40, None, 100, 310, None, 60], [5, 4, 6, None, None, 3, 7], [2, 2, 2]]:
    print(vals, is_valid_bst(build(vals)))</div>
  <div class="fx" data-lang="text">[120, 80, 250, 40, None, 200, 310, None, 60] True
[120, 80, 250, 40, None, 100, 310, None, 60] False
[5, 4, 6, None, None, 3, 7] False
[2, 2, 2] False</div>
  <p>The real charge tree passes; the typo tree fails at 100; <code>[5, 4, 6, None, None, 3, 7]</code> fails for the same reason (3 is under 6 but in 5's right subtree); and equal values fail because the comparison is strict, which matches the usual problem statement. An equally correct alternative is to run an inorder traversal and check that every value is bigger than the one before. Both are O(n) time and O(h) space. Search, insert, delete, minimum, maximum and successor all walk a single path and cost O(h); recognise a BST problem from words like "BST", "kth smallest", "in sorted order", "successor", "closest value" or "range sum".</p>

  <h2 id="dsa-tr-balance"><span class="num">07</span>Balanced Trees</h2>
  <p>Every BST operation costs O(h), and the height depends entirely on the order in which values were inserted. Our 7 charges, inserted in arrival order, made a tree of height 3. But what if the charges arrive already sorted, which is very common in real data such as IDs and timestamps? Each new value is bigger than everything before it, so it always goes right, and the "tree" becomes a straight line. Compare that with building the tree deliberately from a sorted list by always making the middle value the root:</p>
<div class="fx" data-lang="py">def sorted_to_bst(a, lo=0, hi=None):
    if hi is None:
        hi = len(a) - 1
    if lo &gt; hi:
        return None
    mid = (lo + hi) // 2               # the middle value becomes the root
    return TreeNode(a[mid], sorted_to_bst(a, lo, mid - 1), sorted_to_bst(a, mid + 1, hi))

chain = None
for charge in sorted([120, 80, 250, 40, 310, 60, 200]):
    chain = bst_insert(chain, charge)
print("inserted sorted:", level_order(chain), "height", height(chain))
best = sorted_to_bst(sorted([120, 80, 250, 40, 310, 60, 200]))
print("balanced build :", level_order(best), "height", height(best))

skewed = None
for x in range(500):
    skewed = bst_insert(skewed, x)
print("500 values: skewed height", height(skewed), "| balanced height", height(sorted_to_bst(list(range(500)))))</div>
  <div class="fx" data-lang="text">inserted sorted: [[40], [60], [80], [120], [200], [250], [310]] height 6
balanced build : [[120], [60, 250], [40, 80, 200, 310]] height 2
500 values: skewed height 499 | balanced height 8</div>
  <p>The same 7 charges inserted in sorted order give seven levels with one node each, height 6; the balanced build puts the median 120 at the root and has height 2, the best possible for 7 nodes. With 500 values the gap is 499 levels against 8, and with a million values it would be 999,999 against 19. A BST that has degenerated into a chain is just a slow linked list, and every operation becomes O(n).</p>
  <p>Real libraries solve this with <strong>self-balancing</strong> BSTs, which repair their shape after every insert and delete so the height always stays O(log n), whatever the insert order. Think of a balance scale in a kirana shop: keep adding weight on one side and it tips, so the shopkeeper moves weights across to level it. A self-balancing tree does the same with an operation called a <strong>rotation</strong>, in which a parent and child swap roles in O(1) time while keeping the left-smaller, right-bigger order. Two designs are famous. An <strong>AVL tree</strong> insists that at every node the left and right heights differ by at most 1 (our charge tree breaks this at 80), which keeps the height below about 1.44 log₂ n. A <strong>red-black tree</strong> colours nodes red or black and follows looser rules that keep the height below 2 log₂ n with fewer rotations; it is what Java's <code>TreeMap</code> and C++'s <code>std::map</code> use. Interviews do not expect you to code these; they expect you to say "a plain BST is O(h), which is O(n) for sorted input; a self-balancing BST guarantees O(log n) by rotating after updates".</p>
  <p>Python itself has no built-in tree or sorted-map type. In interviews the usual stand-in for a balanced BST is a sorted list with the <code>bisect</code> module: search, floor and ceiling are O(log n), and although insert is O(n), the shifting is a fast memory move in C and is fine up to around 10⁵ items. For heavier use, the third-party <code>sortedcontainers</code> package (<code>SortedList</code>, <code>SortedDict</code>) gives O(log n)-style inserts and is available on LeetCode.</p>

  <h2 id="dsa-tr-paths"><span class="num">08</span>Path Problems</h2>
  <p>Finance now asks about whole routes: "Is there a chain of charges from the top of the tree down to a leaf that adds up to exactly ₹570?" A <strong>root-to-leaf path</strong> starts at the root and ends at a leaf (a node with no children). This is a top-down question, because the sum at a node depends on everything <em>above</em> it. So each call receives information from its parent, here "how much of the target is still remaining", subtracts its own value, and passes the rest down. When the walk reaches a real leaf, the remaining amount must be exactly zero.</p>
  <table class="tbl">
    <tr><th>node</th><th>remaining after this node</th><th>leaf?</th><th>result</th></tr>
    <tr><td>120</td><td>570 − 120 = 450</td><td>no</td><td></td></tr>
    <tr><td>80, 40</td><td>370, then 330</td><td>no (40 has a right child)</td><td></td></tr>
    <tr><td>60</td><td>270</td><td>yes</td><td>not 0: this path sums to 300</td></tr>
    <tr><td>250</td><td>200</td><td>no</td><td></td></tr>
    <tr><td>200</td><td>0</td><td>yes</td><td><b>found: [120, 250, 200]</b></td></tr>
    <tr><td>310</td><td>−110</td><td>yes</td><td>not 0: sums to 680</td></tr>
  </table>
  <p>To <em>list</em> the matching paths rather than just say yes or no, we keep one shared list holding the current route: append the node on the way down, recurse into both children, and pop it on the way back up. This "choose, explore, un-choose" rhythm is called <strong>backtracking</strong>, and it means the list always holds exactly the path from the root to the current node, without copying it at every step. Only when a match is found do we save a copy.</p>
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
            res.append(path[:])                     # save a COPY: path keeps changing
        dfs(node.left, remaining)
        dfs(node.right, remaining)
        path.pop()                                  # un-choose (backtrack)
    dfs(root, target)
    return res

t = build(CHARGES)
print(has_path_sum(t, 570), has_path_sum(t, 400))
print(path_sum(t, 570))
print(path_sum(build([5, 4, 8, 11, None, 13, 4, 7, 2, None, None, 5, 1]), 22))
print(path_sum(build([1, 2]), 1))</div>
  <div class="fx" data-lang="text">True False
[[120, 250, 200]]
[[5, 4, 11, 2], [5, 8, 4, 5]]
[]</div>
  <p>₹570 is reachable along 120, 250, 200; ₹400 is not, since the three routes sum to 300, 570 and 680. The third line is the standard LeetCode example with two matching paths. The last line is a trap worth remembering: in the tree <code>[1, 2]</code>, the root 1 alone matches the target 1, but it is <em>not</em> a leaf (it has a child), so it does not count. That is why the leaf test is "both children are None", not "the node is None". The same reason keeps 120-80-40 from counting as a path in our tree: 40 still has a child. Because values can be negative, you also cannot stop early once the running sum passes the target.</p>
  <p><code>has_path_sum</code> is O(n) time and O(h) space. <code>path_sum</code> is O(n·h) in the worst case, because each saved copy can be h long. Recognise these problems from "root-to-leaf", "path sum", "all paths", "good nodes" (no ancestor bigger than me, so carry the maximum so far downward) and "maximum difference between a node and an ancestor" (carry the minimum and maximum so far).</p>

  <h2 id="dsa-tr-lca"><span class="num">09</span>Lowest Common Ancestor</h2>
  <p>Another family of questions starts from two nodes instead of the root: "where do the routes to ₹60 and ₹200 meet?" The <strong>lowest common ancestor</strong> (LCA) of two nodes p and q is the deepest node that has both of them in its subtree, where a node counts as being in its own subtree. In a family tree it is the closest shared grandparent of two cousins; in the category tree, the smallest category containing both "South Indian" and "Cakes" is "Menu". It also gives distances: the number of edges between p and q is depth(p) + depth(q) − 2 × depth(LCA).</p>
  <p>Our <code>TreeNode</code> has no parent pointers, so we cannot simply walk upward from both nodes. In a <strong>BST</strong> the values tell us the way instead. Starting from the root: if both values are smaller than the node, the LCA must be on the left; if both are bigger, it is on the right; otherwise the two values split here (or one of them is this node), so this node is the answer. For 60 and 200 the split happens immediately at 120. For 40 and 60, both are smaller than 120 and smaller than 80, and at 40 one of them is the node itself, so the answer is 40. For 200 and 310, the walk goes right to 250, where they split.</p>
  <p>In a <strong>general binary tree</strong>, values give no direction, so we search both sides and let the answers flow up (bottom-up again). Each call returns the p or q node it found in its subtree, or <code>None</code>. If a node receives something from <em>both</em> its left and right children, then p and q are on different sides of it, so it is the LCA, and it returns itself; otherwise it passes up whatever it received. For (60, 200): 60 is found and passed up through 40 and 80; 200 is found and passed up through 250; the root receives 60 from the left and 200 from the right, so the root is the answer.</p>
<div class="fx" data-lang="py">def lca_bst(root, p, q):               # p, q are values; tree must be a BST
    node = root
    while node:
        if p &lt; node.val and q &lt; node.val:
            node = node.left           # both smaller: go left
        elif p &gt; node.val and q &gt; node.val:
            node = node.right          # both bigger: go right
        else:
            return node                # they split here (or one IS here)

def lca(root, p, q):                   # any binary tree
    if root is None or root.val == p or root.val == q:
        return root                    # found one of them (or nothing)
    left = lca(root.left, p, q)
    right = lca(root.right, p, q)
    if left and right:
        return root                    # one on each side: I am the LCA
    return left or right               # pass up whichever side found something

print("BST walk :", lca_bst(t, 60, 200).val, lca_bst(t, 40, 60).val, lca_bst(t, 200, 310).val)
print("any tree :", lca(t, 60, 200).val, lca(t, 40, 60).val, lca(t, 200, 310).val)
bt = build([3, 5, 1, 6, 2, 0, 8, None, None, 7, 4])     # not a BST
print("LeetCode example:", lca(bt, 5, 1).val, lca(bt, 5, 4).val)</div>
  <div class="fx" data-lang="text">BST walk : 120 40 250
any tree : 120 40 250
LeetCode example: 3 5</div>
  <p>Both methods agree on the charge tree: 120, 40 and 250. The last line uses a tree that is not a BST, where only the general method works. In <code>lca(bt, 5, 4)</code>, 4 lies below 5, so the search stops at 5 and returns it, which is correct because 5 is an ancestor of itself and of 4. The BST walk is O(h) time and O(1) space since it follows one path; the general version may visit every node, O(n) time and O(h) space. Always ask "is it a BST?" before choosing, because the BST walk relies on the values and goes the wrong way on an arbitrary tree.</p>

  <h2 id="dsa-tr-build"><span class="num">10</span>Building and Saving Trees</h2>
  <p>To save the charge tree to a file or send it to another service, we must turn it into a flat sequence and later rebuild exactly the same shape. Section 03 already turned the tree into lists. Is that reversible? Preorder alone, <code>120 80 40 60 250 200 310</code>, is not enough: it does not say whether 40 is 80's left or right child.</p>
  <p>Two traversals together are enough, provided the values are distinct. Preorder's first value is always the root of the whole tree (120). Find 120 in the inorder list <code>[40, 60, 80, 120, 200, 250, 310]</code>: everything to its left in inorder belongs to the left subtree and everything to its right belongs to the right subtree. Preorder then hands out the roots of those subtrees in order, because it lists the whole left subtree before the right one. Recursing on each part rebuilds the tree.</p>
  <table class="tbl">
    <tr><th>next preorder value</th><th>inorder part it lives in</th><th>split</th><th>becomes</th></tr>
    <tr><td>120</td><td>[40, 60, 80, 120, 200, 250, 310]</td><td>[40, 60, 80] | 120 | [200, 250, 310]</td><td>root</td></tr>
    <tr><td>80</td><td>[40, 60, 80]</td><td>[40, 60] | 80 | []</td><td>left of 120</td></tr>
    <tr><td>40</td><td>[40, 60]</td><td>[] | 40 | [60]</td><td>left of 80</td></tr>
    <tr><td>60</td><td>[60]</td><td>leaf</td><td>right of 40</td></tr>
    <tr><td>250</td><td>[200, 250, 310]</td><td>[200] | 250 | [310]</td><td>right of 120</td></tr>
    <tr><td>200, 310</td><td>[200], [310]</td><td>leaves</td><td>children of 250</td></tr>
  </table>
  <p>The code uses a dictionary from each value to its position in inorder, so finding the split is O(1), and an iterator over preorder that hands out the next root each time a node is created:</p>
<div class="fx" data-lang="py">def build_tree(preorder_vals, inorder_vals):
    pos = {v: i for i, v in enumerate(inorder_vals)}   # value -&gt; index in inorder
    it = iter(preorder_vals)                           # preorder gives roots in order
    def make(lo, hi):                                  # subtree uses inorder[lo..hi]
        if lo &gt; hi:
            return None
        node = TreeNode(next(it))
        mid = pos[node.val]
        node.left = make(lo, mid - 1)                  # left first: preorder is me, LEFT, right
        node.right = make(mid + 1, hi)
        return node
    return make(0, len(inorder_vals) - 1)

rebuilt = build_tree(preorder(t, []), inorder(t, []))
print(level_order(rebuilt), "| identical:", level_order(rebuilt) == level_order(t))
print(level_order(build_tree([3, 9, 20, 15, 7], [9, 3, 15, 20, 7])))</div>
  <div class="fx" data-lang="text">[[120], [80, 250], [40, 200, 310], [60]] | identical: True
[[3], [9, 20], [15, 7]]</div>
  <p>The charge tree comes back exactly. The whole rebuild is O(n) time and space; using list slices and <code>inorder.index()</code> also works but is O(n²). The left subtree must be built before the right one, because that is the order in which preorder lists the roots. The same idea works with postorder and inorder (postorder gives the root last), but preorder plus postorder without inorder is ambiguous: a node with a single child produces the same two lists whether that child is on the left or the right. Duplicates break the inorder split too, which is one reason our tree stores ₹80 only once.</p>
  <p>For saving a single tree, there is a simpler format: write the preorder traversal, but write a marker such as <code>#</code> for every empty child. With the markers, preorder alone becomes unambiguous: after 40 comes <code>#</code> (no left child) and then 60. This is called <strong>serialization</strong>, any reversible conversion of a structure to a flat string, and reading it back (<strong>deserialization</strong>) follows the same order: me, then left, then right.</p>
<div class="fx" data-lang="py">def serialize(root):
    out = []
    def go(node):
        if node is None:
            out.append("#")            # mark the empty spot
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
        node.left = make()             # same order as serialize: me, left, right
        node.right = make()
        return node
    return make()

s = serialize(t)
print(s)
print(level_order(deserialize(s)), "|", serialize(None))</div>
  <div class="fx" data-lang="text">120,80,40,#,60,#,#,#,250,200,#,#,310,#,#
[[120], [80, 250], [40, 200, 310], [60]] | #</div>
  <p>The string reads naturally once you know the order: 120, then its whole left subtree (80, 40, <code>#</code> for 40's missing left child, 60 with two <code>#</code> children, <code>#</code> for 80's missing right child), then the right subtree. Deserializing it gives back the same four levels, and an empty tree is just <code>#</code>. Both directions are O(n). The same marked string is a handy way to compare trees: two trees are identical exactly when their serializations are equal. Recognise this group from "construct from preorder and inorder", "serialize and deserialize", "same tree" or "subtree of another tree".</p>

  <h2 id="dsa-tr-patterns"><span class="num">11</span>Recognising the Pattern</h2>
  <p>Almost every tree problem is one of a handful of shapes, and the problem's wording usually tells you which. The deciding questions are: does the answer at a node depend on its children (bottom-up) or on its ancestors (top-down)? Is the answer about levels (BFS)? Is the tree a BST, so that inorder is sorted and values tell you which way to go? Is the question about two nodes meeting (LCA) or about rebuilding a shape (divide by the root)?</p>
  <table class="tbl">
    <tr><th>Trigger words</th><th>Pattern</th><th>Shape of the code</th><th>Cost</th></tr>
    <tr><td>"maximum / minimum depth", "height", "is balanced", "diameter", "count nodes"</td><td>bottom-up DFS</td><td><code>l = f(left); r = f(right); return combine(l, r, me)</code>, often with a <code>best</code> variable</td><td>O(n)</td></tr>
    <tr><td>"root-to-leaf", "path sum", "good nodes", "valid range"</td><td>top-down DFS</td><td><code>f(node, info_so_far)</code>, update, pass to children</td><td>O(n)</td></tr>
    <tr><td>"all paths", "list every path"</td><td>backtracking</td><td><code>path.append(v); recurse; path.pop()</code>, save <code>path[:]</code></td><td>O(n·h)</td></tr>
    <tr><td>"level", "row", "right side view", "zigzag", "minimum depth"</td><td>BFS by level</td><td><code>for _ in range(len(q))</code></td><td>O(n)</td></tr>
    <tr><td>"BST" with "kth", "sorted", "closest", "successor", "range"</td><td>use the BST order</td><td>inorder is sorted; or walk left/right by comparing</td><td>O(h) or O(n)</td></tr>
    <tr><td>"lowest common ancestor", "distance between two nodes"</td><td>LCA</td><td>the node where both sides return something</td><td>O(n); BST O(h)</td></tr>
    <tr><td>"construct from traversals", "serialize", "same tree", "subtree"</td><td>divide by the root / marked preorder</td><td>root from preorder, split by inorder index</td><td>O(n)</td></tr>
  </table>
  <p>The two DFS skeletons are worth having in your fingers. Here they are as runnable functions on the charge tree: bottom-up computes (size, total) for every subtree from its children's answers, and top-down passes the largest charge seen so far down each path to find the "good" nodes, those with no bigger charge above them:</p>
<div class="fx" data-lang="py">def bottom_up(node):
    if node is None:
        return (0, 0)                              # the "nothing" answer
    ls, lt = bottom_up(node.left)
    rs, rt = bottom_up(node.right)
    return (ls + rs + 1, lt + rt + node.val)       # combine with me

def top_down(node, best_above, out):
    if node is None:
        return out
    if node.val &gt;= best_above:
        out.append(node.val)                       # no ancestor is bigger than me
    best_above = max(best_above, node.val)
    top_down(node.left, best_above, out)
    top_down(node.right, best_above, out)
    return out

print("size and total:", bottom_up(t))
print("good nodes    :", top_down(t, float("-inf"), []))</div>
  <div class="fx" data-lang="text">size and total: (7, 1060)
good nodes    : [120, 250, 310]</div>
  <p>The tree has 7 nodes worth ₹1,060 in total, and the good charges are 120, 250 and 310. One caution about choosing: "maximum depth" contains the word "depth", which tempts people towards BFS. Both work, but the bottom-up DFS is three lines. Reach for BFS when the answer is genuinely per level, or when you can stop at the first leaf you meet (minimum depth).</p>

  <h2 id="dsa-tr-problems"><span class="num">12</span>More Classic Problems</h2>
  <p>Many interview favourites are already solved above: level order and right side view (section 04), diameter and balanced tree (05), search, insert, delete and validate a BST (06), convert a sorted array to a BST (07), path sum (08), lowest common ancestor (09), and construct and serialize (10). Three more appear constantly, and each is a two-minute application of a pattern you now know.</p>
  <p><strong>Maximum Depth</strong> asks for the number of nodes on the longest root-to-leaf path. It is bottom-up recursion in its purest form: my depth is one more than my deeper child's, and an empty tree has depth 0. <strong>Invert Binary Tree</strong> asks for the mirror image, with every left and right child swapped; at each node, invert both children and swap them. <strong>Kth Smallest Element in a BST</strong> uses the sorted inorder: the kth node handled by an inorder traversal is the answer, and the iterative inorder lets us stop the moment we reach it instead of visiting the whole tree.</p>
<div class="fx" data-lang="py">def max_depth(root):                   # counts NODES on the longest path
    if root is None:
        return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))

def invert_tree(root):
    if root is None:
        return None
    root.left, root.right = invert_tree(root.right), invert_tree(root.left)
    return root

def kth_smallest(root, k):
    stack, cur = [], root
    while cur or stack:
        while cur:
            stack.append(cur)
            cur = cur.left
        cur = stack.pop()
        k -= 1
        if k == 0:
            return cur.val             # stop early
        cur = cur.right

print("max depth:", max_depth(build(CHARGES)), max_depth(build([])))
print("kth smallest:", [kth_smallest(build(CHARGES), k) for k in (1, 3, 7)])
m = invert_tree(build(CHARGES))
print("inverted:", level_order(m), "| inorder", inorder(m, []))</div>
  <div class="fx" data-lang="text">max depth: 4 0
kth smallest: [40, 80, 310]
inverted: [[120], [250, 80], [310, 200, 40], [60]] | inorder [310, 250, 200, 120, 80, 60, 40]</div>
  <p>Maximum depth is 4 on the charge tree, which is the textbook height 3 plus one, because it counts nodes rather than edges. The 1st, 3rd and 7th smallest charges are 40, 80 and 310. Inverting the tree mirrors every level (250 is now on the left of the root), and its inorder now comes out in descending order, which is a quick way to check the answer. In <code>invert_tree</code> the tuple assignment evaluates both recursive calls before assigning, so nothing is overwritten too early. Maximum depth and invert are O(n) time and O(h) space; kth smallest is O(h + k). A favourite follow-up for kth smallest is "what if the tree changes often and you are asked often?": store each subtree's size in its node, then at each node compare k with the left subtree's size and go left, stop, or go right with k reduced, which is O(h) per query.</p>
  <p>For practice in the <a class="xref" data-note="dsa_problems">Problem Tracker</a>, this order builds up the patterns one at a time. Start with the traversals, <b>144</b>, <b>94</b> and <b>145</b> (preorder, inorder, postorder), writing each both recursively and with an explicit stack. Then bottom-up recursion: <b>104 Maximum Depth</b>, <b>226 Invert Binary Tree</b>, <b>100 Same Tree</b> and <b>101 Symmetric Tree</b> (two trees walked together), <b>543 Diameter</b> and <b>110 Balanced Binary Tree</b>. Then BFS with <b>102 Level Order Traversal</b> and <b>199 Right Side View</b>. Move to BSTs with <b>700 Search</b>, <b>701 Insert</b>, <b>98 Validate</b>, <b>230 Kth Smallest</b> and <b>450 Delete Node</b>, plus <b>108 Convert Sorted Array to BST</b> for balance. Then top-down and backtracking with <b>112 Path Sum</b>, <b>113 Path Sum II</b> and <b>1448 Count Good Nodes</b>; then <b>235</b> and <b>236</b> for the LCA in a BST and in any tree; and finish with <b>105 Construct from Preorder and Inorder</b>, <b>297 Serialize and Deserialize</b> and <b>124 Maximum Path Sum</b> (the diameter idea with values). Before coding each, decide out loud whether information flows up or down and what the empty tree returns.</p>

  <h2 id="dsa-tr-traps"><span class="num">13</span>Common Mistakes</h2>
  <p>The most famous tree mistake is validating a BST by comparing each node only with its own children. It accepts the typo tree from section 06, where ₹100 is a perfectly good left child of 250 but sits on the wrong side of 120:</p>
<div class="fx" data-lang="py">def is_bst_wrong(node):                # checks only parent vs children
    if node is None:
        return True
    if node.left and node.left.val &gt;= node.val:
        return False
    if node.right and node.right.val &lt;= node.val:
        return False
    return is_bst_wrong(node.left) and is_bst_wrong(node.right)

typo = build([120, 80, 250, 40, None, 100, 310, None, 60])
print("parent-only check:", is_bst_wrong(typo), "| bounds check:", is_valid_bst(typo))</div>
  <div class="fx" data-lang="text">parent-only check: True | bounds check: False</div>
  <p>The parent-only check says <code>True</code>; the bounds check correctly says <code>False</code>. Every node must respect all of its ancestors, which is why the allowed range narrows as you go down.</p>
  <p>The second classic is saving a path without copying it. In backtracking, <code>path</code> is one list that keeps changing; appending it directly stores a reference to that same list, and after all the pops it is empty:</p>
<div class="fx" data-lang="py">def path_sum_buggy(root, target):
    res, path = [], []
    def dfs(node, remaining):
        if node is None:
            return
        path.append(node.val)
        remaining -= node.val
        if node.left is None and node.right is None and remaining == 0:
            res.append(path)           # BUG: stores the same list object
        dfs(node.left, remaining)
        dfs(node.right, remaining)
        path.pop()
    dfs(root, target)
    return res

print("without copy:", path_sum_buggy(t, 570), "| with copy:", path_sum(t, 570))</div>
  <div class="fx" data-lang="text">without copy: [[]] | with copy: [[120, 250, 200]]</div>
  <p>The buggy version returns <code>[[]]</code>: it did find the path, but the list it saved was emptied by the later pops. <code>path[:]</code> (or <code>list(path)</code>) saves a snapshot instead.</p>
  <p>Several smaller slips cause most of the remaining wrong answers. Forgetting the <code>None</code> base case crashes with <code>AttributeError: 'NoneType' object has no attribute 'val'</code> the first time a missing child is touched, so every recursive tree function should begin by handling the empty tree and choosing its return value carefully (0, −1, <code>True</code>, an empty list). Testing <code>node is None</code> where the problem means "a leaf" ends paths at nodes that still have a child, which breaks path sums and minimum depth. Returning the two-sided <code>l + r</code> from the diameter helper, instead of recording it in <code>best</code> and returning the one-sided depth, lets the parent build a path that bends twice. Mixing up edges and nodes gives answers that are off by exactly one. Pushing the left child before the right in iterative preorder produces a valid DFS but not preorder. Using the BST LCA walk on a tree that is not a BST walks the wrong way. Saying "BST search is O(log n)" without the word <em>balanced</em> is a red flag to interviewers. And Python's recursion limit of about 1000 means a skewed input of 10⁴ nodes needs either an iterative traversal or <code>sys.setrecursionlimit</code>; mentioning this shows you know the language.</p>

  <h2 id="dsa-tr-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Definitions</h3>
  <ul>
    <li><b>Tree</b>: nodes joined by parent-to-child links; one root, every other node has one parent, no loops; n nodes, n − 1 edges.</li>
    <li><b>Binary tree</b>: at most two children, left and right. <b>Leaf</b>: no children.</li>
    <li><b>Depth</b>: edges from the root down to a node. <b>Height</b>: edges from a node down to its deepest leaf (leaf 0, empty −1).</li>
    <li><b>Complete</b>: all levels full except the last, filled from the left. <b>Skewed</b>: one child per node, height n − 1.</li>
    <li><b>BST</b>: every value in the left subtree &lt; node &lt; every value in the right subtree.</li>
    <li><b>Height-balanced</b>: at every node, left and right heights differ by at most 1.</li>
    <li><b>Diameter</b>: edges on the longest path between any two nodes.</li>
    <li><b>LCA</b>: deepest node with both p and q in its subtree (a node counts as its own ancestor).</li>
  </ul>
  <h3>Traversals on the charge tree</h3>
  <table class="tbl">
    <tr><th>Order</th><th>Rule</th><th>Result</th><th>Use</th></tr>
    <tr><td>Preorder</td><td>me, L, R</td><td>120 80 40 60 250 200 310</td><td>copy, serialize, indent</td></tr>
    <tr><td>Inorder</td><td>L, me, R</td><td>40 60 80 120 200 250 310</td><td>sorted order of a BST</td></tr>
    <tr><td>Postorder</td><td>L, R, me</td><td>60 40 80 200 310 250 120</td><td>children's answers first</td></tr>
    <tr><td>Level order</td><td>queue, by depth</td><td>[120] [80, 250] [40, 200, 310] [60]</td><td>per-level answers</td></tr>
  </table>
  <h3>Costs</h3>
  <table class="tbl">
    <tr><th>Operation</th><th>Cost</th></tr>
    <tr><td>any traversal</td><td>O(n) time; DFS O(h) space, BFS O(width)</td></tr>
    <tr><td>BST search / insert / delete / min / successor</td><td>O(h): O(log n) balanced, O(n) skewed</td></tr>
    <tr><td>validate BST, diameter, balanced, LCA (any tree)</td><td>O(n)</td></tr>
    <tr><td>LCA in a BST</td><td>O(h) time, O(1) space</td></tr>
    <tr><td>build from preorder + inorder (with a dict)</td><td>O(n)</td></tr>
  </table>
  <h3>Templates</h3>
  <div class="fx" data-lang="py">def bottom_up(node):                 # answer from children
    if node is None: return BASE
    l, r = bottom_up(node.left), bottom_up(node.right)
    return combine(l, r, node.val)

def top_down(node, info):            # info from ancestors
    if node is None: return
    info = update(info, node.val)
    top_down(node.left, info); top_down(node.right, info)

def ok(node, lo, hi):                # validate BST
    return node is None or (lo &lt; node.val &lt; hi and
        ok(node.left, lo, node.val) and ok(node.right, node.val, hi))</div>
  <h3>Gotchas</h3>
  <ul>
    <li>Validate a BST with bounds, not parent-only checks.</li>
    <li>Leaf test: <code>node.left is None and node.right is None</code>.</li>
    <li>Save <code>path[:]</code>, not <code>path</code>.</li>
    <li>Diameter: return one-sided depth, record two-sided bend.</li>
    <li>Edges vs nodes: height 3 = max depth 4 on the charge tree.</li>
    <li>"O(log n)" only if balanced; sorted inserts make a chain.</li>
  </ul>

  <h2 id="dsa-tr-qa"><span class="num">14</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is a tree, and how is it different from a graph?</summary><div class="qa-body">A tree is a set of nodes connected by parent-to-child links with one root, where every other node has exactly one parent and there are no cycles; n nodes always have n − 1 edges. A graph is the general case: any node can connect to any other, cycles are allowed, and there may be no root. Every tree is a graph, but not every graph is a tree.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Define depth and height. What is the height of a single node and of an empty tree?</summary><div class="qa-body">Depth is the number of edges from the root down to a node; height is the number of edges on the longest path from a node down to a leaf. A single node has height 0, and an empty tree is −1 by convention. LeetCode's "maximum depth" counts nodes instead, giving 1 and 0, so state your unit.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the minimum and maximum heights of a binary tree with n nodes?</summary><div class="qa-body">The minimum is ⌊log₂ n⌋, when every level is packed full, because level d can hold at most 2<sup>d</sup> nodes. The maximum is n − 1, when every node has a single child and the tree is a chain. This range is why BST costs are stated as O(h) rather than O(log n).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain preorder, inorder and postorder, and give a use for each.</summary><div class="qa-body">They differ only in when the node itself is handled relative to its subtrees: before (preorder), between (inorder) or after (postorder). Preorder suits copying, serializing and printing hierarchies. Inorder gives sorted output on a BST. Postorder suits anything that needs the children's results first, such as heights, sizes or deleting a tree.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Compare DFS and BFS on a tree in time and space. When would you prefer each?</summary><div class="qa-body">Both visit every node once, O(n) time. DFS uses O(h) space for one root-to-leaf path; BFS uses O(w) for the widest level, which can be about n/2 in a full tree. Prefer BFS for level-based questions or when the answer is near the top (minimum depth); prefer DFS for whole-tree computations and when the tree is wide.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you do an inorder traversal without recursion?</summary><div class="qa-body">Keep an explicit stack and a current pointer. Slide left from the current node, pushing every node on the way; when you cannot go further, pop a node, handle it, and move to its right child; repeat until both the pointer and the stack are empty. This is what recursion does behind the scenes, and it avoids Python's recursion limit on deep trees.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why is the inorder traversal of a BST sorted?</summary><div class="qa-body">Inorder handles the left subtree, then the node, then the right subtree. In a BST every value on the left is smaller than the node and every value on the right is bigger. Applying that at every node forces the output to come out in increasing order.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are the time complexities of BST search, insert and delete?</summary><div class="qa-body">All three walk a single path from the root, so they are O(h). For a balanced tree h is about log₂ n, giving O(log n); for a skewed tree, such as one built from sorted input, h is n − 1 and they degrade to O(n). Self-balancing trees guarantee O(log n).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you delete a BST node that has two children?</summary><div class="qa-body">Find its inorder successor, the smallest value in its right subtree (go right once, then left as far as possible). Copy that value into the node, then delete the successor from the right subtree; the successor has no left child, so that deletion is an easy zero- or one-child case. The inorder predecessor (largest on the left) works equally well.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does checking "left child &lt; node &lt; right child" at every node fail to validate a BST? What works?</summary><div class="qa-body">The BST rule applies to whole subtrees, not just children. A node can be a valid child of its parent yet violate a grandparent, like ₹100 under 250 in 120's right subtree. Pass a (low, high) range down, narrowing it at each step, or check that the inorder traversal is strictly increasing. Both are O(n).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a balanced tree, and how do AVL and red-black trees stay balanced?</summary><div class="qa-body">A balanced tree keeps its height O(log n), so operations stay fast regardless of insert order. After each insert or delete, a self-balancing BST checks a rule and repairs violations with rotations, O(1) restructurings that preserve the BST order. AVL trees keep child heights within 1 of each other (stricter, faster lookups); red-black trees use colour rules (looser, fewer rotations) and power Java's TreeMap and C++'s std::map.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you compute the diameter of a binary tree, and why do you need a separate variable?</summary><div class="qa-body">At every node the longest path that bends there has length left depth + right depth, so a single postorder pass computes depths and keeps the maximum bend seen. The function must return the one-sided depth (1 + max(l, r)), which is what the parent can extend, while the answer is two-sided; since those differ, the answer is kept in a separate variable. It is O(n).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you check whether a tree is height-balanced in O(n)?</summary><div class="qa-body">Use one postorder pass that returns each subtree's height, or a special value such as −2 if that subtree is already unbalanced. At each node compare the two children's heights and propagate failure upward. Calling a separate height function at every node also works but is O(n²) on a skewed tree, because it re-walks each subtree.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When does information flow down a tree, and when does it flow up?</summary><div class="qa-body">It flows up (bottom-up, postorder) when a node's answer depends on its descendants: height, size, diameter, balance. It flows down (top-down, preorder) when it depends on ancestors: current depth, the sum of a path so far, the allowed range in a BST. Ask "who knows what this node needs?" to choose.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How do you find the lowest common ancestor in a BST, and in a general binary tree?</summary><div class="qa-body">In a BST, walk from the root: if both values are smaller go left, if both are bigger go right, otherwise the current node is the LCA; O(h) time, O(1) space. In a general tree, recurse: return the node if it is p or q; if both subtrees return something, the current node is the LCA; otherwise pass up the non-empty side. That is O(n) time and O(h) space.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Which traversals uniquely determine a binary tree?</summary><div class="qa-body">With distinct values, preorder plus inorder, or postorder plus inorder: the first gives each subtree's root and inorder splits left from right. Preorder plus postorder is ambiguous for nodes with a single child. A single preorder with markers for empty children is also enough, which is the usual serialization format.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Python has no built-in balanced BST. What do you use instead?</summary><div class="qa-body">For interviews, a sorted list with the <code>bisect</code> module gives O(log n) search, floor and ceiling; inserts are O(n) but fast in practice. The third-party <code>sortedcontainers</code> library provides <code>SortedList</code> and <code>SortedDict</code> with roughly logarithmic updates. For "smallest / largest so far" only, a heap is enough. General trees are usually stored as a dict from node to list of children.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What can go wrong with recursive tree code in Python on large inputs, and how do you fix it?</summary><div class="qa-body">Python's default recursion limit is about 1000 frames, so a skewed tree with 10⁴ nodes raises <code>RecursionError</code>. Fix it by writing the traversal iteratively with an explicit stack or queue, or by raising the limit with <code>sys.setrecursionlimit</code> (which still risks a real stack overflow at extreme depths).</div></details>
</main>
`
});
