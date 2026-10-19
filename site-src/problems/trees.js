// problems/trees.js — Trees ladder
PROBLEMS.push(
  {
    num: 94, title: "Binary Tree Inorder Traversal", slug: "binary-tree-inorder-traversal", lc: "Easy",
    topic: "trees",
    pattern: "DFS traversal orders",
    level: 1,
    order: 10,
    core: true,
    teaches: "Inorder means left subtree, then the node, then right subtree.",
    learn: ["dsa_trees", "dsa-tr-dfs"],
    pre: [],
    hints: ["Write a helper that visits one node: what order do the three actions go in?", "visit(left), record node.val, visit(right). Stop when the node is None."],
    steps: ["Create an empty result list.", "dfs(node): if node is None return; dfs(node.left); append node.val; dfs(node.right).", "Call dfs(root) and return the list."],
    time: "O(n)", space: "O(h)",
    trap: "Forgetting the None base case; the follow-up asks for the iterative stack version, so practise that too.",
    code: `class Solution:
    def inorderTraversal(self, root):
        res = []
        def dfs(node):
            if not node:
                return
            dfs(node.left)
            res.append(node.val)
            dfs(node.right)
        dfs(root)
        return res`
  },
  {
    num: 144, title: "Binary Tree Preorder Traversal", slug: "binary-tree-preorder-traversal", lc: "Easy",
    topic: "trees",
    pattern: "DFS traversal orders",
    level: 1,
    order: 20,
    core: false,
    teaches: "Preorder records the node before its children; an explicit stack does the same job as recursion.",
    learn: ["dsa_trees", "dsa-tr-dfs"],
    pre: [94],
    hints: ["Same as inorder but the append moves: where?", "Iteratively: pop a node, record it, push right child then left child so left is processed first."],
    steps: ["If root is None return [].", "stack = [root].", "Pop node, append its value, push node.right then node.left (if present).", "Repeat until the stack is empty."],
    time: "O(n)", space: "O(h)",
    trap: "Pushing left before right reverses the order: the stack is last-in first-out.",
    code: `class Solution:
    def preorderTraversal(self, root):
        if not root:
            return []
        res, stack = [], [root]
        while stack:
            node = stack.pop()
            res.append(node.val)
            if node.right:
                stack.append(node.right)
            if node.left:
                stack.append(node.left)
        return res`
  },
  {
    num: 104, title: "Maximum Depth of Binary Tree", slug: "maximum-depth-of-binary-tree", lc: "Easy",
    topic: "trees",
    pattern: "Bottom-up: return info from children",
    level: 1,
    order: 30,
    core: true,
    teaches: "A node's depth answer is 1 + the bigger answer of its two children.",
    learn: ["dsa_trees", "dsa-tr-recur"],
    pre: [],
    hints: ["If both children already told you their depth, what is yours?", "Empty tree has depth 0; otherwise 1 + max(left depth, right depth)."],
    steps: ["If root is None return 0.", "Return 1 + max(maxDepth(left), maxDepth(right))."],
    time: "O(n)", space: "O(h)",
    trap: "Returning 1 for a None node counts an extra level.",
    code: `class Solution:
    def maxDepth(self, root):
        if not root:
            return 0
        return 1 + max(self.maxDepth(root.left), self.maxDepth(root.right))`
  },
  {
    num: 100, title: "Same Tree", slug: "same-tree", lc: "Easy",
    topic: "trees",
    pattern: "Compare / mirror two trees",
    level: 1,
    order: 40,
    core: true,
    teaches: "Two trees are equal if the roots match and both pairs of subtrees are equal.",
    learn: ["dsa_trees", "dsa-tr-recur"],
    pre: [],
    hints: ["What are the cases when at least one of the two nodes is None?", "Both None: equal. One None: not equal. Otherwise compare values and recurse on left-left and right-right."],
    steps: ["If p and q are both None return True.", "If one is None or p.val != q.val return False.", "Return same(p.left, q.left) and same(p.right, q.right)."],
    time: "O(n)", space: "O(h)",
    trap: "Comparing traversal lists without None markers can call different trees equal.",
    code: `class Solution:
    def isSameTree(self, p, q):
        if not p and not q:
            return True
        if not p or not q or p.val != q.val:
            return False
        return self.isSameTree(p.left, q.left) and self.isSameTree(p.right, q.right)`
  },
  {
    num: 226, title: "Invert Binary Tree", slug: "invert-binary-tree", lc: "Easy",
    topic: "trees",
    pattern: "Compare / mirror two trees",
    level: 1,
    order: 50,
    core: true,
    teaches: "Swap the two children at every node; recursion handles the rest.",
    learn: ["dsa_trees", "dsa-tr-recur"],
    pre: [],
    hints: ["What should happen at a single node?", "Swap node.left and node.right, then invert each child (order does not matter)."],
    steps: ["If root is None return None.", "root.left, root.right = invert(root.right), invert(root.left).", "Return root."],
    time: "O(n)", space: "O(h)",
    trap: "Assigning root.left first and then using root.left on the next line uses the already-changed child; swap in one statement.",
    code: `class Solution:
    def invertTree(self, root):
        if not root:
            return None
        root.left, root.right = self.invertTree(root.right), self.invertTree(root.left)
        return root`
  },
  {
    num: 102, title: "Binary Tree Level Order Traversal", slug: "binary-tree-level-order-traversal", lc: "Medium",
    topic: "trees",
    pattern: "BFS level by level",
    level: 1,
    order: 60,
    core: true,
    teaches: "A queue plus 'process len(q) nodes now' splits BFS into levels.",
    learn: ["dsa_trees", "dsa-tr-bfs"],
    pre: [],
    hints: ["How do you know where one level ends in a queue?", "At the start of each round, the queue holds exactly one level: loop len(q) times."],
    steps: ["If root is None return [].", "q = deque([root]).", "While q: level = []; repeat len(q) times: pop, record value, push children. Append level."],
    time: "O(n)", space: "O(n)",
    trap: "Checking len(q) inside the loop (after pushing children) mixes levels.",
    code: `from collections import deque
class Solution:
    def levelOrder(self, root):
        if not root:
            return []
        res, q = [], deque([root])
        while q:
            level = []
            for _ in range(len(q)):
                node = q.popleft()
                level.append(node.val)
                if node.left:
                    q.append(node.left)
                if node.right:
                    q.append(node.right)
            res.append(level)
        return res`
  },
  {
    num: 700, title: "Search in a Binary Search Tree", slug: "search-in-a-binary-search-tree", lc: "Easy",
    topic: "trees",
    pattern: "BST ordering",
    level: 1,
    order: 70,
    core: true,
    teaches: "In a BST compare and go one way; you never search both sides.",
    learn: ["dsa_trees", "dsa-tr-bst"],
    pre: [],
    hints: ["If val is smaller than the node, which subtree can hold it?", "Loop: go left when val < node.val, right when bigger, stop when equal or None."],
    steps: ["node = root.", "While node and node.val != val: node = node.left if val < node.val else node.right.", "Return node."],
    time: "O(h)", space: "O(1)",
    trap: "Searching both subtrees works but throws away the BST advantage.",
    code: `class Solution:
    def searchBST(self, root, val):
        node = root
        while node and node.val != val:
            node = node.left if val < node.val else node.right
        return node`
  },
  {
    num: 145, title: "Binary Tree Postorder Traversal", slug: "binary-tree-postorder-traversal", lc: "Easy",
    topic: "trees",
    pattern: "DFS traversal orders",
    level: 2,
    order: 80,
    core: false,
    teaches: "Postorder (left, right, node) is the reverse of a node-right-left preorder.",
    learn: ["dsa_trees", "dsa-tr-dfs"],
    pre: [144],
    hints: ["Recursively it is one line moved. Can you do it with a stack?", "A preorder that pushes left before right produces node, right, left.", "Reverse that list and you get left, right, node."],
    steps: ["If root is None return [].", "stack = [root]; pop a node, append its value, push left then right.", "When the stack is empty, return the list reversed."],
    time: "O(n)", space: "O(h)",
    trap: "Trying to emit nodes directly in postorder with one stack needs a 'visited' flag; the reverse trick avoids it.",
    code: `class Solution:
    def postorderTraversal(self, root):
        if not root:
            return []
        res, stack = [], [root]
        while stack:
            node = stack.pop()
            res.append(node.val)
            if node.left:
                stack.append(node.left)
            if node.right:
                stack.append(node.right)
        return res[::-1]`
  },
  {
    num: 111, title: "Minimum Depth of Binary Tree", slug: "minimum-depth-of-binary-tree", lc: "Easy",
    topic: "trees",
    pattern: "Bottom-up: return info from children",
    level: 2,
    order: 90,
    core: false,
    teaches: "Minimum depth must stop at a leaf, so a missing child is not a path.",
    learn: ["dsa_trees", "dsa-tr-recur"],
    pre: [104],
    hints: ["Why does copying max depth with min give the wrong answer for a node with one child?", "If one child is None, the only real path goes through the other child.", "BFS also works: the first leaf you reach is the answer."],
    steps: ["If root is None return 0.", "If left is None return 1 + minDepth(right); if right is None return 1 + minDepth(left).", "Otherwise return 1 + min of both."],
    time: "O(n)", space: "O(h)",
    trap: "Tree [2,null,3,null,4] has min depth 3, not 1: a None child is not a leaf.",
    code: `class Solution:
    def minDepth(self, root):
        if not root:
            return 0
        if not root.left:
            return 1 + self.minDepth(root.right)
        if not root.right:
            return 1 + self.minDepth(root.left)
        return 1 + min(self.minDepth(root.left), self.minDepth(root.right))`
  },
  {
    num: 110, title: "Balanced Binary Tree", slug: "balanced-binary-tree", lc: "Easy",
    topic: "trees",
    pattern: "Bottom-up: return info from children",
    level: 2,
    order: 100,
    core: true,
    teaches: "Return a height, and use a sentinel (-1) to say 'already unbalanced' so each node is visited once.",
    learn: ["dsa_trees", "dsa-tr-recur"],
    pre: [104],
    hints: ["Checking height at every node separately costs O(n^2). Can one pass do both jobs?", "Let the helper return the height, or -1 if any subtree below is unbalanced.", "At a node: if either child returned -1 or the heights differ by more than 1, return -1."],
    steps: ["h(None) = 0.", "l = h(left), r = h(right).", "If l == -1 or r == -1 or abs(l - r) > 1 return -1.", "Else return 1 + max(l, r).", "Answer is h(root) != -1."],
    time: "O(n)", space: "O(h)",
    trap: "Only checking the root's two heights misses imbalance deeper in the tree.",
    code: `class Solution:
    def isBalanced(self, root):
        def h(node):
            if not node:
                return 0
            l, r = h(node.left), h(node.right)
            if l == -1 or r == -1 or abs(l - r) > 1:
                return -1
            return 1 + max(l, r)
        return h(root) != -1`
  },
  {
    num: 101, title: "Symmetric Tree", slug: "symmetric-tree", lc: "Easy",
    topic: "trees",
    pattern: "Compare / mirror two trees",
    level: 2,
    order: 110,
    core: true,
    teaches: "A tree is symmetric if its left subtree mirrors its right: compare outer with outer, inner with inner.",
    learn: ["dsa_trees", "dsa-tr-recur"],
    pre: [100],
    hints: ["Write a helper that takes two nodes. Which pairs must match for a mirror?", "mirror(a, b): values equal, mirror(a.left, b.right) and mirror(a.right, b.left)."],
    steps: ["Helper mirror(a, b): both None -> True; one None or values differ -> False.", "Return mirror(a.left, b.right) and mirror(a.right, b.left).", "Answer: mirror(root.left, root.right)."],
    time: "O(n)", space: "O(h)",
    trap: "Comparing left.left with right.left checks sameness, not mirroring.",
    code: `class Solution:
    def isSymmetric(self, root):
        def mirror(a, b):
            if not a and not b:
                return True
            if not a or not b or a.val != b.val:
                return False
            return mirror(a.left, b.right) and mirror(a.right, b.left)
        return mirror(root.left, root.right) if root else True`
  },
  {
    num: 617, title: "Merge Two Binary Trees", slug: "merge-two-binary-trees", lc: "Easy",
    topic: "trees",
    pattern: "Compare / mirror two trees",
    level: 2,
    order: 120,
    core: false,
    teaches: "Walk two trees in lockstep; when one side is missing, reuse the other subtree as is.",
    learn: ["dsa_trees", "dsa-tr-recur"],
    pre: [100],
    hints: ["What do you return when only one of the two nodes exists?", "If one is None return the other. Otherwise make a node with the summed value and merge children pairwise."],
    steps: ["If t1 is None return t2; if t2 is None return t1.", "node = TreeNode(t1.val + t2.val).", "node.left = merge(t1.left, t2.left); node.right = merge(t1.right, t2.right); return node."],
    time: "O(min(n, m))", space: "O(min(h1, h2))",
    trap: "Recursing into a None node and reading .val crashes; handle the one-sided case first.",
    code: `class Solution:
    def mergeTrees(self, root1, root2):
        if not root1:
            return root2
        if not root2:
            return root1
        node = TreeNode(root1.val + root2.val)
        node.left = self.mergeTrees(root1.left, root2.left)
        node.right = self.mergeTrees(root1.right, root2.right)
        return node`
  },
  {
    num: 572, title: "Subtree of Another Tree", slug: "subtree-of-another-tree", lc: "Easy",
    topic: "trees",
    pattern: "Compare / mirror two trees",
    level: 2,
    order: 130,
    core: true,
    teaches: "Combine two recursions: walk the big tree and run Same Tree at each node.",
    learn: ["dsa_trees", "dsa-tr-recur"],
    pre: [100],
    hints: ["You already know how to test two trees for equality. Where would you call it?", "At every node of root, check isSame(node, subRoot); otherwise look in the left or right subtree."],
    steps: ["If root is None return False.", "If same(root, subRoot) return True.", "Return isSubtree(root.left, subRoot) or isSubtree(root.right, subRoot)."],
    time: "O(n * m)", space: "O(h)",
    trap: "A matching value is not enough: the whole subtree, including its leaves' children, must match.",
    code: `class Solution:
    def isSubtree(self, root, subRoot):
        def same(a, b):
            if not a and not b:
                return True
            if not a or not b or a.val != b.val:
                return False
            return same(a.left, b.left) and same(a.right, b.right)
        if not root:
            return False
        return same(root, subRoot) or self.isSubtree(root.left, subRoot) or self.isSubtree(root.right, subRoot)`
  },
  {
    num: 112, title: "Path Sum", slug: "path-sum", lc: "Easy",
    topic: "trees",
    pattern: "Top-down: carry path state",
    level: 2,
    order: 140,
    core: true,
    teaches: "Pass the remaining sum down; check it at leaves only.",
    learn: ["dsa_trees", "dsa-tr-patterns"],
    pre: [104],
    hints: ["What should each child be told about the sum still needed?", "Subtract node.val and recurse. At a leaf, the remaining value must be exactly 0."],
    steps: ["If root is None return False.", "rest = targetSum - root.val.", "If root is a leaf return rest == 0.", "Return hasPathSum(left, rest) or hasPathSum(right, rest)."],
    time: "O(n)", space: "O(h)",
    trap: "Checking at None instead of at a leaf accepts paths that stop at a node with one child.",
    code: `class Solution:
    def hasPathSum(self, root, targetSum):
        if not root:
            return False
        rest = targetSum - root.val
        if not root.left and not root.right:
            return rest == 0
        return self.hasPathSum(root.left, rest) or self.hasPathSum(root.right, rest)`
  },
  {
    num: 257, title: "Binary Tree Paths", slug: "binary-tree-paths", lc: "Easy",
    topic: "trees",
    pattern: "Top-down: carry path state",
    level: 2,
    order: 150,
    core: false,
    teaches: "Carry the path built so far down the tree and save it at each leaf.",
    learn: ["dsa_trees", "dsa-tr-patterns"],
    pre: [112],
    hints: ["What do you need to know at a leaf to print its path?", "Pass the path string (or a list) as an argument; at a leaf append it to the answer."],
    steps: ["dfs(node, path): path += str(node.val).", "If leaf: add path to result.", "Else recurse into existing children with path + '->'."],
    time: "O(n * h)", space: "O(n * h)",
    trap: "Adding the arrow after the leaf value gives '1->2->'.",
    code: `class Solution:
    def binaryTreePaths(self, root):
        res = []
        def dfs(node, path):
            path += str(node.val)
            if not node.left and not node.right:
                res.append(path)
                return
            if node.left:
                dfs(node.left, path + "->")
            if node.right:
                dfs(node.right, path + "->")
        if root:
            dfs(root, "")
        return res`
  },
  {
    num: 107, title: "Binary Tree Level Order Traversal II", slug: "binary-tree-level-order-traversal-ii", lc: "Medium",
    topic: "trees",
    pattern: "BFS level by level",
    level: 2,
    order: 160,
    core: false,
    teaches: "Same level BFS; reverse the list of levels at the end.",
    learn: ["dsa_trees", "dsa-tr-bfs"],
    pre: [102],
    hints: ["You already have the levels top-down. What is the cheapest way to get bottom-up?", "Build levels as in 102, then reverse the outer list once."],
    steps: ["Run level-order BFS collecting each level.", "Return res[::-1]."],
    time: "O(n)", space: "O(n)",
    trap: "Inserting each level at index 0 of a Python list is O(levels) each time.",
    code: `from collections import deque
class Solution:
    def levelOrderBottom(self, root):
        if not root:
            return []
        res, q = [], deque([root])
        while q:
            level = []
            for _ in range(len(q)):
                node = q.popleft()
                level.append(node.val)
                if node.left:
                    q.append(node.left)
                if node.right:
                    q.append(node.right)
            res.append(level)
        return res[::-1]`
  },
  {
    num: 637, title: "Average of Levels in Binary Tree", slug: "average-of-levels-in-binary-tree", lc: "Easy",
    topic: "trees",
    pattern: "BFS level by level",
    level: 2,
    order: 170,
    core: false,
    teaches: "Level BFS where each level becomes one number (its average).",
    learn: ["dsa_trees", "dsa-tr-bfs"],
    pre: [102],
    hints: ["What do you need from each level to compute an average?", "The sum and the count, which is len(q) at the start of the level."],
    steps: ["q = deque([root]).", "For each level: n = len(q); total = sum of popped values while pushing children.", "Append total / n."],
    time: "O(n)", space: "O(w)",
    trap: "Dividing by len(q) after children were pushed uses the wrong count.",
    code: `from collections import deque
class Solution:
    def averageOfLevels(self, root):
        res, q = [], deque([root])
        while q:
            n, total = len(q), 0
            for _ in range(n):
                node = q.popleft()
                total += node.val
                if node.left:
                    q.append(node.left)
                if node.right:
                    q.append(node.right)
            res.append(total / n)
        return res`
  },
  {
    num: 515, title: "Find Largest Value in Each Tree Row", slug: "find-largest-value-in-each-tree-row", lc: "Medium",
    topic: "trees",
    pattern: "BFS level by level",
    level: 2,
    order: 180,
    core: false,
    teaches: "Level BFS reducing each level to its maximum.",
    learn: ["dsa_trees", "dsa-tr-bfs"],
    pre: [102],
    hints: ["Which aggregate per level do you need?", "Track the max while you pop the nodes of a level."],
    steps: ["If root is None return [].", "For each level, best = max of popped values; append best."],
    time: "O(n)", space: "O(w)",
    trap: "Starting best at 0 fails for negative values; start at -infinity or the first node.",
    code: `from collections import deque
class Solution:
    def largestValues(self, root):
        if not root:
            return []
        res, q = [], deque([root])
        while q:
            best = float('-inf')
            for _ in range(len(q)):
                node = q.popleft()
                best = max(best, node.val)
                if node.left:
                    q.append(node.left)
                if node.right:
                    q.append(node.right)
            res.append(best)
        return res`
  },
  {
    num: 1161, title: "Maximum Level Sum of a Binary Tree", slug: "maximum-level-sum-of-a-binary-tree", lc: "Medium",
    topic: "trees",
    pattern: "BFS level by level",
    level: 2,
    order: 190,
    core: false,
    teaches: "Level BFS with a running 'best level' tracker.",
    learn: ["dsa_trees", "dsa-tr-bfs"],
    pre: [102],
    hints: ["Compute the sum of every level. Which level do you report on ties?", "Only replace the best when the new sum is strictly greater, so the smallest level wins ties."],
    steps: ["level = 1, best_sum = -infinity, ans = 1.", "For each level: s = sum of its nodes; if s > best_sum: best_sum, ans = s, level.", "level += 1; return ans."],
    time: "O(n)", space: "O(w)",
    trap: "Using >= returns the last of tied levels instead of the first.",
    code: `from collections import deque
class Solution:
    def maxLevelSum(self, root):
        q = deque([root])
        level, ans, best = 1, 1, float('-inf')
        while q:
            s = 0
            for _ in range(len(q)):
                node = q.popleft()
                s += node.val
                if node.left:
                    q.append(node.left)
                if node.right:
                    q.append(node.right)
            if s > best:
                best, ans = s, level
            level += 1
        return ans`
  },
  {
    num: 938, title: "Range Sum of BST", slug: "range-sum-of-bst", lc: "Easy",
    topic: "trees",
    pattern: "BST ordering",
    level: 2,
    order: 200,
    core: false,
    teaches: "Use the BST order to skip whole subtrees that are outside the range.",
    learn: ["dsa_trees", "dsa-tr-bst"],
    pre: [700],
    hints: ["If node.val < low, can anything in its left subtree be in range?", "Skip the left side when node.val < low, skip the right side when node.val > high."],
    steps: ["If None return 0.", "If val < low return f(right); if val > high return f(left).", "Else return val + f(left) + f(right)."],
    time: "O(n)", space: "O(h)",
    trap: "Visiting everything is correct but slower; pruning is the point.",
    code: `class Solution:
    def rangeSumBST(self, root, low, high):
        if not root:
            return 0
        if root.val < low:
            return self.rangeSumBST(root.right, low, high)
        if root.val > high:
            return self.rangeSumBST(root.left, low, high)
        return root.val + self.rangeSumBST(root.left, low, high) + self.rangeSumBST(root.right, low, high)`
  },
  {
    num: 701, title: "Insert into a Binary Search Tree", slug: "insert-into-a-binary-search-tree", lc: "Medium",
    topic: "trees",
    pattern: "BST ordering",
    level: 2,
    order: 210,
    core: false,
    teaches: "Walk down as in search; the new value goes into the first empty spot.",
    learn: ["dsa_trees", "dsa-tr-bst"],
    pre: [700],
    hints: ["Where does the search for a missing value end?", "At a None child. Attach the new node there."],
    steps: ["If root is None return TreeNode(val).", "If val < root.val: root.left = insert(root.left, val); else root.right = insert(root.right, val).", "Return root."],
    time: "O(h)", space: "O(h)",
    trap: "Forgetting to return the root (or to assign the child) loses the new node.",
    code: `class Solution:
    def insertIntoBST(self, root, val):
        if not root:
            return TreeNode(val)
        if val < root.val:
            root.left = self.insertIntoBST(root.left, val)
        else:
            root.right = self.insertIntoBST(root.right, val)
        return root`
  },
  {
    num: 530, title: "Minimum Absolute Difference in BST", slug: "minimum-absolute-difference-in-bst", lc: "Easy",
    topic: "trees",
    pattern: "BST ordering",
    level: 2,
    order: 220,
    core: false,
    teaches: "Inorder of a BST is sorted, so the closest pair is always neighbours in inorder.",
    learn: ["dsa_trees", "dsa-tr-bst"],
    pre: [94],
    hints: ["In a sorted list where is the smallest difference?", "Between adjacent elements. Inorder visits a BST in sorted order.", "Keep the previous inorder value and compare with the current one."],
    steps: ["prev = None, best = infinity.", "Inorder DFS: at each node, if prev is not None best = min(best, val - prev); prev = val.", "Return best."],
    time: "O(n)", space: "O(h)",
    trap: "Comparing only parent and child misses pairs like the root and the leftmost node of its right subtree.",
    code: `class Solution:
    def getMinimumDifference(self, root):
        prev, best = None, float('inf')
        def dfs(node):
            nonlocal prev, best
            if not node:
                return
            dfs(node.left)
            if prev is not None:
                best = min(best, node.val - prev)
            prev = node.val
            dfs(node.right)
        dfs(root)
        return best`
  },
  {
    num: 235, title: "Lowest Common Ancestor of a Binary Search Tree", slug: "lowest-common-ancestor-of-a-binary-search-tree", lc: "Medium",
    topic: "trees",
    pattern: "Lowest common ancestor",
    level: 2,
    order: 230,
    core: true,
    teaches: "In a BST the LCA is the first node whose value lies between p and q.",
    learn: ["dsa_trees", "dsa-tr-patterns"],
    pre: [700],
    hints: ["If both p and q are smaller than the node, where is their LCA?", "Walk down: both smaller -> go left, both bigger -> go right, otherwise this node is the split point."],
    steps: ["node = root.", "While True: if p, q < node go left; elif p, q > node go right; else return node."],
    time: "O(h)", space: "O(1)",
    trap: "When one of p or q is the node itself, that node is the answer.",
    code: `class Solution:
    def lowestCommonAncestor(self, root, p, q):
        node = root
        while node:
            if p.val < node.val and q.val < node.val:
                node = node.left
            elif p.val > node.val and q.val > node.val:
                node = node.right
            else:
                return node`
  },
  {
    num: 108, title: "Convert Sorted Array to Binary Search Tree", slug: "convert-sorted-array-to-binary-search-tree", lc: "Easy",
    topic: "trees",
    pattern: "Build tree from traversals",
    level: 2,
    order: 240,
    core: true,
    teaches: "Pick the middle element as root so both halves have equal size; recurse on each half.",
    learn: ["dsa_trees", "dsa-tr-problems"],
    pre: [],
    hints: ["Which element should be the root so the tree stays balanced?", "The middle one. Then the left half builds the left subtree and the right half the right subtree."],
    steps: ["build(lo, hi): if lo > hi return None.", "mid = (lo + hi) // 2; node = TreeNode(nums[mid]).", "node.left = build(lo, mid - 1); node.right = build(mid + 1, hi)."],
    time: "O(n)", space: "O(log n)",
    trap: "Slicing nums[:mid] in each call copies arrays and makes it O(n log n); pass indices.",
    code: `class Solution:
    def sortedArrayToBST(self, nums):
        def build(lo, hi):
            if lo > hi:
                return None
            mid = (lo + hi) // 2
            node = TreeNode(nums[mid])
            node.left = build(lo, mid - 1)
            node.right = build(mid + 1, hi)
            return node
        return build(0, len(nums) - 1)`
  },
  {
    num: 606, title: "Construct String from Binary Tree", slug: "construct-string-from-binary-tree", lc: "Medium",
    topic: "trees",
    pattern: "Serialize / encode a tree",
    level: 2,
    order: 250,
    core: false,
    teaches: "Preorder into a string; only an empty left child needs '()' to keep the shape unambiguous.",
    learn: ["dsa_trees", "dsa-tr-problems"],
    pre: [144],
    hints: ["Write the preorder string with parentheses around every child. Which empty pairs can you drop?", "An empty right child can always be dropped. An empty left child must stay as '()' if there is a right child."],
    steps: ["f(None) = ''.", "s = str(val).", "If left or right: s += '(' + f(left) + ')'.", "If right: s += '(' + f(right) + ')'."],
    time: "O(n)", space: "O(n)",
    trap: "Dropping '()' for a missing left child when a right child exists makes the right child look like a left one.",
    code: `class Solution:
    def tree2str(self, root):
        if not root:
            return ""
        s = str(root.val)
        if root.left or root.right:
            s += "(" + self.tree2str(root.left) + ")"
        if root.right:
            s += "(" + self.tree2str(root.right) + ")"
        return s`
  },
  {
    num: 897, title: "Increasing Order Search Tree", slug: "increasing-order-search-tree", lc: "Easy",
    topic: "trees",
    pattern: "Rewire / modify tree in place",
    level: 2,
    order: 260,
    core: false,
    teaches: "Inorder walk that appends each node to a tail pointer, clearing its left child.",
    learn: ["dsa_trees", "dsa-tr-recur"],
    pre: [94],
    hints: ["Which traversal visits a BST in increasing order?", "Inorder. Keep a dummy head and a tail; at each node set node.left = None, tail.right = node, tail = node."],
    steps: ["dummy = TreeNode(); tail = dummy.", "Inorder DFS: at node set node.left = None; tail.right = node; tail = node.", "Return dummy.right."],
    time: "O(n)", space: "O(h)",
    trap: "Read node.right before you overwrite anything, or you lose the rest of the tree.",
    code: `class Solution:
    def increasingBST(self, root):
        dummy = TreeNode()
        tail = dummy
        def dfs(node):
            nonlocal tail
            if not node:
                return
            dfs(node.left)
            node.left = None
            tail.right = node
            tail = node
            dfs(node.right)
        dfs(root)
        return dummy.right`
  },
  {
    num: 543, title: "Diameter of Binary Tree", slug: "diameter-of-binary-tree", lc: "Easy",
    topic: "trees",
    pattern: "Bottom-up: return info from children",
    level: 3,
    order: 270,
    core: true,
    teaches: "Return one thing to the parent (one-sided depth) but record another (two-sided path) in a global best.",
    learn: ["dsa_trees", "dsa-tr-recur"],
    pre: [104],
    hints: ["The longest path may not pass through the root. Where can it bend?", "At every node the longest path bending there is leftDepth + rightDepth edges.", "Return 1 + max(leftDepth, rightDepth) to the parent, and keep the best sum in an outer variable."],
    steps: ["best = 0.", "depth(None) = 0.", "At a node: l = depth(left), r = depth(right); best = max(best, l + r); return 1 + max(l, r).", "Call depth(root), return best."],
    time: "O(n)", space: "O(h)",
    trap: "Returning l + r upward is wrong: a parent can only extend one side.",
    code: `class Solution:
    def diameterOfBinaryTree(self, root):
        best = 0
        def depth(node):
            nonlocal best
            if not node:
                return 0
            l, r = depth(node.left), depth(node.right)
            best = max(best, l + r)
            return 1 + max(l, r)
        depth(root)
        return best`
  },
  {
    num: 951, title: "Flip Equivalent Binary Trees", slug: "flip-equivalent-binary-trees", lc: "Medium",
    topic: "trees",
    pattern: "Compare / mirror two trees",
    level: 3,
    order: 280,
    core: false,
    teaches: "Allow two ways to match children: straight or swapped.",
    learn: ["dsa_trees", "dsa-tr-recur"],
    pre: [100, 101],
    hints: ["At a node you may flip its children or not. What are the two possibilities to check?", "Equivalent if values match and (left~left and right~right) or (left~right and right~left)."],
    steps: ["Both None -> True; one None or values differ -> False.", "Return (f(a.left, b.left) and f(a.right, b.right)) or (f(a.left, b.right) and f(a.right, b.left))."],
    time: "O(n)", space: "O(h)",
    trap: "With unique values this is O(n) because at most one of the two options can pass the value check.",
    code: `class Solution:
    def flipEquiv(self, root1, root2):
        if not root1 and not root2:
            return True
        if not root1 or not root2 or root1.val != root2.val:
            return False
        return ((self.flipEquiv(root1.left, root2.left) and self.flipEquiv(root1.right, root2.right)) or
                (self.flipEquiv(root1.left, root2.right) and self.flipEquiv(root1.right, root2.left)))`
  },
  {
    num: 113, title: "Path Sum II", slug: "path-sum-ii", lc: "Medium",
    topic: "trees",
    pattern: "Top-down: carry path state",
    level: 3,
    order: 290,
    core: true,
    teaches: "Backtracking on a tree: append, recurse, pop; copy the path when it is a hit.",
    learn: ["dsa_trees", "dsa-tr-patterns"],
    pre: [112, 257],
    hints: ["This is Path Sum, but you must list every path. What do you carry down?", "Keep one shared list path. Append node.val before recursing and pop it after.", "At a leaf with remaining sum 0, save path[:] (a copy)."],
    steps: ["dfs(node, rest): if None return.", "path.append(node.val); rest -= node.val.", "If leaf and rest == 0: res.append(path[:]).", "Recurse left and right, then path.pop()."],
    time: "O(n^2)", space: "O(h)",
    trap: "Appending path itself (not a copy) leaves every saved answer empty after backtracking.",
    code: `class Solution:
    def pathSum(self, root, targetSum):
        res, path = [], []
        def dfs(node, rest):
            if not node:
                return
            path.append(node.val)
            rest -= node.val
            if not node.left and not node.right and rest == 0:
                res.append(path[:])
            dfs(node.left, rest)
            dfs(node.right, rest)
            path.pop()
        dfs(root, targetSum)
        return res`
  },
  {
    num: 129, title: "Sum Root to Leaf Numbers", slug: "sum-root-to-leaf-numbers", lc: "Medium",
    topic: "trees",
    pattern: "Top-down: carry path state",
    level: 3,
    order: 300,
    core: false,
    teaches: "Carry a running number down: cur = cur * 10 + digit.",
    learn: ["dsa_trees", "dsa-tr-patterns"],
    pre: [112],
    hints: ["How does the number change when you step down to a child?", "Pass cur * 10 + node.val to the children; at a leaf, that value is one finished number to add."],
    steps: ["dfs(node, cur): if None return 0.", "cur = cur * 10 + node.val.", "If leaf return cur.", "Return dfs(left, cur) + dfs(right, cur)."],
    time: "O(n)", space: "O(h)",
    trap: "Adding at None nodes double-counts leaves (each leaf has two None children).",
    code: `class Solution:
    def sumNumbers(self, root):
        def dfs(node, cur):
            if not node:
                return 0
            cur = cur * 10 + node.val
            if not node.left and not node.right:
                return cur
            return dfs(node.left, cur) + dfs(node.right, cur)
        return dfs(root, 0)`
  },
  {
    num: 1448, title: "Count Good Nodes in Binary Tree", slug: "count-good-nodes-in-binary-tree", lc: "Medium",
    topic: "trees",
    pattern: "Top-down: carry path state",
    level: 3,
    order: 310,
    core: true,
    teaches: "Pass the maximum seen on the path so far; a node is good if it is at least that max.",
    learn: ["dsa_trees", "dsa-tr-patterns"],
    pre: [112],
    hints: ["What single fact about the path above decides whether a node is good?", "The largest value from root to here. Pass it down and update it with node.val."],
    steps: ["dfs(node, mx): if None return 0.", "good = 1 if node.val >= mx else 0.", "mx = max(mx, node.val).", "Return good + dfs(left, mx) + dfs(right, mx)."],
    time: "O(n)", space: "O(h)",
    trap: "Using > instead of >= misses nodes equal to the path max (the root itself is always good).",
    code: `class Solution:
    def goodNodes(self, root):
        def dfs(node, mx):
            if not node:
                return 0
            good = 1 if node.val >= mx else 0
            mx = max(mx, node.val)
            return good + dfs(node.left, mx) + dfs(node.right, mx)
        return dfs(root, root.val)`
  },
  {
    num: 1026, title: "Maximum Difference Between Node and Ancestor", slug: "maximum-difference-between-node-and-ancestor", lc: "Medium",
    topic: "trees",
    pattern: "Top-down: carry path state",
    level: 3,
    order: 320,
    core: false,
    teaches: "Carry both the min and max of the path; the best difference at a leaf is max - min.",
    learn: ["dsa_trees", "dsa-tr-patterns"],
    pre: [1448],
    hints: ["Comparing every ancestor-descendant pair is O(n^2). What summary of the ancestors do you need?", "The biggest |a - b| with a an ancestor comes from the smallest or largest ancestor value.", "Pass lo and hi down; at None return hi - lo."],
    steps: ["dfs(node, lo, hi): if None return hi - lo.", "lo = min(lo, node.val), hi = max(hi, node.val).", "Return max(dfs(left, lo, hi), dfs(right, lo, hi))."],
    time: "O(n)", space: "O(h)",
    trap: "Only tracking the max misses the case where the descendant is much larger than the smallest ancestor.",
    code: `class Solution:
    def maxAncestorDiff(self, root):
        def dfs(node, lo, hi):
            if not node:
                return hi - lo
            lo, hi = min(lo, node.val), max(hi, node.val)
            return max(dfs(node.left, lo, hi), dfs(node.right, lo, hi))
        return dfs(root, root.val, root.val)`
  },
  {
    num: 199, title: "Binary Tree Right Side View", slug: "binary-tree-right-side-view", lc: "Medium",
    topic: "trees",
    pattern: "BFS level by level",
    level: 3,
    order: 330,
    core: true,
    teaches: "The right side view is the last node of each BFS level.",
    learn: ["dsa_trees", "dsa-tr-bfs"],
    pre: [102],
    hints: ["Which node of a level is visible from the right?", "The last one popped in each level. A left child can be visible if the right side is shorter."],
    steps: ["Run level BFS.", "For each level, after the inner loop, append the value of the last node popped."],
    time: "O(n)", space: "O(w)",
    trap: "Following only right children misses levels where the deepest node is on the left.",
    code: `from collections import deque
class Solution:
    def rightSideView(self, root):
        if not root:
            return []
        res, q = [], deque([root])
        while q:
            for _ in range(len(q)):
                node = q.popleft()
                if node.left:
                    q.append(node.left)
                if node.right:
                    q.append(node.right)
            res.append(node.val)
        return res`
  },
  {
    num: 103, title: "Binary Tree Zigzag Level Order Traversal", slug: "binary-tree-zigzag-level-order-traversal", lc: "Medium",
    topic: "trees",
    pattern: "BFS level by level",
    level: 3,
    order: 340,
    core: false,
    teaches: "Level BFS as usual; flip the order of every second level when you record it.",
    learn: ["dsa_trees", "dsa-tr-bfs"],
    pre: [102],
    hints: ["Do you need to change how you traverse, or only how you record?", "Traverse normally; reverse the level list when the level index is odd."],
    steps: ["Level BFS with a flag left_to_right = True.", "After building a level, reverse it if the flag is False.", "Toggle the flag after each level."],
    time: "O(n)", space: "O(w)",
    trap: "Pushing children in reversed order on alternate levels gets tangled quickly; reversing the output is simpler.",
    code: `from collections import deque
class Solution:
    def zigzagLevelOrder(self, root):
        if not root:
            return []
        res, q, ltr = [], deque([root]), True
        while q:
            level = []
            for _ in range(len(q)):
                node = q.popleft()
                level.append(node.val)
                if node.left:
                    q.append(node.left)
                if node.right:
                    q.append(node.right)
            res.append(level if ltr else level[::-1])
            ltr = not ltr
        return res`
  },
  {
    num: 993, title: "Cousins in Binary Tree", slug: "cousins-in-binary-tree", lc: "Easy",
    topic: "trees",
    pattern: "BFS level by level",
    level: 3,
    order: 350,
    core: false,
    teaches: "Store (parent, depth) for the two target values, then compare.",
    learn: ["dsa_trees", "dsa-tr-bfs"],
    pre: [102],
    hints: ["Cousins means same depth but different parents. What should you record for x and y?", "During BFS or DFS, remember the parent and the depth when you meet x and y."],
    steps: ["BFS with (node, parent, depth).", "When node.val is x or y, store info[val] = (parent, depth).", "Return depths equal and parents different."],
    time: "O(n)", space: "O(n)",
    trap: "Siblings have the same depth but are not cousins.",
    code: `from collections import deque
class Solution:
    def isCousins(self, root, x, y):
        info = {}
        q = deque([(root, None, 0)])
        while q:
            node, parent, d = q.popleft()
            if node.val in (x, y):
                info[node.val] = (parent, d)
            for ch in (node.left, node.right):
                if ch:
                    q.append((ch, node, d + 1))
        (px, dx), (py, dy) = info[x], info[y]
        return dx == dy and px is not py`
  },
  {
    num: 98, title: "Validate Binary Search Tree", slug: "validate-binary-search-tree", lc: "Medium",
    topic: "trees",
    pattern: "BST ordering",
    level: 3,
    order: 360,
    core: true,
    teaches: "Pass an allowed (low, high) range down; every node must sit strictly inside it.",
    learn: ["dsa_trees", "dsa-tr-bst"],
    pre: [700],
    hints: ["Checking each node against its children only is not enough. Why?", "A node deep in the left subtree must also be smaller than the root. Carry bounds.", "Going left, the high bound becomes node.val; going right, the low bound becomes node.val."],
    steps: ["ok(node, lo, hi): None -> True.", "If not lo < node.val < hi return False.", "Return ok(left, lo, node.val) and ok(right, node.val, hi).", "Start with (-inf, inf)."],
    time: "O(n)", space: "O(h)",
    trap: "[5,4,6,null,null,3,7] passes the parent-child check but 3 is in the right subtree of 5.",
    code: `class Solution:
    def isValidBST(self, root):
        def ok(node, lo, hi):
            if not node:
                return True
            if not (lo < node.val < hi):
                return False
            return ok(node.left, lo, node.val) and ok(node.right, node.val, hi)
        return ok(root, float('-inf'), float('inf'))`
  },
  {
    num: 230, title: "Kth Smallest Element in a BST", slug: "kth-smallest-element-in-a-bst", lc: "Medium",
    topic: "trees",
    pattern: "BST ordering",
    level: 3,
    order: 370,
    core: true,
    teaches: "Inorder walk with an explicit stack, stopping at the kth pop.",
    learn: ["dsa_trees", "dsa-tr-bst"],
    pre: [94],
    hints: ["What order does inorder visit BST values in?", "Sorted. The kth node visited is the answer.", "Use the iterative stack version so you can stop early."],
    steps: ["stack = [], node = root.", "Loop: push all left children; pop; k -= 1; if k == 0 return its value; move to its right child."],
    time: "O(h + k)", space: "O(h)",
    trap: "Collecting the whole inorder list works but costs O(n) even for k = 1.",
    code: `class Solution:
    def kthSmallest(self, root, k):
        stack, node = [], root
        while True:
            while node:
                stack.append(node)
                node = node.left
            node = stack.pop()
            k -= 1
            if k == 0:
                return node.val
            node = node.right`
  },
  {
    num: 450, title: "Delete Node in a BST", slug: "delete-node-in-a-bst", lc: "Medium",
    topic: "trees",
    pattern: "BST ordering",
    level: 3,
    order: 380,
    core: false,
    teaches: "Deleting a node with two children: replace its value with the inorder successor, then delete that successor.",
    learn: ["dsa_trees", "dsa-tr-bst"],
    pre: [701],
    hints: ["Find the node as in search. How many cases are there once you find it?", "No left child: return right. No right child: return left.", "Two children: copy the smallest value of the right subtree into the node, then delete that value from the right subtree."],
    steps: ["Recurse left/right by comparing key.", "On match: if not left return right; if not right return left.", "Else succ = leftmost of right; node.val = succ.val; node.right = delete(node.right, succ.val).", "Return node."],
    time: "O(h)", space: "O(h)",
    trap: "Forgetting to reassign root.left / root.right with the recursive result leaves the old node in place.",
    code: `class Solution:
    def deleteNode(self, root, key):
        if not root:
            return None
        if key < root.val:
            root.left = self.deleteNode(root.left, key)
        elif key > root.val:
            root.right = self.deleteNode(root.right, key)
        else:
            if not root.left:
                return root.right
            if not root.right:
                return root.left
            succ = root.right
            while succ.left:
                succ = succ.left
            root.val = succ.val
            root.right = self.deleteNode(root.right, succ.val)
        return root`
  },
  {
    num: 173, title: "Binary Search Tree Iterator", slug: "binary-search-tree-iterator", lc: "Medium",
    topic: "trees",
    pattern: "BST ordering",
    level: 3,
    order: 390,
    core: false,
    teaches: "The iterative inorder stack, split into pause-and-resume steps.",
    learn: ["dsa_trees", "dsa-tr-bst"],
    pre: [230],
    hints: ["Which part of the iterative inorder loop produces one value?", "Keep a stack of the left spine. next() pops one node, then pushes the left spine of its right child."],
    steps: ["__init__: push root and all its left descendants.", "next(): node = pop; push left spine of node.right; return node.val.", "hasNext(): stack is not empty."],
    time: "O(1) amortized per call", space: "O(h)",
    trap: "Flattening the whole tree into a list in __init__ uses O(n) memory instead of O(h).",
    code: `class BSTIterator:
    def __init__(self, root):
        self.stack = []
        self._push_left(root)

    def _push_left(self, node):
        while node:
            self.stack.append(node)
            node = node.left

    def next(self):
        node = self.stack.pop()
        self._push_left(node.right)
        return node.val

    def hasNext(self):
        return bool(self.stack)`
  },
  {
    num: 236, title: "Lowest Common Ancestor of a Binary Tree", slug: "lowest-common-ancestor-of-a-binary-tree", lc: "Medium",
    topic: "trees",
    pattern: "Lowest common ancestor",
    level: 3,
    order: 400,
    core: true,
    teaches: "Each call returns the p or q it found (or the LCA); the node where both sides return something is the LCA.",
    learn: ["dsa_trees", "dsa-tr-patterns"],
    pre: [235],
    hints: ["Without BST order you cannot choose a side. What can each subtree tell you?", "Return node if it is p or q. Otherwise ask both children.", "If both children return non-None, this node is the LCA; else pass up the non-None one."],
    steps: ["If node is None or node is p or q: return node.", "l = lca(left), r = lca(right).", "If l and r return node; return l or r."],
    time: "O(n)", space: "O(h)",
    trap: "Stopping at p is correct even if q is below p: then p is the LCA.",
    code: `class Solution:
    def lowestCommonAncestor(self, root, p, q):
        if not root or root is p or root is q:
            return root
        l = self.lowestCommonAncestor(root.left, p, q)
        r = self.lowestCommonAncestor(root.right, p, q)
        if l and r:
            return root
        return l or r`
  },
  {
    num: 654, title: "Maximum Binary Tree", slug: "maximum-binary-tree", lc: "Medium",
    topic: "trees",
    pattern: "Build tree from traversals",
    level: 3,
    order: 410,
    core: false,
    teaches: "The maximum splits the array into left and right subtrees; a decreasing stack builds it in O(n).",
    learn: ["dsa_trees", "dsa-tr-problems"],
    pre: [108],
    hints: ["The recursive definition is direct: max is the root, left part left, right part right. That is O(n^2) worst case.", "For O(n), keep a stack of nodes with decreasing values. A new bigger value adopts the popped nodes as its left child.", "After popping, if the stack is not empty, the new node becomes the right child of the stack top."],
    steps: ["stack = [].", "For each x: node = TreeNode(x); while stack and stack[-1].val < x: node.left = stack.pop().", "If stack: stack[-1].right = node. Push node.", "Return stack[0]."],
    time: "O(n)", space: "O(n)",
    trap: "Assigning node.left only once (not on every pop) loses the correct last-popped child.",
    code: `class Solution:
    def constructMaximumBinaryTree(self, nums):
        stack = []
        for x in nums:
            node = TreeNode(x)
            while stack and stack[-1].val < x:
                node.left = stack.pop()
            if stack:
                stack[-1].right = node
            stack.append(node)
        return stack[0]`
  },
  {
    num: 105, title: "Construct Binary Tree from Preorder and Inorder Traversal", slug: "construct-binary-tree-from-preorder-and-inorder-traversal", lc: "Medium",
    topic: "trees",
    pattern: "Build tree from traversals",
    level: 3,
    order: 420,
    core: true,
    teaches: "Preorder gives the root; its position in inorder splits left and right subtrees.",
    learn: ["dsa_trees", "dsa-tr-problems"],
    pre: [108, 94, 144],
    hints: ["What is preorder[0]? Where is it in inorder, and what is on each side of it?", "Store each value's inorder index in a dict so the split is O(1).", "Consume preorder left to right with a pointer: build the left subtree before the right."],
    steps: ["idx = {value: index in inorder}; i = 0 (preorder pointer).", "build(lo, hi): if lo > hi return None; root = preorder[i]; i += 1.", "m = idx[root]; root.left = build(lo, m - 1); root.right = build(m + 1, hi)."],
    time: "O(n)", space: "O(n)",
    trap: "Calling inorder.index() each time makes it O(n^2); building the right subtree first breaks the preorder pointer.",
    code: `class Solution:
    def buildTree(self, preorder, inorder):
        idx = {v: i for i, v in enumerate(inorder)}
        it = iter(preorder)
        def build(lo, hi):
            if lo > hi:
                return None
            node = TreeNode(next(it))
            m = idx[node.val]
            node.left = build(lo, m - 1)
            node.right = build(m + 1, hi)
            return node
        return build(0, len(inorder) - 1)`
  },
  {
    num: 106, title: "Construct Binary Tree from Inorder and Postorder Traversal", slug: "construct-binary-tree-from-inorder-and-postorder-traversal", lc: "Medium",
    topic: "trees",
    pattern: "Build tree from traversals",
    level: 3,
    order: 430,
    core: false,
    teaches: "Postorder's last value is the root; read postorder backwards and build right before left.",
    learn: ["dsa_trees", "dsa-tr-problems"],
    pre: [105],
    hints: ["Which end of postorder holds the root?", "The last element. Walk postorder from the end.", "Walking backwards gives root, right, left order, so build the right subtree first."],
    steps: ["idx = inorder index map; pointer at the end of postorder.", "build(lo, hi): root = postorder[ptr]; ptr -= 1.", "m = idx[root]; root.right = build(m + 1, hi); root.left = build(lo, m - 1)."],
    time: "O(n)", space: "O(n)",
    trap: "Building left first here uses right-subtree values for the left side.",
    code: `class Solution:
    def buildTree(self, inorder, postorder):
        idx = {v: i for i, v in enumerate(inorder)}
        it = iter(reversed(postorder))
        def build(lo, hi):
            if lo > hi:
                return None
            node = TreeNode(next(it))
            m = idx[node.val]
            node.right = build(m + 1, hi)
            node.left = build(lo, m - 1)
            return node
        return build(0, len(inorder) - 1)`
  },
  {
    num: 1008, title: "Construct Binary Search Tree from Preorder Traversal", slug: "construct-binary-search-tree-from-preorder-traversal", lc: "Medium",
    topic: "trees",
    pattern: "Build tree from traversals",
    level: 3,
    order: 440,
    core: false,
    teaches: "Build a BST from preorder with an upper bound: consume values while they fit under the bound.",
    learn: ["dsa_trees", "dsa-tr-problems"],
    pre: [105, 98],
    hints: ["Inorder of a BST is just sorted(preorder), so 105 works in O(n log n). Can you skip the sort?", "Use bounds like Validate BST: a node can take the next preorder value only if it is below the current upper bound.", "build(bound): if the next value > bound, return None; else make it the node, build left with bound=val, right with the old bound."],
    steps: ["i = 0.", "build(bound): if i == n or preorder[i] > bound return None.", "node = TreeNode(preorder[i]); i += 1; node.left = build(node.val); node.right = build(bound).", "Return build(inf)."],
    time: "O(n)", space: "O(h)",
    trap: "Inserting values one by one is O(n^2) for a sorted input.",
    code: `class Solution:
    def bstFromPreorder(self, preorder):
        i = 0
        def build(bound):
            nonlocal i
            if i == len(preorder) or preorder[i] > bound:
                return None
            node = TreeNode(preorder[i])
            i += 1
            node.left = build(node.val)
            node.right = build(bound)
            return node
        return build(float('inf'))`
  },
  {
    num: 652, title: "Find Duplicate Subtrees", slug: "find-duplicate-subtrees", lc: "Medium",
    topic: "trees",
    pattern: "Serialize / encode a tree",
    level: 3,
    order: 450,
    core: false,
    teaches: "Serialize every subtree bottom-up and count the strings in a dict; a count of 2 means a duplicate.",
    learn: ["dsa_trees", "dsa-tr-problems"],
    pre: [606],
    hints: ["How can you compare subtrees quickly? Turn each one into a key.", "Postorder: key(node) = key(left) + ',' + key(right) + ',' + val, with '#' for None.", "Count keys; when a key's count becomes exactly 2, record that node."],
    steps: ["count = defaultdict(int); res = [].", "key(None) = '#'.", "k = key(left) + ',' + key(right) + ',' + str(val); count[k] += 1; if count[k] == 2 res.append(node).", "Return res."],
    time: "O(n^2) with strings (O(n) with id-mapping)", space: "O(n^2)",
    trap: "Without the '#' markers, different shapes can produce the same string.",
    code: `from collections import defaultdict
class Solution:
    def findDuplicateSubtrees(self, root):
        count, res = defaultdict(int), []
        def key(node):
            if not node:
                return "#"
            k = key(node.left) + "," + key(node.right) + "," + str(node.val)
            count[k] += 1
            if count[k] == 2:
                res.append(node)
            return k
        key(root)
        return res`
  },
  {
    num: 114, title: "Flatten Binary Tree to Linked List", slug: "flatten-binary-tree-to-linked-list", lc: "Medium",
    topic: "trees",
    pattern: "Rewire / modify tree in place",
    level: 3,
    order: 460,
    core: true,
    teaches: "For each node, splice its left subtree between it and its right subtree (via the left subtree's rightmost node).",
    learn: ["dsa_trees", "dsa-tr-recur"],
    pre: [144, 897],
    hints: ["The result is preorder. Where must the original right subtree end up?", "After the whole left subtree, i.e. hanging off the rightmost node of the left subtree.", "Walk cur down the right pointers; whenever cur has a left child, splice it in. O(1) extra space."],
    steps: ["cur = root.", "While cur: if cur.left: pre = rightmost node of cur.left; pre.right = cur.right; cur.right = cur.left; cur.left = None.", "cur = cur.right."],
    time: "O(n)", space: "O(1)",
    trap: "Leaving cur.left set produces a tree, not a list: every left must be None.",
    code: `class Solution:
    def flatten(self, root):
        cur = root
        while cur:
            if cur.left:
                pre = cur.left
                while pre.right:
                    pre = pre.right
                pre.right = cur.right
                cur.right = cur.left
                cur.left = None
            cur = cur.right`
  },
  {
    num: 1110, title: "Delete Nodes And Return Forest", slug: "delete-nodes-and-return-forest", lc: "Medium",
    topic: "trees",
    pattern: "Rewire / modify tree in place",
    level: 3,
    order: 470,
    core: false,
    teaches: "Postorder: fix children first, then decide whether this node is deleted and its children become roots.",
    learn: ["dsa_trees", "dsa-tr-recur"],
    pre: [450],
    hints: ["When a node is deleted, what happens to its children?", "They become new roots (if they exist). Process in postorder so children are already cleaned.", "Pass is_root down: a kept node is a new root if its parent was deleted."],
    steps: ["to_del = set(to_delete); res = [].", "dfs(node, is_root): if None return None. deleted = node.val in to_del.", "If is_root and not deleted: res.append(node).", "node.left = dfs(left, deleted); node.right = dfs(right, deleted).", "Return None if deleted else node."],
    time: "O(n)", space: "O(n)",
    trap: "Forgetting to cut the parent's pointer to a deleted child leaves deleted nodes attached.",
    code: `class Solution:
    def delNodes(self, root, to_delete):
        to_del, res = set(to_delete), []
        def dfs(node, is_root):
            if not node:
                return None
            deleted = node.val in to_del
            if is_root and not deleted:
                res.append(node)
            node.left = dfs(node.left, deleted)
            node.right = dfs(node.right, deleted)
            return None if deleted else node
        dfs(root, True)
        return res`
  },
  {
    num: 116, title: "Populating Next Right Pointers in Each Node", slug: "populating-next-right-pointers-in-each-node", lc: "Medium",
    topic: "trees",
    pattern: "Rewire / modify tree in place",
    level: 3,
    order: 480,
    core: false,
    teaches: "Use the next pointers of the level above to wire the level below, with O(1) extra space.",
    learn: ["dsa_trees", "dsa-tr-recur"],
    pre: [102],
    hints: ["A BFS queue works. Can the already-built next pointers replace the queue?", "In a perfect tree: node.left.next = node.right, and node.right.next = node.next.left when node.next exists.", "Walk each level using next, starting from its leftmost node."],
    steps: ["leftmost = root.", "While leftmost and leftmost.left: walk node = leftmost along next, setting the two links.", "leftmost = leftmost.left.", "Return root."],
    time: "O(n)", space: "O(1)",
    trap: "Forgetting the cross-parent link (node.right.next = node.next.left) leaves gaps between cousins.",
    code: `class Solution:
    def connect(self, root):
        leftmost = root
        while leftmost and leftmost.left:
            node = leftmost
            while node:
                node.left.next = node.right
                if node.next:
                    node.right.next = node.next.left
                node = node.next
            leftmost = leftmost.left
        return root`
  },
  {
    num: 687, title: "Longest Univalue Path", slug: "longest-univalue-path", lc: "Medium",
    topic: "trees",
    pattern: "Bottom-up: return info from children",
    level: 4,
    order: 490,
    core: false,
    teaches: "Diameter pattern with a filter: an arm only extends through children with the same value.",
    learn: ["dsa_trees", "dsa-tr-recur"],
    pre: [543],
    hints: ["This is the diameter idea. What changes about which child arms you may use?", "Let dfs return the longest same-value arm going down from this node.", "An arm from a child counts only if child.val == node.val; otherwise it contributes 0."],
    steps: ["best = 0.", "dfs(node): if None return 0. a = dfs(left), b = dfs(right).", "l = a + 1 if left and left.val == node.val else 0; same for r.", "best = max(best, l + r); return max(l, r)."],
    time: "O(n)", space: "O(h)",
    trap: "You must still recurse into children whose value differs, or you miss paths lower down.",
    code: `class Solution:
    def longestUnivaluePath(self, root):
        best = 0
        def dfs(node):
            nonlocal best
            if not node:
                return 0
            a, b = dfs(node.left), dfs(node.right)
            l = a + 1 if node.left and node.left.val == node.val else 0
            r = b + 1 if node.right and node.right.val == node.val else 0
            best = max(best, l + r)
            return max(l, r)
        dfs(root)
        return best`
  },
  {
    num: 222, title: "Count Complete Tree Nodes", slug: "count-complete-tree-nodes", lc: "Medium",
    topic: "trees",
    pattern: "Bottom-up: return info from children",
    level: 4,
    order: 500,
    core: false,
    teaches: "In a complete tree, equal left-edge and right-edge heights mean a perfect tree with 2^h - 1 nodes.",
    learn: ["dsa_trees", "dsa-tr-recur"],
    pre: [104],
    hints: ["Counting every node is O(n). What does 'complete' let you skip?", "Walk only left pointers and only right pointers from a node. If both heights match, the subtree is perfect.", "Otherwise return 1 + count(left) + count(right); one of the two is always perfect."],
    steps: ["lh = steps going left from root, rh = steps going right.", "If lh == rh return 2**lh - 1.", "Else return 1 + countNodes(left) + countNodes(right)."],
    time: "O(log^2 n)", space: "O(log n)",
    trap: "Plain DFS counting passes but misses the point: the follow-up wants better than O(n).",
    code: `class Solution:
    def countNodes(self, root):
        if not root:
            return 0
        lh, node = 0, root
        while node:
            lh += 1
            node = node.left
        rh, node = 0, root
        while node:
            rh += 1
            node = node.right
        if lh == rh:
            return (1 << lh) - 1
        return 1 + self.countNodes(root.left) + self.countNodes(root.right)`
  },
  {
    num: 437, title: "Path Sum III", slug: "path-sum-iii", lc: "Medium",
    topic: "trees",
    pattern: "Top-down: carry path state",
    level: 4,
    order: 510,
    core: true,
    teaches: "Prefix sums on a root-to-node path: count earlier prefixes equal to current - target, then backtrack.",
    learn: ["dsa_trees", "dsa-tr-patterns"],
    pre: [113],
    hints: ["Paths can start anywhere above. On a single array this is 'subarray sum equals k'.", "Keep a counter of prefix sums on the current root-to-node path. At a node with prefix cur, add count[cur - target].", "Increment count[cur] before recursing and decrement after, so sibling branches do not see it."],
    steps: ["count = {0: 1}.", "dfs(node, cur): cur += node.val; ans = count[cur - target].", "count[cur] += 1; ans += dfs(left, cur) + dfs(right, cur); count[cur] -= 1.", "Return ans."],
    time: "O(n)", space: "O(n)",
    trap: "Forgetting to undo count[cur] lets paths jump between branches.",
    code: `from collections import defaultdict
class Solution:
    def pathSum(self, root, targetSum):
        count = defaultdict(int)
        count[0] = 1
        def dfs(node, cur):
            if not node:
                return 0
            cur += node.val
            ans = count[cur - targetSum]
            count[cur] += 1
            ans += dfs(node.left, cur) + dfs(node.right, cur)
            count[cur] -= 1
            return ans
        return dfs(root, 0)`
  },
  {
    num: 662, title: "Maximum Width of Binary Tree", slug: "maximum-width-of-binary-tree", lc: "Medium",
    topic: "trees",
    pattern: "BFS level by level",
    level: 4,
    order: 520,
    core: false,
    teaches: "Give each node a heap-style index (left 2i, right 2i+1); width = last - first + 1 per level.",
    learn: ["dsa_trees", "dsa-tr-bfs"],
    pre: [102],
    hints: ["Null nodes between the ends count. How can you measure a gap without storing nulls?", "Number nodes like an array heap: child indices 2i and 2i+1.", "Re-base the indices per level (subtract the first index) so the numbers stay small."],
    steps: ["q = deque([(root, 0)]).", "For each level: first = q[0][1]; last index seen; width = last - first + 1.", "Push children with indices 2*(i-first) and 2*(i-first)+1."],
    time: "O(n)", space: "O(w)",
    trap: "Without re-basing, indices double every level and overflow in languages with fixed ints.",
    code: `from collections import deque
class Solution:
    def widthOfBinaryTree(self, root):
        best, q = 0, deque([(root, 0)])
        while q:
            first = q[0][1]
            for _ in range(len(q)):
                node, i = q.popleft()
                i -= first
                if node.left:
                    q.append((node.left, 2 * i))
                if node.right:
                    q.append((node.right, 2 * i + 1))
            best = max(best, i + 1)
        return best`
  },
  {
    num: 99, title: "Recover Binary Search Tree", slug: "recover-binary-search-tree", lc: "Medium",
    topic: "trees",
    pattern: "BST ordering",
    level: 4,
    order: 530,
    core: false,
    teaches: "In the inorder sequence two swapped values create one or two 'drops'; the first big and last small are the culprits.",
    learn: ["dsa_trees", "dsa-tr-bst"],
    pre: [530, 98],
    hints: ["Write the inorder sequence of a BST with two values swapped. Where does it stop being sorted?", "Track prev during inorder. At each drop (prev.val > node.val), the first drop gives first = prev; every drop updates second = node.", "Swap first.val and second.val at the end."],
    steps: ["Inorder DFS with prev = None, first = second = None.", "If prev and prev.val > node.val: if first is None: first = prev; second = node.", "prev = node.", "Finally swap first.val and second.val."],
    time: "O(n)", space: "O(h)",
    trap: "Adjacent swapped nodes give only one drop; setting second only on the second drop misses that case.",
    code: `class Solution:
    def recoverTree(self, root):
        first = second = prev = None
        def dfs(node):
            nonlocal first, second, prev
            if not node:
                return
            dfs(node.left)
            if prev and prev.val > node.val:
                if first is None:
                    first = prev
                second = node
            prev = node
            dfs(node.right)
        dfs(root)
        first.val, second.val = second.val, first.val`
  },
  {
    num: 1123, title: "Lowest Common Ancestor of Deepest Leaves", slug: "lowest-common-ancestor-of-deepest-leaves", lc: "Medium",
    topic: "trees",
    pattern: "Lowest common ancestor",
    level: 4,
    order: 540,
    core: false,
    teaches: "Return (depth, lca) from each subtree; equal depths mean this node is the answer.",
    learn: ["dsa_trees", "dsa-tr-patterns"],
    pre: [236, 104],
    hints: ["The answer is the LCA of all deepest leaves. What should each subtree report?", "Return the subtree's depth and the LCA of its deepest leaves.", "If left and right depths are equal, the current node is the LCA; otherwise take the deeper side's answer."],
    steps: ["dfs(None) = (0, None).", "(dl, a) = dfs(left), (dr, b) = dfs(right).", "If dl > dr return (dl + 1, a); if dr > dl return (dr + 1, b); else return (dl + 1, node)."],
    time: "O(n)", space: "O(h)",
    trap: "Computing depth separately at every node gives O(n^2).",
    code: `class Solution:
    def lcaDeepestLeaves(self, root):
        def dfs(node):
            if not node:
                return 0, None
            dl, a = dfs(node.left)
            dr, b = dfs(node.right)
            if dl > dr:
                return dl + 1, a
            if dr > dl:
                return dr + 1, b
            return dl + 1, node
        return dfs(root)[1]`
  },
  {
    num: 889, title: "Construct Binary Tree from Preorder and Postorder Traversal", slug: "construct-binary-tree-from-preorder-and-postorder-traversal", lc: "Medium",
    topic: "trees",
    pattern: "Build tree from traversals",
    level: 4,
    order: 550,
    core: false,
    teaches: "With preorder and postorder, the left child's value (pre[1]) marks where the left subtree ends in postorder.",
    learn: ["dsa_trees", "dsa-tr-problems"],
    pre: [105, 106],
    hints: ["preorder[0] is the root. What is preorder[1] (if it exists)?", "It is the root of the left subtree (the answer may put a single child on the left). Find it in postorder.", "Everything in postorder up to and including that index is the left subtree."],
    steps: ["post_idx = {v: i}.", "build(preL, preR, postL): root = pre[preL]; if preL == preR return node.", "k = post_idx[pre[preL + 1]]; size = k - postL + 1.", "left = build(preL+1, preL+size, postL); right = build(preL+size+1, preR, k+1) if any remain."],
    time: "O(n)", space: "O(n)",
    trap: "The tree is not unique; any valid answer is accepted, so do not worry when your shape differs on one-child nodes.",
    code: `class Solution:
    def constructFromPrePost(self, preorder, postorder):
        pidx = {v: i for i, v in enumerate(postorder)}
        def build(pl, pr, ql):
            if pl > pr:
                return None
            node = TreeNode(preorder[pl])
            if pl == pr:
                return node
            k = pidx[preorder[pl + 1]]
            size = k - ql + 1
            node.left = build(pl + 1, pl + size, ql)
            node.right = build(pl + size + 1, pr, k + 1)
            return node
        return build(0, len(preorder) - 1, 0)`
  },
  {
    num: 449, title: "Serialize and Deserialize BST", slug: "serialize-and-deserialize-bst", lc: "Medium",
    topic: "trees",
    pattern: "Serialize / encode a tree",
    level: 4,
    order: 560,
    core: false,
    teaches: "A BST is fully defined by its preorder, so no null markers are needed; rebuild with bounds.",
    learn: ["dsa_trees", "dsa-tr-problems"],
    pre: [1008, 606],
    hints: ["For a general tree you need '#' markers. Why does a BST not need them?", "Because preorder plus the BST rule fixes the shape (that is problem 1008).", "Serialize as space-separated preorder; deserialize with the bounded build."],
    steps: ["serialize: preorder values joined by spaces.", "deserialize: parse ints; build(lo, hi) consumes the next value only if lo < v < hi.", "node.left = build(lo, v); node.right = build(v, hi)."],
    time: "O(n)", space: "O(n)",
    trap: "Using the generic codec with '#' works but is less compact; the problem asks for as compact as possible.",
    code: `class Codec:
    def serialize(self, root):
        out = []
        def pre(node):
            if node:
                out.append(str(node.val))
                pre(node.left)
                pre(node.right)
        pre(root)
        return " ".join(out)

    def deserialize(self, data):
        vals = [int(x) for x in data.split()]
        i = 0
        def build(lo, hi):
            nonlocal i
            if i == len(vals) or not (lo < vals[i] < hi):
                return None
            node = TreeNode(vals[i])
            i += 1
            node.left = build(lo, node.val)
            node.right = build(node.val, hi)
            return node
        return build(float('-inf'), float('inf'))`
  },
  {
    num: 117, title: "Populating Next Right Pointers in Each Node II", slug: "populating-next-right-pointers-in-each-node-ii", lc: "Medium",
    topic: "trees",
    pattern: "Rewire / modify tree in place",
    level: 4,
    order: 570,
    core: false,
    teaches: "Wire the next level with a dummy head and tail while walking the current level by next pointers.",
    learn: ["dsa_trees", "dsa-tr-recur"],
    pre: [116],
    hints: ["Without a perfect tree, children may be missing. How do you find the next child to link?", "While walking the current level, append each existing child to a 'next level' list built with a dummy head.", "When the level ends, the dummy's next is the start of the next level."],
    steps: ["head = root.", "While head: dummy = Node(); tail = dummy; for node in level (via next): append node.left/right to tail.", "head = dummy.next."],
    time: "O(n)", space: "O(1)",
    trap: "Reusing a single dummy without resetting its next pointer creates an endless loop.",
    code: `class Solution:
    def connect(self, root):
        head = root
        while head:
            dummy = Node(0)
            tail = dummy
            node = head
            while node:
                if node.left:
                    tail.next = node.left
                    tail = tail.next
                if node.right:
                    tail.next = node.right
                    tail = tail.next
                node = node.next
            head = dummy.next
        return root`
  },
  {
    num: 863, title: "All Nodes Distance K in Binary Tree", slug: "all-nodes-distance-k-in-binary-tree", lc: "Medium",
    topic: "trees",
    pattern: "Tree as a graph (parent links)",
    level: 4,
    order: 580,
    core: true,
    teaches: "Add parent links so the tree becomes an undirected graph, then BFS k steps from the target.",
    learn: ["dsa_trees", "dsa-tr-patterns"],
    pre: [102, 236],
    hints: ["Distance K can go up through parents. What is missing from a TreeNode to go up?", "Record every node's parent with one DFS. Now each node has up to three neighbours.", "BFS from target with a visited set; after k rounds, the queue holds the answer."],
    steps: ["parent = {} via DFS.", "q = deque([target]), seen = {target}.", "Repeat k times: expand every node in q to left, right, parent not yet seen.", "Return the values in q."],
    time: "O(n)", space: "O(n)",
    trap: "Without a visited set the BFS walks back to where it came from.",
    code: `from collections import deque
class Solution:
    def distanceK(self, root, target, k):
        parent = {}
        stack = [root]
        while stack:
            node = stack.pop()
            for ch in (node.left, node.right):
                if ch:
                    parent[ch] = node
                    stack.append(ch)
        q, seen = deque([target]), {target}
        for _ in range(k):
            for _ in range(len(q)):
                node = q.popleft()
                for nb in (node.left, node.right, parent.get(node)):
                    if nb and nb not in seen:
                        seen.add(nb)
                        q.append(nb)
        return [n.val for n in q]`
  },
  {
    num: 2385, title: "Amount of Time for Binary Tree to Be Infected", slug: "amount-of-time-for-binary-tree-to-be-infected", lc: "Medium",
    topic: "trees",
    pattern: "Tree as a graph (parent links)",
    level: 4,
    order: 590,
    core: false,
    teaches: "Same parent-link BFS: the answer is how many levels the BFS from the start node takes.",
    learn: ["dsa_trees", "dsa-tr-patterns"],
    pre: [863],
    hints: ["Infection spreads to parent and children each minute. What graph search measures 'minutes'?", "BFS from the start node, counting levels, over left/right/parent neighbours.", "The answer is the number of levels minus one."],
    steps: ["Build parent map and find the start node.", "BFS level by level with a seen set.", "Return levels - 1."],
    time: "O(n)", space: "O(n)",
    trap: "Values are unique, so look up the start node by value once when building the parent map.",
    code: `from collections import deque
class Solution:
    def amountOfTime(self, root, start):
        parent, src, stack = {}, None, [root]
        while stack:
            node = stack.pop()
            if node.val == start:
                src = node
            for ch in (node.left, node.right):
                if ch:
                    parent[ch] = node
                    stack.append(ch)
        q, seen, minutes = deque([src]), {src}, -1
        while q:
            minutes += 1
            for _ in range(len(q)):
                node = q.popleft()
                for nb in (node.left, node.right, parent.get(node)):
                    if nb and nb not in seen:
                        seen.add(nb)
                        q.append(nb)
        return minutes`
  },
  {
    num: 124, title: "Binary Tree Maximum Path Sum", slug: "binary-tree-maximum-path-sum", lc: "Hard",
    topic: "trees",
    pattern: "Bottom-up: return info from children",
    level: 5,
    order: 600,
    core: true,
    teaches: "Return the best one-sided gain (never below 0), record the best bend-here path globally.",
    learn: ["dsa_trees", "dsa-tr-recur"],
    pre: [543],
    hints: ["Same shape as diameter, but values can be negative. When should you refuse a child's contribution?", "gain(node) = node.val + max(0, gain(left), gain(right)): the best downward path you can offer a parent.", "At each node also try node.val + max(0, gainL) + max(0, gainR) as a full path."],
    steps: ["best = -infinity.", "gain(None) = 0.", "l = max(0, gain(left)), r = max(0, gain(right)).", "best = max(best, node.val + l + r); return node.val + max(l, r).", "Return best."],
    time: "O(n)", space: "O(h)",
    trap: "Starting best at 0 fails when all values are negative (answer is the largest single node).",
    code: `class Solution:
    def maxPathSum(self, root):
        best = float('-inf')
        def gain(node):
            nonlocal best
            if not node:
                return 0
            l = max(0, gain(node.left))
            r = max(0, gain(node.right))
            best = max(best, node.val + l + r)
            return node.val + max(l, r)
        gain(root)
        return best`
  },
  {
    num: 987, title: "Vertical Order Traversal of a Binary Tree", slug: "vertical-order-traversal-of-a-binary-tree", lc: "Hard",
    topic: "trees",
    pattern: "BFS level by level",
    level: 5,
    order: 610,
    core: false,
    teaches: "Tag every node with (column, row), then sort: column, then row, then value.",
    learn: ["dsa_trees", "dsa-tr-bfs"],
    pre: [102],
    hints: ["Each node gets a column (left -1, right +1) and a row. What order does the answer need inside one column?", "Collect (col, row, val) for every node and sort the triples.", "Group consecutive triples with the same column."],
    steps: ["DFS or BFS recording (col, row, val).", "Sort the list.", "Walk it, starting a new group whenever col changes."],
    time: "O(n log n)", space: "O(n)",
    trap: "Nodes in the same row and column must be sorted by value, not by visit order.",
    code: `class Solution:
    def verticalTraversal(self, root):
        cells = []
        def dfs(node, row, col):
            if not node:
                return
            cells.append((col, row, node.val))
            dfs(node.left, row + 1, col - 1)
            dfs(node.right, row + 1, col + 1)
        dfs(root, 0, 0)
        cells.sort()
        res, prev = [], None
        for col, row, val in cells:
            if col != prev:
                res.append([])
                prev = col
            res[-1].append(val)
        return res`
  },
  {
    num: 1373, title: "Maximum Sum BST in Binary Tree", slug: "maximum-sum-bst-in-binary-tree", lc: "Hard",
    topic: "trees",
    pattern: "BST ordering",
    level: 5,
    order: 620,
    core: false,
    teaches: "Bottom-up return of a 4-tuple (is BST, min, max, sum) lets each node decide in O(1).",
    learn: ["dsa_trees", "dsa-tr-bst"],
    pre: [98, 124],
    hints: ["To know if a subtree is a BST, what must each child report?", "Return (isBST, min, max, sum). A node is a BST if both children are and left.max < val < right.min.", "Use (inf, -inf) as min/max for an empty tree so the comparison always passes."],
    steps: ["dfs(None) = (True, inf, -inf, 0).", "Get l and r. If both BST and l.max < val < r.min: s = l.sum + r.sum + val; best = max(best, s);", "return (True, min(l.min, val), max(r.max, val), s).", "Else return (False, 0, 0, 0). Answer best (start 0)."],
    time: "O(n)", space: "O(h)",
    trap: "The empty tree counts with sum 0, so the answer is never negative.",
    code: `class Solution:
    def maxSumBST(self, root):
        best = 0
        def dfs(node):
            nonlocal best
            if not node:
                return True, float('inf'), float('-inf'), 0
            lb, lmin, lmax, ls = dfs(node.left)
            rb, rmin, rmax, rs = dfs(node.right)
            if lb and rb and lmax < node.val < rmin:
                s = ls + rs + node.val
                best = max(best, s)
                return True, min(lmin, node.val), max(rmax, node.val), s
            return False, 0, 0, 0
        dfs(root)
        return best`
  },
  {
    num: 1028, title: "Recover a Tree From Preorder Traversal", slug: "recover-a-tree-from-preorder-traversal", lc: "Hard",
    topic: "trees",
    pattern: "Build tree from traversals",
    level: 5,
    order: 630,
    core: false,
    teaches: "Parse (depth, value) pairs and keep a stack holding the current root-to-node path.",
    learn: ["dsa_trees", "dsa-tr-problems"],
    pre: [105, 144],
    hints: ["The number of dashes is the depth. With preorder, where does a node at depth d attach?", "To the most recent node at depth d - 1. Keep a stack whose length equals the current depth.", "Pop until len(stack) == d, attach as left child if empty else right, then push."],
    steps: ["Parse the string into (depth, value) pairs.", "For each: while len(stack) > depth: pop.", "If stack: attach to stack[-1].left if free else .right. Push node.", "Return stack[0]."],
    time: "O(n)", space: "O(h)",
    trap: "Values can have several digits, so read all digits, not just one character.",
    code: `class Solution:
    def recoverFromPreorder(self, traversal):
        stack, i, n = [], 0, len(traversal)
        while i < n:
            d = 0
            while traversal[i] == '-':
                d += 1
                i += 1
            j = i
            while j < n and traversal[j] != '-':
                j += 1
            node = TreeNode(int(traversal[i:j]))
            i = j
            while len(stack) > d:
                stack.pop()
            if stack:
                if stack[-1].left is None:
                    stack[-1].left = node
                else:
                    stack[-1].right = node
            stack.append(node)
        return stack[0]`
  },
  {
    num: 297, title: "Serialize and Deserialize Binary Tree", slug: "serialize-and-deserialize-binary-tree", lc: "Hard",
    topic: "trees",
    pattern: "Serialize / encode a tree",
    level: 5,
    order: 640,
    core: true,
    teaches: "Preorder with '#' for every None is reversible: read tokens back in the same order.",
    learn: ["dsa_trees", "dsa-tr-problems"],
    pre: [606, 105],
    hints: ["What extra information makes a single traversal enough to rebuild any tree?", "Write '#' for every None child in preorder.", "To decode, use an iterator over tokens: take one; '#' -> None; else make a node, then build left, then right."],
    steps: ["serialize: preorder, append str(val) or '#'; join with commas.", "deserialize: it = iter(tokens); build(): t = next(it); if t == '#' return None; node = TreeNode(int(t)); node.left = build(); node.right = build()."],
    time: "O(n)", space: "O(n)",
    trap: "Splitting on commas leaves '-' signs inside tokens, so parse with int(), not by single characters.",
    code: `class Codec:
    def serialize(self, root):
        out = []
        def pre(node):
            if not node:
                out.append("#")
                return
            out.append(str(node.val))
            pre(node.left)
            pre(node.right)
        pre(root)
        return ",".join(out)

    def deserialize(self, data):
        it = iter(data.split(","))
        def build():
            t = next(it)
            if t == "#":
                return None
            node = TreeNode(int(t))
            node.left = build()
            node.right = build()
            return node
        return build()`
  },
  {
    num: 2458, title: "Height of Binary Tree After Subtree Removal Queries", slug: "height-of-binary-tree-after-subtree-removal-queries", lc: "Hard",
    topic: "trees",
    pattern: "Bottom-up: return info from children",
    level: 6,
    order: 650,
    core: false,
    teaches: "Precompute depth and height of every node, then group by depth and keep the top two depth+height values.",
    learn: ["dsa_trees", "dsa-tr-recur"],
    pre: [104, 102],
    hints: ["After removing q's subtree, the tallest remaining path must pass through some other node at q's depth, or end above it.", "Record depth[v] and height[v] for all nodes. For each depth, the longest root-to-leaf path through a node there is depth + height.", "Keep the best two values per depth: if q owns the best, use the second; if q is alone at its depth, the answer is depth - 1."],
    steps: ["BFS from the root to get depth of every node and a top-down order.", "Walk that order backwards to compute height[v] = 1 + max(child heights) (leaf = 0).", "For every depth d keep the two largest (d + height, node) pairs.", "For query q at depth d: other = best at d not belonging to q; answer = other if it exists else d - 1."],
    time: "O(n + q)", space: "O(n)",
    trap: "Recomputing the height per query is O(n*q) and times out; deep trees also overflow Python recursion, so go iterative.",
    code: `from collections import deque
class Solution:
    def treeQueries(self, root, queries):
        depth, height, order = {}, {}, []
        q = deque([(root, 0)])
        while q:
            node, d = q.popleft()
            depth[node.val] = d
            order.append(node)
            for ch in (node.left, node.right):
                if ch:
                    q.append((ch, d + 1))
        for node in reversed(order):
            h = -1
            for ch in (node.left, node.right):
                if ch:
                    h = max(h, height[ch.val])
            height[node.val] = h + 1
        top = {}  # depth -> [(value, node), (value, node)] best two
        for node in order:
            d = depth[node.val]
            cand = (d + height[node.val], node.val)
            lst = top.setdefault(d, [])
            lst.append(cand)
            lst.sort(reverse=True)
            del lst[2:]
        res = []
        for v in queries:
            d = depth[v]
            others = [val for val, who in top[d] if who != v]
            res.append(others[0] if others else d - 1)
        return res`
  }
);
