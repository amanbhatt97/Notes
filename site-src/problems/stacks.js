// problems/stacks.js — Stacks & Queues ladder
PROBLEMS.push(
  {
    num: 1047, title: "Remove All Adjacent Duplicates In String", slug: "remove-all-adjacent-duplicates-in-string", lc: "Easy",
    topic: "stacks",
    pattern: "Stack basics",
    level: 1,
    order: 10,
    core: true,
    teaches: "A stack remembers the most recent item, so 'cancel with the previous one' becomes compare-with-top.",
    learn: ["dsa_stacks", "dsa-sq-stack"],
    pre: [],
    hints: [
      "When you read a letter, which earlier letter could it cancel with?",
      "Only the last kept letter. Keep kept letters on a stack: pop if the top equals the new letter, else push."
    ],
    steps: [
      "stack = [].",
      "For ch in s: if stack and stack[-1] == ch: pop; else push ch.",
      "Return ''.join(stack)."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Repeatedly scanning and deleting pairs from the string is O(n^2).",
    code: `def removeDuplicates(s):
    stack = []
    for ch in s:
        if stack and stack[-1] == ch:
            stack.pop()
        else:
            stack.append(ch)
    return "".join(stack)`
  },
  {
    num: 2390, title: "Removing Stars From a String", slug: "removing-stars-from-a-string", lc: "Medium",
    topic: "stacks",
    pattern: "Stack basics",
    level: 1,
    order: 20,
    core: false,
    teaches: "Each '*' deletes the closest kept character to its left: that is exactly stack.pop().",
    learn: ["dsa_stacks", "dsa-sq-stack"],
    pre: [1047],
    hints: [
      "Which character does a star remove? The most recent one still standing.",
      "Push letters; on '*' pop."
    ],
    steps: [
      "stack = [].",
      "For ch in s: pop if ch == '*', else push.",
      "Return ''.join(stack)."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Using str.replace or slicing in a loop rebuilds the string each time: O(n^2).",
    code: `def removeStars(s):
    stack = []
    for ch in s:
        if ch == "*":
            stack.pop()
        else:
            stack.append(ch)
    return "".join(stack)`
  },
  {
    num: 682, title: "Baseball Game", slug: "baseball-game", lc: "Easy",
    topic: "stacks",
    pattern: "Stack basics",
    level: 1,
    order: 30,
    core: false,
    teaches: "Stack as a scoreboard: new scores depend on the most recent valid ones, and 'C' undoes the last.",
    learn: ["dsa_stacks", "dsa-sq-stack"],
    pre: [1047],
    hints: [
      "'+', 'D' and 'C' all talk about the most recent scores. Keep scores on a stack.",
      "'+' pushes stack[-1] + stack[-2]; 'D' pushes 2 * stack[-1]; 'C' pops; a number is pushed."
    ],
    steps: [
      "stack = [].",
      "For op: handle '+', 'D', 'C' as above; otherwise push int(op).",
      "Return sum(stack)."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Parsing negative numbers: use int(op), not op.isdigit() (which is False for '-2').",
    code: `def calPoints(operations):
    stack = []
    for op in operations:
        if op == "+":
            stack.append(stack[-1] + stack[-2])
        elif op == "D":
            stack.append(2 * stack[-1])
        elif op == "C":
            stack.pop()
        else:
            stack.append(int(op))
    return sum(stack)`
  },
  {
    num: 20, title: "Valid Parentheses", slug: "valid-parentheses", lc: "Easy",
    topic: "stacks",
    pattern: "Parentheses & nesting",
    level: 1,
    order: 40,
    core: true,
    teaches: "The bracket that must close next is always the most recently opened one: a stack of openers.",
    learn: ["dsa_stacks", "dsa-sq-problems"],
    pre: [],
    hints: [
      "When you see a closing bracket, which opening bracket must it match?",
      "Push openers. On a closer, the stack top must be its partner; pop it. At the end the stack must be empty."
    ],
    steps: [
      "pairs = {')': '(', ']': '[', '}': '{'}; stack = [].",
      "For ch: if closer: if not stack or stack.pop() != pairs[ch]: return False. Else push.",
      "Return not stack."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Forgetting the two edge cases: a closer with an empty stack (']') and leftovers ('((').",
    code: `def isValid(s):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in s:
        if ch in pairs:
            if not stack or stack.pop() != pairs[ch]:
                return False
        else:
            stack.append(ch)
    return not stack`
  },
  {
    num: 1021, title: "Remove Outermost Parentheses", slug: "remove-outermost-parentheses", lc: "Easy",
    topic: "stacks",
    pattern: "Parentheses & nesting",
    level: 1,
    order: 50,
    core: false,
    teaches: "With one bracket type, the stack collapses into a depth counter.",
    learn: ["dsa_stacks", "dsa-sq-patterns"],
    pre: [20],
    hints: [
      "With only '(' and ')', all you need to know is how deep you are.",
      "Keep '(' only if the depth before it is > 0; keep ')' only if the depth after it is > 0."
    ],
    steps: [
      "depth = 0; out = [].",
      "'(': if depth > 0 keep it; depth += 1.",
      "')': depth -= 1; if depth > 0 keep it.",
      "Return ''.join(out)."
    ],
    time: "O(n)", space: "O(n) for the output",
    trap: "Updating depth before the check for '(' (or after for ')') keeps the outer brackets.",
    code: `def removeOuterParentheses(s):
    out, depth = [], 0
    for ch in s:
        if ch == "(":
            if depth > 0:
                out.append(ch)
            depth += 1
        else:
            depth -= 1
            if depth > 0:
                out.append(ch)
    return "".join(out)`
  },
  {
    num: 1614, title: "Maximum Nesting Depth of the Parentheses", slug: "maximum-nesting-depth-of-the-parentheses", lc: "Easy",
    topic: "stacks",
    pattern: "Parentheses & nesting",
    level: 1,
    order: 60,
    core: false,
    teaches: "The stack height at any moment is the nesting depth; track its maximum.",
    learn: ["dsa_stacks", "dsa-sq-patterns"],
    pre: [1021],
    hints: [
      "The depth goes up at '(' and down at ')'. Other characters don't matter.",
      "Keep a counter and record its largest value."
    ],
    steps: [
      "depth = best = 0.",
      "For ch: '(' -> depth += 1, best = max(best, depth); ')' -> depth -= 1.",
      "Return best."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Pushing characters onto a real stack works but wastes O(n) space.",
    code: `def maxDepth(s):
    depth = best = 0
    for ch in s:
        if ch == "(":
            depth += 1
            best = max(best, depth)
        elif ch == ")":
            depth -= 1
    return best`
  },
  {
    num: 225, title: "Implement Stack using Queues", slug: "implement-stack-using-queues", lc: "Easy",
    topic: "stacks",
    pattern: "Stack / queue design",
    level: 1,
    order: 70,
    core: false,
    teaches: "A queue can act as a stack if, after each push, you rotate the older items behind the new one.",
    learn: ["dsa_stacks", "dsa-sq-impl"],
    pre: [1047],
    hints: [
      "A queue gives back the OLDEST item. You need the newest. Can you make the newest one the oldest?",
      "After appending x, move the other len - 1 items from the front to the back."
    ],
    steps: [
      "push(x): q.append(x); repeat len(q) - 1 times: q.append(q.popleft()).",
      "pop: q.popleft(). top: q[0]. empty: not q."
    ],
    time: "push O(n), others O(1)", space: "O(n)",
    trap: "Using a Python list's pop() makes it a stack, not a queue; only append/popleft/len are allowed.",
    code: `from collections import deque

class MyStack:
    def __init__(self):
        self.q = deque()

    def push(self, x):
        self.q.append(x)
        for _ in range(len(self.q) - 1):
            self.q.append(self.q.popleft())

    def pop(self):
        return self.q.popleft()

    def top(self):
        return self.q[0]

    def empty(self):
        return not self.q`
  },
  {
    num: 933, title: "Number of Recent Calls", slug: "number-of-recent-calls", lc: "Easy",
    topic: "stacks",
    pattern: "Queue simulation",
    level: 1,
    order: 80,
    core: true,
    teaches: "A deque as a sliding time window: append new times on the right, drop expired ones from the left.",
    learn: ["dsa_stacks", "dsa-sq-queue"],
    pre: [],
    hints: [
      "Times arrive in increasing order. Which old requests stop counting once a new one arrives?",
      "Keep times in a deque; pop from the left while the front is < t - 3000. Return len."
    ],
    steps: [
      "ping(t): q.append(t).",
      "While q[0] < t - 3000: q.popleft().",
      "Return len(q)."
    ],
    time: "O(1) amortised per ping", space: "O(window)",
    trap: "list.pop(0) is O(n); use collections.deque.",
    code: `from collections import deque

class RecentCounter:
    def __init__(self):
        self.q = deque()

    def ping(self, t):
        self.q.append(t)
        while self.q[0] < t - 3000:
            self.q.popleft()
        return len(self.q)`
  },
  {
    num: 1475, title: "Final Prices With a Special Discount in a Shop", slug: "final-prices-with-a-special-discount-in-a-shop", lc: "Easy",
    topic: "stacks",
    pattern: "Monotonic stack",
    level: 1,
    order: 90,
    core: false,
    teaches: "Monotonic stack on-ramp: each waiting price is answered by the first later price that is <= it.",
    learn: ["dsa_stacks", "dsa-sq-mono"],
    pre: [],
    hints: [
      "For each item you need the first item to its RIGHT whose price is <= its price.",
      "Keep indexes of items still waiting for a discount. When a new price p arrives, every waiting item with price >= p gets discount p.",
      "Those waiting prices are increasing from bottom to top, so you only ever pop from the top."
    ],
    steps: [
      "ans = prices[:]; stack = [].",
      "For i, p: while stack and prices[stack[-1]] >= p: ans[stack.pop()] -= p.",
      "stack.append(i).",
      "Return ans."
    ],
    time: "O(n)", space: "O(n)",
    trap: "The discount condition is <= (equal prices count), so pop on >=, not >.",
    code: `def finalPrices(prices):
    ans = prices[:]
    stack = []
    for i, p in enumerate(prices):
        while stack and prices[stack[-1]] >= p:
            ans[stack.pop()] -= p
        stack.append(i)
    return ans`
  },
  {
    num: 71, title: "Simplify Path", slug: "simplify-path", lc: "Medium",
    topic: "stacks",
    pattern: "Stack basics",
    level: 2,
    order: 100,
    core: false,
    teaches: "Split the path into names and use a stack of folders: '..' pops, '.' and empty parts are skipped.",
    learn: ["dsa_stacks", "dsa-sq-stack"],
    pre: [2390],
    hints: [
      "Split on '/'. Which parts change the current folder, and which can be ignored?",
      "'..' goes up (pop if possible), '' and '.' do nothing, anything else is a folder name to push.",
      "Join the stack with '/' and put one '/' in front."
    ],
    steps: [
      "stack = [].",
      "For part in path.split('/'): '..' -> pop if stack; '' or '.' -> skip; else push.",
      "Return '/' + '/'.join(stack)."
    ],
    time: "O(n)", space: "O(n)",
    trap: "'...' is a valid folder name, not a parent reference.",
    code: `def simplifyPath(path):
    stack = []
    for part in path.split("/"):
        if part == "..":
            if stack:
                stack.pop()
        elif part and part != ".":
            stack.append(part)
    return "/" + "/".join(stack)`
  },
  {
    num: 946, title: "Validate Stack Sequences", slug: "validate-stack-sequences", lc: "Medium",
    topic: "stacks",
    pattern: "Stack basics",
    level: 2,
    order: 110,
    core: false,
    teaches: "Simulate with a real stack: push in order, and pop greedily whenever the top matches the next expected pop.",
    learn: ["dsa_stacks", "dsa-sq-stack"],
    pre: [1047],
    hints: [
      "Just replay it. Push pushed[i] one by one.",
      "After each push, while the top equals popped[j], pop and advance j. Valid if the stack ends empty."
    ],
    steps: [
      "stack = []; j = 0.",
      "For x in pushed: push x; while stack and stack[-1] == popped[j]: pop; j += 1.",
      "Return not stack."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Popping greedily is always safe because values are distinct: waiting can never help.",
    code: `def validateStackSequences(pushed, popped):
    stack, j = [], 0
    for x in pushed:
        stack.append(x)
        while stack and stack[-1] == popped[j]:
            stack.pop()
            j += 1
    return not stack`
  },
  {
    num: 921, title: "Minimum Add to Make Parentheses Valid", slug: "minimum-add-to-make-parentheses-valid", lc: "Medium",
    topic: "stacks",
    pattern: "Parentheses & nesting",
    level: 2,
    order: 120,
    core: false,
    teaches: "Count unmatched brackets: open ones still waiting, and closers that arrived with nothing to match.",
    learn: ["dsa_stacks", "dsa-sq-patterns"],
    pre: [20],
    hints: [
      "Scan with a balance counter. What does it mean if a ')' arrives when balance is 0?",
      "That ')' needs an inserted '('. At the end, every still-open '(' needs an inserted ')'."
    ],
    steps: [
      "open = add = 0.",
      "'(': open += 1. ')': if open: open -= 1 else add += 1.",
      "Return add + open."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Letting the balance go negative and only using |balance| at the end misses cases like ')('.",
    code: `def minAddToMakeValid(s):
    open_, add = 0, 0
    for ch in s:
        if ch == "(":
            open_ += 1
        elif open_:
            open_ -= 1
        else:
            add += 1
    return add + open_`
  },
  {
    num: 150, title: "Evaluate Reverse Polish Notation", slug: "evaluate-reverse-polish-notation", lc: "Medium",
    topic: "stacks",
    pattern: "Expression evaluation",
    level: 2,
    order: 130,
    core: true,
    teaches: "Postfix needs no precedence rules: push numbers, and each operator pops two, computes, pushes the result.",
    learn: ["dsa_stacks", "dsa-sq-patterns"],
    pre: [682],
    hints: [
      "In postfix, an operator always applies to the two most recent values.",
      "On an operator: b = pop(), a = pop(), push a op b. Order matters for - and /.",
      "Division truncates toward zero: use int(a / b), not a // b."
    ],
    steps: [
      "stack = [].",
      "For tok: if operator: b, a = pop(), pop(); push the result (int(a / b) for '/').",
      "Else push int(tok).",
      "Return stack[0]."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Python's // floors (-7 // 2 == -4) but the problem truncates toward zero (-3).",
    code: `def evalRPN(tokens):
    stack = []
    for tok in tokens:
        if tok in "+-*/" and len(tok) == 1:
            b, a = stack.pop(), stack.pop()
            if tok == "+":
                stack.append(a + b)
            elif tok == "-":
                stack.append(a - b)
            elif tok == "*":
                stack.append(a * b)
            else:
                stack.append(int(a / b))
        else:
            stack.append(int(tok))
    return stack[0]`
  },
  {
    num: 232, title: "Implement Queue using Stacks", slug: "implement-queue-using-stacks", lc: "Easy",
    topic: "stacks",
    pattern: "Stack / queue design",
    level: 2,
    order: 140,
    core: true,
    teaches: "Two stacks make a queue: pour the input stack into the output stack only when the output is empty (amortised O(1)).",
    learn: ["dsa_stacks", "dsa-sq-impl"],
    pre: [225],
    hints: [
      "Pouring one stack into another reverses the order, turning newest-first into oldest-first.",
      "Push into 'inbox'. For pop/peek, if 'outbox' is empty, move everything from inbox to outbox, then use outbox's top.",
      "Each element moves at most once, so the average cost per operation is O(1)."
    ],
    steps: [
      "push(x): inbox.append(x).",
      "_move(): if not outbox: while inbox: outbox.append(inbox.pop()).",
      "pop: _move(); return outbox.pop(). peek: _move(); return outbox[-1].",
      "empty: not inbox and not outbox."
    ],
    time: "O(1) amortised", space: "O(n)",
    trap: "Pouring back and forth on every operation is O(n) each; only refill outbox when it is empty.",
    code: `class MyQueue:
    def __init__(self):
        self.inbox, self.outbox = [], []

    def push(self, x):
        self.inbox.append(x)

    def _move(self):
        if not self.outbox:
            while self.inbox:
                self.outbox.append(self.inbox.pop())

    def pop(self):
        self._move()
        return self.outbox.pop()

    def peek(self):
        self._move()
        return self.outbox[-1]

    def empty(self):
        return not self.inbox and not self.outbox`
  },
  {
    num: 155, title: "Min Stack", slug: "min-stack", lc: "Medium",
    topic: "stacks",
    pattern: "Stack / queue design",
    level: 2,
    order: 150,
    core: true,
    teaches: "Stack with extra info: store (value, min so far) so the minimum is always at the top.",
    learn: ["dsa_stacks", "dsa-sq-problems"],
    pre: [1047],
    hints: [
      "Recomputing min(stack) is O(n). What if each entry remembered the minimum at the time it was pushed?",
      "Push (x, min(x, current min)). After a pop, the new top still knows its own minimum."
    ],
    steps: [
      "push(x): m = x if empty else min(x, s[-1][1]); s.append((x, m)).",
      "pop: s.pop(). top: s[-1][0]. getMin: s[-1][1]."
    ],
    time: "O(1) per operation", space: "O(n)",
    trap: "Keeping a single min variable breaks after popping the minimum.",
    code: `class MinStack:
    def __init__(self):
        self.s = []

    def push(self, val):
        m = val if not self.s else min(val, self.s[-1][1])
        self.s.append((val, m))

    def pop(self):
        self.s.pop()

    def top(self):
        return self.s[-1][0]

    def getMin(self):
        return self.s[-1][1]`
  },
  {
    num: 1381, title: "Design a Stack With Increment Operation", slug: "design-a-stack-with-increment-operation", lc: "Medium",
    topic: "stacks",
    pattern: "Stack / queue design",
    level: 2,
    order: 160,
    core: false,
    teaches: "Lazy updates: record 'add val to the bottom k' at index k - 1, and pass it down when that element is popped.",
    learn: ["dsa_stacks", "dsa-sq-stack"],
    pre: [155],
    hints: [
      "Looping over k elements on every increment is O(k). Can you postpone the work?",
      "Keep inc[i]: an amount owed to element i and everything below it. increment(k, v): inc[min(k, size) - 1] += v.",
      "On pop at index i: result = stack[i] + inc[i]; pass inc[i] down to inc[i - 1]; reset inc[i]."
    ],
    steps: [
      "stack = []; inc = [0] * maxSize.",
      "push: if len < maxSize append.",
      "increment(k, v): if stack: inc[min(k, len) - 1] += v.",
      "pop: if empty -1; i = len - 1; if i > 0: inc[i - 1] += inc[i]; res = stack.pop() + inc[i]; inc[i] = 0; return res."
    ],
    time: "O(1) per operation", space: "O(maxSize)",
    trap: "Forgetting to reset inc[i] after a pop gives the next element pushed at that slot a stale bonus.",
    code: `class CustomStack:
    def __init__(self, maxSize):
        self.max = maxSize
        self.stack = []
        self.inc = [0] * maxSize

    def push(self, x):
        if len(self.stack) < self.max:
            self.stack.append(x)

    def pop(self):
        if not self.stack:
            return -1
        i = len(self.stack) - 1
        if i > 0:
            self.inc[i - 1] += self.inc[i]
        res = self.stack.pop() + self.inc[i]
        self.inc[i] = 0
        return res

    def increment(self, k, val):
        if self.stack:
            self.inc[min(k, len(self.stack)) - 1] += val`
  },
  {
    num: 622, title: "Design Circular Queue", slug: "design-circular-queue", lc: "Medium",
    topic: "stacks",
    pattern: "Queue simulation",
    level: 2,
    order: 170,
    core: false,
    teaches: "A fixed array plus a head index and a count; positions wrap around with % k.",
    learn: ["dsa_stacks", "dsa-sq-queue"],
    pre: [933],
    hints: [
      "Keep head (index of the front) and size. Where is the rear? (head + size - 1) % k.",
      "enQueue writes at (head + size) % k; deQueue moves head forward by one, wrapping with % k."
    ],
    steps: [
      "a = [0] * k; head = 0; size = 0.",
      "enQueue: if full return False; a[(head + size) % k] = v; size += 1.",
      "deQueue: if empty return False; head = (head + 1) % k; size -= 1.",
      "Front: a[head]; Rear: a[(head + size - 1) % k]; -1 when empty."
    ],
    time: "O(1) per operation", space: "O(k)",
    trap: "Tracking only head and tail cannot tell 'full' from 'empty'; keep a size counter.",
    code: `class MyCircularQueue:
    def __init__(self, k):
        self.a = [0] * k
        self.k = k
        self.head = 0
        self.size = 0

    def enQueue(self, value):
        if self.size == self.k:
            return False
        self.a[(self.head + self.size) % self.k] = value
        self.size += 1
        return True

    def deQueue(self):
        if self.size == 0:
            return False
        self.head = (self.head + 1) % self.k
        self.size -= 1
        return True

    def Front(self):
        return self.a[self.head] if self.size else -1

    def Rear(self):
        return self.a[(self.head + self.size - 1) % self.k] if self.size else -1

    def isEmpty(self):
        return self.size == 0

    def isFull(self):
        return self.size == self.k`
  },
  {
    num: 641, title: "Design Circular Deque", slug: "design-circular-deque", lc: "Medium",
    topic: "stacks",
    pattern: "Queue simulation",
    level: 2,
    order: 180,
    core: false,
    teaches: "The circular array also supports the front: inserting there moves head back one slot, wrapping with % k.",
    learn: ["dsa_stacks", "dsa-sq-queue"],
    pre: [622],
    hints: [
      "Start from Design Circular Queue. What changes when you can also insert at the front?",
      "insertFront: head = (head - 1) % k, write there, size += 1. deleteLast just does size -= 1."
    ],
    steps: [
      "Same fields as the circular queue: a, k, head, size.",
      "insertFront: head = (head - 1) % k; a[head] = v. insertLast: a[(head + size) % k] = v. Both size += 1.",
      "deleteFront: head = (head + 1) % k; size -= 1. deleteLast: size -= 1.",
      "getFront: a[head]; getRear: a[(head + size - 1) % k]."
    ],
    time: "O(1) per operation", space: "O(k)",
    trap: "In other languages (head - 1) % k can be negative; Python's % is already non-negative.",
    code: `class MyCircularDeque:
    def __init__(self, k):
        self.a = [0] * k
        self.k = k
        self.head = 0
        self.size = 0

    def insertFront(self, value):
        if self.size == self.k:
            return False
        self.head = (self.head - 1) % self.k
        self.a[self.head] = value
        self.size += 1
        return True

    def insertLast(self, value):
        if self.size == self.k:
            return False
        self.a[(self.head + self.size) % self.k] = value
        self.size += 1
        return True

    def deleteFront(self):
        if self.size == 0:
            return False
        self.head = (self.head + 1) % self.k
        self.size -= 1
        return True

    def deleteLast(self):
        if self.size == 0:
            return False
        self.size -= 1
        return True

    def getFront(self):
        return self.a[self.head] if self.size else -1

    def getRear(self):
        return self.a[(self.head + self.size - 1) % self.k] if self.size else -1

    def isEmpty(self):
        return self.size == 0

    def isFull(self):
        return self.size == self.k`
  },
  {
    num: 496, title: "Next Greater Element I", slug: "next-greater-element-i", lc: "Easy",
    topic: "stacks",
    pattern: "Monotonic stack",
    level: 2,
    order: 190,
    core: true,
    teaches: "Next greater element: keep a decreasing stack; a bigger newcomer is the answer for everything it pops.",
    learn: ["dsa_stacks", "dsa-sq-mono"],
    pre: [1475],
    hints: [
      "Compute the next greater element for every number in nums2 once, then look up nums1's numbers.",
      "Scan nums2 with a stack of numbers still waiting. When x arrives, pop all smaller waiting numbers: x is their answer.",
      "Store answers in a dict; anything never popped gets -1."
    ],
    steps: [
      "nxt = {}; stack = [].",
      "For x in nums2: while stack and stack[-1] < x: nxt[stack.pop()] = x. Push x.",
      "Return [nxt.get(v, -1) for v in nums1]."
    ],
    time: "O(n + m)", space: "O(n)",
    trap: "For each nums1 value, scanning nums2 to the right is O(n * m).",
    code: `def nextGreaterElement(nums1, nums2):
    nxt, stack = {}, []
    for x in nums2:
        while stack and stack[-1] < x:
            nxt[stack.pop()] = x
        stack.append(x)
    return [nxt.get(v, -1) for v in nums1]`
  },
  {
    num: 739, title: "Daily Temperatures", slug: "daily-temperatures", lc: "Medium",
    topic: "stacks",
    pattern: "Monotonic stack",
    level: 2,
    order: 200,
    core: true,
    teaches: "Same monotonic stack, but store INDEXES so you can measure how far away the warmer day is.",
    learn: ["dsa_stacks", "dsa-sq-mono"],
    pre: [496],
    hints: [
      "For each day you need the first later day that is warmer, and the distance to it.",
      "Keep a stack of indexes whose temperatures are decreasing. When day i is warmer than the top, pop j and set ans[j] = i - j."
    ],
    steps: [
      "ans = [0] * n; stack = [].",
      "For i, t: while stack and temps[stack[-1]] < t: j = pop; ans[j] = i - j.",
      "Push i.",
      "Return ans."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Pushing temperatures instead of indexes loses the position needed for the distance.",
    code: `def dailyTemperatures(temperatures):
    ans = [0] * len(temperatures)
    stack = []
    for i, t in enumerate(temperatures):
        while stack and temperatures[stack[-1]] < t:
            j = stack.pop()
            ans[j] = i - j
        stack.append(i)
    return ans`
  },
  {
    num: 735, title: "Asteroid Collision", slug: "asteroid-collision", lc: "Medium",
    topic: "stacks",
    pattern: "Stack basics",
    level: 3,
    order: 210,
    core: true,
    teaches: "Collisions happen only between a right-moving survivor (stack top) and a new left-moving asteroid; resolve them in a loop.",
    learn: ["dsa_stacks", "dsa-sq-stack"],
    pre: [1047],
    hints: [
      "Which pairs can collide? Only a positive one on the left with a negative one on the right.",
      "Keep survivors on a stack. A new negative asteroid fights the positive tops one by one.",
      "Smaller top explodes (pop, keep fighting); equal: both explode; bigger top: the new one explodes."
    ],
    steps: [
      "For a in asteroids: alive = True.",
      "While alive and a < 0 and stack and stack[-1] > 0: if stack[-1] < -a: pop; elif == -a: pop, alive = False; else alive = False.",
      "If alive: push a.",
      "Return stack."
    ],
    time: "O(n)", space: "O(n)",
    trap: "A negative on the left and a positive on the right move apart and never collide.",
    code: `def asteroidCollision(asteroids):
    stack = []
    for a in asteroids:
        alive = True
        while alive and a < 0 and stack and stack[-1] > 0:
            if stack[-1] < -a:
                stack.pop()
            elif stack[-1] == -a:
                stack.pop()
                alive = False
            else:
                alive = False
        if alive:
            stack.append(a)
    return stack`
  },
  {
    num: 1249, title: "Minimum Remove to Make Valid Parentheses", slug: "minimum-remove-to-make-valid-parentheses", lc: "Medium",
    topic: "stacks",
    pattern: "Parentheses & nesting",
    level: 3,
    order: 220,
    core: true,
    teaches: "Stack of INDEXES of unmatched '(' finds exactly which characters to delete.",
    learn: ["dsa_stacks", "dsa-sq-problems"],
    pre: [20, 921],
    hints: [
      "A ')' with nothing open must go. Which '(' must go?",
      "Push the index of each '('. On ')', pop if possible, else mark that ')' for removal.",
      "Whatever indexes remain on the stack are unmatched '(' and must be removed too."
    ],
    steps: [
      "stack = []; remove = set().",
      "For i, ch: '(' -> push i; ')' -> pop if stack else remove.add(i).",
      "remove |= set(stack).",
      "Return the characters whose index is not in remove."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Removing characters from the string while scanning shifts indexes; collect them and build once.",
    code: `def minRemoveToMakeValid(s):
    stack, remove = [], set()
    for i, ch in enumerate(s):
        if ch == "(":
            stack.append(i)
        elif ch == ")":
            if stack:
                stack.pop()
            else:
                remove.add(i)
    remove.update(stack)
    return "".join(ch for i, ch in enumerate(s) if i not in remove)`
  },
  {
    num: 856, title: "Score of Parentheses", slug: "score-of-parentheses", lc: "Medium",
    topic: "stacks",
    pattern: "Parentheses & nesting",
    level: 3,
    order: 230,
    core: false,
    teaches: "Stack of partial scores per nesting level: '(' opens a new level, ')' closes it and adds max(2 * inner, 1) to the parent.",
    learn: ["dsa_stacks", "dsa-sq-patterns"],
    pre: [20],
    hints: [
      "Every '(' starts a new group whose score you don't know yet. Push a 0 for it.",
      "On ')': v = pop(); the parent's score increases by 1 if v == 0 (it was '()'), else by 2 * v."
    ],
    steps: [
      "stack = [0].",
      "'(' -> push 0. ')' -> v = pop(); stack[-1] += max(2 * v, 1).",
      "Return stack[0]."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Treating '()()' as nested: siblings add, only nesting doubles.",
    code: `def scoreOfParentheses(s):
    stack = [0]
    for ch in s:
        if ch == "(":
            stack.append(0)
        else:
            v = stack.pop()
            stack[-1] += max(2 * v, 1)
    return stack[0]`
  },
  {
    num: 1190, title: "Reverse Substrings Between Each Pair of Parentheses", slug: "reverse-substrings-between-each-pair-of-parentheses", lc: "Medium",
    topic: "stacks",
    pattern: "Parentheses & nesting",
    level: 3,
    order: 240,
    core: false,
    teaches: "Match brackets with a stack first, then walk the string jumping to the partner bracket and flipping direction at each bracket.",
    learn: ["dsa_stacks", "dsa-sq-patterns"],
    pre: [1249],
    hints: [
      "Simple version: a stack of partial strings; on ')' reverse the top and append it to the one below. That is O(n^2) in the worst case.",
      "O(n) idea: pair every '(' with its ')' using a stack of indexes.",
      "Walk from i = 0 with direction +1. At a bracket, jump to its partner and flip the direction; at a letter, output it."
    ],
    steps: [
      "pair = [0] * n; stack of '(' indexes; on ')' j = pop: pair[i] = j; pair[j] = i.",
      "i, d = 0, 1; out = [].",
      "While i < n: if s[i] in '()': i = pair[i]; d = -d; else out.append(s[i]). Then i += d.",
      "Return ''.join(out)."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Reversing substrings again and again for deep nesting makes it O(n^2).",
    code: `def reverseParentheses(s):
    n = len(s)
    pair, stack = [0] * n, []
    for i, ch in enumerate(s):
        if ch == "(":
            stack.append(i)
        elif ch == ")":
            j = stack.pop()
            pair[i], pair[j] = j, i
    out, i, d = [], 0, 1
    while i < n:
        if s[i] in "()":
            i = pair[i]
            d = -d
        else:
            out.append(s[i])
        i += d
    return "".join(out)`
  },
  {
    num: 227, title: "Basic Calculator II", slug: "basic-calculator-ii", lc: "Medium",
    topic: "stacks",
    pattern: "Expression evaluation",
    level: 3,
    order: 250,
    core: true,
    teaches: "Handle precedence with a stack of terms: + and - push a new term, * and / combine with the last term immediately.",
    learn: ["dsa_stacks", "dsa-sq-patterns"],
    pre: [150],
    hints: [
      "* and / must happen before + and -. What if you only ever add things up at the very end?",
      "Keep the last operator. When a number finishes: '+' push n, '-' push -n, '*' push pop() * n, '/' push int(pop() / n).",
      "The answer is sum(stack)."
    ],
    steps: [
      "num = 0; op = '+'; stack = [].",
      "For each char (plus a final sentinel): build num from digits; on an operator or the end, apply op to num as above, then op = char, num = 0.",
      "Return sum(stack)."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Division truncates toward zero for negative terms: int(a / b), not a // b.",
    code: `def calculate(s):
    stack, num, op = [], 0, "+"
    for ch in s + "+":
        if ch.isdigit():
            num = num * 10 + int(ch)
        elif ch in "+-*/":
            if op == "+":
                stack.append(num)
            elif op == "-":
                stack.append(-num)
            elif op == "*":
                stack.append(stack.pop() * num)
            else:
                stack.append(int(stack.pop() / num))
            op, num = ch, 0
    return sum(stack)`
  },
  {
    num: 394, title: "Decode String", slug: "decode-string", lc: "Medium",
    topic: "stacks",
    pattern: "Expression evaluation",
    level: 3,
    order: 260,
    core: true,
    teaches: "On '[' save the string built so far and the repeat count; on ']' pop them and splice in the repeated inner string.",
    learn: ["dsa_stacks", "dsa-sq-patterns"],
    pre: [150, 20],
    hints: [
      "Nested brackets mean you must pause the outer string while you build the inner one. What structure pauses work?",
      "Keep cur (string being built) and k (number being read). On '[' push (cur, k) and reset both.",
      "On ']' pop (prev, times) and set cur = prev + cur * times."
    ],
    steps: [
      "stack = []; cur = ''; k = 0.",
      "Digit: k = k * 10 + digit. '[': push (cur, k); cur, k = '', 0.",
      "']': prev, times = pop(); cur = prev + cur * times. Letter: cur += ch.",
      "Return cur."
    ],
    time: "O(output length)", space: "O(output length)",
    trap: "Multi-digit counts like 12[a]: build k digit by digit, don't read a single character.",
    code: `def decodeString(s):
    stack, cur, k = [], "", 0
    for ch in s:
        if ch.isdigit():
            k = k * 10 + int(ch)
        elif ch == "[":
            stack.append((cur, k))
            cur, k = "", 0
        elif ch == "]":
            prev, times = stack.pop()
            cur = prev + cur * times
        else:
            cur += ch
    return cur`
  },
  {
    num: 1472, title: "Design Browser History", slug: "design-browser-history", lc: "Medium",
    topic: "stacks",
    pattern: "Stack / queue design",
    level: 3,
    order: 270,
    core: false,
    teaches: "One list plus a cursor and a logical end: visiting overwrites forward history in O(1) without deleting anything.",
    learn: ["dsa_stacks", "dsa-sq-stack"],
    pre: [155],
    hints: [
      "Back and forward move along a line of pages. Visiting a new page throws away everything ahead of you.",
      "Store pages in a list with cur (current index) and last (last valid index). visit writes at cur + 1 and sets last = cur.",
      "back(k): cur = max(0, cur - k). forward(k): cur = min(last, cur + k)."
    ],
    steps: [
      "hist = [homepage]; cur = last = 0.",
      "visit(url): cur += 1; write hist[cur] (append if needed); last = cur.",
      "back(steps): cur = max(0, cur - steps); return hist[cur].",
      "forward(steps): cur = min(last, cur + steps); return hist[cur]."
    ],
    time: "O(1) per operation", space: "O(n)",
    trap: "Two stacks also work but back/forward cost O(steps); slicing the list on visit costs O(n).",
    code: `class BrowserHistory:
    def __init__(self, homepage):
        self.hist = [homepage]
        self.cur = 0
        self.last = 0

    def visit(self, url):
        self.cur += 1
        if self.cur == len(self.hist):
            self.hist.append(url)
        else:
            self.hist[self.cur] = url
        self.last = self.cur

    def back(self, steps):
        self.cur = max(0, self.cur - steps)
        return self.hist[self.cur]

    def forward(self, steps):
        self.cur = min(self.last, self.cur + steps)
        return self.hist[self.cur]`
  },
  {
    num: 950, title: "Reveal Cards In Increasing Order", slug: "reveal-cards-in-increasing-order", lc: "Medium",
    topic: "stacks",
    pattern: "Queue simulation",
    level: 3,
    order: 280,
    core: false,
    teaches: "Run the reveal process on a queue of POSITIONS to learn the order positions are revealed in, then fill them with sorted cards.",
    learn: ["dsa_stacks", "dsa-sq-queue"],
    pre: [933],
    hints: [
      "You don't know where cards go, but you can simulate which position is revealed 1st, 2nd, 3rd...",
      "Queue the indexes 0..n-1. Repeatedly: the front index is revealed next; then move the new front to the back.",
      "Assign the sorted cards to positions in that reveal order."
    ],
    steps: [
      "q = deque(range(n)); ans = [0] * n.",
      "For card in sorted(deck): ans[q.popleft()] = card; if q: q.append(q.popleft()).",
      "Return ans."
    ],
    time: "O(n log n)", space: "O(n)",
    trap: "Simulating on the card values instead of positions gets the reverse mapping.",
    code: `from collections import deque

def deckRevealedIncreasing(deck):
    n = len(deck)
    q = deque(range(n))
    ans = [0] * n
    for card in sorted(deck):
        ans[q.popleft()] = card
        if q:
            q.append(q.popleft())
    return ans`
  },
  {
    num: 649, title: "Dota2 Senate", slug: "dota2-senate", lc: "Medium",
    topic: "stacks",
    pattern: "Queue simulation",
    level: 3,
    order: 290,
    core: false,
    teaches: "Two queues of senator indexes: the earlier one bans the other and re-queues itself with index + n for the next round.",
    learn: ["dsa_stacks", "dsa-sq-queue"],
    pre: [933],
    hints: [
      "Each senator should ban the NEXT opposing senator who would act. Why the next one?",
      "Keep one queue of indexes per party. Compare the fronts: the smaller index acts first and bans the other.",
      "The winner goes to the back with index + n (it acts again next round)."
    ],
    steps: [
      "r, d = deques of indexes for 'R' and 'D'.",
      "While both non-empty: a, b = r.popleft(), d.popleft(); if a < b: r.append(a + n) else d.append(b + n).",
      "Return 'Radiant' if r else 'Dire'."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Banning the first opponent in the string (not the next one in turn order) gives wrong answers.",
    code: `from collections import deque

def predictPartyVictory(senate):
    n = len(senate)
    r = deque(i for i, c in enumerate(senate) if c == "R")
    d = deque(i for i, c in enumerate(senate) if c == "D")
    while r and d:
        a, b = r.popleft(), d.popleft()
        if a < b:
            r.append(a + n)
        else:
            d.append(b + n)
    return "Radiant" if r else "Dire"`
  },
  {
    num: 503, title: "Next Greater Element II", slug: "next-greater-element-ii", lc: "Medium",
    topic: "stacks",
    pattern: "Monotonic stack",
    level: 3,
    order: 300,
    core: false,
    teaches: "Circular array: run the monotonic stack over 2n positions (index i % n) so each element can see past the end.",
    learn: ["dsa_stacks", "dsa-sq-mono"],
    pre: [739],
    hints: [
      "Wrapping around means the next greater element may be earlier in the array.",
      "Pretend the array is written twice. Loop i over range(2 * n), use nums[i % n].",
      "Only push indexes during the first pass (i < n); the second pass only answers."
    ],
    steps: [
      "ans = [-1] * n; stack = [].",
      "For i in range(2n): x = nums[i % n]; while stack and nums[stack[-1]] < x: ans[stack.pop()] = x.",
      "If i < n: push i.",
      "Return ans."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Actually concatenating the array doubles memory; index with % n instead.",
    code: `def nextGreaterElements(nums):
    n = len(nums)
    ans, stack = [-1] * n, []
    for i in range(2 * n):
        x = nums[i % n]
        while stack and nums[stack[-1]] < x:
            ans[stack.pop()] = x
        if i < n:
            stack.append(i)
    return ans`
  },
  {
    num: 901, title: "Online Stock Span", slug: "online-stock-span", lc: "Medium",
    topic: "stacks",
    pattern: "Monotonic stack",
    level: 3,
    order: 310,
    core: true,
    teaches: "Online monotonic stack: store (price, span); a new price absorbs the spans of all smaller-or-equal prices it pops.",
    learn: ["dsa_stacks", "dsa-sq-mono"],
    pre: [739],
    hints: [
      "The span reaches back to the previous price that is strictly higher.",
      "Keep a stack of (price, span) with decreasing prices. A new price pops every entry <= it and adds their spans to its own (starting at 1)."
    ],
    steps: [
      "next(price): span = 1.",
      "While stack and stack[-1][0] <= price: span += stack.pop()[1].",
      "Push (price, span); return span."
    ],
    time: "O(1) amortised per call", space: "O(n)",
    trap: "Walking backwards through all previous prices each call is O(n) per call.",
    code: `class StockSpanner:
    def __init__(self):
        self.stack = []

    def next(self, price):
        span = 1
        while self.stack and self.stack[-1][0] <= price:
            span += self.stack.pop()[1]
        self.stack.append((price, span))
        return span`
  },
  {
    num: 1019, title: "Next Greater Node In Linked List", slug: "next-greater-node-in-linked-list", lc: "Medium",
    topic: "stacks",
    pattern: "Monotonic stack",
    level: 3,
    order: 320,
    core: false,
    teaches: "A linked list is just a sequence: walk it once, applying the next-greater stack to (index, value) pairs.",
    learn: ["dsa_stacks", "dsa-sq-mono"],
    pre: [739],
    hints: [
      "You can't index a linked list, but you can number the nodes as you walk.",
      "Append a 0 to the answer for each node; keep a stack of indexes still waiting for a greater value."
    ],
    steps: [
      "ans = []; stack = []; i = 0.",
      "For each node: ans.append(0); while stack and vals[stack[-1]] < node.val: ans[stack.pop()] = node.val. Push i.",
      "Return ans."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Checking the remaining list for every node is O(n^2).",
    code: `def nextLargerNodes(head):
    ans, vals, stack = [], [], []
    while head:
        i = len(vals)
        vals.append(head.val)
        ans.append(0)
        while stack and vals[stack[-1]] < head.val:
            ans[stack.pop()] = head.val
        stack.append(i)
        head = head.next
    return ans`
  },
  {
    num: 2487, title: "Remove Nodes From Linked List", slug: "remove-nodes-from-linked-list", lc: "Medium",
    topic: "stacks",
    pattern: "Monotonic stack",
    level: 3,
    order: 330,
    core: false,
    teaches: "Keep a non-increasing stack of nodes: a bigger node removes every smaller node before it; then relink the survivors.",
    learn: ["dsa_stacks", "dsa-sq-mono"],
    pre: [1019],
    hints: [
      "A node survives only if nothing to its right is strictly greater.",
      "Walk the list with a stack of kept nodes; pop while the top's value < current value, then push current.",
      "Finally link the stack's nodes in order. (Alternative: reverse, keep a running max, reverse back.)"
    ],
    steps: [
      "stack = [].",
      "For each node: while stack and stack[-1].val < node.val: pop. Push node.",
      "For i in range(len(stack) - 1): stack[i].next = stack[i + 1]; stack[-1].next = None.",
      "Return stack[0]."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Using <= in the pop condition removes equal values, but only strictly greater ones count.",
    code: `def removeNodes(head):
    stack = []
    while head:
        while stack and stack[-1].val < head.val:
            stack.pop()
        stack.append(head)
        head = head.next
    for a, b in zip(stack, stack[1:]):
        a.next = b
    stack[-1].next = None
    return stack[0]`
  },
  {
    num: 853, title: "Car Fleet", slug: "car-fleet", lc: "Medium",
    topic: "stacks",
    pattern: "Monotonic stack",
    level: 3,
    order: 340,
    core: true,
    teaches: "Sort cars by position from the front; compare arrival times on a stack: a car that would arrive sooner joins the fleet ahead.",
    learn: ["dsa_stacks", "dsa-sq-mono"],
    pre: [739],
    hints: [
      "A car can only be blocked by cars ahead of it. Process cars from the closest to the target backwards.",
      "Each car's solo arrival time is (target - pos) / speed. If it is <= the fleet ahead's time, it merges into that fleet.",
      "Otherwise it starts a new, slower fleet: push its time. The answer is the stack size."
    ],
    steps: [
      "Sort cars by position descending.",
      "For each: t = (target - p) / s; if not stack or t > stack[-1]: push t.",
      "Return len(stack)."
    ],
    time: "O(n log n)", space: "O(n)",
    trap: "Sorting ascending and scanning from the back of the line ignores that the front cars set the pace.",
    code: `def carFleet(target, position, speed):
    stack = []
    for p, s in sorted(zip(position, speed), reverse=True):
        t = (target - p) / s
        if not stack or t > stack[-1]:
            stack.append(t)
    return len(stack)`
  },
  {
    num: 402, title: "Remove K Digits", slug: "remove-k-digits", lc: "Medium",
    topic: "stacks",
    pattern: "Monotonic stack",
    level: 3,
    order: 350,
    core: true,
    teaches: "Greedy with an increasing stack: a digit should be removed if a smaller digit comes right after it.",
    learn: ["dsa_stacks", "dsa-sq-mono"],
    pre: [496],
    hints: [
      "To make a number small, the leftmost digits matter most. When is removing a digit clearly good?",
      "When the next digit is smaller. Keep an increasing stack; while k > 0 and the top > current digit, pop (k -= 1).",
      "If k is still > 0, cut digits from the end. Strip leading zeros; empty means '0'."
    ],
    steps: [
      "stack = [].",
      "For d in num: while k and stack and stack[-1] > d: pop; k -= 1. Push d.",
      "If k: stack = stack[:-k].",
      "Return ''.join(stack).lstrip('0') or '0'."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Forgetting the leftover k on an already increasing number like '12345'.",
    code: `def removeKdigits(num, k):
    stack = []
    for d in num:
        while k and stack and stack[-1] > d:
            stack.pop()
            k -= 1
        stack.append(d)
    if k:
        stack = stack[:-k]
    return "".join(stack).lstrip("0") or "0"`
  },
  {
    num: 1106, title: "Parsing A Boolean Expression", slug: "parsing-a-boolean-expression", lc: "Hard",
    topic: "stacks",
    pattern: "Parentheses & nesting",
    level: 4,
    order: 360,
    core: false,
    teaches: "Evaluate nested prefix expressions with one stack: push everything, and on ')' pop the operands back to the operator and push the result.",
    learn: ["dsa_stacks", "dsa-sq-patterns"],
    pre: [394],
    hints: [
      "Like Decode String: inner expressions must finish before outer ones. Push characters, skipping commas.",
      "On ')': pop values ('t'/'f') until you hit '('; pop '(' and then the operator.",
      "Apply it: '!' -> not the single value, '&' -> all true, '|' -> any true. Push 't' or 'f'."
    ],
    steps: [
      "stack = [].",
      "For ch: skip ','; if ch != ')': push.",
      "On ')': vals = set(); pop into vals until '('; pop '('; op = pop().",
      "Push 't' if (op == '&' and 'f' not in vals) or (op == '|' and 't' in vals) or (op == '!' and 'f' in vals) else 'f'.",
      "Return stack[0] == 't'."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Recursive parsing is fine too, but don't forget '!' takes exactly one argument.",
    code: `def parseBoolExpr(expression):
    stack = []
    for ch in expression:
        if ch == ",":
            continue
        if ch != ")":
            stack.append(ch)
            continue
        vals = set()
        while stack[-1] != "(":
            vals.add(stack.pop())
        stack.pop()
        op = stack.pop()
        if op == "&":
            res = "f" not in vals
        elif op == "|":
            res = "t" in vals
        else:
            res = "f" in vals
        stack.append("t" if res else "f")
    return stack[0] == "t"`
  },
  {
    num: 224, title: "Basic Calculator", slug: "basic-calculator", lc: "Hard",
    topic: "stacks",
    pattern: "Expression evaluation",
    level: 4,
    order: 370,
    core: true,
    teaches: "With only + and - but with parentheses, keep a running result and sign; '(' saves (result, sign) on a stack, ')' restores.",
    learn: ["dsa_stacks", "dsa-sq-patterns"],
    pre: [227],
    hints: [
      "Without parentheses this is easy: result += sign * number for each number.",
      "On '(' push the current result and the sign in front of the bracket, then start fresh (result = 0, sign = 1).",
      "On ')' finish the inner number; then result = saved_result + saved_sign * result. Unary minus works naturally."
    ],
    steps: [
      "result = 0; num = 0; sign = 1; stack = [].",
      "Digit: num = num * 10 + d. '+'/'-': result += sign * num; num = 0; sign = +1/-1.",
      "'(': push result, push sign; result, sign = 0, 1.",
      "')': result += sign * num; num = 0; result = stack.pop() * result + stack.pop() (pop sign first, then saved result).",
      "Return result + sign * num."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Unary minus before '(' like '-(2+3)': the saved sign handles it; don't try to parse it as a number.",
    code: `def calculate(s):
    result, num, sign, stack = 0, 0, 1, []
    for ch in s:
        if ch.isdigit():
            num = num * 10 + int(ch)
        elif ch in "+-":
            result += sign * num
            num = 0
            sign = 1 if ch == "+" else -1
        elif ch == "(":
            stack.append(result)
            stack.append(sign)
            result, sign = 0, 1
        elif ch == ")":
            result += sign * num
            num = 0
            saved_sign = stack.pop()
            saved_result = stack.pop()
            result = saved_result + saved_sign * result
    return result + sign * num`
  },
  {
    num: 895, title: "Maximum Frequency Stack", slug: "maximum-frequency-stack", lc: "Hard",
    topic: "stacks",
    pattern: "Stack / queue design",
    level: 4,
    order: 380,
    core: false,
    teaches: "Keep one stack per frequency level: an element with frequency f sits in stacks 1..f, so the top of stack[maxfreq] is the answer.",
    learn: ["dsa_stacks", "dsa-sq-stack"],
    pre: [155],
    hints: [
      "You need the most frequent element, ties broken by most recent push. Think of frequency 'levels'.",
      "freq[x] counts x. group[f] is a stack of elements that reached frequency f, in push order.",
      "pop: x = group[maxf].pop(); freq[x] -= 1; if group[maxf] is empty, maxf -= 1."
    ],
    steps: [
      "push(x): freq[x] += 1; f = freq[x]; maxf = max(maxf, f); group[f].append(x).",
      "pop(): x = group[maxf].pop(); freq[x] -= 1; if not group[maxf]: maxf -= 1; return x."
    ],
    time: "O(1) per operation", space: "O(n)",
    trap: "A heap of (freq, time) works in O(log n) but stale entries make it messy; the group stacks never go stale.",
    code: `from collections import defaultdict

class FreqStack:
    def __init__(self):
        self.freq = defaultdict(int)
        self.group = defaultdict(list)
        self.maxf = 0

    def push(self, val):
        self.freq[val] += 1
        f = self.freq[val]
        self.maxf = max(self.maxf, f)
        self.group[f].append(val)

    def pop(self):
        x = self.group[self.maxf].pop()
        self.freq[x] -= 1
        if not self.group[self.maxf]:
            self.maxf -= 1
        return x`
  },
  {
    num: 316, title: "Remove Duplicate Letters", slug: "remove-duplicate-letters", lc: "Medium",
    topic: "stacks",
    pattern: "Monotonic stack",
    level: 4,
    order: 390,
    core: false,
    teaches: "Remove K Digits plus two rules: never add a letter twice, and only pop a letter if it appears again later.",
    learn: ["dsa_stacks", "dsa-sq-mono"],
    pre: [402],
    hints: [
      "Build the answer on an increasing stack, like Remove K Digits.",
      "But you may pop a bigger letter only if it occurs later in the string (record each letter's last index).",
      "Skip a letter already in the stack (keep a set)."
    ],
    steps: [
      "last = {c: i}; stack = []; seen = set().",
      "For i, c: if c in seen: continue.",
      "While stack and stack[-1] > c and last[stack[-1]] > i: seen.remove(stack.pop()).",
      "Push c; seen.add(c).",
      "Return ''.join(stack)."
    ],
    time: "O(n)", space: "O(1) (at most 26 letters)",
    trap: "Popping a letter that never appears again loses it from the answer entirely.",
    code: `def removeDuplicateLetters(s):
    last = {c: i for i, c in enumerate(s)}
    stack, seen = [], set()
    for i, c in enumerate(s):
        if c in seen:
            continue
        while stack and stack[-1] > c and last[stack[-1]] > i:
            seen.remove(stack.pop())
        stack.append(c)
        seen.add(c)
    return "".join(stack)`
  },
  {
    num: 456, title: "132 Pattern", slug: "132-pattern", lc: "Medium",
    topic: "stacks",
    pattern: "Monotonic stack",
    level: 4,
    order: 400,
    core: false,
    teaches: "Scan from the right with a decreasing stack; everything popped becomes a candidate '2', and any later smaller number is the '1'.",
    learn: ["dsa_stacks", "dsa-sq-mono"],
    pre: [503],
    hints: [
      "Fix the middle '3' (nums[j]). You want the largest '2' to its right that is still smaller than it, and some '1' to its left below that.",
      "Go right to left. When x pops smaller values from the stack, x can be the '3' and the largest popped value is the best '2' (third).",
      "If you ever see a number smaller than third, it is the '1': return True."
    ],
    steps: [
      "third = -inf; stack = [].",
      "For x in reversed(nums): if x < third: return True.",
      "While stack and stack[-1] < x: third = stack.pop().",
      "Push x.",
      "Return False."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Checking all triples is O(n^3); even fixing j and scanning is O(n^2).",
    code: `def find132pattern(nums):
    third, stack = float('-inf'), []
    for x in reversed(nums):
        if x < third:
            return True
        while stack and stack[-1] < x:
            third = stack.pop()
        stack.append(x)
    return False`
  },
  {
    num: 962, title: "Maximum Width Ramp", slug: "maximum-width-ramp", lc: "Medium",
    topic: "stacks",
    pattern: "Monotonic stack",
    level: 4,
    order: 410,
    core: false,
    teaches: "Only prefix minimums can be the best left end; keep them on a decreasing stack, then match right ends scanning from the back.",
    learn: ["dsa_stacks", "dsa-sq-mono"],
    pre: [739],
    hints: [
      "If i < i' and nums[i] <= nums[i'], i' is never a better left end than i. So only strictly decreasing prefix values matter.",
      "Build a stack of those indexes from the left.",
      "Scan j from the right end: while nums[stack[-1]] <= nums[j], record j - stack.pop() (it's the widest for that left end)."
    ],
    steps: [
      "stack = indexes i where nums[i] < every earlier value.",
      "For j from n - 1 down to 0: while stack and nums[stack[-1]] <= nums[j]: best = max(best, j - stack.pop()).",
      "Return best."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Sorting indexes by value also works but is O(n log n).",
    code: `def maxWidthRamp(nums):
    stack = []
    for i, x in enumerate(nums):
        if not stack or x < nums[stack[-1]]:
            stack.append(i)
    best = 0
    for j in range(len(nums) - 1, -1, -1):
        while stack and nums[stack[-1]] <= nums[j]:
            best = max(best, j - stack.pop())
    return best`
  },
  {
    num: 907, title: "Sum of Subarray Minimums", slug: "sum-of-subarray-minimums", lc: "Medium",
    topic: "stacks",
    pattern: "Monotonic stack",
    level: 4,
    order: 420,
    core: false,
    teaches: "Contribution counting: arr[i] is the minimum of (i - left) * (right - i) subarrays, where left/right are the nearest smaller elements.",
    learn: ["dsa_stacks", "dsa-sq-mono"],
    pre: [739],
    hints: [
      "Instead of looping over subarrays, ask: in how many subarrays is arr[i] the minimum?",
      "Find left[i] = index of the previous element < arr[i], right[i] = next element <= arr[i] (monotonic stacks).",
      "Answer = sum(arr[i] * (i - left[i]) * (right[i] - i)) mod 1e9+7. The < on one side and <= on the other avoids double counting equal values."
    ],
    steps: [
      "left = [-1] * n via a stack scanning left to right (pop while >= current).",
      "right = [n] * n via a stack (pop while > current, so ties go one way).",
      "Sum arr[i] * (i - left[i]) * (right[i] - i), mod 10^9 + 7."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Using strict < on both sides counts subarrays with repeated minimums twice.",
    code: `def sumSubarrayMins(arr):
    n = len(arr)
    left, right = [-1] * n, [n] * n
    stack = []
    for i, x in enumerate(arr):
        while stack and arr[stack[-1]] > x:
            right[stack.pop()] = i
        left[i] = stack[-1] if stack else -1
        stack.append(i)
    total = sum(arr[i] * (i - left[i]) * (right[i] - i) for i in range(n))
    return total % (10**9 + 7)`
  },
  {
    num: 2104, title: "Sum of Subarray Ranges", slug: "sum-of-subarray-ranges", lc: "Medium",
    topic: "stacks",
    pattern: "Monotonic stack",
    level: 4,
    order: 430,
    core: false,
    teaches: "Sum of (max - min) = (sum of subarray maxima) - (sum of subarray minima); each half is the contribution trick.",
    learn: ["dsa_stacks", "dsa-sq-mono"],
    pre: [907],
    hints: [
      "Split the range into two separate sums.",
      "Sum of minimums: exactly Sum of Subarray Minimums (without the modulo). Sum of maximums: the same with comparisons flipped.",
      "A trick: sum of maxima of arr = -(sum of minima of the negated array)."
    ],
    steps: [
      "mins(a): contribution of each element as a minimum, via one monotonic stack pass.",
      "Return -mins([-x for x in nums]) - mins(nums)."
    ],
    time: "O(n)", space: "O(n)",
    trap: "The O(n^2) double loop passes here (n <= 1000), but the follow-up asks for O(n).",
    code: `def subArrayRanges(nums):
    def sum_mins(a):
        n = len(a)
        left, right = [-1] * n, [n] * n
        stack = []
        for i, x in enumerate(a):
            while stack and a[stack[-1]] > x:
                right[stack.pop()] = i
            left[i] = stack[-1] if stack else -1
            stack.append(i)
        return sum(a[i] * (i - left[i]) * (right[i] - i) for i in range(n))

    return -sum_mins([-x for x in nums]) - sum_mins(nums)`
  },
  {
    num: 32, title: "Longest Valid Parentheses", slug: "longest-valid-parentheses", lc: "Hard",
    topic: "stacks",
    pattern: "Parentheses & nesting",
    level: 5,
    order: 440,
    core: false,
    teaches: "Keep a stack of indexes with a 'base' (the last unmatched position); each match measures i - stack[-1].",
    learn: ["dsa_stacks", "dsa-sq-patterns"],
    pre: [1249, 1106],
    hints: [
      "A valid substring ends at a ')' that matches. How far back does it reach?",
      "Store indexes. Start the stack with -1 as a base. '(' pushes i. ')' pops.",
      "After popping: if the stack is empty, push i as the new base; otherwise the valid length is i - stack[-1]."
    ],
    steps: [
      "stack = [-1]; best = 0.",
      "'(' -> push i.",
      "')' -> pop; if not stack: push i; else best = max(best, i - stack[-1]).",
      "Return best."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Measuring from the matched '(' only gives the last pair, not '()()' runs: measure from the base below it.",
    code: `def longestValidParentheses(s):
    stack, best = [-1], 0
    for i, ch in enumerate(s):
        if ch == "(":
            stack.append(i)
        else:
            stack.pop()
            if not stack:
                stack.append(i)
            else:
                best = max(best, i - stack[-1])
    return best`
  },
  {
    num: 726, title: "Number of Atoms", slug: "number-of-atoms", lc: "Hard",
    topic: "stacks",
    pattern: "Expression evaluation",
    level: 5,
    order: 450,
    core: false,
    teaches: "Parse with a stack of Counters: '(' pushes a new counter, ')' pops it, multiplies by the following number, and merges it down.",
    learn: ["dsa_stacks", "dsa-sq-patterns"],
    pre: [394],
    hints: [
      "Like Decode String, but each level holds counts of atoms instead of a string.",
      "Parse names as one uppercase letter plus following lowercase letters, then an optional number (default 1).",
      "On ')' read the multiplier, multiply every count in the popped Counter, add into the Counter below. Finally sort names."
    ],
    steps: [
      "stack = [Counter()]; i = 0.",
      "'(' -> push Counter(); i += 1.",
      "')' -> i += 1; read number m (default 1); top = pop(); for atom, c in top: stack[-1][atom] += c * m.",
      "Else read name and number; stack[-1][name] += number.",
      "Join sorted names with counts (omit 1)."
    ],
    time: "O(n^2) worst case (deep nesting re-multiplies), O(n log n) typical", space: "O(n)",
    trap: "Reading only one digit of a count like 'H12', or forgetting lowercase letters after the uppercase one ('Mg').",
    code: `from collections import Counter

def countOfAtoms(formula):
    n = len(formula)
    stack = [Counter()]
    i = 0

    def read_num(i):
        j = i
        while j < n and formula[j].isdigit():
            j += 1
        return (int(formula[i:j]) if j > i else 1), j

    while i < n:
        ch = formula[i]
        if ch == "(":
            stack.append(Counter())
            i += 1
        elif ch == ")":
            m, i = read_num(i + 1)
            top = stack.pop()
            for atom, c in top.items():
                stack[-1][atom] += c * m
        else:
            j = i + 1
            while j < n and formula[j].islower():
                j += 1
            name = formula[i:j]
            m, i = read_num(j)
            stack[-1][name] += m
    counts = stack[0]
    return "".join(a + (str(counts[a]) if counts[a] > 1 else "") for a in sorted(counts))`
  },
  {
    num: 84, title: "Largest Rectangle in Histogram", slug: "largest-rectangle-in-histogram", lc: "Hard",
    topic: "stacks",
    pattern: "Monotonic stack",
    level: 5,
    order: 460,
    core: true,
    teaches: "With an increasing stack of bars, popping a bar reveals both walls: the new top on the left, the current bar on the right.",
    learn: ["dsa_stacks", "dsa-sq-mono"],
    pre: [739, 907],
    hints: [
      "For each bar, the biggest rectangle using its full height stretches until a shorter bar on each side.",
      "Keep indexes of increasing heights. When a shorter bar i arrives, pop j: its right wall is i and its left wall is the new stack top.",
      "Width = i - stack[-1] - 1 (or i if the stack is empty). Add a 0-height bar at the end to flush the stack."
    ],
    steps: [
      "stack = []; best = 0.",
      "For i, h in enumerate(heights + [0]):",
      "  while stack and heights[stack[-1]] >= h: height = heights[stack.pop()]; left = stack[-1] if stack else -1; best = max(best, height * (i - left - 1)).",
      "  push i.",
      "Return best."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Forgetting the sentinel 0 at the end leaves increasing bars on the stack, never measured.",
    code: `def largestRectangleArea(heights):
    stack, best = [], 0
    hs = heights + [0]
    for i, h in enumerate(hs):
        while stack and hs[stack[-1]] >= h:
            height = hs[stack.pop()]
            left = stack[-1] if stack else -1
            best = max(best, height * (i - left - 1))
        stack.append(i)
    return best`
  },
  {
    num: 85, title: "Maximal Rectangle", slug: "maximal-rectangle", lc: "Hard",
    topic: "stacks",
    pattern: "Monotonic stack",
    level: 5,
    order: 470,
    core: false,
    teaches: "Turn each row into a histogram of consecutive 1s above it, then run Largest Rectangle in Histogram on every row.",
    learn: ["dsa_stacks", "dsa-sq-mono"],
    pre: [84],
    hints: [
      "Fix the bottom row of the rectangle. For each column, how tall a block of 1s stands on that row?",
      "heights[c] = heights[c] + 1 if the cell is '1' else 0. That's a histogram per row.",
      "The answer is the max of Largest Rectangle in Histogram over all rows."
    ],
    steps: [
      "heights = [0] * cols.",
      "For each row: update heights.",
      "best = max(best, largestRectangleArea(heights)) using the stack method.",
      "Return best."
    ],
    time: "O(rows * cols)", space: "O(cols)",
    trap: "Cells are the characters '0'/'1', not integers.",
    code: `def maximalRectangle(matrix):
    def largest(heights):
        stack, best = [], 0
        hs = heights + [0]
        for i, h in enumerate(hs):
            while stack and hs[stack[-1]] >= h:
                height = hs[stack.pop()]
                left = stack[-1] if stack else -1
                best = max(best, height * (i - left - 1))
            stack.append(i)
        return best

    heights = [0] * len(matrix[0])
    best = 0
    for row in matrix:
        for c, v in enumerate(row):
            heights[c] = heights[c] + 1 if v == "1" else 0
        best = max(best, largest(heights))
    return best`
  },
  {
    num: 1856, title: "Maximum Subarray Min-Product", slug: "maximum-subarray-min-product", lc: "Medium",
    topic: "stacks",
    pattern: "Monotonic stack",
    level: 5,
    order: 480,
    core: false,
    teaches: "For each element as the minimum, extend to the nearest smaller on both sides (like the histogram) and use prefix sums for the window sum.",
    learn: ["dsa_stacks", "dsa-sq-mono"],
    pre: [84],
    hints: [
      "Fix which element is the minimum. Then the subarray should be as wide as possible: until a smaller element on each side.",
      "Find those borders with a monotonic stack, exactly like Largest Rectangle in Histogram.",
      "Window sum = prefix[right] - prefix[left + 1]. Take the max of min * sum, and apply the modulo only at the end."
    ],
    steps: [
      "prefix sums pre (pre[0] = 0).",
      "Scan nums + [0] with an increasing stack.",
      "When popping j at i: left = stack[-1] if stack else -1; best = max(best, nums[j] * (pre[i] - pre[left + 1])).",
      "Return best % (10**9 + 7)."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Taking the modulo before comparing products picks the wrong maximum.",
    code: `def maxSumMinProduct(nums):
    pre = [0]
    for x in nums:
        pre.append(pre[-1] + x)
    stack, best = [], 0
    hs = nums + [0]
    for i, h in enumerate(hs):
        while stack and hs[stack[-1]] >= h:
            j = stack.pop()
            left = stack[-1] if stack else -1
            best = max(best, nums[j] * (pre[i] - pre[left + 1]))
        stack.append(i)
    return best % (10**9 + 7)`
  },
  {
    num: 239, title: "Sliding Window Maximum", slug: "sliding-window-maximum", lc: "Hard",
    topic: "stacks",
    pattern: "Monotonic deque",
    level: 5,
    order: 490,
    core: true,
    teaches: "A deque of indexes with decreasing values: the front is the window max; drop it when it leaves the window.",
    learn: ["dsa_stacks", "dsa-sq-deque"],
    pre: [739, 933],
    hints: [
      "A number smaller than a newer number to its right can never be a window maximum again. Throw it away.",
      "Keep a deque of indexes with decreasing values. Before adding i, pop from the back while nums[back] <= nums[i].",
      "Pop from the front if it is outside the window (index <= i - k). Once i >= k - 1, the front is the max."
    ],
    steps: [
      "dq = deque(); out = [].",
      "For i, x: while dq and nums[dq[-1]] <= x: dq.pop(). dq.append(i).",
      "If dq[0] <= i - k: dq.popleft().",
      "If i >= k - 1: out.append(nums[dq[0]]).",
      "Return out."
    ],
    time: "O(n)", space: "O(k)",
    trap: "Storing values instead of indexes: you can't tell when the front has slid out of the window.",
    code: `from collections import deque

def maxSlidingWindow(nums, k):
    dq, out = deque(), []
    for i, x in enumerate(nums):
        while dq and nums[dq[-1]] <= x:
            dq.pop()
        dq.append(i)
        if dq[0] <= i - k:
            dq.popleft()
        if i >= k - 1:
            out.append(nums[dq[0]])
    return out`
  },
  {
    num: 1438, title: "Longest Continuous Subarray With Absolute Diff Less Than or Equal to Limit", slug: "longest-continuous-subarray-with-absolute-diff-less-than-or-equal-to-limit", lc: "Medium",
    topic: "stacks",
    pattern: "Monotonic deque",
    level: 5,
    order: 500,
    core: false,
    teaches: "Sliding window whose validity depends on max - min: maintain both with two monotonic deques.",
    learn: ["dsa_stacks", "dsa-sq-deque"],
    pre: [239],
    hints: [
      "Use a variable-size window [left, right]. It is valid when max - min <= limit.",
      "Track the max with a decreasing deque and the min with an increasing deque (values, not just one deque).",
      "When invalid, move left forward and pop deque fronts that equal nums[left] before moving."
    ],
    steps: [
      "maxd, mind = deque(), deque(); left = 0.",
      "For right, x: pop smaller values from maxd's back, larger from mind's back; append x to both.",
      "While maxd[0] - mind[0] > limit: if nums[left] == maxd[0]: maxd.popleft(); same for mind; left += 1.",
      "best = max(best, right - left + 1)."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Popping equal values from the back (using <= / >=) is fine only if you store indexes; with values, keep duplicates (use < and >).",
    code: `from collections import deque

def longestSubarray(nums, limit):
    maxd, mind = deque(), deque()
    left = best = 0
    for right, x in enumerate(nums):
        while maxd and maxd[-1] < x:
            maxd.pop()
        while mind and mind[-1] > x:
            mind.pop()
        maxd.append(x)
        mind.append(x)
        while maxd[0] - mind[0] > limit:
            if nums[left] == maxd[0]:
                maxd.popleft()
            if nums[left] == mind[0]:
                mind.popleft()
            left += 1
        best = max(best, right - left + 1)
    return best`
  },
  {
    num: 1696, title: "Jump Game VI", slug: "jump-game-vi", lc: "Medium",
    topic: "stacks",
    pattern: "Monotonic deque",
    level: 5,
    order: 510,
    core: false,
    teaches: "A DP whose transition is 'max of the last k values' becomes O(n) with a sliding-window-max deque over the dp array.",
    learn: ["dsa_stacks", "dsa-sq-deque"],
    pre: [239],
    hints: [
      "Let dp[i] = best score ending at i. dp[i] = nums[i] + max(dp[i-k .. i-1]).",
      "That max over a sliding window is exactly Sliding Window Maximum, applied to dp as you fill it."
    ],
    steps: [
      "dp[0] = nums[0]; dq = deque([0]).",
      "For i in 1..n-1: if dq[0] < i - k: popleft. dp[i] = nums[i] + dp[dq[0]].",
      "While dq and dp[dq[-1]] <= dp[i]: pop. Append i.",
      "Return dp[-1]."
    ],
    time: "O(n)", space: "O(n)",
    trap: "The plain DP loops over k previous values: O(n k), too slow for n, k up to 10^5.",
    code: `from collections import deque

def maxResult(nums, k):
    n = len(nums)
    dp = [0] * n
    dp[0] = nums[0]
    dq = deque([0])
    for i in range(1, n):
        if dq[0] < i - k:
            dq.popleft()
        dp[i] = nums[i] + dp[dq[0]]
        while dq and dp[dq[-1]] <= dp[i]:
            dq.pop()
        dq.append(i)
    return dp[-1]`
  },
  {
    num: 1499, title: "Max Value of Equation", slug: "max-value-of-equation", lc: "Hard",
    topic: "stacks",
    pattern: "Monotonic deque",
    level: 5,
    order: 520,
    core: false,
    teaches: "Rewrite yi + yj + |xi - xj| as (yi - xi) + (yj + xj); keep the max of (y - x) over a window of x with a deque.",
    learn: ["dsa_stacks", "dsa-sq-deque"],
    pre: [239],
    hints: [
      "Points are sorted by x, so for i < j: |xi - xj| = xj - xi. Split the expression into a part for i and a part for j.",
      "For each j, you want the max of (yi - xi) among earlier points with xj - xi <= k: a sliding-window maximum.",
      "Deque holds (x, y - x) with decreasing y - x; drop fronts with x too far left before using the front."
    ],
    steps: [
      "dq = deque(); best = -inf.",
      "For x, y: while dq and x - dq[0][0] > k: popleft.",
      "If dq: best = max(best, dq[0][1] + y + x).",
      "While dq and dq[-1][1] <= y - x: pop. Append (x, y - x).",
      "Return best."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Adding the current point to the deque before computing best pairs it with itself.",
    code: `from collections import deque

def findMaxValueOfEquation(points, k):
    dq, best = deque(), float('-inf')
    for x, y in points:
        while dq and x - dq[0][0] > k:
            dq.popleft()
        if dq:
            best = max(best, dq[0][1] + y + x)
        while dq and dq[-1][1] <= y - x:
            dq.pop()
        dq.append((x, y - x))
    return best`
  },
  {
    num: 2289, title: "Steps to Make Array Non-decreasing", slug: "steps-to-make-array-non-decreasing", lc: "Medium",
    topic: "stacks",
    pattern: "Monotonic stack",
    level: 6,
    order: 530,
    core: false,
    teaches: "Monotonic stack carrying a DP value: each element's removal time is 1 + the max removal time of the smaller elements between it and its killer.",
    learn: ["dsa_stacks", "dsa-sq-mono"],
    pre: [84],
    hints: [
      "An element is removed by the nearest bigger element to its LEFT. But it must wait until everything between them has been removed.",
      "Scan left to right with a stack of (value, steps). For x, pop all values <= x, tracking the max steps among them.",
      "If the stack is now empty, x is never removed (steps 0); otherwise steps = max popped + 1. Answer = max steps."
    ],
    steps: [
      "stack = []; ans = 0.",
      "For x: t = 0; while stack and stack[-1][0] <= x: t = max(t, stack.pop()[1]).",
      "t = t + 1 if stack else 0. Push (x, t); ans = max(ans, t).",
      "Return ans."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Simulating round by round is O(n^2) on inputs like [n, 1, 2, 3, ..., n-1].",
    code: `def totalSteps(nums):
    stack, ans = [], 0
    for x in nums:
        t = 0
        while stack and stack[-1][0] <= x:
            t = max(t, stack.pop()[1])
        t = t + 1 if stack else 0
        stack.append((x, t))
        ans = max(ans, t)
    return ans`
  },
  {
    num: 862, title: "Shortest Subarray with Sum at Least K", slug: "shortest-subarray-with-sum-at-least-k", lc: "Hard",
    topic: "stacks",
    pattern: "Monotonic deque",
    level: 6,
    order: 540,
    core: false,
    teaches: "With negative numbers, use prefix sums and an increasing deque of prefix indexes: pop the front while it forms a valid subarray, pop the back while it's not useful.",
    learn: ["dsa_stacks", "dsa-sq-deque"],
    pre: [239],
    hints: [
      "A sliding window fails because negatives break monotonicity. Use prefix sums: want j > i with P[j] - P[i] >= k and j - i smallest.",
      "Keep a deque of indexes with increasing P. For each j, while P[j] - P[front] >= k, record j - front and pop the front (it can't do better later).",
      "Before appending j, pop from the back while P[back] >= P[j]: j is a later, smaller start, so the back is never better."
    ],
    steps: [
      "P = prefix sums with P[0] = 0; dq = deque(); best = inf.",
      "For j in 0..n: while dq and P[j] - P[dq[0]] >= k: best = min(best, j - dq.popleft()).",
      "While dq and P[dq[-1]] >= P[j]: dq.pop(). Append j.",
      "Return best if finite else -1."
    ],
    time: "O(n)", space: "O(n)",
    trap: "The classic two-pointer window only works for non-negative numbers.",
    code: `from collections import deque

def shortestSubarray(nums, k):
    P = [0]
    for x in nums:
        P.append(P[-1] + x)
    dq, best = deque(), float('inf')
    for j, pj in enumerate(P):
        while dq and pj - P[dq[0]] >= k:
            best = min(best, j - dq.popleft())
        while dq and P[dq[-1]] >= pj:
            dq.pop()
        dq.append(j)
    return best if best != float('inf') else -1`
  }
);
