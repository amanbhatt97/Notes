// problems/linkedlist.js — Linked Lists ladder
PROBLEMS.push(
  {
    num: 1290, title: "Convert Binary Number in a Linked List to Integer", slug: "convert-binary-number-in-a-linked-list-to-integer", lc: "Easy",
    topic: "linkedlist",
    pattern: "Traversal & counting",
    level: 1,
    order: 10,
    core: false,
    teaches: "Walk a list with cur = cur.next, carrying a running value as you go.",
    learn: ["dsa_linkedlist", "dsa-ll-ops"],
    pre: [],
    hints: [
      "Reading binary left to right: each new bit doubles what you had and adds the bit.",
      "value = value * 2 + node.val for every node from head to the end."
    ],
    steps: [
      "value = 0; cur = head.",
      "While cur: value = value * 2 + cur.val; cur = cur.next.",
      "Return value."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Collecting the bits into a string and calling int(s, 2) works but uses O(n) extra space.",
    code: `def getDecimalValue(head):
    value = 0
    while head:
        value = value * 2 + head.val
        head = head.next
    return value`
  },
  {
    num: 2807, title: "Insert Greatest Common Divisors in Linked List", slug: "insert-greatest-common-divisors-in-linked-list", lc: "Medium",
    topic: "linkedlist",
    pattern: "Traversal & counting",
    level: 1,
    order: 20,
    core: false,
    teaches: "Insert a node between cur and cur.next: new.next = cur.next, then cur.next = new.",
    learn: ["dsa_linkedlist", "dsa-ll-ops"],
    pre: [1290],
    hints: [
      "For each adjacent pair (cur, cur.next), you create one new node and link it in between.",
      "After inserting, jump cur two steps (past the node you just added)."
    ],
    steps: [
      "cur = head.",
      "While cur.next: node = ListNode(gcd(cur.val, cur.next.val), cur.next); cur.next = node; cur = node.next.",
      "Return head."
    ],
    time: "O(n log V)", space: "O(1) extra",
    trap: "Setting cur.next = node before saving cur.next loses the rest of the list.",
    code: `from math import gcd

def insertGreatestCommonDivisors(head):
    cur = head
    while cur.next:
        node = ListNode(gcd(cur.val, cur.next.val), cur.next)
        cur.next = node
        cur = node.next
    return head`
  },
  {
    num: 203, title: "Remove Linked List Elements", slug: "remove-linked-list-elements", lc: "Easy",
    topic: "linkedlist",
    pattern: "Dummy head & deletion",
    level: 1,
    order: 30,
    core: true,
    teaches: "A dummy node before head means even the first node can be deleted with the same prev.next = prev.next.next.",
    learn: ["dsa_linkedlist", "dsa-ll-dummy"],
    pre: [],
    hints: [
      "Deleting the head is a special case... unless something sits in front of it.",
      "Put a dummy before head. Walk prev: if prev.next.val == val skip it, else advance prev."
    ],
    steps: [
      "dummy = ListNode(0, head); prev = dummy.",
      "While prev.next: if prev.next.val == val: prev.next = prev.next.next; else prev = prev.next.",
      "Return dummy.next."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Advancing prev right after a deletion skips checking the new prev.next (fails on 7,7,7).",
    code: `def removeElements(head, val):
    dummy = ListNode(0, head)
    prev = dummy
    while prev.next:
        if prev.next.val == val:
            prev.next = prev.next.next
        else:
            prev = prev.next
    return dummy.next`
  },
  {
    num: 83, title: "Remove Duplicates from Sorted List", slug: "remove-duplicates-from-sorted-list", lc: "Easy",
    topic: "linkedlist",
    pattern: "Dummy head & deletion",
    level: 1,
    order: 40,
    core: false,
    teaches: "In a sorted list, duplicates sit next to each other: unlink cur.next while it equals cur.",
    learn: ["dsa_linkedlist", "dsa-ll-ops"],
    pre: [203],
    hints: [
      "Duplicates in a sorted list are always neighbours.",
      "If cur.next.val == cur.val, bypass cur.next; only move cur when the next value differs."
    ],
    steps: [
      "cur = head.",
      "While cur and cur.next: if equal, cur.next = cur.next.next; else cur = cur.next.",
      "Return head."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Moving cur forward after removing one copy leaves a third copy behind.",
    code: `def deleteDuplicates(head):
    cur = head
    while cur and cur.next:
        if cur.next.val == cur.val:
            cur.next = cur.next.next
        else:
            cur = cur.next
    return head`
  },
  {
    num: 237, title: "Delete Node in a Linked List", slug: "delete-node-in-a-linked-list", lc: "Medium",
    topic: "linkedlist",
    pattern: "Dummy head & deletion",
    level: 1,
    order: 50,
    core: false,
    teaches: "Without access to the previous node, copy the next node's value into this one and delete the next node instead.",
    learn: ["dsa_linkedlist", "dsa-ll-ops"],
    pre: [203],
    hints: [
      "You can't reach the node before this one. Which node CAN you remove?",
      "Overwrite node.val with node.next.val, then skip node.next."
    ],
    steps: [
      "node.val = node.next.val.",
      "node.next = node.next.next."
    ],
    time: "O(1)", space: "O(1)",
    trap: "It only works because the node is guaranteed not to be the tail.",
    code: `def deleteNode(node):
    node.val = node.next.val
    node.next = node.next.next`
  },
  {
    num: 876, title: "Middle of the Linked List", slug: "middle-of-the-linked-list", lc: "Easy",
    topic: "linkedlist",
    pattern: "Fast & slow pointers",
    level: 1,
    order: 60,
    core: true,
    teaches: "Move slow one step and fast two steps; when fast hits the end, slow is in the middle.",
    learn: ["dsa_linkedlist", "dsa-ll-fastslow"],
    pre: [],
    hints: [
      "If one pointer moves twice as fast as another, where is the slow one when the fast one finishes?",
      "Loop while fast and fast.next; return slow. With even length this lands on the second middle."
    ],
    steps: [
      "slow = fast = head.",
      "While fast and fast.next: slow = slow.next; fast = fast.next.next.",
      "Return slow."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Looping while fast.next and fast.next.next returns the FIRST middle for even lengths.",
    code: `def middleNode(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow`
  },
  {
    num: 206, title: "Reverse Linked List", slug: "reverse-linked-list", lc: "Easy",
    topic: "linkedlist",
    pattern: "In-place reversal",
    level: 1,
    order: 70,
    core: true,
    teaches: "Reverse in place with three pointers: save next, point cur back to prev, step forward.",
    learn: ["dsa_linkedlist", "dsa-ll-problems"],
    pre: [],
    hints: [
      "Each node's next must end up pointing at the node before it. What must you save before changing cur.next?",
      "prev = None, cur = head; loop: nxt = cur.next; cur.next = prev; prev, cur = cur, nxt."
    ],
    steps: [
      "prev, cur = None, head.",
      "While cur: nxt = cur.next; cur.next = prev; prev = cur; cur = nxt.",
      "Return prev."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Returning head: after the loop head is the tail; the new head is prev.",
    code: `def reverseList(head):
    prev, cur = None, head
    while cur:
        nxt = cur.next
        cur.next = prev
        prev, cur = cur, nxt
    return prev`
  },
  {
    num: 2181, title: "Merge Nodes in Between Zeros", slug: "merge-nodes-in-between-zeros", lc: "Medium",
    topic: "linkedlist",
    pattern: "Traversal & counting",
    level: 2,
    order: 80,
    core: false,
    teaches: "Walk once, summing between markers, and write each sum into a new chain built behind a tail pointer.",
    learn: ["dsa_linkedlist", "dsa-ll-ops"],
    pre: [1290],
    hints: [
      "Every zero ends a group. Keep a running sum and emit it when you hit a zero.",
      "Build the answer with a dummy + tail (or reuse the zero nodes to store the sums)."
    ],
    steps: [
      "dummy = tail = ListNode(); s = 0; cur = head.next.",
      "For each node: if val == 0: tail.next = ListNode(s); tail = tail.next; s = 0. Else s += val.",
      "Return dummy.next."
    ],
    time: "O(n)", space: "O(1) extra besides the output",
    trap: "The list starts with a 0; begin from head.next or you emit an empty sum of 0.",
    code: `def mergeNodes(head):
    dummy = tail = ListNode()
    s = 0
    cur = head.next
    while cur:
        if cur.val == 0:
            tail.next = ListNode(s)
            tail = tail.next
            s = 0
        else:
            s += cur.val
        cur = cur.next
    return dummy.next`
  },
  {
    num: 3217, title: "Delete Nodes From Linked List Present in Array", slug: "delete-nodes-from-linked-list-present-in-array", lc: "Medium",
    topic: "linkedlist",
    pattern: "Dummy head & deletion",
    level: 2,
    order: 90,
    core: false,
    teaches: "Dummy-head deletion plus a set for O(1) 'should I delete this?' checks.",
    learn: ["dsa_linkedlist", "dsa-ll-dummy"],
    pre: [203],
    hints: [
      "This is Remove Linked List Elements, but with many values to remove.",
      "Turn nums into a set first, so each check is O(1)."
    ],
    steps: [
      "bad = set(nums); dummy = ListNode(0, head); prev = dummy.",
      "While prev.next: if prev.next.val in bad: unlink it; else prev = prev.next.",
      "Return dummy.next."
    ],
    time: "O(n + m)", space: "O(m)",
    trap: "Checking 'val in nums' on the list makes it O(n * m).",
    code: `def modifiedList(nums, head):
    bad = set(nums)
    dummy = ListNode(0, head)
    prev = dummy
    while prev.next:
        if prev.next.val in bad:
            prev.next = prev.next.next
        else:
            prev = prev.next
    return dummy.next`
  },
  {
    num: 707, title: "Design Linked List", slug: "design-linked-list", lc: "Medium",
    topic: "linkedlist",
    pattern: "Dummy head & deletion",
    level: 2,
    order: 100,
    core: false,
    teaches: "Build the list class yourself: a dummy head plus a size counter makes every insert/delete one code path.",
    learn: ["dsa_linkedlist", "dsa-ll-dummy"],
    pre: [203, 2807],
    hints: [
      "Keep self.dummy (a sentinel before the real head) and self.size.",
      "Write one helper that returns the node just BEFORE position i (walk i steps from the dummy). Every operation uses it.",
      "Validate indexes first: get/delete need 0 <= i < size; addAtIndex allows i == size."
    ],
    steps: [
      "__init__: dummy = ListNode(0); size = 0.",
      "_prev(i): node = dummy; repeat i times node = node.next; return node.",
      "get(i): invalid -> -1; else _prev(i).next.val.",
      "addAtIndex(i, v): if i > size return; p = _prev(i); p.next = ListNode(v, p.next); size += 1. addAtHead/Tail call it with 0 / size.",
      "deleteAtIndex(i): if valid, p = _prev(i); p.next = p.next.next; size -= 1."
    ],
    time: "O(i) per operation", space: "O(n)",
    trap: "Forgetting to update size, or allowing deleteAtIndex(size), corrupts later operations.",
    code: `class MyLinkedList:
    def __init__(self):
        self.dummy = ListNode(0)
        self.size = 0

    def _prev(self, index):
        node = self.dummy
        for _ in range(index):
            node = node.next
        return node

    def get(self, index):
        if index < 0 or index >= self.size:
            return -1
        return self._prev(index).next.val

    def addAtHead(self, val):
        self.addAtIndex(0, val)

    def addAtTail(self, val):
        self.addAtIndex(self.size, val)

    def addAtIndex(self, index, val):
        if index > self.size:
            return
        p = self._prev(index)
        p.next = ListNode(val, p.next)
        self.size += 1

    def deleteAtIndex(self, index):
        if 0 <= index < self.size:
            p = self._prev(index)
            p.next = p.next.next
            self.size -= 1`
  },
  {
    num: 141, title: "Linked List Cycle", slug: "linked-list-cycle", lc: "Easy",
    topic: "linkedlist",
    pattern: "Fast & slow pointers",
    level: 2,
    order: 110,
    core: true,
    teaches: "Floyd's idea: in a loop, the fast pointer gains one step per move and must land on the slow one.",
    learn: ["dsa_linkedlist", "dsa-ll-fastslow"],
    pre: [876],
    hints: [
      "If there is no cycle, the fast pointer simply reaches the end.",
      "If there is a cycle, fast laps slow. Check slow is fast after each move."
    ],
    steps: [
      "slow = fast = head.",
      "While fast and fast.next: slow = slow.next; fast = fast.next.next; if slow is fast: return True.",
      "Return False."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Comparing values (slow.val == fast.val) instead of identity gives false positives on repeated values.",
    code: `def hasCycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True
    return False`
  },
  {
    num: 2095, title: "Delete the Middle Node of a Linked List", slug: "delete-the-middle-node-of-a-linked-list", lc: "Medium",
    topic: "linkedlist",
    pattern: "Fast & slow pointers",
    level: 2,
    order: 120,
    core: false,
    teaches: "To delete the middle you need the node BEFORE it: give fast a head start of one double step.",
    learn: ["dsa_linkedlist", "dsa-ll-fastslow"],
    pre: [876, 203],
    hints: [
      "Finding the middle is 876. But to unlink it you need its predecessor.",
      "Start slow at head and fast at head.next.next; when fast stops, slow is just before the middle.",
      "A single-node list becomes empty."
    ],
    steps: [
      "If head.next is None return None.",
      "slow = head; fast = head.next.next.",
      "While fast and fast.next: slow = slow.next; fast = fast.next.next.",
      "slow.next = slow.next.next; return head."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Starting both at head stops ON the middle, and you can't unlink a node from itself.",
    code: `def deleteMiddle(head):
    if not head.next:
        return None
    slow, fast = head, head.next.next
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    slow.next = slow.next.next
    return head`
  },
  {
    num: 19, title: "Remove Nth Node From End of List", slug: "remove-nth-node-from-end-of-list", lc: "Medium",
    topic: "linkedlist",
    pattern: "Fast & slow pointers",
    level: 2,
    order: 130,
    core: true,
    teaches: "Two pointers with a fixed gap: move the lead n steps ahead, then move both; the trailer stops before the target.",
    learn: ["dsa_linkedlist", "dsa-ll-patterns"],
    pre: [203, 876],
    hints: [
      "If one pointer is n nodes ahead of another, where is the trailing one when the leader reaches the end?",
      "Start both at a dummy before head. Move fast n + 1 steps, then move both until fast is None; slow.next is the node to delete."
    ],
    steps: [
      "dummy = ListNode(0, head); slow = fast = dummy.",
      "Move fast n + 1 times.",
      "While fast: slow = slow.next; fast = fast.next.",
      "slow.next = slow.next.next; return dummy.next."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Without the dummy, deleting the head (n == length) needs a special case.",
    code: `def removeNthFromEnd(head, n):
    dummy = ListNode(0, head)
    slow = fast = dummy
    for _ in range(n + 1):
        fast = fast.next
    while fast:
        slow = slow.next
        fast = fast.next
    slow.next = slow.next.next
    return dummy.next`
  },
  {
    num: 160, title: "Intersection of Two Linked Lists", slug: "intersection-of-two-linked-lists", lc: "Easy",
    topic: "linkedlist",
    pattern: "Fast & slow pointers",
    level: 2,
    order: 140,
    core: false,
    teaches: "Two pointers that switch to the other list's head after finishing walk equal distances and meet at the junction.",
    learn: ["dsa_linkedlist", "dsa-ll-patterns"],
    pre: [876],
    hints: [
      "The lists may have different lengths before they join. How could two walkers cancel out that difference?",
      "Walker A goes through list A then list B; walker B goes through B then A. Both travel a + b + c steps.",
      "They meet at the intersection, or both become None at the same time."
    ],
    steps: [
      "a, b = headA, headB.",
      "While a is not b: a = a.next if a else headB; b = b.next if b else headA.",
      "Return a."
    ],
    time: "O(m + n)", space: "O(1)",
    trap: "Comparing node values instead of node identity: different nodes can hold equal values.",
    code: `def getIntersectionNode(headA, headB):
    a, b = headA, headB
    while a is not b:
        a = a.next if a else headB
        b = b.next if b else headA
    return a`
  },
  {
    num: 234, title: "Palindrome Linked List", slug: "palindrome-linked-list", lc: "Easy",
    topic: "linkedlist",
    pattern: "In-place reversal",
    level: 2,
    order: 150,
    core: true,
    teaches: "Combine two basics: find the middle with fast/slow, reverse the second half, compare the halves.",
    learn: ["dsa_linkedlist", "dsa-ll-problems"],
    pre: [876, 206],
    hints: [
      "With an array you would compare from both ends. A singly linked list can't walk backwards... unless you reverse part of it.",
      "Find the middle (876), reverse from there (206), then walk both halves comparing values."
    ],
    steps: [
      "Find the middle with slow/fast.",
      "Reverse the list starting at slow.",
      "Walk p = head and q = reversed half while q: if values differ return False.",
      "Return True."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Copying values to a Python list and checking a == a[::-1] is O(n) space; the follow-up asks for O(1).",
    code: `def isPalindrome(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    prev = None
    while slow:
        nxt = slow.next
        slow.next = prev
        prev, slow = slow, nxt
    p, q = head, prev
    while q:
        if p.val != q.val:
            return False
        p, q = p.next, q.next
    return True`
  },
  {
    num: 21, title: "Merge Two Sorted Lists", slug: "merge-two-sorted-lists", lc: "Easy",
    topic: "linkedlist",
    pattern: "Merge & splice",
    level: 2,
    order: 160,
    core: true,
    teaches: "Merge by re-linking: a dummy head and a tail pointer that always takes the smaller front node.",
    learn: ["dsa_linkedlist", "dsa-ll-problems"],
    pre: [203],
    hints: [
      "At each step, which of the two front nodes should come next in the result?",
      "Use dummy + tail; attach the smaller front node, advance that list; at the end attach whatever is left."
    ],
    steps: [
      "dummy = tail = ListNode().",
      "While l1 and l2: attach the smaller one to tail, advance it and tail.",
      "tail.next = l1 or l2.",
      "Return dummy.next."
    ],
    time: "O(m + n)", space: "O(1)",
    trap: "Forgetting to attach the leftover list after the loop drops its nodes.",
    code: `def mergeTwoLists(list1, list2):
    dummy = tail = ListNode()
    while list1 and list2:
        if list1.val <= list2.val:
            tail.next, list1 = list1, list1.next
        else:
            tail.next, list2 = list2, list2.next
        tail = tail.next
    tail.next = list1 or list2
    return dummy.next`
  },
  {
    num: 1669, title: "Merge In Between Linked Lists", slug: "merge-in-between-linked-lists", lc: "Medium",
    topic: "linkedlist",
    pattern: "Merge & splice",
    level: 2,
    order: 170,
    core: false,
    teaches: "Splicing: find the node before the cut and the node after it, then stitch the other list in between.",
    learn: ["dsa_linkedlist", "dsa-ll-ops"],
    pre: [21],
    hints: [
      "You need two anchor nodes in list1: the one at index a - 1 and the one at index b + 1.",
      "Point the first anchor at list2's head, and list2's tail at the second anchor."
    ],
    steps: [
      "left = node at index a - 1; right = node at index b + 1 (walk from list1).",
      "left.next = list2; walk to list2's tail; tail.next = right.",
      "Return list1."
    ],
    time: "O(n + m)", space: "O(1)",
    trap: "Walking to index b instead of b + 1 keeps node b in the result.",
    code: `def mergeInBetween(list1, a, b, list2):
    left = list1
    for _ in range(a - 1):
        left = left.next
    right = left
    for _ in range(b - a + 2):
        right = right.next
    left.next = list2
    while list2.next:
        list2 = list2.next
    list2.next = right
    return list1`
  },
  {
    num: 2, title: "Add Two Numbers", slug: "add-two-numbers", lc: "Medium",
    topic: "linkedlist",
    pattern: "Digit-by-digit arithmetic",
    level: 2,
    order: 180,
    core: true,
    teaches: "Grade-school addition on lists: digits are already in reverse order, so add front to front with a carry.",
    learn: ["dsa_linkedlist", "dsa-ll-patterns"],
    pre: [21],
    hints: [
      "The lists store the ones digit first, which is exactly the order you add in by hand.",
      "Loop while l1 or l2 or carry: add available digits plus carry, append total % 10, carry = total // 10."
    ],
    steps: [
      "dummy = tail = ListNode(); carry = 0.",
      "While l1 or l2 or carry: s = carry + (l1.val if l1) + (l2.val if l2); tail.next = ListNode(s % 10); carry = s // 10; advance.",
      "Return dummy.next."
    ],
    time: "O(max(m, n))", space: "O(1) extra besides the output",
    trap: "Stopping when both lists end loses a final carry (5 + 5 = 10 needs a new node).",
    code: `def addTwoNumbers(l1, l2):
    dummy = tail = ListNode()
    carry = 0
    while l1 or l2 or carry:
        s = carry
        if l1:
            s += l1.val
            l1 = l1.next
        if l2:
            s += l2.val
            l2 = l2.next
        tail.next = ListNode(s % 10)
        tail = tail.next
        carry = s // 10
    return dummy.next`
  },
  {
    num: 61, title: "Rotate List", slug: "rotate-list", lc: "Medium",
    topic: "linkedlist",
    pattern: "Traversal & counting",
    level: 3,
    order: 190,
    core: false,
    teaches: "Measure the length, close the list into a ring, then cut it at the new tail.",
    learn: ["dsa_linkedlist", "dsa-ll-ops"],
    pre: [19],
    hints: [
      "Rotating by k equals rotating by k % length. Why not compute the length first?",
      "Join the tail to head to form a ring, walk length - k % length - 1 steps from head to the new tail, and break the ring after it."
    ],
    steps: [
      "If not head: return head. Count length n and find the tail.",
      "k %= n; if k == 0 return head.",
      "tail.next = head; walk new_tail = n - k - 1 steps from head.",
      "new_head = new_tail.next; new_tail.next = None; return new_head."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Rotating one step at a time k times is O(k n) and k can be 2*10^9.",
    code: `def rotateRight(head, k):
    if not head:
        return head
    n, tail = 1, head
    while tail.next:
        tail = tail.next
        n += 1
    k %= n
    if k == 0:
        return head
    tail.next = head
    new_tail = head
    for _ in range(n - k - 1):
        new_tail = new_tail.next
    new_head = new_tail.next
    new_tail.next = None
    return new_head`
  },
  {
    num: 725, title: "Split Linked List in Parts", slug: "split-linked-list-in-parts", lc: "Medium",
    topic: "linkedlist",
    pattern: "Traversal & counting",
    level: 3,
    order: 200,
    core: false,
    teaches: "Count first, then compute each part's size (n // k, plus one for the first n % k parts) and cut.",
    learn: ["dsa_linkedlist", "dsa-ll-ops"],
    pre: [61],
    hints: [
      "You can't split evenly without knowing the length. Count it.",
      "Part i gets n // k nodes, plus one extra if i < n % k. Walk that many nodes, then cut the link."
    ],
    steps: [
      "n = length; base, extra = divmod(n, k).",
      "For i in range(k): head_i = cur; size = base + (i < extra).",
      "Walk size - 1 steps; if cur: nxt = cur.next, cur.next = None, cur = nxt.",
      "Append head_i (None when size is 0)."
    ],
    time: "O(n + k)", space: "O(k) for the output",
    trap: "Forgetting to cut (cur.next = None) leaves each part holding the rest of the list.",
    code: `def splitListToParts(head, k):
    n, cur = 0, head
    while cur:
        n += 1
        cur = cur.next
    base, extra = divmod(n, k)
    parts, cur = [], head
    for i in range(k):
        part_head = cur
        size = base + (1 if i < extra else 0)
        for _ in range(size - 1):
            cur = cur.next
        if cur:
            nxt = cur.next
            cur.next = None
            cur = nxt
        parts.append(part_head if size else None)
    return parts`
  },
  {
    num: 2058, title: "Find the Minimum and Maximum Number of Nodes Between Critical Points", slug: "find-the-minimum-and-maximum-number-of-nodes-between-critical-points", lc: "Medium",
    topic: "linkedlist",
    pattern: "Traversal & counting",
    level: 3,
    order: 210,
    core: false,
    teaches: "One pass with a three-node window (prev, cur, next), remembering the first and previous critical index.",
    learn: ["dsa_linkedlist", "dsa-ll-ops"],
    pre: [1290],
    hints: [
      "A critical point is a strict local max or min: compare cur with prev and cur.next.",
      "Max distance = last critical - first critical. Min distance is the smallest gap between consecutive critical points.",
      "Fewer than two critical points: return [-1, -1]."
    ],
    steps: [
      "prev = head; cur = head.next; i = 1; first = last = -1; best = inf.",
      "While cur.next: if cur is a local max or min: if first == -1 first = i else best = min(best, i - last); last = i.",
      "Advance prev, cur, i.",
      "Return [-1, -1] if first == last else [best, last - first]."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Comparing with the first critical point for the minimum distance; you need consecutive ones.",
    code: `def nodesBetweenCriticalPoints(head):
    prev, cur, i = head, head.next, 1
    first = last = -1
    best = float('inf')
    while cur.next:
        nxt = cur.next
        if (cur.val > prev.val and cur.val > nxt.val) or (cur.val < prev.val and cur.val < nxt.val):
            if first == -1:
                first = i
            else:
                best = min(best, i - last)
            last = i
        prev, cur, i = cur, nxt, i + 1
    if first == last:
        return [-1, -1]
    return [best, last - first]`
  },
  {
    num: 82, title: "Remove Duplicates from Sorted List II", slug: "remove-duplicates-from-sorted-list-ii", lc: "Medium",
    topic: "linkedlist",
    pattern: "Dummy head & deletion",
    level: 3,
    order: 220,
    core: false,
    teaches: "Remove every copy of a duplicated value: from prev, skip the whole run, and only advance prev past unique nodes.",
    learn: ["dsa_linkedlist", "dsa-ll-dummy"],
    pre: [83],
    hints: [
      "Now the first copy must go too, and it might be the head: use a dummy.",
      "From prev, if prev.next and prev.next.next share a value, skip all nodes with that value; otherwise prev moves forward."
    ],
    steps: [
      "dummy = ListNode(0, head); prev = dummy.",
      "While prev.next: cur = prev.next; if cur.next and cur.next.val == cur.val: v = cur.val; skip while prev.next and prev.next.val == v.",
      "Else prev = prev.next.",
      "Return dummy.next."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Advancing prev right after skipping a run misses a second duplicated run directly after it (1,1,2,2,3).",
    code: `def deleteDuplicates(head):
    dummy = ListNode(0, head)
    prev = dummy
    while prev.next:
        cur = prev.next
        if cur.next and cur.next.val == cur.val:
            v = cur.val
            while prev.next and prev.next.val == v:
                prev.next = prev.next.next
        else:
            prev = prev.next
    return dummy.next`
  },
  {
    num: 86, title: "Partition List", slug: "partition-list", lc: "Medium",
    topic: "linkedlist",
    pattern: "Dummy head & deletion",
    level: 3,
    order: 230,
    core: false,
    teaches: "Build two separate lists with two dummy heads (small and big), then join them.",
    learn: ["dsa_linkedlist", "dsa-ll-dummy"],
    pre: [21],
    hints: [
      "Instead of moving nodes around in place, deal them into two piles.",
      "Use two dummies and two tails; append each node to 'less' or 'rest' in order; finally link less_tail to rest_head."
    ],
    steps: [
      "d1 = t1 = ListNode(); d2 = t2 = ListNode().",
      "For each node: append to t1 if val < x else to t2.",
      "t2.next = None; t1.next = d2.next.",
      "Return d1.next."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Not setting t2.next = None leaves a cycle through an old next pointer.",
    code: `def partition(head, x):
    d1 = t1 = ListNode()
    d2 = t2 = ListNode()
    while head:
        if head.val < x:
            t1.next = head
            t1 = head
        else:
            t2.next = head
            t2 = head
        head = head.next
    t2.next = None
    t1.next = d2.next
    return d1.next`
  },
  {
    num: 328, title: "Odd Even Linked List", slug: "odd-even-linked-list", lc: "Medium",
    topic: "linkedlist",
    pattern: "Dummy head & deletion",
    level: 3,
    order: 240,
    core: false,
    teaches: "Weave two chains in one pass (odd positions and even positions), then attach evens after odds.",
    learn: ["dsa_linkedlist", "dsa-ll-ops"],
    pre: [86],
    hints: [
      "It's Partition List by position instead of by value, and it must be O(1) space.",
      "Keep odd = head, even = head.next, even_head = even. Repeatedly: odd.next = even.next; odd = odd.next; even.next = odd.next; even = even.next."
    ],
    steps: [
      "If not head return head. odd = head; even = even_head = head.next.",
      "While even and even.next: odd.next = even.next; odd = odd.next; even.next = odd.next; even = even.next.",
      "odd.next = even_head; return head."
    ],
    time: "O(n)", space: "O(1)",
    trap: "It's about node positions (1st, 3rd, ...), not odd or even values.",
    code: `def oddEvenList(head):
    if not head:
        return head
    odd, even = head, head.next
    even_head = even
    while even and even.next:
        odd.next = even.next
        odd = odd.next
        even.next = odd.next
        even = even.next
    odd.next = even_head
    return head`
  },
  {
    num: 142, title: "Linked List Cycle II", slug: "linked-list-cycle-ii", lc: "Medium",
    topic: "linkedlist",
    pattern: "Fast & slow pointers",
    level: 3,
    order: 250,
    core: true,
    teaches: "After fast and slow meet, a pointer from head and one from the meeting point, both at speed 1, meet at the cycle start.",
    learn: ["dsa_linkedlist", "dsa-ll-fastslow"],
    pre: [141],
    hints: [
      "First detect the cycle like in Linked List Cycle.",
      "Math: if the tail before the cycle has length a, the meeting point is a steps (mod cycle length) before the cycle start.",
      "So reset one pointer to head and move both one step at a time; where they meet is the answer."
    ],
    steps: [
      "Run slow/fast; if they never meet return None.",
      "p = head; q = meeting node.",
      "While p is not q: p = p.next; q = q.next.",
      "Return p."
    ],
    time: "O(n)", space: "O(1)",
    trap: "A visited set solves it in O(n) space; the follow-up wants O(1).",
    code: `def detectCycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            p = head
            while p is not slow:
                p = p.next
                slow = slow.next
            return p
    return None`
  },
  {
    num: 1721, title: "Swapping Nodes in a Linked List", slug: "swapping-nodes-in-a-linked-list", lc: "Medium",
    topic: "linkedlist",
    pattern: "Fast & slow pointers",
    level: 3,
    order: 260,
    core: false,
    teaches: "The gap trick finds the k-th node from the end in one pass; then just swap the two values.",
    learn: ["dsa_linkedlist", "dsa-ll-patterns"],
    pre: [19],
    hints: [
      "The k-th node from the start is easy. The k-th from the end is Remove Nth From End's trick.",
      "Walk first = k-th node. Then start second at head and a runner at first; move both until the runner hits the tail. Swap values."
    ],
    steps: [
      "first = head moved k - 1 steps.",
      "runner = first; second = head.",
      "While runner.next: runner = runner.next; second = second.next.",
      "Swap first.val and second.val; return head."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Swapping nodes instead of values needs many special cases (adjacent nodes, same node, head).",
    code: `def swapNodes(head, k):
    first = head
    for _ in range(k - 1):
        first = first.next
    runner, second = first, head
    while runner.next:
        runner = runner.next
        second = second.next
    first.val, second.val = second.val, first.val
    return head`
  },
  {
    num: 2130, title: "Maximum Twin Sum of a Linked List", slug: "maximum-twin-sum-of-a-linked-list", lc: "Medium",
    topic: "linkedlist",
    pattern: "In-place reversal",
    level: 3,
    order: 270,
    core: false,
    teaches: "Same split-and-reverse as Palindrome List, but you combine the halves instead of comparing them.",
    learn: ["dsa_linkedlist", "dsa-ll-problems"],
    pre: [234],
    hints: [
      "Twin i is node i and node n - 1 - i: one from the first half, one from the second half read backwards.",
      "Find the middle, reverse the second half, then walk both halves together summing pairs."
    ],
    steps: [
      "Find the middle with slow/fast (slow lands on the start of the second half).",
      "Reverse from slow.",
      "Walk p = head, q = reversed head while q: best = max(best, p.val + q.val).",
      "Return best."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Pushing every value into a list works but is O(n) space; the in-place way is the pattern practice.",
    code: `def pairSum(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    prev = None
    while slow:
        nxt = slow.next
        slow.next = prev
        prev, slow = slow, nxt
    best, p, q = 0, head, prev
    while q:
        best = max(best, p.val + q.val)
        p, q = p.next, q.next
    return best`
  },
  {
    num: 92, title: "Reverse Linked List II", slug: "reverse-linked-list-ii", lc: "Medium",
    topic: "linkedlist",
    pattern: "In-place reversal",
    level: 3,
    order: 280,
    core: false,
    teaches: "Reverse just a section: stop before it with a dummy-based prev, then move nodes one at a time to the front of the section.",
    learn: ["dsa_linkedlist", "dsa-ll-problems"],
    pre: [206, 203],
    hints: [
      "Get to the node just before position left (a dummy handles left == 1).",
      "Keep cur = prev.next fixed. right - left times: take cur.next out and insert it right after prev."
    ],
    steps: [
      "dummy = ListNode(0, head); prev = dummy; move prev left - 1 steps.",
      "cur = prev.next.",
      "Repeat right - left times: nxt = cur.next; cur.next = nxt.next; nxt.next = prev.next; prev.next = nxt.",
      "Return dummy.next."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Without the dummy, left == 1 needs separate code because the head changes.",
    code: `def reverseBetween(head, left, right):
    dummy = ListNode(0, head)
    prev = dummy
    for _ in range(left - 1):
        prev = prev.next
    cur = prev.next
    for _ in range(right - left):
        nxt = cur.next
        cur.next = nxt.next
        nxt.next = prev.next
        prev.next = nxt
    return dummy.next`
  },
  {
    num: 24, title: "Swap Nodes in Pairs", slug: "swap-nodes-in-pairs", lc: "Medium",
    topic: "linkedlist",
    pattern: "In-place reversal",
    level: 3,
    order: 290,
    core: false,
    teaches: "Swap pairs by relinking: with prev before a pair (a, b), point prev to b, b to a, a to the rest.",
    learn: ["dsa_linkedlist", "dsa-ll-dummy"],
    pre: [92],
    hints: [
      "Draw prev -> a -> b -> rest. What should it look like after the swap?",
      "prev.next = b; a.next = b.next; b.next = a; then prev = a for the next pair. Use a dummy for the head."
    ],
    steps: [
      "dummy = ListNode(0, head); prev = dummy.",
      "While prev.next and prev.next.next: a, b = prev.next, prev.next.next; prev.next = b; a.next = b.next; b.next = a; prev = a.",
      "Return dummy.next."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Swapping values instead of nodes is not allowed by the problem.",
    code: `def swapPairs(head):
    dummy = ListNode(0, head)
    prev = dummy
    while prev.next and prev.next.next:
        a, b = prev.next, prev.next.next
        prev.next = b
        a.next = b.next
        b.next = a
        prev = a
    return dummy.next`
  },
  {
    num: 147, title: "Insertion Sort List", slug: "insertion-sort-list", lc: "Medium",
    topic: "linkedlist",
    pattern: "Merge & splice",
    level: 3,
    order: 300,
    core: false,
    teaches: "Insertion sort on a list: take each node and walk a sorted dummy-headed list to find where it goes.",
    learn: ["dsa_linkedlist", "dsa-ll-dummy"],
    pre: [21],
    hints: [
      "Keep a separate sorted list starting with a dummy. For each node of the input, where does it belong?",
      "Walk p from the dummy while p.next.val < node.val, then splice the node after p.",
      "Speed-up: if the node is >= the last inserted value, you can often start from there."
    ],
    steps: [
      "dummy = ListNode(); cur = head.",
      "While cur: nxt = cur.next; p = dummy; while p.next and p.next.val < cur.val: p = p.next.",
      "cur.next = p.next; p.next = cur; cur = nxt.",
      "Return dummy.next."
    ],
    time: "O(n^2)", space: "O(1)",
    trap: "Forgetting to save cur.next before splicing loses the unsorted rest.",
    code: `def insertionSortList(head):
    dummy = ListNode()
    cur = head
    while cur:
        nxt = cur.next
        p = dummy
        while p.next and p.next.val < cur.val:
            p = p.next
        cur.next = p.next
        p.next = cur
        cur = nxt
    return dummy.next`
  },
  {
    num: 445, title: "Add Two Numbers II", slug: "add-two-numbers-ii", lc: "Medium",
    topic: "linkedlist",
    pattern: "Digit-by-digit arithmetic",
    level: 3,
    order: 310,
    core: false,
    teaches: "When digits come most-significant first, stacks give you the digits from the back; build the result by adding nodes at the front.",
    learn: ["dsa_linkedlist", "dsa-ll-patterns"],
    pre: [2, 206],
    hints: [
      "Addition starts at the ones digit, which is now at the END of each list.",
      "Push each list's digits onto a stack, then pop and add with a carry.",
      "Prepend each new digit: node = ListNode(digit, head); head = node."
    ],
    steps: [
      "s1, s2 = digits of l1 and l2 as stacks.",
      "head = None; carry = 0.",
      "While s1 or s2 or carry: total = carry + pops; head = ListNode(total % 10, head); carry = total // 10.",
      "Return head."
    ],
    time: "O(m + n)", space: "O(m + n)",
    trap: "Reversing the inputs also works but modifies them, which the follow-up forbids.",
    code: `def addTwoNumbers(l1, l2):
    s1, s2 = [], []
    while l1:
        s1.append(l1.val)
        l1 = l1.next
    while l2:
        s2.append(l2.val)
        l2 = l2.next
    head, carry = None, 0
    while s1 or s2 or carry:
        total = carry + (s1.pop() if s1 else 0) + (s2.pop() if s2 else 0)
        head = ListNode(total % 10, head)
        carry = total // 10
    return head`
  },
  {
    num: 138, title: "Copy List with Random Pointer", slug: "copy-list-with-random-pointer", lc: "Medium",
    topic: "linkedlist",
    pattern: "Copy & flatten",
    level: 3,
    order: 320,
    core: true,
    teaches: "Deep copy with a dict from old node to new node: first create all copies, then wire next and random through the dict.",
    learn: ["dsa_linkedlist", "dsa-ll-patterns"],
    pre: [707],
    hints: [
      "The hard part is random: it can point forward to a node you haven't copied yet.",
      "Pass 1: create a copy of every node and store old -> new in a dict. Pass 2: set new.next = map[old.next], new.random = map[old.random].",
      "Map None to None so the lookups never fail."
    ],
    steps: [
      "m = {None: None}.",
      "For each node: m[node] = Node(node.val).",
      "For each node: m[node].next = m[node.next]; m[node].random = m[node.random].",
      "Return m[head]."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Copying random in the same pass as next fails when random points ahead. (O(1) space: interleave copies A->A'->B->B'.)",
    code: `# class Node: def __init__(self, x, next=None, random=None)
def copyRandomList(head):
    m = {None: None}
    cur = head
    while cur:
        m[cur] = Node(cur.val)
        cur = cur.next
    cur = head
    while cur:
        m[cur].next = m[cur.next]
        m[cur].random = m[cur.random]
        cur = cur.next
    return m[head]`
  },
  {
    num: 430, title: "Flatten a Multilevel Doubly Linked List", slug: "flatten-a-multilevel-doubly-linked-list", lc: "Medium",
    topic: "linkedlist",
    pattern: "Copy & flatten",
    level: 3,
    order: 330,
    core: false,
    teaches: "Flatten by splicing: when a node has a child, insert the child list between the node and its next, then keep walking.",
    learn: ["dsa_linkedlist", "dsa-ll-ops"],
    pre: [707],
    hints: [
      "Process the list left to right. When cur has a child, the whole child chain must go right after cur.",
      "Find the child chain's tail, link tail and cur.next to each other, and cur and child to each other, and clear cur.child.",
      "Then continue from cur.next: nested children get handled as you reach them."
    ],
    steps: [
      "cur = head.",
      "While cur: if cur.child: child = cur.child; tail = last node of child chain.",
      "tail.next = cur.next; if cur.next: cur.next.prev = tail. cur.next = child; child.prev = cur; cur.child = None.",
      "cur = cur.next.",
      "Return head."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Forgetting the prev pointers (it's doubly linked) or forgetting to set child to None.",
    code: `# class Node: val, prev, next, child
def flatten(head):
    cur = head
    while cur:
        if cur.child:
            child = cur.child
            tail = child
            while tail.next:
                tail = tail.next
            tail.next = cur.next
            if cur.next:
                cur.next.prev = tail
            cur.next = child
            child.prev = cur
            cur.child = None
        cur = cur.next
    return head`
  },
  {
    num: 1171, title: "Remove Zero Sum Consecutive Nodes from Linked List", slug: "remove-zero-sum-consecutive-nodes-from-linked-list", lc: "Medium",
    topic: "linkedlist",
    pattern: "Dummy head & deletion",
    level: 4,
    order: 340,
    core: false,
    teaches: "Prefix sums on a list: if two nodes have the same running sum, everything between them sums to zero and can be skipped.",
    learn: ["dsa_linkedlist", "dsa-ll-dummy"],
    pre: [82],
    hints: [
      "A run of nodes sums to 0 exactly when the prefix sum before it equals the prefix sum at its end.",
      "Pass 1 (starting from a dummy with sum 0): map each prefix sum to the LAST node where it occurs.",
      "Pass 2: recompute prefix sums and set node.next = last[prefix].next, jumping over every zero-sum run."
    ],
    steps: [
      "dummy = ListNode(0, head).",
      "Pass 1: s = 0; for node from dummy: s += val; last[s] = node.",
      "Pass 2: s = 0; for node from dummy: s += val; node.next = last[s].next.",
      "Return dummy.next."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Deleting the first zero-sum run you find and restarting is O(n^2); and the dummy is needed when the run starts at head.",
    code: `def removeZeroSumSublists(head):
    dummy = ListNode(0, head)
    last, s, node = {}, 0, dummy
    while node:
        s += node.val
        last[s] = node
        node = node.next
    s, node = 0, dummy
    while node:
        s += node.val
        node.next = last[s].next
        node = node.next
    return dummy.next`
  },
  {
    num: 287, title: "Find the Duplicate Number", slug: "find-the-duplicate-number", lc: "Medium",
    topic: "linkedlist",
    pattern: "Fast & slow pointers",
    level: 4,
    order: 350,
    core: false,
    teaches: "Treat i -> nums[i] as next pointers: the duplicate value is where two arrows enter, i.e. the start of a cycle.",
    learn: ["dsa_linkedlist", "dsa-ll-fastslow"],
    pre: [142],
    hints: [
      "You can't modify the array and must use O(1) space, so no sorting and no set.",
      "Values are in 1..n and there are n + 1 indexes. Follow i -> nums[i] from index 0: you walk a linked list that must loop.",
      "The cycle's entrance is the duplicate. Use exactly the Linked List Cycle II method."
    ],
    steps: [
      "slow = fast = 0; repeat slow = nums[slow], fast = nums[nums[fast]] until they meet.",
      "slow = 0; while slow != fast: slow = nums[slow]; fast = nums[fast].",
      "Return slow."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Sorting or a set finds it easily but breaks the rules: the array must not change and extra space must be O(1).",
    code: `def findDuplicate(nums):
    slow = fast = 0
    while True:
        slow = nums[slow]
        fast = nums[nums[fast]]
        if slow == fast:
            break
    slow = 0
    while slow != fast:
        slow = nums[slow]
        fast = nums[fast]
    return slow`
  },
  {
    num: 2074, title: "Reverse Nodes in Even Length Groups", slug: "reverse-nodes-in-even-length-groups", lc: "Medium",
    topic: "linkedlist",
    pattern: "In-place reversal",
    level: 4,
    order: 360,
    core: false,
    teaches: "Walk groups of growing size; count each group's REAL length first, and reverse it only if that count is even.",
    learn: ["dsa_linkedlist", "dsa-ll-problems"],
    pre: [92],
    hints: [
      "Group sizes are 1, 2, 3, ... but the last group may be cut short, so count how many nodes it really has.",
      "Keep prev = node before the current group. Count up to g nodes after prev.",
      "If the count is even, reverse those nodes (as in Reverse Linked List II); then move prev to the group's last node."
    ],
    steps: [
      "prev = head; g = 2.",
      "While prev.next: count n = min(g, nodes remaining after prev).",
      "If n is even: reverse the n nodes after prev with head-insertion; the old first node is now last, so prev = it. Else walk prev n steps.",
      "g += 1. Return head."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Deciding by the planned size g instead of the actual size of the last group.",
    code: `def reverseEvenLengthGroups(head):
    prev, g = head, 2
    while prev.next:
        n, node = 0, prev.next
        while node and n < g:
            n += 1
            node = node.next
        if n % 2 == 0:
            cur = prev.next
            for _ in range(n - 1):
                nxt = cur.next
                cur.next = nxt.next
                nxt.next = prev.next
                prev.next = nxt
            prev = cur
        else:
            for _ in range(n):
                prev = prev.next
        g += 1
    return head`
  },
  {
    num: 143, title: "Reorder List", slug: "reorder-list", lc: "Medium",
    topic: "linkedlist",
    pattern: "Merge & splice",
    level: 4,
    order: 370,
    core: true,
    teaches: "Three building blocks in a row: find the middle, reverse the second half, weave the two halves together.",
    learn: ["dsa_linkedlist", "dsa-ll-problems"],
    pre: [876, 206, 21],
    hints: [
      "The order L0, Ln, L1, Ln-1, ... takes from the front and from the back alternately.",
      "Split at the middle and reverse the back half; now both 'fronts' are easy to reach.",
      "Merge by alternating: one node from the first half, one from the reversed second half."
    ],
    steps: [
      "Find the middle (slow/fast); second = slow.next; slow.next = None.",
      "Reverse second.",
      "first = head; while second: save both nexts; first.next = second; second.next = saved first next; advance both."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Not cutting the first half (slow.next = None) leaves a cycle.",
    code: `def reorderList(head):
    slow = fast = head
    while fast.next and fast.next.next:
        slow = slow.next
        fast = fast.next.next
    second, slow.next = slow.next, None
    prev = None
    while second:
        nxt = second.next
        second.next = prev
        prev, second = second, nxt
    first, second = head, prev
    while second:
        n1, n2 = first.next, second.next
        first.next = second
        second.next = n1
        first, second = n1, n2`
  },
  {
    num: 25, title: "Reverse Nodes in k-Group", slug: "reverse-nodes-in-k-group", lc: "Hard",
    topic: "linkedlist",
    pattern: "In-place reversal",
    level: 5,
    order: 380,
    core: true,
    teaches: "Repeat 'reverse a section' group by group: check k nodes exist, reverse them, reconnect, move to the next group.",
    learn: ["dsa_linkedlist", "dsa-ll-problems"],
    pre: [92, 24],
    hints: [
      "Handle one group at a time with prev = node before the group (start with a dummy).",
      "First check there are k nodes ahead; if not, stop: the tail stays as it is.",
      "Reverse the k nodes with head-insertion (as in Reverse Linked List II); the group's old first node becomes the new prev."
    ],
    steps: [
      "dummy = ListNode(0, head); prev = dummy.",
      "Loop: walk k nodes from prev.next; if fewer than k exist, break.",
      "cur = prev.next; repeat k - 1 times: nxt = cur.next; cur.next = nxt.next; nxt.next = prev.next; prev.next = nxt.",
      "prev = cur. Return dummy.next."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Reversing the final short group: leftover nodes (fewer than k) must stay in their original order.",
    code: `def reverseKGroup(head, k):
    dummy = ListNode(0, head)
    prev = dummy
    while True:
        node, count = prev.next, 0
        while node and count < k:
            node = node.next
            count += 1
        if count < k:
            break
        cur = prev.next
        for _ in range(k - 1):
            nxt = cur.next
            cur.next = nxt.next
            nxt.next = prev.next
            prev.next = nxt
        prev = cur
    return dummy.next`
  }
);
