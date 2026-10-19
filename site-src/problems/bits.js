// problems/bits.js — Bit Manipulation ladder
PROBLEMS.push(
  {
    num: 1342, title: "Number of Steps to Reduce a Number to Zero", slug: "number-of-steps-to-reduce-a-number-to-zero", lc: "Easy",
    topic: "bits",
    pattern: "Bit basics: read, shift, mask",
    level: 1,
    order: 10,
    core: false,
    teaches: "n & 1 tells you if n is odd, and n >> 1 divides by 2.",
    learn: ["dsa_bits", "dsa-bt-ops"],
    pre: [],
    hints: [
      "Even: divide by 2. Odd: subtract 1. Can you see each case in binary?",
      "Each 1 bit costs one subtract step; every bit except the top one costs one shift step."
    ],
    steps: [
      "steps = 0.",
      "While num: if num & 1 then num -= 1, else num >>= 1; steps += 1.",
      "Return steps. (Closed form: popcount(num) + bit_length(num) - 1 for num > 0.)"
    ],
    time: "O(log n)", space: "O(1)",
    trap: "num = 0 needs 0 steps; the closed form would give -1 there.",
    code: `class Solution:
    def numberOfSteps(self, num: int) -> int:
        steps = 0
        while num:
            if num & 1:
                num -= 1          # odd: subtract 1
            else:
                num >>= 1         # even: divide by 2
            steps += 1
        return steps`
  },
  {
    num: 693, title: "Binary Number with Alternating Bits", slug: "binary-number-with-alternating-bits", lc: "Easy",
    topic: "bits",
    pattern: "Bit basics: read, shift, mask",
    level: 1,
    order: 20,
    core: false,
    teaches: "Compare the last bit with the next one by shifting right.",
    learn: ["dsa_bits", "dsa-bt-ops"],
    pre: [1342],
    hints: [
      "Look at the lowest bit, then shift and look at the next.",
      "Alternating means every two neighbouring bits differ. Alternatively: n ^ (n >> 1) is all ones."
    ],
    steps: [
      "prev = n & 1, then n >>= 1.",
      "While n: cur = n & 1; if cur == prev return False; prev = cur; n >>= 1.",
      "Return True."
    ],
    time: "O(log n)", space: "O(1)",
    trap: "The x = n ^ (n >> 1) trick needs x & (x + 1) == 0 to test all-ones; don't forget the +1.",
    code: `class Solution:
    def hasAlternatingBits(self, n: int) -> bool:
        prev = n & 1
        n >>= 1
        while n:
            cur = n & 1
            if cur == prev:
                return False
            prev = cur
            n >>= 1
        return True`
  },
  {
    num: 476, title: "Number Complement", slug: "number-complement", lc: "Easy",
    topic: "bits",
    pattern: "Bit basics: read, shift, mask",
    level: 1,
    order: 30,
    core: false,
    teaches: "XOR with an all-ones mask of the same length flips every bit.",
    learn: ["dsa_bits", "dsa-bt-ops"],
    pre: [],
    hints: [
      "Which operation flips a bit? Which mask flips only the bits that n actually uses?",
      "num.bit_length() tells you how many bits; (1 << L) - 1 is that many ones."
    ],
    steps: [
      "L = num.bit_length().",
      "mask = (1 << L) - 1.",
      "Return num ^ mask."
    ],
    time: "O(1)", space: "O(1)",
    trap: "Python's ~num gives a negative number (infinite leading ones); mask instead.",
    code: `class Solution:
    def findComplement(self, num: int) -> int:
        mask = (1 << num.bit_length()) - 1   # all ones, same length as num
        return num ^ mask`
  },
  {
    num: 136, title: "Single Number", slug: "single-number", lc: "Easy",
    topic: "bits",
    pattern: "XOR: pairs cancel",
    level: 1,
    order: 40,
    core: true,
    teaches: "x ^ x = 0 and x ^ 0 = x, so XOR of everything leaves the lonely value.",
    learn: ["dsa_bits", "dsa-bt-single"],
    pre: [],
    hints: [
      "What is a ^ a? What is a ^ 0?",
      "XOR is order-independent, so XOR all the numbers together."
    ],
    steps: [
      "x = 0.",
      "For each n: x ^= n.",
      "Return x."
    ],
    time: "O(n)", space: "O(1)",
    trap: "A set or Counter works but uses O(n) space; the problem asks for O(1).",
    code: `class Solution:
    def singleNumber(self, nums: List[int]) -> int:
        x = 0
        for n in nums:
            x ^= n          # pairs cancel to 0
        return x`
  },
  {
    num: 1720, title: "Decode XORed Array", slug: "decode-xored-array", lc: "Easy",
    topic: "bits",
    pattern: "XOR: pairs cancel",
    level: 1,
    order: 50,
    core: false,
    teaches: "If a ^ b = c then a ^ c = b: XOR undoes itself.",
    learn: ["dsa_bits", "dsa-bt-single"],
    pre: [136],
    hints: [
      "encoded[i] = arr[i] ^ arr[i+1]. You know arr[i]; how do you get arr[i+1] back?",
      "XOR both sides with arr[i]."
    ],
    steps: [
      "arr = [first].",
      "For each e in encoded: arr.append(arr[-1] ^ e).",
      "Return arr."
    ],
    time: "O(n)", space: "O(n) for the output",
    trap: "Subtraction does not undo XOR; only XOR does.",
    code: `class Solution:
    def decode(self, encoded: List[int], first: int) -> List[int]:
        arr = [first]
        for e in encoded:
            arr.append(arr[-1] ^ e)
        return arr`
  },
  {
    num: 191, title: "Number of 1 Bits", slug: "number-of-1-bits", lc: "Easy",
    topic: "bits",
    pattern: "Count set bits",
    level: 1,
    order: 60,
    core: true,
    teaches: "n & (n - 1) clears the lowest 1 bit (Kernighan).",
    learn: ["dsa_bits", "dsa-bt-count"],
    pre: [],
    hints: [
      "You could test each of the 32 bits with n & 1 and a shift.",
      "Faster: n & (n - 1) removes exactly one 1 bit; count how many times until n is 0."
    ],
    steps: [
      "count = 0.",
      "While n: n &= n - 1; count += 1.",
      "Return count."
    ],
    time: "O(number of 1 bits)", space: "O(1)",
    trap: "Don't loop on n > 0 with signed shifting in other languages; the input is unsigned.",
    code: `class Solution:
    def hammingWeight(self, n: int) -> int:
        count = 0
        while n:
            n &= n - 1        # drop the lowest 1 bit
            count += 1
        return count`
  },
  {
    num: 461, title: "Hamming Distance", slug: "hamming-distance", lc: "Easy",
    topic: "bits",
    pattern: "Count set bits",
    level: 1,
    order: 70,
    core: true,
    teaches: "x ^ y marks every differing bit; count them.",
    learn: ["dsa_bits", "dsa-bt-count"],
    pre: [191],
    hints: [
      "Which operator gives 1 exactly where two bits differ?",
      "Count the 1s of x ^ y."
    ],
    steps: [
      "z = x ^ y.",
      "Count 1 bits of z with Kernighan (or bin(z).count('1')).",
      "Return the count."
    ],
    time: "O(1)", space: "O(1)",
    trap: "Comparing decimal digits instead of bits is the usual misread.",
    code: `class Solution:
    def hammingDistance(self, x: int, y: int) -> int:
        z, count = x ^ y, 0
        while z:
            z &= z - 1
            count += 1
        return count`
  },
  {
    num: 231, title: "Power of Two", slug: "power-of-two", lc: "Easy",
    topic: "bits",
    pattern: "Power of two and lowest bit",
    level: 1,
    order: 80,
    core: true,
    teaches: "A power of two has exactly one 1 bit, so n & (n - 1) == 0.",
    learn: ["dsa_bits", "dsa-bt-tricks"],
    pre: [],
    hints: [
      "Write 1, 2, 4, 8, 16 in binary. What do they share?",
      "n & (n - 1) clears the lowest 1 bit. When does that leave zero?"
    ],
    steps: [
      "Return n > 0 and n & (n - 1) == 0."
    ],
    time: "O(1)", space: "O(1)",
    trap: "0 and negative numbers are not powers of two; check n > 0.",
    code: `class Solution:
    def isPowerOfTwo(self, n: int) -> bool:
        return n > 0 and n & (n - 1) == 0`
  },
  {
    num: 1684, title: "Count the Number of Consistent Strings", slug: "count-the-number-of-consistent-strings", lc: "Easy",
    topic: "bits",
    pattern: "Letter set as a bitmask",
    level: 1,
    order: 90,
    core: false,
    teaches: "A set of lowercase letters fits in 26 bits; subset test is w & ~allowed == 0.",
    learn: ["dsa_bits", "dsa-bt-subsets"],
    pre: [],
    hints: [
      "Turn 'allowed' into a bitmask: bit (c - 'a') is set for each allowed letter.",
      "A word is consistent when its own letter mask has no bit outside allowed."
    ],
    steps: [
      "allow = OR of 1 << (c - 'a') for c in allowed.",
      "For each word: m = its mask; count it if m & ~allow == 0.",
      "Return the count."
    ],
    time: "O(total letters)", space: "O(1)",
    trap: "A plain set works too; the mask version is the warm-up for harder letter-mask problems.",
    code: `class Solution:
    def countConsistentStrings(self, allowed: str, words: List[str]) -> int:
        def mask(w):
            m = 0
            for c in w:
                m |= 1 << (ord(c) - 97)
            return m
        allow = mask(allowed)
        return sum(mask(w) & ~allow == 0 for w in words)`
  },
  {
    num: 868, title: "Binary Gap", slug: "binary-gap", lc: "Easy",
    topic: "bits",
    pattern: "Bit basics: read, shift, mask",
    level: 2,
    order: 100,
    core: false,
    teaches: "Walk the bits with an index and remember where the last 1 was.",
    learn: ["dsa_bits", "dsa-bt-ops"],
    pre: [693],
    hints: [
      "Scan bits from low to high, keeping the position of each bit.",
      "Store the position of the previous 1; when you see a new 1, the gap is pos - last."
    ],
    steps: [
      "last = -1, best = 0, i = 0.",
      "While n: if n & 1: if last >= 0 best = max(best, i - last); last = i.",
      "n >>= 1; i += 1. Return best."
    ],
    time: "O(log n)", space: "O(1)",
    trap: "A number with a single 1 bit has answer 0, not its length.",
    code: `class Solution:
    def binaryGap(self, n: int) -> int:
        last, best, i = -1, 0, 0
        while n:
            if n & 1:
                if last >= 0:
                    best = max(best, i - last)
                last = i
            n >>= 1
            i += 1
        return best`
  },
  {
    num: 190, title: "Reverse Bits", slug: "reverse-bits", lc: "Easy",
    topic: "bits",
    pattern: "Bit basics: read, shift, mask",
    level: 2,
    order: 110,
    core: true,
    teaches: "Build the answer bit by bit: shift result left, pull n's last bit in.",
    learn: ["dsa_bits", "dsa-bt-ops"],
    pre: [1342],
    hints: [
      "Take bits off n from the right; put them onto the result from the right, while pushing the result left.",
      "Loop exactly 32 times, even when n becomes 0, so leading zeros move to the end."
    ],
    steps: [
      "res = 0.",
      "Repeat 32 times: res = (res << 1) | (n & 1); n >>= 1.",
      "Return res."
    ],
    time: "O(32)", space: "O(1)",
    trap: "Stopping when n becomes 0 loses the trailing zeros; always do 32 rounds.",
    code: `class Solution:
    def reverseBits(self, n: int) -> int:
        res = 0
        for _ in range(32):
            res = (res << 1) | (n & 1)
            n >>= 1
        return res`
  },
  {
    num: 405, title: "Convert a Number to Hexadecimal", slug: "convert-a-number-to-hexadecimal", lc: "Easy",
    topic: "bits",
    pattern: "Bit basics: read, shift, mask",
    level: 2,
    order: 120,
    core: false,
    teaches: "Read 4 bits at a time with & 15; mask negatives to 32 bits first.",
    learn: ["dsa_bits", "dsa-bt-neg"],
    pre: [476],
    hints: [
      "One hex digit is exactly 4 bits. Which mask grabs the lowest 4 bits?",
      "For a negative number, add 2**32 (or & 0xFFFFFFFF) to get its two's complement as a positive number."
    ],
    steps: [
      "If num == 0 return '0'.",
      "num &= 0xFFFFFFFF.",
      "While num: append '0123456789abcdef'[num & 15]; num >>= 4.",
      "Return the digits reversed."
    ],
    time: "O(log n)", space: "O(1)",
    trap: "Python's >> on a negative number never reaches 0: infinite loop unless you mask first.",
    code: `class Solution:
    def toHex(self, num: int) -> str:
        if num == 0:
            return "0"
        digits = "0123456789abcdef"
        num &= 0xFFFFFFFF            # two's complement view of negatives
        out = []
        while num:
            out.append(digits[num & 15])
            num >>= 4
        return "".join(reversed(out))`
  },
  {
    num: 268, title: "Missing Number", slug: "missing-number", lc: "Easy",
    topic: "bits",
    pattern: "XOR: pairs cancel",
    level: 2,
    order: 130,
    core: true,
    teaches: "XOR the values with the indexes 0..n; every present number cancels, the missing one stays.",
    learn: ["dsa_bits", "dsa-bt-single"],
    pre: [136],
    hints: [
      "If you XOR all of 0..n and also all of nums, which numbers appear twice?",
      "Start x = n, then for each i: x ^= i ^ nums[i]."
    ],
    steps: [
      "x = len(nums).",
      "For i, v in enumerate(nums): x ^= i ^ v.",
      "Return x."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Indexes only go to n-1, so remember to include n itself (start x at n).",
    code: `class Solution:
    def missingNumber(self, nums: List[int]) -> int:
        x = len(nums)                 # n is not an index, add it up front
        for i, v in enumerate(nums):
            x ^= i ^ v
        return x`
  },
  {
    num: 389, title: "Find the Difference", slug: "find-the-difference", lc: "Easy",
    topic: "bits",
    pattern: "XOR: pairs cancel",
    level: 2,
    order: 140,
    core: false,
    teaches: "Characters cancel in XOR too: XOR all codes of s and t, the extra letter remains.",
    learn: ["dsa_bits", "dsa-bt-single"],
    pre: [136],
    hints: [
      "Every letter in s also appears in t, except one extra letter in t.",
      "This is Single Number on character codes: XOR ord(c) over both strings."
    ],
    steps: [
      "x = 0.",
      "For c in s + t: x ^= ord(c).",
      "Return chr(x)."
    ],
    time: "O(n)", space: "O(1)",
    trap: "The extra letter may be a duplicate of one already in s (e.g. s='a', t='aa'); a set difference fails.",
    code: `class Solution:
    def findTheDifference(self, s: str, t: str) -> str:
        x = 0
        for c in s + t:
            x ^= ord(c)
        return chr(x)`
  },
  {
    num: 338, title: "Counting Bits", slug: "counting-bits", lc: "Easy",
    topic: "bits",
    pattern: "Count set bits",
    level: 2,
    order: 150,
    core: true,
    teaches: "Reuse smaller answers: bits(i) = bits(i >> 1) + (i & 1).",
    learn: ["dsa_bits", "dsa-bt-count"],
    pre: [191],
    hints: [
      "i >> 1 is i with the last bit removed, and it is smaller than i.",
      "You already know the count for i >> 1; add back the bit you dropped."
    ],
    steps: [
      "ans = [0] * (n + 1).",
      "For i in 1..n: ans[i] = ans[i >> 1] + (i & 1).",
      "Return ans."
    ],
    time: "O(n)", space: "O(n) for the output",
    trap: "Calling a popcount for every i is O(n log n); the follow-up wants O(n).",
    code: `class Solution:
    def countBits(self, n: int) -> List[int]:
        ans = [0] * (n + 1)
        for i in range(1, n + 1):
            ans[i] = ans[i >> 1] + (i & 1)
        return ans`
  },
  {
    num: 762, title: "Prime Number of Set Bits in Binary Representation", slug: "prime-number-of-set-bits-in-binary-representation", lc: "Easy",
    topic: "bits",
    pattern: "Count set bits",
    level: 2,
    order: 160,
    core: false,
    teaches: "Popcount every number in the range, then test the small count for primality.",
    learn: ["dsa_bits", "dsa-bt-count"],
    pre: [191],
    hints: [
      "For each number count its 1 bits.",
      "Numbers are below 2^20, so the bit count is at most 20; the primes up to 20 fit in a small set."
    ],
    steps: [
      "primes = {2, 3, 5, 7, 11, 13, 17, 19}.",
      "Count x in [left, right] with bin(x).count('1') in primes.",
      "Return the count."
    ],
    time: "O((right - left) * log right)", space: "O(1)",
    trap: "1 is not prime: numbers with a single set bit don't count.",
    code: `class Solution:
    def countPrimeSetBits(self, left: int, right: int) -> int:
        primes = {2, 3, 5, 7, 11, 13, 17, 19}
        return sum(bin(x).count("1") in primes for x in range(left, right + 1))`
  },
  {
    num: 1356, title: "Sort Integers by The Number of 1 Bits", slug: "sort-integers-by-the-number-of-1-bits", lc: "Easy",
    topic: "bits",
    pattern: "Count set bits",
    level: 2,
    order: 170,
    core: false,
    teaches: "Sort with a tuple key: (popcount, value).",
    learn: ["dsa_bits", "dsa-bt-count"],
    pre: [191],
    hints: [
      "Python sorts tuples by first element, then second.",
      "key = (number of 1 bits, the number itself)."
    ],
    steps: [
      "Return sorted(arr, key=lambda x: (bin(x).count('1'), x))."
    ],
    time: "O(n log n)", space: "O(n)",
    trap: "Ties must be broken by the value itself, ascending.",
    code: `class Solution:
    def sortByBits(self, arr: List[int]) -> List[int]:
        return sorted(arr, key=lambda x: (bin(x).count("1"), x))`
  },
  {
    num: 342, title: "Power of Four", slug: "power-of-four", lc: "Easy",
    topic: "bits",
    pattern: "Power of two and lowest bit",
    level: 2,
    order: 180,
    core: false,
    teaches: "Power of four = power of two whose single 1 bit sits at an even position.",
    learn: ["dsa_bits", "dsa-bt-tricks"],
    pre: [231],
    hints: [
      "Every power of four is a power of two. Which powers of two are not?",
      "4^k has its bit at position 2k. A mask 0x55555555 has 1s only at even positions."
    ],
    steps: [
      "Check n > 0 and n & (n - 1) == 0.",
      "Also check n & 0x55555555 != 0.",
      "Return both."
    ],
    time: "O(1)", space: "O(1)",
    trap: "2 and 8 are powers of two but not of four.",
    code: `class Solution:
    def isPowerOfFour(self, n: int) -> bool:
        return n > 0 and n & (n - 1) == 0 and n & 0x55555555 != 0`
  },
  {
    num: 67, title: "Add Binary", slug: "add-binary", lc: "Easy",
    topic: "bits",
    pattern: "Arithmetic with bits",
    level: 2,
    order: 190,
    core: true,
    teaches: "Add from the right with a carry; digit = total % 2, carry = total // 2.",
    learn: ["dsa_bits", "dsa-bt-ops"],
    pre: [],
    hints: [
      "Do it like school addition, but in base 2, starting from the last characters.",
      "Keep going while either string has digits left or carry is 1."
    ],
    steps: [
      "i, j = last indexes; carry = 0; out = [].",
      "While i >= 0 or j >= 0 or carry: total = carry + digit a[i] + digit b[j]; out.append(total % 2); carry = total // 2; move i, j left.",
      "Return reversed out joined."
    ],
    time: "O(max(m, n))", space: "O(max(m, n))",
    trap: "Forgetting the final carry: '1' + '1' must give '10'.",
    code: `class Solution:
    def addBinary(self, a: str, b: str) -> str:
        i, j, carry, out = len(a) - 1, len(b) - 1, 0, []
        while i >= 0 or j >= 0 or carry:
            total = carry
            if i >= 0:
                total += int(a[i]); i -= 1
            if j >= 0:
                total += int(b[j]); j -= 1
            out.append(str(total % 2))
            carry = total // 2
        return "".join(reversed(out))`
  },
  {
    num: 2433, title: "Find The Original Array of Prefix Xor", slug: "find-the-original-array-of-prefix-xor", lc: "Medium",
    topic: "bits",
    pattern: "Prefix XOR and parity masks",
    level: 2,
    order: 200,
    core: false,
    teaches: "pref[i] ^ pref[i-1] = arr[i], because the shared prefix cancels.",
    learn: ["dsa_bits", "dsa-bt-single"],
    pre: [1720],
    hints: [
      "pref[i] = arr[0] ^ ... ^ arr[i]. What do pref[i] and pref[i-1] have in common?",
      "XOR them: the common part cancels."
    ],
    steps: [
      "arr = [pref[0]].",
      "For i in 1..n-1: arr.append(pref[i] ^ pref[i-1]).",
      "Return arr."
    ],
    time: "O(n)", space: "O(n) for the output",
    trap: "Don't XOR with the running arr values; use neighbouring pref values.",
    code: `class Solution:
    def findArray(self, pref: List[int]) -> List[int]:
        return [pref[0]] + [pref[i] ^ pref[i - 1] for i in range(1, len(pref))]`
  },
  {
    num: 1310, title: "XOR Queries of a Subarray", slug: "xor-queries-of-a-subarray", lc: "Medium",
    topic: "bits",
    pattern: "Prefix XOR and parity masks",
    level: 2,
    order: 210,
    core: true,
    teaches: "Prefix XOR answers any range: xor(l..r) = px[r+1] ^ px[l].",
    learn: ["dsa_bits", "dsa-bt-single"],
    pre: [2433],
    hints: [
      "Prefix sums answer range sums. Does the same idea work with XOR?",
      "px[i] = XOR of the first i values; the part before l cancels itself."
    ],
    steps: [
      "px = [0]; for a in arr: px.append(px[-1] ^ a).",
      "For each [l, r]: answer px[r + 1] ^ px[l].",
      "Return the answers."
    ],
    time: "O(n + q)", space: "O(n)",
    trap: "Off by one: use px[r + 1], not px[r].",
    code: `class Solution:
    def xorQueries(self, arr: List[int], queries: List[List[int]]) -> List[int]:
        px = [0]
        for a in arr:
            px.append(px[-1] ^ a)
        return [px[r + 1] ^ px[l] for l, r in queries]`
  },
  {
    num: 2506, title: "Count Pairs Of Similar Strings", slug: "count-pairs-of-similar-strings", lc: "Easy",
    topic: "bits",
    pattern: "Letter set as a bitmask",
    level: 2,
    order: 220,
    core: false,
    teaches: "Same letter set means same mask; count equal masks with a hashmap.",
    learn: ["dsa_bits", "dsa-bt-subsets"],
    pre: [1684],
    hints: [
      "Two words are similar when their letter sets match. How can a set become a hashable number?",
      "Count masks; a mask seen k times gives k * (k - 1) / 2 pairs."
    ],
    steps: [
      "cnt = Counter().",
      "For each word: m = letter mask; res += cnt[m]; cnt[m] += 1.",
      "Return res."
    ],
    time: "O(total letters)", space: "O(n)",
    trap: "Repeated letters don't matter ('aab' is similar to 'ab').",
    code: `class Solution:
    def similarPairs(self, words: List[str]) -> int:
        cnt, res = Counter(), 0
        for w in words:
            m = 0
            for c in w:
                m |= 1 << (ord(c) - 97)
            res += cnt[m]
            cnt[m] += 1
        return res`
  },
  {
    num: 1318, title: "Minimum Flips to Make a OR b Equal to c", slug: "minimum-flips-to-make-a-or-b-equal-to-c", lc: "Medium",
    topic: "bits",
    pattern: "Per-bit reasoning",
    level: 2,
    order: 230,
    core: false,
    teaches: "Bits don't interact in OR, so decide the cost of each bit position separately.",
    learn: ["dsa_bits", "dsa-bt-ops"],
    pre: [461],
    hints: [
      "Look at one bit position of a, b, c at a time.",
      "If c's bit is 1 and both a, b bits are 0: 1 flip. If c's bit is 0: flip every 1 among a and b."
    ],
    steps: [
      "flips = 0.",
      "While a or b or c: x, y, z = a & 1, b & 1, c & 1.",
      "If z: flips += (x | y) == 0 else flips += x + y.",
      "Shift all three right. Return flips."
    ],
    time: "O(log max)", space: "O(1)",
    trap: "When c's bit is 0 and both a and b have 1, that costs 2 flips, not 1.",
    code: `class Solution:
    def minFlips(self, a: int, b: int, c: int) -> int:
        flips = 0
        while a or b or c:
            x, y, z = a & 1, b & 1, c & 1
            if z:
                flips += (x | y) == 0
            else:
                flips += x + y
            a, b, c = a >> 1, b >> 1, c >> 1
        return flips`
  },
  {
    num: 2419, title: "Longest Subarray With Maximum Bitwise AND", slug: "longest-subarray-with-maximum-bitwise-and", lc: "Medium",
    topic: "bits",
    pattern: "AND/OR over subarrays",
    level: 2,
    order: 240,
    core: false,
    teaches: "AND never grows, so the max AND is the max element; find its longest run.",
    learn: ["dsa_bits", "dsa-bt-ops"],
    pre: [],
    hints: [
      "Can a & b ever be larger than max(a, b)?",
      "So the biggest AND is the biggest number, reached only by subarrays made only of it."
    ],
    steps: [
      "m = max(nums).",
      "Scan: extend a run while x == m, reset otherwise; track the longest run.",
      "Return it."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Two different numbers can never AND to the max, even if they share its bits.",
    code: `class Solution:
    def longestSubarray(self, nums: List[int]) -> int:
        m = max(nums)
        best = run = 0
        for x in nums:
            run = run + 1 if x == m else 0
            best = max(best, run)
        return best`
  },
  {
    num: 260, title: "Single Number III", slug: "single-number-iii", lc: "Medium",
    topic: "bits",
    pattern: "XOR: pairs cancel",
    level: 3,
    order: 250,
    core: true,
    teaches: "XOR gives a ^ b; any set bit of it splits the numbers into two groups, one single in each.",
    learn: ["dsa_bits", "dsa-bt-single"],
    pre: [136, 231],
    hints: [
      "XOR of everything gives a ^ b, which is nonzero. What does a set bit in it tell you about a and b?",
      "At that bit, a and b differ. Split all numbers by that bit and XOR each group separately.",
      "x & -x isolates the lowest set bit."
    ],
    steps: [
      "x = XOR of all nums.",
      "low = x & -x.",
      "a = XOR of nums with (n & low) != 0; b = x ^ a.",
      "Return [a, b]."
    ],
    time: "O(n)", space: "O(1)",
    trap: "In other languages x & -x overflows for INT_MIN; Python ints are fine.",
    code: `class Solution:
    def singleNumber(self, nums: List[int]) -> List[int]:
        x = 0
        for n in nums:
            x ^= n                    # x = a ^ b
        low = x & -x                  # a bit where a and b differ
        a = 0
        for n in nums:
            if n & low:
                a ^= n
        return [a, x ^ a]`
  },
  {
    num: 201, title: "Bitwise AND of Numbers Range", slug: "bitwise-and-of-numbers-range", lc: "Medium",
    topic: "bits",
    pattern: "Power of two and lowest bit",
    level: 3,
    order: 260,
    core: true,
    teaches: "AND of a range keeps only the common binary prefix of left and right.",
    learn: ["dsa_bits", "dsa-bt-tricks"],
    pre: [231],
    hints: [
      "Any bit that flips somewhere between left and right becomes 0 in the AND.",
      "Bits below the first position where left and right differ all flip at some point.",
      "Shift both right until they are equal, then shift back."
    ],
    steps: [
      "shift = 0.",
      "While left != right: left >>= 1; right >>= 1; shift += 1.",
      "Return left << shift."
    ],
    time: "O(log n)", space: "O(1)",
    trap: "Looping from left to right ANDing each number times out for ranges like [1, 2^31 - 1].",
    code: `class Solution:
    def rangeBitwiseAnd(self, left: int, right: int) -> int:
        shift = 0
        while left != right:      # strip bits until only the common prefix is left
            left >>= 1
            right >>= 1
            shift += 1
        return left << shift`
  },
  {
    num: 371, title: "Sum of Two Integers", slug: "sum-of-two-integers", lc: "Medium",
    topic: "bits",
    pattern: "Arithmetic with bits",
    level: 3,
    order: 270,
    core: true,
    teaches: "a ^ b adds without carry, (a & b) << 1 is the carry; repeat until no carry. Mask to 32 bits in Python.",
    learn: ["dsa_bits", "dsa-bt-neg"],
    pre: [67],
    hints: [
      "In one bit position, what are the sum bit and the carry bit of two bits? Which operators give them?",
      "sum = a ^ b, carry = (a & b) << 1. Now add sum and carry the same way, until carry is 0.",
      "Python ints never overflow, so keep everything & 0xFFFFFFFF and convert back to signed at the end."
    ],
    steps: [
      "MASK = 0xFFFFFFFF; a &= MASK; b &= MASK.",
      "While b: a, b = (a ^ b) & MASK, ((a & b) << 1) & MASK.",
      "If a > 0x7FFFFFFF return ~(a ^ MASK) (negative), else return a."
    ],
    time: "O(32)", space: "O(1)",
    trap: "Without the 32-bit mask, a negative input makes the carry loop run forever in Python.",
    code: `class Solution:
    def getSum(self, a: int, b: int) -> int:
        MASK, MAX = 0xFFFFFFFF, 0x7FFFFFFF
        a, b = a & MASK, b & MASK
        while b:
            a, b = (a ^ b) & MASK, ((a & b) << 1) & MASK
        return a if a <= MAX else ~(a ^ MASK)   # back to a signed int`
  },
  {
    num: 1442, title: "Count Triplets That Can Form Two Arrays of Equal XOR", slug: "count-triplets-that-can-form-two-arrays-of-equal-xor", lc: "Medium",
    topic: "bits",
    pattern: "Prefix XOR and parity masks",
    level: 3,
    order: 280,
    core: false,
    teaches: "a == b means arr[i..k] XORs to 0, i.e. px[i] == px[k+1]; then every j between works.",
    learn: ["dsa_bits", "dsa-bt-single"],
    pre: [1310],
    hints: [
      "If a == b, what is a ^ b? What range is that the XOR of?",
      "So you need px[i] == px[k + 1]. For such a pair, j can be any of i+1..k: that is k - i choices.",
      "Brute force over (i, k) pairs is O(n^2) and fine; a hashmap of count and index sums gives O(n)."
    ],
    steps: [
      "Compute prefix XOR on the fly.",
      "For each end position t = k + 1 with prefix value x: add count[x] * (t - 1) - sumIdx[x].",
      "Then count[x] += 1 and sumIdx[x] += t (start with count[0] = 1, sumIdx[0] = 0)."
    ],
    time: "O(n)", space: "O(n)",
    trap: "j ranges over i+1..k, so each pair contributes k - i, not 1.",
    code: `class Solution:
    def countTriplets(self, arr: List[int]) -> int:
        count = defaultdict(int)
        idx_sum = defaultdict(int)
        count[0] = 1                  # prefix of length 0
        x = res = 0
        for t, a in enumerate(arr, 1):
            x ^= a                    # x = px[t]
            # each earlier i with px[i] == x adds (t - 1) - i triplets
            res += count[x] * (t - 1) - idx_sum[x]
            count[x] += 1
            idx_sum[x] += t
        return res`
  },
  {
    num: 2588, title: "Count the Number of Beautiful Subarrays", slug: "count-the-number-of-beautiful-subarrays", lc: "Medium",
    topic: "bits",
    pattern: "Prefix XOR and parity masks",
    level: 3,
    order: 290,
    core: false,
    teaches: "A subarray can be zeroed exactly when every bit appears an even number of times: its XOR is 0.",
    learn: ["dsa_bits", "dsa-bt-single"],
    pre: [1310],
    hints: [
      "One operation removes the same bit from two numbers. What happens to the count of numbers with that bit?",
      "The count of each bit must be even: the subarray XOR is 0.",
      "Count pairs of equal prefix XORs with a hashmap (like subarray sum equals k with k = 0)."
    ],
    steps: [
      "cnt = {0: 1}; x = 0; res = 0.",
      "For a: x ^= a; res += cnt[x]; cnt[x] += 1.",
      "Return res."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Seed the map with prefix 0 so subarrays starting at index 0 count.",
    code: `class Solution:
    def beautifulSubarrays(self, nums: List[int]) -> int:
        cnt = Counter({0: 1})
        x = res = 0
        for a in nums:
            x ^= a
            res += cnt[x]       # earlier prefixes with the same XOR
            cnt[x] += 1
        return res`
  },
  {
    num: 2397, title: "Maximum Rows Covered by Columns", slug: "maximum-rows-covered-by-columns", lc: "Medium",
    topic: "bits",
    pattern: "Enumerate subsets with a mask",
    level: 3,
    order: 300,
    core: false,
    teaches: "Turn each row into a mask; a row is covered when row & ~chosen == 0.",
    learn: ["dsa_bits", "dsa-bt-subsets"],
    pre: [1863, 191],
    hints: [
      "n <= 12 columns, so try every set of columns with exactly numSelect bits.",
      "Store each row as a bitmask of its 1 columns. Covered means row is a subset of chosen: row & chosen == row."
    ],
    steps: [
      "rows = [mask of each row].",
      "For each chosen in range(1 << n) with popcount == numSelect: covered = count of rows with r & chosen == r.",
      "Return the max covered."
    ],
    time: "O(2^n * m)", space: "O(m)",
    trap: "Rows of all zeros are always covered; don't skip them.",
    code: `class Solution:
    def maximumRows(self, matrix: List[List[int]], numSelect: int) -> int:
        n = len(matrix[0])
        rows = [sum(v << j for j, v in enumerate(r)) for r in matrix]
        best = 0
        for chosen in range(1 << n):
            if bin(chosen).count("1") != numSelect:
                continue
            best = max(best, sum(r & chosen == r for r in rows))
        return best`
  },
  {
    num: 2212, title: "Maximum Points in an Archery Competition", slug: "maximum-points-in-an-archery-competition", lc: "Medium",
    topic: "bits",
    pattern: "Enumerate subsets with a mask",
    level: 3,
    order: 310,
    core: false,
    teaches: "Choose which of the 12 sections Bob wins with a mask; winning section i costs aliceArrows[i] + 1.",
    learn: ["dsa_bits", "dsa-bt-subsets"],
    pre: [2397],
    hints: [
      "Bob either wins a section with the cheapest amount (one more than Alice) or puts 0 there.",
      "There are only 2^12 choices of sections to win. Check each mask's cost against numArrows.",
      "Leftover arrows can go anywhere, e.g. section 0."
    ],
    steps: [
      "For mask in range(1 << 12): cost = sum(alice[i] + 1 for bits i); skip if cost > numArrows.",
      "score = sum(i for bits i); keep the best mask.",
      "Build bob: alice[i] + 1 on chosen sections, 0 elsewhere; add numArrows - cost to section 0."
    ],
    time: "O(12 * 2^12)", space: "O(12)",
    trap: "Bob's arrows must sum to exactly numArrows; dump the leftovers somewhere.",
    code: `class Solution:
    def maximumBobPoints(self, numArrows: int, aliceArrows: List[int]) -> List[int]:
        best_score, best_mask = -1, 0
        for mask in range(1 << 12):
            cost = score = 0
            for i in range(12):
                if mask >> i & 1:
                    cost += aliceArrows[i] + 1
                    score += i
            if cost <= numArrows and score > best_score:
                best_score, best_mask = score, mask
        bob = [aliceArrows[i] + 1 if best_mask >> i & 1 else 0 for i in range(12)]
        bob[0] += numArrows - sum(bob)
        return bob`
  },
  {
    num: 318, title: "Maximum Product of Word Lengths", slug: "maximum-product-of-word-lengths", lc: "Medium",
    topic: "bits",
    pattern: "Letter set as a bitmask",
    level: 3,
    order: 320,
    core: true,
    teaches: "Precompute one mask per word; 'no common letters' is a single AND == 0.",
    learn: ["dsa_bits", "dsa-bt-subsets"],
    pre: [1684],
    hints: [
      "Checking two words for shared letters character by character is slow. Precompute something per word.",
      "Masks: words i and j share no letter exactly when mask[i] & mask[j] == 0.",
      "Keep only the longest word per mask to shrink the pair loop."
    ],
    steps: [
      "best_len = {} mapping mask -> max length of a word with that mask.",
      "For every pair of masks (a, b): if a & b == 0: res = max(res, la * lb).",
      "Return res."
    ],
    time: "O(L + n^2)", space: "O(n)",
    trap: "Words with the same letters but different lengths: keep the longest for each mask.",
    code: `class Solution:
    def maxProduct(self, words: List[str]) -> int:
        best = {}
        for w in words:
            m = 0
            for c in w:
                m |= 1 << (ord(c) - 97)
            best[m] = max(best.get(m, 0), len(w))
        items = list(best.items())
        res = 0
        for i, (a, la) in enumerate(items):
            for b, lb in items[i + 1:]:
                if a & b == 0:
                    res = max(res, la * lb)
        return res`
  },
  {
    num: 137, title: "Single Number II", slug: "single-number-ii", lc: "Medium",
    topic: "bits",
    pattern: "Per-bit reasoning",
    level: 3,
    order: 330,
    core: true,
    teaches: "Count each bit position mod 3; leftover bits belong to the single number.",
    learn: ["dsa_bits", "dsa-bt-single"],
    pre: [136],
    hints: [
      "XOR alone fails: three copies don't cancel. Think one bit position at a time.",
      "For bit i, count how many numbers have it set. Triples contribute multiples of 3.",
      "count % 3 is the single number's bit. Fix the sign for bit 31 (two's complement)."
    ],
    steps: [
      "res = 0.",
      "For i in 0..31: c = sum((n >> i) & 1 for n in nums); if c % 3: res |= 1 << i.",
      "If res >= 2^31: res -= 2^32.",
      "Return res."
    ],
    time: "O(32 n)", space: "O(1)",
    trap: "Negative numbers: Python's >> on negatives works, but bit 31 must be turned back into a negative value.",
    code: `class Solution:
    def singleNumber(self, nums: List[int]) -> int:
        res = 0
        for i in range(32):
            c = sum((n >> i) & 1 for n in nums)
            if c % 3:
                res |= 1 << i
        if res >= 2**31:              # bit 31 set: negative in 32-bit
            res -= 2**32
        return res`
  },
  {
    num: 477, title: "Total Hamming Distance", slug: "total-hamming-distance", lc: "Medium",
    topic: "bits",
    pattern: "Per-bit reasoning",
    level: 3,
    order: 340,
    core: true,
    teaches: "Per bit, the pairs that differ are (ones) * (zeros).",
    learn: ["dsa_bits", "dsa-bt-count"],
    pre: [461],
    hints: [
      "Pairwise Hamming distance is O(n^2). Can you count each bit separately?",
      "At bit i, if k numbers have a 1 and n - k have a 0, how many pairs differ there?"
    ],
    steps: [
      "total = 0.",
      "For i in 0..31: k = count of numbers with bit i set; total += k * (n - k).",
      "Return total."
    ],
    time: "O(32 n)", space: "O(1)",
    trap: "Summing pairwise distances directly is O(n^2) and times out for n = 10^4.",
    code: `class Solution:
    def totalHammingDistance(self, nums: List[int]) -> int:
        n, total = len(nums), 0
        for i in range(32):
            k = sum((x >> i) & 1 for x in nums)
            total += k * (n - k)
        return total`
  },
  {
    num: 2275, title: "Largest Combination With Bitwise AND Greater Than Zero", slug: "largest-combination-with-bitwise-and-greater-than-zero", lc: "Medium",
    topic: "bits",
    pattern: "Per-bit reasoning",
    level: 3,
    order: 350,
    core: false,
    teaches: "An AND is > 0 iff some bit is shared by all chosen; the answer is the most popular bit.",
    learn: ["dsa_bits", "dsa-bt-count"],
    pre: [477],
    hints: [
      "For the AND to be positive, at least one bit must be 1 in every chosen number.",
      "Fix a bit; the biggest group that shares it is all numbers with that bit set."
    ],
    steps: [
      "For each bit b in 0..23: count numbers with bit b set.",
      "Return the max count."
    ],
    time: "O(24 n)", space: "O(1)",
    trap: "Don't try subsets; the per-bit count is already optimal.",
    code: `class Solution:
    def largestCombination(self, candidates: List[int]) -> int:
        return max(sum((c >> b) & 1 for c in candidates) for b in range(24))`
  },
  {
    num: 2429, title: "Minimize XOR", slug: "minimize-xor", lc: "Medium",
    topic: "bits",
    pattern: "Per-bit reasoning",
    level: 3,
    order: 360,
    core: false,
    teaches: "Greedy from the top bit: match num1's high 1s first, then fill the lowest 0s.",
    learn: ["dsa_bits", "dsa-bt-tricks"],
    pre: [191],
    hints: [
      "x must have popcount(num2) ones. To make x ^ num1 small, where should those ones go?",
      "Cancel num1's highest 1 bits first. If ones are left over, place them in num1's lowest 0 bits."
    ],
    steps: [
      "k = popcount(num2); x = 0.",
      "For b from 31 down to 0: if num1 bit b is 1 and k > 0: set it in x; k -= 1.",
      "For b from 0 up: if k > 0 and bit b of x is 0: set it; k -= 1.",
      "Return x."
    ],
    time: "O(32)", space: "O(1)",
    trap: "Leftover ones go to the LOWEST free positions, not the highest.",
    code: `class Solution:
    def minimizeXor(self, num1: int, num2: int) -> int:
        k, x = bin(num2).count("1"), 0
        for b in range(31, -1, -1):          # cancel num1's high 1 bits
            if k and num1 >> b & 1:
                x |= 1 << b
                k -= 1
        b = 0
        while k:                              # extra ones go as low as possible
            if not x >> b & 1:
                x |= 1 << b
                k -= 1
            b += 1
        return x`
  },
  {
    num: 2401, title: "Longest Nice Subarray", slug: "longest-nice-subarray", lc: "Medium",
    topic: "bits",
    pattern: "AND/OR over subarrays",
    level: 3,
    order: 370,
    core: false,
    teaches: "Pairwise AND 0 means no shared bits; keep an OR of the window and remove with XOR.",
    learn: ["dsa_bits", "dsa-bt-ops"],
    pre: [2419],
    hints: [
      "Every pair has AND 0 means no bit appears in two numbers of the window.",
      "Sliding window: keep used = OR of the window. A new x fits only if used & x == 0.",
      "Since bits don't overlap, removing the left number is used ^= nums[left]."
    ],
    steps: [
      "left = 0, used = 0, best = 0.",
      "For right, x: while used & x: used ^= nums[left]; left += 1.",
      "used |= x; best = max(best, right - left + 1).",
      "Return best."
    ],
    time: "O(n)", space: "O(1)",
    trap: "You can remove with XOR only because the window's numbers share no bits.",
    code: `class Solution:
    def longestNiceSubarray(self, nums: List[int]) -> int:
        left = used = best = 0
        for right, x in enumerate(nums):
            while used & x:
                used ^= nums[left]     # bits are disjoint, so XOR removes exactly them
                left += 1
            used |= x
            best = max(best, right - left + 1)
        return best`
  },
  {
    num: 89, title: "Gray Code", slug: "gray-code", lc: "Medium",
    topic: "bits",
    pattern: "Gray code",
    level: 3,
    order: 380,
    core: false,
    teaches: "The i-th Gray code is i ^ (i >> 1); neighbours differ in one bit.",
    learn: ["dsa_bits", "dsa-bt-tricks"],
    pre: [461],
    hints: [
      "Try to build n-bit Gray codes from (n-1)-bit ones: copy, reverse, and add a top bit.",
      "Or use the closed form: g(i) = i ^ (i >> 1)."
    ],
    steps: [
      "Return [i ^ (i >> 1) for i in range(1 << n)]."
    ],
    time: "O(2^n)", space: "O(2^n) for the output",
    trap: "The last code must also differ from the first in one bit; the formula guarantees it.",
    code: `class Solution:
    def grayCode(self, n: int) -> List[int]:
        return [i ^ (i >> 1) for i in range(1 << n)]`
  },
  {
    num: 1734, title: "Decode XORed Permutation", slug: "decode-xored-permutation", lc: "Medium",
    topic: "bits",
    pattern: "XOR: pairs cancel",
    level: 4,
    order: 390,
    core: false,
    teaches: "Find one element first: XOR of 1..n minus XOR of every second encoded value gives perm[0].",
    learn: ["dsa_bits", "dsa-bt-single"],
    pre: [1720, 268],
    hints: [
      "If you knew perm[0], this would be Decode XORed Array.",
      "You know the XOR of the whole permutation (1..n). n is odd.",
      "encoded[1] ^ encoded[3] ^ ... = perm[1] ^ perm[2] ^ ... ^ perm[n-1]."
    ],
    steps: [
      "total = XOR of 1..n.",
      "rest = XOR of encoded[i] for odd i.",
      "first = total ^ rest.",
      "Decode forward: perm[i+1] = perm[i] ^ encoded[i]."
    ],
    time: "O(n)", space: "O(n) for the output",
    trap: "Use odd indexes of encoded (1, 3, 5...), which skip perm[0]; even indexes would include it.",
    code: `class Solution:
    def decode(self, encoded: List[int]) -> List[int]:
        n = len(encoded) + 1
        total = 0
        for v in range(1, n + 1):
            total ^= v
        rest = 0
        for i in range(1, len(encoded), 2):
            rest ^= encoded[i]        # perm[1] ^ ... ^ perm[n-1]
        perm = [total ^ rest]
        for e in encoded:
            perm.append(perm[-1] ^ e)
        return perm`
  },
  {
    num: 29, title: "Divide Two Integers", slug: "divide-two-integers", lc: "Medium",
    topic: "bits",
    pattern: "Arithmetic with bits",
    level: 4,
    order: 400,
    core: false,
    teaches: "Long division in binary: subtract the biggest divisor << k that still fits.",
    learn: ["dsa_bits", "dsa-bt-ops"],
    pre: [371],
    hints: [
      "Subtracting the divisor one at a time is too slow for 2^31 / 1.",
      "Double the divisor (shift left) while it still fits in the dividend; subtract it and add that power of two to the answer.",
      "Work with absolute values, fix the sign at the end, and clamp the one overflow case."
    ],
    steps: [
      "If dividend == -2^31 and divisor == -1 return 2^31 - 1.",
      "neg = signs differ; a, b = abs values; q = 0.",
      "For k from 31 down to 0: if (b << k) <= a: a -= b << k; q |= 1 << k.",
      "Return -q if neg else q."
    ],
    time: "O(32)", space: "O(1)",
    trap: "-2^31 / -1 overflows 32-bit; it must return 2^31 - 1.",
    code: `class Solution:
    def divide(self, dividend: int, divisor: int) -> int:
        INT_MAX, INT_MIN = 2**31 - 1, -2**31
        if dividend == INT_MIN and divisor == -1:
            return INT_MAX
        neg = (dividend < 0) != (divisor < 0)
        a, b, q = abs(dividend), abs(divisor), 0
        for k in range(31, -1, -1):
            if (b << k) <= a:          # biggest shifted divisor that still fits
                a -= b << k
                q |= 1 << k
        return -q if neg else q`
  },
  {
    num: 1177, title: "Can Make Palindrome from Substring", slug: "can-make-palindrome-from-substring", lc: "Medium",
    topic: "bits",
    pattern: "Prefix XOR and parity masks",
    level: 4,
    order: 410,
    core: false,
    teaches: "Prefix parity masks answer each query in O(1): odd letters = popcount of the XOR of two masks.",
    learn: ["dsa_bits", "dsa-bt-patterns"],
    pre: [1310],
    hints: [
      "After rearranging, a palindrome needs at most one letter with an odd count. Each replacement fixes two odd letters.",
      "So you need (number of odd letters) // 2 <= k.",
      "Store a 26-bit parity mask for every prefix; the substring's mask is px[r + 1] ^ px[l]."
    ],
    steps: [
      "px = [0]; for c: px.append(px[-1] ^ (1 << (c - 'a'))).",
      "For [l, r, k]: odd = popcount(px[r + 1] ^ px[l]); answer odd // 2 <= k.",
      "Return the answers."
    ],
    time: "O(n + q)", space: "O(n)",
    trap: "Recounting letters for each query is O(26 n q) and too slow.",
    code: `class Solution:
    def canMakePaliQueries(self, s: str, queries: List[List[int]]) -> List[bool]:
        px = [0]
        for c in s:
            px.append(px[-1] ^ (1 << (ord(c) - 97)))
        return [bin(px[r + 1] ^ px[l]).count("1") // 2 <= k for l, r, k in queries]`
  },
  {
    num: 1371, title: "Find the Longest Substring Containing Vowels in Even Counts", slug: "find-the-longest-substring-containing-vowels-in-even-counts", lc: "Medium",
    topic: "bits",
    pattern: "Prefix XOR and parity masks",
    level: 4,
    order: 420,
    core: false,
    teaches: "Keep 5 parity bits (one per vowel) as a prefix mask; equal masks bound an even substring.",
    learn: ["dsa_bits", "dsa-bt-patterns"],
    pre: [1310],
    hints: [
      "You only care whether each vowel count is even or odd: 5 bits of state.",
      "Substring s[i..j] is good when the parity mask before i equals the mask after j.",
      "Store the first index where each mask appears; the longest substring uses the earliest one."
    ],
    steps: [
      "first = {0: -1}; mask = 0; best = 0.",
      "For i, c: if c is a vowel flip its bit in mask.",
      "If mask in first: best = max(best, i - first[mask]) else first[mask] = i.",
      "Return best."
    ],
    time: "O(n)", space: "O(32)",
    trap: "Seed first[0] = -1 so a good prefix starting at index 0 counts.",
    code: `class Solution:
    def findTheLongestSubstring(self, s: str) -> int:
        bit = {"a": 1, "e": 2, "i": 4, "o": 8, "u": 16}
        first = {0: -1}
        mask = best = 0
        for i, c in enumerate(s):
            mask ^= bit.get(c, 0)
            if mask in first:
                best = max(best, i - first[mask])
            else:
                first[mask] = i
        return best`
  },
  {
    num: 1915, title: "Number of Wonderful Substrings", slug: "number-of-wonderful-substrings", lc: "Medium",
    topic: "bits",
    pattern: "Prefix XOR and parity masks",
    level: 4,
    order: 430,
    core: true,
    teaches: "Parity mask + counting hashmap; also try every mask that differs by one bit.",
    learn: ["dsa_bits", "dsa-bt-patterns"],
    pre: [1371, 2588],
    hints: [
      "Track a 10-bit parity mask of letters a..j as a prefix.",
      "All-even substring: earlier prefix with the same mask. One odd letter: earlier mask differing in exactly one bit.",
      "Count how many times each mask has appeared, and check mask and mask ^ (1 << b) for each of 10 bits."
    ],
    steps: [
      "cnt = [0] * 1024; cnt[0] = 1; mask = 0; res = 0.",
      "For each c: mask ^= 1 << (c - 'a').",
      "res += cnt[mask] + sum(cnt[mask ^ (1 << b)] for b in 0..9).",
      "cnt[mask] += 1. Return res."
    ],
    time: "O(10 n)", space: "O(1024)",
    trap: "Count substrings, not their lengths, so store counts, not first indexes.",
    code: `class Solution:
    def wonderfulSubstrings(self, word: str) -> int:
        cnt = [0] * 1024
        cnt[0] = 1
        mask = res = 0
        for c in word:
            mask ^= 1 << (ord(c) - 97)
            res += cnt[mask]                     # all letters even
            for b in range(10):
                res += cnt[mask ^ (1 << b)]      # exactly one letter odd
            cnt[mask] += 1
        return res`
  },
  {
    num: 1601, title: "Maximum Number of Achievable Transfer Requests", slug: "maximum-number-of-achievable-transfer-requests", lc: "Hard",
    topic: "bits",
    pattern: "Enumerate subsets with a mask",
    level: 4,
    order: 440,
    core: false,
    teaches: "Try every subset of requests (m <= 16) and keep the biggest one whose net flow is zero everywhere.",
    learn: ["dsa_bits", "dsa-bt-subsets"],
    pre: [2397],
    hints: [
      "m is at most 16, so 65536 subsets is fine.",
      "A subset is valid when every building's out-count equals its in-count.",
      "Skip masks whose popcount can't beat the best you already have."
    ],
    steps: [
      "best = 0.",
      "For mask in range(1 << m): if popcount(mask) <= best skip.",
      "net = [0] * n; for each chosen request (a, b): net[a] -= 1; net[b] += 1.",
      "If all net are 0: best = popcount(mask). Return best."
    ],
    time: "O(2^m * (m + n))", space: "O(n)",
    trap: "Self-loop requests (a == b) are always fine; they fall out of the net check naturally.",
    code: `class Solution:
    def maximumRequests(self, n: int, requests: List[List[int]]) -> int:
        m, best = len(requests), 0
        for mask in range(1 << m):
            k = bin(mask).count("1")
            if k <= best:
                continue
            net = [0] * n
            for i in range(m):
                if mask >> i & 1:
                    a, b = requests[i]
                    net[a] -= 1
                    net[b] += 1
            if not any(net):
                best = k
        return best`
  },
  {
    num: 2151, title: "Maximum Good People Based on Statements", slug: "maximum-good-people-based-on-statements", lc: "Hard",
    topic: "bits",
    pattern: "Enumerate subsets with a mask",
    level: 4,
    order: 450,
    core: false,
    teaches: "Guess who is good with a mask (n <= 15) and check only the good people's statements.",
    learn: ["dsa_bits", "dsa-bt-subsets"],
    pre: [2212],
    hints: [
      "Bad people can say anything, so only good people's statements constrain the guess.",
      "Try every mask of 'good' people. For each good i and each j with statements[i][j] != 2, the statement must match bit j.",
      "Keep the largest popcount among consistent masks."
    ],
    steps: [
      "best = 0.",
      "For mask in range(1 << n): if popcount <= best skip.",
      "For each i in mask, each j: if statements[i][j] != 2 and statements[i][j] != (mask >> j & 1): invalid.",
      "If valid best = popcount. Return best."
    ],
    time: "O(2^n * n^2)", space: "O(1)",
    trap: "Don't check statements made by people you assumed bad.",
    code: `class Solution:
    def maximumGood(self, statements: List[List[int]]) -> int:
        n, best = len(statements), 0
        for mask in range(1 << n):
            k = bin(mask).count("1")
            if k <= best:
                continue
            ok = True
            for i in range(n):
                if not mask >> i & 1:
                    continue                    # bad people may lie
                for j in range(n):
                    st = statements[i][j]
                    if st != 2 and st != (mask >> j & 1):
                        ok = False
                        break
                if not ok:
                    break
            if ok:
                best = k
        return best`
  },
  {
    num: 2135, title: "Count Words Obtained After Adding a Letter", slug: "count-words-obtained-after-adding-a-letter", lc: "Medium",
    topic: "bits",
    pattern: "Letter set as a bitmask",
    level: 4,
    order: 460,
    core: false,
    teaches: "Rearranging means only the letter set matters; 'append a letter' means removing one bit from the target mask.",
    learn: ["dsa_bits", "dsa-bt-subsets"],
    pre: [318, 2506],
    hints: [
      "Order doesn't matter after rearranging, so each word is just its letter mask.",
      "A target t is reachable if t minus one of its letters equals some start mask.",
      "Put all start masks in a set; for each target try t ^ (1 << b) for every bit b in t."
    ],
    steps: [
      "starts = set of masks of startWords.",
      "For each target with mask t: if any (t ^ (1 << b)) in starts for bit b set in t: count += 1.",
      "Return count."
    ],
    time: "O(26 * (n + m))", space: "O(n)",
    trap: "You must add a new letter, so removing a letter has to hit a bit that is set in t.",
    code: `class Solution:
    def wordCount(self, startWords: List[str], targetWords: List[str]) -> int:
        def mask(w):
            m = 0
            for c in w:
                m |= 1 << (ord(c) - 97)
            return m
        starts = {mask(w) for w in startWords}
        count = 0
        for w in targetWords:
            t = mask(w)
            if any(t >> b & 1 and (t ^ (1 << b)) in starts for b in range(26)):
                count += 1
        return count`
  },
  {
    num: 1835, title: "Find XOR Sum of All Pairs Bitwise AND", slug: "find-xor-sum-of-all-pairs-bitwise-and", lc: "Hard",
    topic: "bits",
    pattern: "Per-bit reasoning",
    level: 4,
    order: 470,
    core: false,
    teaches: "AND distributes over XOR: XOR of all (a & b) = (XOR of arr1) & (XOR of arr2).",
    learn: ["dsa_bits", "dsa-bt-tricks"],
    pre: [477],
    hints: [
      "Look at one bit. When is the XOR of all a_i & b_j at that bit equal to 1?",
      "At one bit it is (count of ones in arr1) * (count in arr2) mod 2, which is parity1 AND parity2."
    ],
    steps: [
      "x = XOR of arr1; y = XOR of arr2.",
      "Return x & y."
    ],
    time: "O(n + m)", space: "O(1)",
    trap: "The n * m pairs loop is too slow (10^5 each); it's a one-line identity.",
    code: `class Solution:
    def getXORSum(self, arr1: List[int], arr2: List[int]) -> int:
        x = y = 0
        for a in arr1:
            x ^= a
        for b in arr2:
            y ^= b
        return x & y`
  },
  {
    num: 898, title: "Bitwise ORs of Subarrays", slug: "bitwise-ors-of-subarrays", lc: "Medium",
    topic: "bits",
    pattern: "AND/OR over subarrays",
    level: 4,
    order: 480,
    core: false,
    teaches: "ORs of subarrays ending at i form a set of at most ~32 values, built from the previous set.",
    learn: ["dsa_bits", "dsa-bt-patterns"],
    pre: [2401],
    hints: [
      "Think of all subarrays ending at index i. How do their ORs relate to those ending at i - 1?",
      "cur_i = {x | arr[i] for x in cur_(i-1)} plus {arr[i]}.",
      "OR only adds bits, so each set has at most about 30 distinct values."
    ],
    steps: [
      "res = set(); cur = set().",
      "For x: cur = {x | y for y in cur} | {x}; res |= cur.",
      "Return len(res)."
    ],
    time: "O(30 n)", space: "O(30 n)",
    trap: "Enumerating all subarrays is O(n^2) and too slow for n = 5 * 10^4.",
    code: `class Solution:
    def subarrayBitwiseORs(self, arr: List[int]) -> int:
        res, cur = set(), set()
        for x in arr:
            cur = {x | y for y in cur} | {x}   # ORs of subarrays ending here
            res |= cur
        return len(res)`
  },
  {
    num: 1238, title: "Circular Permutation in Binary Representation", slug: "circular-permutation-in-binary-representation", lc: "Medium",
    topic: "bits",
    pattern: "Gray code",
    level: 4,
    order: 490,
    core: false,
    teaches: "XOR every Gray code with start: still one-bit steps, and the sequence now begins at start.",
    learn: ["dsa_bits", "dsa-bt-tricks"],
    pre: [89],
    hints: [
      "Gray code already gives a cycle starting at 0.",
      "XOR-ing every element with the same value keeps 'differ by one bit' true. Which value maps 0 to start?"
    ],
    steps: [
      "Return [start ^ i ^ (i >> 1) for i in range(1 << n)]."
    ],
    time: "O(2^n)", space: "O(2^n) for the output",
    trap: "Rotating the Gray list to start works too, but needs to find start's position first.",
    code: `class Solution:
    def circularPermutation(self, n: int, start: int) -> List[int]:
        return [start ^ i ^ (i >> 1) for i in range(1 << n)]`
  },
  {
    num: 1542, title: "Find Longest Awesome Substring", slug: "find-longest-awesome-substring", lc: "Hard",
    topic: "bits",
    pattern: "Prefix XOR and parity masks",
    level: 5,
    order: 500,
    core: false,
    teaches: "Longest palindrome-permutable substring: earliest index per digit-parity mask, plus one-bit neighbours.",
    learn: ["dsa_bits", "dsa-bt-patterns"],
    pre: [1915, 1177],
    hints: [
      "A string can be rearranged into a palindrome when at most one character has an odd count.",
      "Combine Wonderful Substrings (mask or mask with one bit flipped) with Vowels in Even Counts (earliest index per mask)."
    ],
    steps: [
      "first = [inf] * 1024; first[0] = -1; mask = 0; best = 0.",
      "For i, c: mask ^= 1 << int(c).",
      "best = max(best, i - first[mask]); for b in 0..9: best = max(best, i - first[mask ^ (1 << b)]).",
      "If first[mask] is inf set it to i. Return best."
    ],
    time: "O(10 n)", space: "O(1024)",
    trap: "Only record the first time a mask is seen; overwriting it shortens answers.",
    code: `class Solution:
    def longestAwesome(self, s: str) -> int:
        INF = float("inf")
        first = [INF] * 1024
        first[0] = -1
        mask = best = 0
        for i, c in enumerate(s):
            mask ^= 1 << int(c)
            best = max(best, i - first[mask])
            for b in range(10):
                best = max(best, i - first[mask ^ (1 << b)])
            if first[mask] == INF:
                first[mask] = i
        return best`
  },
  {
    num: 1178, title: "Number of Valid Words for Each Puzzle", slug: "number-of-valid-words-for-each-puzzle", lc: "Hard",
    topic: "bits",
    pattern: "Letter set as a bitmask",
    level: 5,
    order: 510,
    core: false,
    teaches: "Count word masks, then for each puzzle walk only the submasks that contain its first letter.",
    learn: ["dsa_bits", "dsa-bt-subsets"],
    pre: [2135],
    hints: [
      "Words become masks; many words share a mask, so count them.",
      "A puzzle has 7 letters, so it has only 2^7 = 128 submasks. Enumerate them with sub = (sub - 1) & mask.",
      "Only count submasks that include the puzzle's first letter."
    ],
    steps: [
      "cnt = Counter of word masks (skip masks with more than 7 bits).",
      "For each puzzle: first = bit of puzzle[0]; rest = mask of the other letters.",
      "sub = rest; loop: total += cnt[sub | first]; if sub == 0 break; sub = (sub - 1) & rest.",
      "Append total."
    ],
    time: "O(W * L + P * 2^6)", space: "O(W)",
    trap: "The submask loop must also visit sub = 0 (word = just the first letter) before stopping.",
    code: `class Solution:
    def findNumOfValidWords(self, words: List[str], puzzles: List[str]) -> List[int]:
        cnt = Counter()
        for w in words:
            m = 0
            for c in w:
                m |= 1 << (ord(c) - 97)
            if bin(m).count("1") <= 7:
                cnt[m] += 1
        res = []
        for p in puzzles:
            first = 1 << (ord(p[0]) - 97)
            rest = 0
            for c in p[1:]:
                rest |= 1 << (ord(c) - 97)
            total, sub = 0, rest
            while True:
                total += cnt[sub | first]
                if sub == 0:
                    break
                sub = (sub - 1) & rest      # next smaller submask
            res.append(total)
        return res`
  },
  {
    num: 1521, title: "Find a Value of a Mysterious Function Closest to Target", slug: "find-a-value-of-a-mysterious-function-closest-to-target", lc: "Hard",
    topic: "bits",
    pattern: "AND/OR over subarrays",
    level: 5,
    order: 520,
    core: false,
    teaches: "Same trick with AND: subarray ANDs ending at i take at most ~20 values; check each against target.",
    learn: ["dsa_bits", "dsa-bt-patterns"],
    pre: [898],
    hints: [
      "func(arr, l, r) is just the AND of arr[l..r].",
      "Like Bitwise ORs of Subarrays: keep the set of ANDs of subarrays ending at i; AND only removes bits.",
      "For every value in the set, update best = min(best, abs(v - target))."
    ],
    steps: [
      "cur = set(); best = inf.",
      "For x: cur = {x & y for y in cur} | {x}.",
      "For v in cur: best = min(best, abs(v - target)).",
      "Return best."
    ],
    time: "O(20 n)", space: "O(20)",
    trap: "The set is small because each new AND either equals the old value or loses a bit.",
    code: `class Solution:
    def closestToTarget(self, arr: List[int], target: int) -> int:
        cur, best = set(), float("inf")
        for x in arr:
            cur = {x & y for y in cur} | {x}   # ANDs of subarrays ending here
            for v in cur:
                best = min(best, abs(v - target))
        return best`
  },
  {
    num: 1611, title: "Minimum One Bit Operations to Make Integers Zero", slug: "minimum-one-bit-operations-to-make-integers-zero", lc: "Hard",
    topic: "bits",
    pattern: "Gray code",
    level: 5,
    order: 530,
    core: false,
    teaches: "The allowed moves walk the Gray code sequence, so the answer is the Gray-code index of n.",
    learn: ["dsa_bits", "dsa-bt-tricks"],
    pre: [89],
    hints: [
      "The two operations are exactly the moves between neighbouring Gray codes.",
      "Going to 0 means walking back to index 0: the answer is the index i with i ^ (i >> 1) == n.",
      "Invert Gray code: i = n ^ (n >> 1) ^ (n >> 2) ^ ... (prefix XOR of the bits from the top)."
    ],
    steps: [
      "res = 0.",
      "While n: res ^= n; n >>= 1.",
      "Return res."
    ],
    time: "O(log n)", space: "O(1)",
    trap: "The recursive formula f(2^k) = 2^(k+1) - 1 also works but is easy to get off by one.",
    code: `class Solution:
    def minimumOneBitOperations(self, n: int) -> int:
        res = 0
        while n:              # inverse Gray code: XOR of all right shifts
            res ^= n
            n >>= 1
        return res`
  }
);
