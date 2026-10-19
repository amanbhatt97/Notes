// problems/math.js — Math & Number Theory ladder
PROBLEMS.push(
  {
    num: 1295, title: "Find Numbers with Even Number of Digits", slug: "find-numbers-with-even-number-of-digits", lc: "Easy",
    topic: "math",
    pattern: "Digits: peel with % 10",
    level: 1,
    order: 10,
    core: false,
    teaches: "Count digits by dividing by 10 until the number is 0.",
    learn: ["dsa_math", "dsa-mt-digits"],
    pre: [],
    hints: [
      "How many times can you do n //= 10 before n becomes 0?",
      "That count is the number of digits; check if it is even."
    ],
    steps: [
      "For each x: d = 0; while x: x //= 10; d += 1.",
      "Count the x whose d is even.",
      "Return the count."
    ],
    time: "O(n log M)", space: "O(1)",
    trap: "len(str(x)) is fine in Python; the digit loop is the skill to practise.",
    code: `class Solution:
    def findNumbers(self, nums: List[int]) -> int:
        res = 0
        for x in nums:
            d = 0
            while x:
                x //= 10
                d += 1
            res += d % 2 == 0
        return res`
  },
  {
    num: 9, title: "Palindrome Number", slug: "palindrome-number", lc: "Easy",
    topic: "math",
    pattern: "Digits: peel with % 10",
    level: 1,
    order: 20,
    core: true,
    teaches: "Build the reverse with rev = rev * 10 + x % 10; compare.",
    learn: ["dsa_math", "dsa-mt-digits"],
    pre: [1295],
    hints: [
      "Negative numbers are never palindromes (the '-' sign).",
      "Reverse the digits with % 10 and // 10 and compare with the original.",
      "Optional: reverse only half the digits and stop when rev >= x."
    ],
    steps: [
      "If x < 0 or (x % 10 == 0 and x != 0) return False.",
      "rev = 0; while x > rev: rev = rev * 10 + x % 10; x //= 10.",
      "Return x == rev or x == rev // 10 (odd length)."
    ],
    time: "O(log x)", space: "O(1)",
    trap: "Numbers ending in 0 (except 0 itself) cannot be palindromes; the half-reverse check needs that guard.",
    code: `class Solution:
    def isPalindrome(self, x: int) -> bool:
        if x < 0 or (x % 10 == 0 and x != 0):
            return False
        rev = 0
        while x > rev:                 # reverse only the second half
            rev = rev * 10 + x % 10
            x //= 10
        return x == rev or x == rev // 10`
  },
  {
    num: 66, title: "Plus One", slug: "plus-one", lc: "Easy",
    topic: "math",
    pattern: "Big-number arithmetic on strings",
    level: 1,
    order: 30,
    core: true,
    teaches: "Add with carry from the last digit; a 9 becomes 0 and the carry moves left.",
    learn: ["dsa_math", "dsa-mt-digits"],
    pre: [],
    hints: [
      "Start from the last digit. When does the carry stop?",
      "Turn trailing 9s into 0; the first non-9 gets +1. All 9s: put a 1 in front."
    ],
    steps: [
      "For i from n-1 down to 0: if digits[i] < 9: digits[i] += 1; return digits. Else digits[i] = 0.",
      "Return [1] + digits."
    ],
    time: "O(n)", space: "O(1) (O(n) when all digits are 9)",
    trap: "[9, 9] must become [1, 0, 0], not [10, 0].",
    code: `class Solution:
    def plusOne(self, digits: List[int]) -> List[int]:
        for i in range(len(digits) - 1, -1, -1):
            if digits[i] < 9:
                digits[i] += 1
                return digits
            digits[i] = 0
        return [1] + digits`
  },
  {
    num: 171, title: "Excel Sheet Column Number", slug: "excel-sheet-column-number", lc: "Easy",
    topic: "math",
    pattern: "Number bases and conversions",
    level: 1,
    order: 40,
    core: true,
    teaches: "Read a base-26 number left to right: value = value * 26 + digit.",
    learn: ["dsa_math", "dsa-mt-digits"],
    pre: [],
    hints: [
      "Think of A..Z as digits 1..26 in base 26.",
      "Same as reading decimal: res = res * 26 + (letter value)."
    ],
    steps: [
      "res = 0.",
      "For c: res = res * 26 + (ord(c) - ord('A') + 1).",
      "Return res."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Letters are 1..26, not 0..25.",
    code: `class Solution:
    def titleToNumber(self, columnTitle: str) -> int:
        res = 0
        for c in columnTitle:
            res = res * 26 + (ord(c) - 64)
        return res`
  },
  {
    num: 504, title: "Base 7", slug: "base-7", lc: "Easy",
    topic: "math",
    pattern: "Number bases and conversions",
    level: 1,
    order: 50,
    core: false,
    teaches: "Base conversion: repeatedly take n % base as the next digit from the right, then n //= base.",
    learn: ["dsa_math", "dsa-mt-digits"],
    pre: [],
    hints: [
      "Same as peeling decimal digits, but with 7 instead of 10.",
      "Handle the sign separately and 0 as a special case."
    ],
    steps: [
      "If num == 0 return '0'.",
      "n = abs(num); out = [].",
      "While n: out.append(n % 7); n //= 7.",
      "Return '-' if negative, plus reversed digits."
    ],
    time: "O(log n)", space: "O(log n)",
    trap: "0 must return '0', not an empty string.",
    code: `class Solution:
    def convertToBase7(self, num: int) -> str:
        if num == 0:
            return "0"
        n, out = abs(num), []
        while n:
            n, d = divmod(n, 7)
            out.append(str(d))
        return ("-" if num < 0 else "") + "".join(reversed(out))`
  },
  {
    num: 1979, title: "Find Greatest Common Divisor of Array", slug: "find-greatest-common-divisor-of-array", lc: "Easy",
    topic: "math",
    pattern: "GCD and LCM",
    level: 1,
    order: 60,
    core: false,
    teaches: "Euclid: gcd(a, b) = gcd(b, a % b) until b is 0.",
    learn: ["dsa_math", "dsa-mt-gcd"],
    pre: [],
    hints: [
      "Find the smallest and largest numbers first.",
      "Then apply Euclid's algorithm (or math.gcd)."
    ],
    steps: [
      "a, b = min(nums), max(nums).",
      "While b: a, b = b, a % b.",
      "Return a."
    ],
    time: "O(n + log M)", space: "O(1)",
    trap: "It's the gcd of only min and max, not of the whole array.",
    code: `class Solution:
    def findGCD(self, nums: List[int]) -> int:
        a, b = min(nums), max(nums)
        while b:
            a, b = b, a % b
        return a`
  },
  {
    num: 263, title: "Ugly Number", slug: "ugly-number", lc: "Easy",
    topic: "math",
    pattern: "Primes and sieve",
    level: 1,
    order: 70,
    core: true,
    teaches: "Divide out every allowed prime factor; what's left must be 1.",
    learn: ["dsa_math", "dsa-mt-factor"],
    pre: [],
    hints: [
      "Keep dividing n by 2 while you can, then by 3, then by 5.",
      "If anything other than 1 remains, n had another prime factor."
    ],
    steps: [
      "If n <= 0 return False.",
      "For p in (2, 3, 5): while n % p == 0: n //= p.",
      "Return n == 1."
    ],
    time: "O(log n)", space: "O(1)",
    trap: "0 and negatives are not ugly; 0 would loop forever.",
    code: `class Solution:
    def isUgly(self, n: int) -> bool:
        if n <= 0:
            return False
        for p in (2, 3, 5):
            while n % p == 0:
                n //= p
        return n == 1`
  },
  {
    num: 507, title: "Perfect Number", slug: "perfect-number", lc: "Easy",
    topic: "math",
    pattern: "Divisors and factorization",
    level: 1,
    order: 80,
    core: true,
    teaches: "Divisors come in pairs (d, n // d), so loop d only up to sqrt(n).",
    learn: ["dsa_math", "dsa-mt-factor"],
    pre: [],
    hints: [
      "Checking every d < n is too slow for 10^8.",
      "If d divides n, so does n // d. Add both, stopping at sqrt(n)."
    ],
    steps: [
      "If n <= 1 return False.",
      "total = 1.",
      "For d in 2..isqrt(n): if n % d == 0: total += d + (n // d if n // d != d else 0).",
      "Return total == n."
    ],
    time: "O(sqrt n)", space: "O(1)",
    trap: "Don't add the square root twice, and don't add n itself.",
    code: `class Solution:
    def checkPerfectNumber(self, num: int) -> bool:
        if num <= 1:
            return False
        total = 1
        for d in range(2, math.isqrt(num) + 1):
            if num % d == 0:
                total += d
                if d != num // d:
                    total += num // d
        return total == num`
  },
  {
    num: 326, title: "Power of Three", slug: "power-of-three", lc: "Easy",
    topic: "math",
    pattern: "Powers and fast exponentiation",
    level: 1,
    order: 90,
    core: false,
    teaches: "Divide by 3 while you can; a power of three ends at exactly 1.",
    learn: ["dsa_math", "dsa-mt-pow"],
    pre: [],
    hints: [
      "Keep dividing by 3 while n % 3 == 0.",
      "Trick: 3^19 is the largest power of 3 in int range; n is a power of 3 iff it divides 3^19."
    ],
    steps: [
      "If n <= 0 return False.",
      "While n % 3 == 0: n //= 3.",
      "Return n == 1."
    ],
    time: "O(log n)", space: "O(1)",
    trap: "n = 0 loops forever without the n <= 0 check.",
    code: `class Solution:
    def isPowerOfThree(self, n: int) -> bool:
        if n <= 0:
            return False
        while n % 3 == 0:
            n //= 3
        return n == 1`
  },
  {
    num: 2652, title: "Sum Multiples", slug: "sum-multiples", lc: "Easy",
    topic: "math",
    pattern: "Modular arithmetic and remainders",
    level: 1,
    order: 100,
    core: false,
    teaches: "x % k == 0 tests divisibility; inclusion-exclusion gives an O(1) version.",
    learn: ["dsa_math", "dsa-mt-mod"],
    pre: [],
    hints: [
      "Loop i from 1 to n and test i % 3, i % 5, i % 7.",
      "O(1) idea: sum of multiples of k up to n is k * m * (m + 1) / 2 with m = n // k; combine with inclusion-exclusion."
    ],
    steps: [
      "total = 0.",
      "For i in 1..n: if i % 3 == 0 or i % 5 == 0 or i % 7 == 0: total += i.",
      "Return total."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Numbers divisible by more than one of 3, 5, 7 must be added once.",
    code: `class Solution:
    def sumOfMultiples(self, n: int) -> int:
        return sum(i for i in range(1, n + 1) if i % 3 == 0 or i % 5 == 0 or i % 7 == 0)`
  },
  {
    num: 118, title: "Pascal's Triangle", slug: "pascals-triangle", lc: "Easy",
    topic: "math",
    pattern: "Combinatorics and counting",
    level: 1,
    order: 110,
    core: true,
    teaches: "Each inner entry is the sum of the two above it: C(n, k) = C(n-1, k-1) + C(n-1, k).",
    learn: ["dsa_math", "dsa-mt-comb"],
    pre: [],
    hints: [
      "Every row starts and ends with 1.",
      "Middle value j of a row = previous row[j - 1] + previous row[j]."
    ],
    steps: [
      "rows = [[1]].",
      "Repeat numRows - 1 times: prev = rows[-1]; rows.append([1] + [prev[j-1] + prev[j] for j in 1..len(prev)-1] + [1]).",
      "Return rows."
    ],
    time: "O(n^2)", space: "O(n^2) for the output",
    trap: "numRows = 1 should return [[1]] only.",
    code: `class Solution:
    def generate(self, numRows: int) -> List[List[int]]:
        rows = [[1]]
        for _ in range(numRows - 1):
            prev = rows[-1]
            rows.append([1] + [prev[j - 1] + prev[j] for j in range(1, len(prev))] + [1])
        return rows`
  },
  {
    num: 1523, title: "Count Odd Numbers in an Interval Range", slug: "count-odd-numbers-in-an-interval-range", lc: "Easy",
    topic: "math",
    pattern: "Formulas and sums",
    level: 1,
    order: 120,
    core: false,
    teaches: "Count of odds in [0, x] is (x + 1) // 2; subtract two prefix counts.",
    learn: ["dsa_math", "dsa-mt-patterns"],
    pre: [],
    hints: [
      "How many odd numbers are in 0..x?",
      "Answer = odds(high) - odds(low - 1)."
    ],
    steps: [
      "Return (high + 1) // 2 - low // 2."
    ],
    time: "O(1)", space: "O(1)",
    trap: "Looping from low to high is too slow for 10^9.",
    code: `class Solution:
    def countOdds(self, low: int, high: int) -> int:
        return (high + 1) // 2 - low // 2`
  },
  {
    num: 2485, title: "Find the Pivot Integer", slug: "find-the-pivot-integer", lc: "Easy",
    topic: "math",
    pattern: "Formulas and sums",
    level: 1,
    order: 130,
    core: false,
    teaches: "Sum 1..x equals sum x..n exactly when x^2 = n(n+1)/2.",
    learn: ["dsa_math", "dsa-mt-patterns"],
    pre: [1523],
    hints: [
      "Write both sums with the formula k(k+1)/2.",
      "They are equal when x * x = n * (n + 1) / 2; check whether that is a perfect square."
    ],
    steps: [
      "t = n * (n + 1) // 2.",
      "x = isqrt(t).",
      "Return x if x * x == t else -1."
    ],
    time: "O(1)", space: "O(1)",
    trap: "Floating sqrt may round; use math.isqrt and check exactly.",
    code: `class Solution:
    def pivotInteger(self, n: int) -> int:
        t = n * (n + 1) // 2
        x = math.isqrt(t)
        return x if x * x == t else -1`
  },
  {
    num: 1266, title: "Minimum Time Visiting All Points", slug: "minimum-time-visiting-all-points", lc: "Easy",
    topic: "math",
    pattern: "Geometry",
    level: 1,
    order: 140,
    core: false,
    teaches: "With diagonal moves, the time between two points is max(|dx|, |dy|) (Chebyshev distance).",
    learn: ["dsa_math", "dsa-mt-patterns"],
    pre: [],
    hints: [
      "A diagonal step fixes both x and y at once.",
      "Go diagonally until one coordinate matches, then straight: max(dx, dy) steps."
    ],
    steps: [
      "total = 0.",
      "For each consecutive pair: total += max(abs(x2 - x1), abs(y2 - y1)).",
      "Return total."
    ],
    time: "O(n)", space: "O(1)",
    trap: "It's not dx + dy (Manhattan) because diagonals are allowed.",
    code: `class Solution:
    def minTimeToVisitAllPoints(self, points: List[List[int]]) -> int:
        total = 0
        for (x1, y1), (x2, y2) in zip(points, points[1:]):
            total += max(abs(x2 - x1), abs(y2 - y1))
        return total`
  },
  {
    num: 2582, title: "Pass the Pillow", slug: "pass-the-pillow", lc: "Easy",
    topic: "math",
    pattern: "Simulation and cycles",
    level: 1,
    order: 150,
    core: false,
    teaches: "A back-and-forth walk repeats every 2(n - 1) steps; reduce time with % first.",
    learn: ["dsa_math", "dsa-mt-patterns"],
    pre: [],
    hints: [
      "The pillow goes to the end and back: one full round trip takes 2(n - 1) seconds.",
      "t = time % (2(n - 1)). If t < n - 1 it's moving forward, else backward."
    ],
    steps: [
      "t = time % (2 * (n - 1)).",
      "Forward half (t < n): return 1 + t.",
      "Backward half: return 2n - 1 - t."
    ],
    time: "O(1)", space: "O(1)",
    trap: "The period is 2(n - 1), not 2n: the end person is not visited twice in a row.",
    code: `class Solution:
    def passThePillow(self, n: int, time: int) -> int:
        t = time % (2 * (n - 1))
        return 1 + t if t < n else 2 * n - 1 - t`
  },
  {
    num: 657, title: "Robot Return to Origin", slug: "robot-return-to-origin", lc: "Easy",
    topic: "math",
    pattern: "Simulation and cycles",
    level: 1,
    order: 160,
    core: false,
    teaches: "Simulate with (x, y) or just compare opposite move counts.",
    learn: ["dsa_math", "dsa-mt-patterns"],
    pre: [],
    hints: [
      "Track x and y as you read the moves.",
      "Back at the origin means #U == #D and #L == #R."
    ],
    steps: [
      "Return moves.count('U') == moves.count('D') and moves.count('L') == moves.count('R')."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Direction letters are U, D, L, R; the robot's facing doesn't matter here.",
    code: `class Solution:
    def judgeCircle(self, moves: str) -> bool:
        return moves.count("U") == moves.count("D") and moves.count("L") == moves.count("R")`
  },
  {
    num: 258, title: "Add Digits", slug: "add-digits", lc: "Easy",
    topic: "math",
    pattern: "Digits: peel with % 10",
    level: 2,
    order: 170,
    core: true,
    teaches: "Digital root: repeated digit sums equal 1 + (n - 1) % 9 because 10 = 1 mod 9.",
    learn: ["dsa_math", "dsa-mt-digits"],
    pre: [1295],
    hints: [
      "Loop version: while n >= 10, replace n by its digit sum.",
      "For O(1): a number and its digit sum have the same remainder mod 9.",
      "So the answer is n % 9, except multiples of 9 give 9 and 0 gives 0."
    ],
    steps: [
      "If n == 0 return 0.",
      "Return 1 + (n - 1) % 9."
    ],
    time: "O(1)", space: "O(1)",
    trap: "n % 9 alone returns 0 for 9, 18, ...; the answer there is 9.",
    code: `class Solution:
    def addDigits(self, num: int) -> int:
        if num == 0:
            return 0
        return 1 + (num - 1) % 9`
  },
  {
    num: 7, title: "Reverse Integer", slug: "reverse-integer", lc: "Medium",
    topic: "math",
    pattern: "Digits: peel with % 10",
    level: 2,
    order: 180,
    core: true,
    teaches: "Reverse digits of the absolute value, then check the 32-bit range.",
    learn: ["dsa_math", "dsa-mt-digits"],
    pre: [9],
    hints: [
      "Handle the sign separately and reverse abs(x) with % 10 and // 10.",
      "After reversing, return 0 if the result is outside [-2^31, 2^31 - 1]."
    ],
    steps: [
      "sign = -1 if x < 0 else 1; x = abs(x).",
      "rev = 0; while x: rev = rev * 10 + x % 10; x //= 10.",
      "rev *= sign; return rev if -2^31 <= rev <= 2^31 - 1 else 0."
    ],
    time: "O(log x)", space: "O(1)",
    trap: "Python's % on negatives gives a positive remainder (-123 % 10 == 7); work with abs(x).",
    code: `class Solution:
    def reverse(self, x: int) -> int:
        sign = -1 if x < 0 else 1
        x, rev = abs(x), 0
        while x:
            rev = rev * 10 + x % 10
            x //= 10
        rev *= sign
        return rev if -2**31 <= rev <= 2**31 - 1 else 0`
  },
  {
    num: 202, title: "Happy Number", slug: "happy-number", lc: "Easy",
    topic: "math",
    pattern: "Digits: peel with % 10",
    level: 2,
    order: 190,
    core: true,
    teaches: "A repeating sequence is a cycle: detect it with a set or Floyd's slow/fast pointers.",
    learn: ["dsa_math", "dsa-mt-patterns"],
    pre: [258],
    hints: [
      "Compute a few steps by hand for 2. What happens?",
      "Either you reach 1 or you see a number again. A set of seen numbers detects the repeat.",
      "For O(1) space, move a slow and a fast pointer (Floyd) through the sequence."
    ],
    steps: [
      "nxt(x) = sum of squares of digits.",
      "slow = n, fast = nxt(n).",
      "While fast != 1 and slow != fast: slow = nxt(slow); fast = nxt(nxt(fast)).",
      "Return fast == 1."
    ],
    time: "O(log n)", space: "O(1)",
    trap: "Without cycle detection the loop for an unhappy number never ends.",
    code: `class Solution:
    def isHappy(self, n: int) -> bool:
        def nxt(x):
            total = 0
            while x:
                x, d = divmod(x, 10)
                total += d * d
            return total
        slow, fast = n, nxt(n)
        while fast != 1 and slow != fast:   # Floyd cycle detection
            slow = nxt(slow)
            fast = nxt(nxt(fast))
        return fast == 1`
  },
  {
    num: 415, title: "Add Strings", slug: "add-strings", lc: "Easy",
    topic: "math",
    pattern: "Big-number arithmetic on strings",
    level: 2,
    order: 200,
    core: false,
    teaches: "School addition on strings: two pointers from the right plus a carry.",
    learn: ["dsa_math", "dsa-mt-digits"],
    pre: [66],
    hints: [
      "You can't convert to int (that's the point). Add digit by digit from the right.",
      "Continue while either string has digits or there is a carry."
    ],
    steps: [
      "i, j = last indexes; carry = 0; out = [].",
      "While i >= 0 or j >= 0 or carry: total = carry + digit(i) + digit(j); out.append(total % 10); carry = total // 10.",
      "Return reversed out joined."
    ],
    time: "O(max(m, n))", space: "O(max(m, n))",
    trap: "Remember the final carry ('9' + '1' = '10').",
    code: `class Solution:
    def addStrings(self, num1: str, num2: str) -> str:
        i, j, carry, out = len(num1) - 1, len(num2) - 1, 0, []
        while i >= 0 or j >= 0 or carry:
            total = carry
            if i >= 0:
                total += ord(num1[i]) - 48; i -= 1
            if j >= 0:
                total += ord(num2[j]) - 48; j -= 1
            out.append(chr(48 + total % 10))
            carry = total // 10
        return "".join(reversed(out))`
  },
  {
    num: 168, title: "Excel Sheet Column Title", slug: "excel-sheet-column-title", lc: "Easy",
    topic: "math",
    pattern: "Number bases and conversions",
    level: 2,
    order: 210,
    core: true,
    teaches: "Base 26 with no zero digit: subtract 1 before each divmod.",
    learn: ["dsa_math", "dsa-mt-digits"],
    pre: [171],
    hints: [
      "Try normal base-26 conversion on 26. Why does it break?",
      "Digits run 1..26, so shift to 0..25 first: n -= 1, then take n % 26 and n //= 26."
    ],
    steps: [
      "out = [].",
      "While n: n -= 1; out.append(chr(ord('A') + n % 26)); n //= 26.",
      "Return reversed out."
    ],
    time: "O(log n)", space: "O(log n)",
    trap: "26 must be 'Z', not 'A@' or 'BA'; the -1 shift fixes it.",
    code: `class Solution:
    def convertToTitle(self, columnNumber: int) -> str:
        out = []
        n = columnNumber
        while n:
            n -= 1                      # shift digits 1..26 to 0..25
            out.append(chr(65 + n % 26))
            n //= 26
        return "".join(reversed(out))`
  },
  {
    num: 12, title: "Integer to Roman", slug: "integer-to-roman", lc: "Medium",
    topic: "math",
    pattern: "Number bases and conversions",
    level: 2,
    order: 220,
    core: false,
    teaches: "Greedy over a value table that already includes the six subtractive pairs.",
    learn: ["dsa_math", "dsa-mt-digits"],
    pre: [13],
    hints: [
      "Put CM, CD, XC, XL, IX, IV into the table as their own symbols.",
      "Then, from biggest to smallest, take each value as many times as it fits."
    ],
    steps: [
      "table = [(1000,'M'), (900,'CM'), ..., (4,'IV'), (1,'I')].",
      "For v, sym: while num >= v: append sym; num -= v.",
      "Return the string."
    ],
    time: "O(1)", space: "O(1)",
    trap: "Without the subtractive pairs in the table you would produce 'IIII' for 4.",
    code: `class Solution:
    def intToRoman(self, num: int) -> str:
        table = [(1000, "M"), (900, "CM"), (500, "D"), (400, "CD"), (100, "C"), (90, "XC"),
                 (50, "L"), (40, "XL"), (10, "X"), (9, "IX"), (5, "V"), (4, "IV"), (1, "I")]
        out = []
        for v, sym in table:
            while num >= v:
                out.append(sym)
                num -= v
        return "".join(out)`
  },
  {
    num: 1071, title: "Greatest Common Divisor of Strings", slug: "greatest-common-divisor-of-strings", lc: "Easy",
    topic: "math",
    pattern: "GCD and LCM",
    level: 2,
    order: 230,
    core: true,
    teaches: "If s1 + s2 == s2 + s1 the strings share a base; its length is gcd(len1, len2).",
    learn: ["dsa_math", "dsa-mt-gcd"],
    pre: [1979],
    hints: [
      "If a string x divides both, what can you say about s1 + s2 versus s2 + s1?",
      "When they are equal, the longest divisor has length gcd(len(s1), len(s2))."
    ],
    steps: [
      "If s1 + s2 != s2 + s1 return ''.",
      "Return s1[:gcd(len(s1), len(s2))]."
    ],
    time: "O(m + n)", space: "O(m + n)",
    trap: "Checking only that the shorter string is a prefix of the longer is not enough ('ABAB' vs 'AB A').",
    code: `class Solution:
    def gcdOfStrings(self, str1: str, str2: str) -> str:
        if str1 + str2 != str2 + str1:
            return ""
        return str1[:math.gcd(len(str1), len(str2))]`
  },
  {
    num: 914, title: "X of a Kind in a Deck of Cards", slug: "x-of-a-kind-in-a-deck-of-cards", lc: "Easy",
    topic: "math",
    pattern: "GCD and LCM",
    level: 2,
    order: 240,
    core: false,
    teaches: "A group size X works for every count only if X divides all counts: gcd of counts >= 2.",
    learn: ["dsa_math", "dsa-mt-gcd"],
    pre: [1979],
    hints: [
      "Count each card value.",
      "X must divide every count. The biggest such X is the gcd of the counts."
    ],
    steps: [
      "cnt = Counter(deck).",
      "g = gcd of all counts.",
      "Return g >= 2."
    ],
    time: "O(n log n)", space: "O(n)",
    trap: "Counts 4 and 6 work (X = 2) even though neither divides the other.",
    code: `class Solution:
    def hasGroupsSizeX(self, deck: List[int]) -> bool:
        g = 0
        for c in Counter(deck).values():
            g = math.gcd(g, c)
        return g >= 2`
  },
  {
    num: 204, title: "Count Primes", slug: "count-primes", lc: "Medium",
    topic: "math",
    pattern: "Primes and sieve",
    level: 2,
    order: 250,
    core: true,
    teaches: "Sieve of Eratosthenes: cross out multiples of each prime starting at p * p.",
    learn: ["dsa_math", "dsa-mt-primes"],
    pre: [263],
    hints: [
      "Testing each number for primality is O(n sqrt n): too slow for 5 * 10^6.",
      "Mark multiples of every prime as composite; the unmarked ones are prime.",
      "Start crossing out at p * p, and only for p up to sqrt(n)."
    ],
    steps: [
      "If n < 3 return 0.",
      "is_p = [True] * n; is_p[0] = is_p[1] = False.",
      "For p in 2..isqrt(n - 1): if is_p[p]: mark p*p, p*p + p, ... False.",
      "Return sum(is_p)."
    ],
    time: "O(n log log n)", space: "O(n)",
    trap: "Primes strictly LESS than n: count_primes(2) is 0.",
    code: `class Solution:
    def countPrimes(self, n: int) -> int:
        if n < 3:
            return 0
        is_p = bytearray([1]) * n
        is_p[0] = is_p[1] = 0
        for p in range(2, math.isqrt(n - 1) + 1):
            if is_p[p]:
                is_p[p * p::p] = bytearray(len(range(p * p, n, p)))   # cross out multiples
        return sum(is_p)`
  },
  {
    num: 1492, title: "The kth Factor of n", slug: "the-kth-factor-of-n", lc: "Medium",
    topic: "math",
    pattern: "Divisors and factorization",
    level: 2,
    order: 260,
    core: false,
    teaches: "List small divisors up to sqrt(n); the large ones are n // small in reverse order.",
    learn: ["dsa_math", "dsa-mt-factor"],
    pre: [507],
    hints: [
      "The simple O(n) loop works for n <= 1000.",
      "For O(sqrt n): collect divisors d <= sqrt(n); the rest are n // d, in reverse."
    ],
    steps: [
      "small = [d for d in 1..isqrt(n) if n % d == 0].",
      "large = [n // d for d in reversed(small) if d * d != n].",
      "divs = small + large; return divs[k - 1] if k <= len(divs) else -1."
    ],
    time: "O(sqrt n)", space: "O(sqrt n)",
    trap: "For perfect squares, sqrt(n) appears once, not twice.",
    code: `class Solution:
    def kthFactor(self, n: int, k: int) -> int:
        small = [d for d in range(1, math.isqrt(n) + 1) if n % d == 0]
        large = [n // d for d in reversed(small) if d * d != n]
        divs = small + large
        return divs[k - 1] if k <= len(divs) else -1`
  },
  {
    num: 50, title: "Pow(x, n)", slug: "powx-n", lc: "Medium",
    topic: "math",
    pattern: "Powers and fast exponentiation",
    level: 2,
    order: 270,
    core: true,
    teaches: "Fast power: square the base and halve the exponent; multiply in when the low bit is 1.",
    learn: ["dsa_math", "dsa-mt-pow"],
    pre: [],
    hints: [
      "x^n = (x^2)^(n/2) for even n. That halves the work each step.",
      "Walk the bits of n: when the current bit is 1, multiply the result by the current base.",
      "Negative n: compute (1/x)^(-n)."
    ],
    steps: [
      "If n < 0: x, n = 1 / x, -n.",
      "res = 1.0.",
      "While n: if n & 1: res *= x. x *= x; n >>= 1.",
      "Return res."
    ],
    time: "O(log n)", space: "O(1)",
    trap: "n = -2^31: in Java/C++ -n overflows; Python is fine but remember the case.",
    code: `class Solution:
    def myPow(self, x: float, n: int) -> float:
        if n < 0:
            x, n = 1 / x, -n
        res = 1.0
        while n:
            if n & 1:
                res *= x
            x *= x
            n >>= 1
        return res`
  },
  {
    num: 1018, title: "Binary Prefix Divisible By 5", slug: "binary-prefix-divisible-by-5", lc: "Easy",
    topic: "math",
    pattern: "Modular arithmetic and remainders",
    level: 2,
    order: 280,
    core: false,
    teaches: "Keep only the running value mod 5: r = (2r + bit) % 5.",
    learn: ["dsa_math", "dsa-mt-mod"],
    pre: [2652],
    hints: [
      "Appending a bit doubles the number and adds the bit.",
      "The numbers get huge, but you only need them mod 5, and (2x + b) % 5 depends only on x % 5."
    ],
    steps: [
      "r = 0; out = [].",
      "For b in nums: r = (r * 2 + b) % 5; out.append(r == 0).",
      "Return out."
    ],
    time: "O(n)", space: "O(1) extra",
    trap: "Building the full number is O(n^2) bit work for n = 10^5.",
    code: `class Solution:
    def prefixesDivBy5(self, nums: List[int]) -> List[bool]:
        r, out = 0, []
        for b in nums:
            r = (r * 2 + b) % 5
            out.append(r == 0)
        return out`
  },
  {
    num: 119, title: "Pascal's Triangle II", slug: "pascals-triangle-ii", lc: "Easy",
    topic: "math",
    pattern: "Combinatorics and counting",
    level: 2,
    order: 290,
    core: false,
    teaches: "One row in O(k) space: update right to left, or use C(k, j) = C(k, j-1) * (k - j + 1) / j.",
    learn: ["dsa_math", "dsa-mt-comb"],
    pre: [118],
    hints: [
      "You only need one row. Can you update it in place?",
      "Go from right to left so you don't overwrite values you still need.",
      "Or compute each entry from the previous one with the nCr ratio."
    ],
    steps: [
      "row = [1].",
      "For j in 1..k: row.append(row[-1] * (k - j + 1) // j).",
      "Return row."
    ],
    time: "O(k)", space: "O(k)",
    trap: "Multiply before dividing; integer division first loses precision.",
    code: `class Solution:
    def getRow(self, rowIndex: int) -> List[int]:
        row = [1]
        for j in range(1, rowIndex + 1):
            row.append(row[-1] * (rowIndex - j + 1) // j)   # C(k, j) from C(k, j-1)
        return row`
  },
  {
    num: 1716, title: "Calculate Money in Leetcode Bank", slug: "calculate-money-in-leetcode-bank", lc: "Easy",
    topic: "math",
    pattern: "Formulas and sums",
    level: 2,
    order: 300,
    core: false,
    teaches: "Split into full weeks and leftover days; each part is an arithmetic series.",
    learn: ["dsa_math", "dsa-mt-patterns"],
    pre: [1523],
    hints: [
      "Week w (0-based) deposits 28 + 7w in total.",
      "Full weeks: sum over w < n // 7. Leftover d days of week w: (w + 1) + ... + (w + d)."
    ],
    steps: [
      "w, d = divmod(n, 7).",
      "full = 28 * w + 7 * w * (w - 1) // 2.",
      "part = d * (w + 1) + d * (d - 1) // 2.",
      "Return full + part."
    ],
    time: "O(1)", space: "O(1)",
    trap: "Each new Monday starts one dollar higher than the previous Monday, not than the previous day.",
    code: `class Solution:
    def totalMoney(self, n: int) -> int:
        w, d = divmod(n, 7)
        full = 28 * w + 7 * w * (w - 1) // 2
        part = d * (w + 1) + d * (d - 1) // 2
        return full + part`
  },
  {
    num: 1232, title: "Check If It Is a Straight Line", slug: "check-if-it-is-a-straight-line", lc: "Easy",
    topic: "math",
    pattern: "Geometry",
    level: 2,
    order: 310,
    core: true,
    teaches: "Compare slopes by cross-multiplying, so vertical lines and fractions need no division.",
    learn: ["dsa_math", "dsa-mt-patterns"],
    pre: [1266],
    hints: [
      "Slopes from the first point to every other point must be equal.",
      "Avoid division (vertical lines!): dy1 * dx2 == dy2 * dx1."
    ],
    steps: [
      "(x0, y0), (x1, y1) = first two points; dx, dy = x1 - x0, y1 - y0.",
      "For every point (x, y): if dy * (x - x0) != dx * (y - y0) return False.",
      "Return True."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Dividing to get slopes crashes on vertical lines (dx = 0).",
    code: `class Solution:
    def checkStraightLine(self, coordinates: List[List[int]]) -> bool:
        (x0, y0), (x1, y1) = coordinates[0], coordinates[1]
        dx, dy = x1 - x0, y1 - y0
        return all(dy * (x - x0) == dx * (y - y0) for x, y in coordinates)`
  },
  {
    num: 836, title: "Rectangle Overlap", slug: "rectangle-overlap", lc: "Easy",
    topic: "math",
    pattern: "Geometry",
    level: 2,
    order: 320,
    core: false,
    teaches: "Two rectangles overlap iff their x-intervals and y-intervals both overlap with positive length.",
    learn: ["dsa_math", "dsa-mt-patterns"],
    pre: [1266],
    hints: [
      "Split the problem into the x axis and the y axis.",
      "Intervals [a1, a2] and [b1, b2] overlap with positive length iff max(a1, b1) < min(a2, b2)."
    ],
    steps: [
      "x_ok = max(r1[0], r2[0]) < min(r1[2], r2[2]).",
      "y_ok = max(r1[1], r2[1]) < min(r1[3], r2[3]).",
      "Return x_ok and y_ok."
    ],
    time: "O(1)", space: "O(1)",
    trap: "Touching edges or corners is not overlap: use strict <.",
    code: `class Solution:
    def isRectangleOverlap(self, rec1: List[int], rec2: List[int]) -> bool:
        return (max(rec1[0], rec2[0]) < min(rec1[2], rec2[2]) and
                max(rec1[1], rec2[1]) < min(rec1[3], rec2[3]))`
  },
  {
    num: 874, title: "Walking Robot Simulation", slug: "walking-robot-simulation", lc: "Medium",
    topic: "math",
    pattern: "Simulation and cycles",
    level: 2,
    order: 330,
    core: false,
    teaches: "Direction index into a dx/dy table; turning is (d +- 1) % 4; obstacles in a set.",
    learn: ["dsa_math", "dsa-mt-patterns"],
    pre: [657],
    hints: [
      "Keep the direction as an index 0..3 into [(0,1), (1,0), (0,-1), (-1,0)].",
      "Turn right: d = (d + 1) % 4; turn left: d = (d + 3) % 4.",
      "Move one unit at a time and stop before an obstacle (set of tuples for O(1) lookup)."
    ],
    steps: [
      "obs = set of tuples; x = y = d = 0; best = 0.",
      "For c: -2 turn left, -1 turn right, else step c times unless the next cell is in obs.",
      "After each move best = max(best, x*x + y*y). Return best."
    ],
    time: "O(sum of steps + obstacles)", space: "O(obstacles)",
    trap: "The answer is the max distance during the walk, not the final distance.",
    code: `class Solution:
    def robotSim(self, commands: List[int], obstacles: List[List[int]]) -> int:
        dirs = [(0, 1), (1, 0), (0, -1), (-1, 0)]   # N, E, S, W
        obs = set(map(tuple, obstacles))
        x = y = d = best = 0
        for c in commands:
            if c == -2:
                d = (d + 3) % 4
            elif c == -1:
                d = (d + 1) % 4
            else:
                dx, dy = dirs[d]
                for _ in range(c):
                    if (x + dx, y + dy) in obs:
                        break
                    x, y = x + dx, y + dy
                best = max(best, x * x + y * y)
        return best`
  },
  {
    num: 384, title: "Shuffle an Array", slug: "shuffle-an-array", lc: "Medium",
    topic: "math",
    pattern: "Randomized algorithms",
    level: 2,
    order: 340,
    core: true,
    teaches: "Fisher-Yates: for i from the end, swap a[i] with a random a[j], j in [0, i].",
    learn: ["dsa_math", "dsa-mt-random"],
    pre: [],
    hints: [
      "Each of the n! orders must be equally likely.",
      "Pick a random element for the last slot, then for the second last from what's left, and so on.",
      "Swap a[i] with a[randint(0, i)] for i from n-1 down to 1."
    ],
    steps: [
      "Store the original list.",
      "reset: return a copy of the original.",
      "shuffle: a = copy; for i from n-1 down to 1: j = randint(0, i); swap a[i], a[j]. Return a."
    ],
    time: "O(n) per shuffle", space: "O(n)",
    trap: "Swapping with randint(0, n - 1) every time is biased (n^n outcomes is not a multiple of n!).",
    code: `import random

class Solution:
    def __init__(self, nums: List[int]):
        self.orig = nums[:]

    def reset(self) -> List[int]:
        return self.orig[:]

    def shuffle(self) -> List[int]:
        a = self.orig[:]
        for i in range(len(a) - 1, 0, -1):
            j = random.randint(0, i)        # 0..i inclusive
            a[i], a[j] = a[j], a[i]
        return a`
  },
  {
    num: 382, title: "Linked List Random Node", slug: "linked-list-random-node", lc: "Medium",
    topic: "math",
    pattern: "Randomized algorithms",
    level: 2,
    order: 350,
    core: false,
    teaches: "Reservoir sampling: keep the i-th item with probability 1/i; every item ends up with 1/n.",
    learn: ["dsa_math", "dsa-mt-random"],
    pre: [],
    hints: [
      "You may not know the list length (or want only one pass).",
      "Walk the list; at the i-th node (1-based), replace your answer with probability 1/i."
    ],
    steps: [
      "res = None; i = 0; node = head.",
      "While node: i += 1; if randint(1, i) == 1: res = node.val; node = node.next.",
      "Return res."
    ],
    time: "O(n) per call", space: "O(1)",
    trap: "Storing the whole list in an array is fine too, but misses the one-pass streaming follow-up.",
    code: `import random

class Solution:
    def __init__(self, head: Optional[ListNode]):
        self.head = head

    def getRandom(self) -> int:
        res, i, node = None, 0, self.head
        while node:
            i += 1
            if random.randint(1, i) == 1:   # keep with probability 1/i
                res = node.val
            node = node.next
        return res`
  },
  {
    num: 400, title: "Nth Digit", slug: "nth-digit", lc: "Medium",
    topic: "math",
    pattern: "Digits: peel with % 10",
    level: 3,
    order: 360,
    core: false,
    teaches: "Skip whole blocks: 9 one-digit numbers, 90 two-digit, 900 three-digit, ...",
    learn: ["dsa_math", "dsa-mt-digits"],
    pre: [1295],
    hints: [
      "How many digits do all 1-digit numbers use? All 2-digit numbers?",
      "Subtract block sizes 9 * 10^(d-1) * d until n fits inside a block of d-digit numbers.",
      "Inside the block, (n - 1) // d tells which number and (n - 1) % d which digit of it."
    ],
    steps: [
      "d = 1, count = 9, start = 1.",
      "While n > d * count: n -= d * count; d += 1; count *= 10; start *= 10.",
      "num = start + (n - 1) // d.",
      "Return int(str(num)[(n - 1) % d])."
    ],
    time: "O(log n)", space: "O(1)",
    trap: "Off-by-one: n is 1-indexed, so use n - 1 for both the number and the digit index.",
    code: `class Solution:
    def findNthDigit(self, n: int) -> int:
        d, count, start = 1, 9, 1
        while n > d * count:          # skip the whole block of d-digit numbers
            n -= d * count
            d += 1
            count *= 10
            start *= 10
        num = start + (n - 1) // d
        return int(str(num)[(n - 1) % d])`
  },
  {
    num: 43, title: "Multiply Strings", slug: "multiply-strings", lc: "Medium",
    topic: "math",
    pattern: "Big-number arithmetic on strings",
    level: 3,
    order: 370,
    core: true,
    teaches: "Digit i times digit j lands at position i + j + 1 of an array of length m + n.",
    learn: ["dsa_math", "dsa-mt-digits"],
    pre: [415],
    hints: [
      "The product of an m-digit and an n-digit number has at most m + n digits.",
      "num1[i] * num2[j] contributes to result positions i + j and i + j + 1.",
      "Accumulate all products into an int array, then push carries from right to left and strip leading zeros."
    ],
    steps: [
      "res = [0] * (m + n).",
      "For i, j from the right: res[i + j + 1] += d1 * d2.",
      "For k from m+n-1 down to 1: res[k-1] += res[k] // 10; res[k] %= 10.",
      "Strip leading zeros; return '0' if nothing is left."
    ],
    time: "O(m n)", space: "O(m + n)",
    trap: "'0' times anything: strip zeros but keep a single '0'.",
    code: `class Solution:
    def multiply(self, num1: str, num2: str) -> str:
        m, n = len(num1), len(num2)
        res = [0] * (m + n)
        for i in range(m - 1, -1, -1):
            for j in range(n - 1, -1, -1):
                res[i + j + 1] += (ord(num1[i]) - 48) * (ord(num2[j]) - 48)
        for k in range(m + n - 1, 0, -1):     # push carries left
            res[k - 1] += res[k] // 10
            res[k] %= 10
        s = "".join(map(str, res)).lstrip("0")
        return s or "0"`
  },
  {
    num: 1017, title: "Convert to Base -2", slug: "convert-to-base-2", lc: "Medium",
    topic: "math",
    pattern: "Number bases and conversions",
    level: 3,
    order: 380,
    core: false,
    teaches: "Base -2: take the bit n & 1, then divide by -2 rounding so the remainder stays 0 or 1.",
    learn: ["dsa_math", "dsa-mt-digits"],
    pre: [168],
    hints: [
      "Ordinary base conversion: digit = n mod base, n = (n - digit) / base. Does that still work for base -2?",
      "Keep the digit in {0, 1}: digit = n & 1, then n = -(n - digit) // 2 ... i.e. n = -(n >> 1)."
    ],
    steps: [
      "If n == 0 return '0'.",
      "out = [].",
      "While n: out.append(n & 1); n = -(n >> 1).",
      "Return reversed out joined."
    ],
    time: "O(log n)", space: "O(log n)",
    trap: "Python's >> floors toward minus infinity, which is exactly what makes -(n >> 1) correct for negative n.",
    code: `class Solution:
    def baseNeg2(self, n: int) -> str:
        if n == 0:
            return "0"
        out = []
        while n:
            out.append(str(n & 1))
            n = -(n >> 1)              # (n - bit) / -2
        return "".join(reversed(out))`
  },
  {
    num: 2447, title: "Number of Subarrays With GCD Equal to K", slug: "number-of-subarrays-with-gcd-equal-to-k", lc: "Medium",
    topic: "math",
    pattern: "GCD and LCM",
    level: 3,
    order: 390,
    core: false,
    teaches: "Extend each start to the right while keeping a running gcd; stop once it can't divide by k.",
    learn: ["dsa_math", "dsa-mt-gcd"],
    pre: [1979],
    hints: [
      "gcd of a subarray only shrinks (or stays) as you extend it.",
      "For each start i, keep g = gcd(g, nums[j]); count when g == k.",
      "Once g % k != 0, no longer subarray from i can reach k: break."
    ],
    steps: [
      "res = 0.",
      "For i: g = 0; for j from i: g = gcd(g, nums[j]); if g % k: break; if g == k: res += 1.",
      "Return res."
    ],
    time: "O(n^2 log M)", space: "O(1)",
    trap: "Don't stop when g == k; longer subarrays can still have gcd k.",
    code: `class Solution:
    def subarrayGCD(self, nums: List[int], k: int) -> int:
        res = 0
        for i in range(len(nums)):
            g = 0
            for j in range(i, len(nums)):
                g = math.gcd(g, nums[j])
                if g % k:
                    break              # gcd can only shrink further
                res += g == k
        return res`
  },
  {
    num: 365, title: "Water and Jug Problem", slug: "water-and-jug-problem", lc: "Medium",
    topic: "math",
    pattern: "GCD and LCM",
    level: 3,
    order: 400,
    core: true,
    teaches: "Bezout: the measurable amounts are exactly the multiples of gcd(x, y) up to x + y.",
    learn: ["dsa_math", "dsa-mt-gcd"],
    pre: [1979],
    hints: [
      "Every pour keeps the total a combination a*x + b*y.",
      "Which totals can a*x + b*y reach? (Bezout's identity.)",
      "Also the target must fit in both jugs together."
    ],
    steps: [
      "If target > x + y return False.",
      "Return target % gcd(x, y) == 0."
    ],
    time: "O(log min(x, y))", space: "O(1)",
    trap: "BFS over states works but is slow for capacities up to 10^3 squared; the gcd test is O(log).",
    code: `class Solution:
    def canMeasureWater(self, x: int, y: int, target: int) -> bool:
        if target > x + y:
            return False
        return target % math.gcd(x, y) == 0`
  },
  {
    num: 1175, title: "Prime Arrangements", slug: "prime-arrangements", lc: "Easy",
    topic: "math",
    pattern: "Primes and sieve",
    level: 3,
    order: 410,
    core: false,
    teaches: "Count primes up to n with a sieve; answer = p! * (n - p)! mod 1e9+7.",
    learn: ["dsa_math", "dsa-mt-primes"],
    pre: [204],
    hints: [
      "Primes must go to prime positions, and non-primes to the other positions.",
      "If there are p primes up to n, they can be arranged in p! ways; the rest in (n - p)! ways.",
      "Reduce mod 10^9 + 7 after every multiply."
    ],
    steps: [
      "p = number of primes in 1..n (sieve).",
      "res = 1; for i in 2..p: res = res * i % MOD.",
      "For i in 2..n-p: res = res * i % MOD.",
      "Return res."
    ],
    time: "O(n log log n)", space: "O(n)",
    trap: "1 is not prime, and positions are 1-indexed.",
    code: `class Solution:
    def numPrimeArrangements(self, n: int) -> int:
        MOD = 10**9 + 7
        is_p = [False, False] + [True] * (n - 1)
        for i in range(2, math.isqrt(n) + 1):
            if is_p[i]:
                for j in range(i * i, n + 1, i):
                    is_p[j] = False
        p = sum(is_p[:n + 1])
        res = 1
        for i in range(2, p + 1):
            res = res * i % MOD
        for i in range(2, n - p + 1):
            res = res * i % MOD
        return res`
  },
  {
    num: 2523, title: "Closest Prime Numbers in Range", slug: "closest-prime-numbers-in-range", lc: "Medium",
    topic: "math",
    pattern: "Primes and sieve",
    level: 3,
    order: 420,
    core: false,
    teaches: "Sieve once up to right, then scan consecutive primes in range for the smallest gap.",
    learn: ["dsa_math", "dsa-mt-primes"],
    pre: [204],
    hints: [
      "Get all primes in [left, right] with a sieve.",
      "The closest pair is always two consecutive primes in that list."
    ],
    steps: [
      "Sieve up to right.",
      "primes = [x for x in left..right if prime].",
      "Scan neighbours, keep the pair with the smallest difference (first one on ties).",
      "Return it or [-1, -1]."
    ],
    time: "O(right log log right)", space: "O(right)",
    trap: "Ties: return the pair with the smaller first number, so only replace on a strictly smaller gap.",
    code: `class Solution:
    def closestPrimes(self, left: int, right: int) -> List[int]:
        is_p = bytearray([1]) * (right + 1)
        is_p[0] = 0
        if right >= 1:
            is_p[1] = 0
        for p in range(2, math.isqrt(right) + 1):
            if is_p[p]:
                is_p[p * p::p] = bytearray(len(range(p * p, right + 1, p)))
        primes = [x for x in range(left, right + 1) if is_p[x]]
        best = [-1, -1]
        for a, b in zip(primes, primes[1:]):
            if best[0] == -1 or b - a < best[1] - best[0]:
                best = [a, b]
        return best`
  },
  {
    num: 2521, title: "Distinct Prime Factors of Product of Array", slug: "distinct-prime-factors-of-product-of-array", lc: "Medium",
    topic: "math",
    pattern: "Divisors and factorization",
    level: 3,
    order: 430,
    core: false,
    teaches: "The product's primes are the union of each number's primes: factor each one, never the product.",
    learn: ["dsa_math", "dsa-mt-factor"],
    pre: [263, 1492],
    hints: [
      "The product can be astronomically large. Do you need it?",
      "A prime divides the product iff it divides some element. Factor each number by trial division and collect primes in a set."
    ],
    steps: [
      "primes = set().",
      "For each x: d = 2; while d * d <= x: if x % d == 0: add d; divide out d. d += 1.",
      "If x > 1 add x.",
      "Return len(primes)."
    ],
    time: "O(n sqrt M)", space: "O(number of primes)",
    trap: "After the loop, a leftover x > 1 is itself a prime factor.",
    code: `class Solution:
    def distinctPrimeFactors(self, nums: List[int]) -> int:
        primes = set()
        for x in nums:
            d = 2
            while d * d <= x:
                if x % d == 0:
                    primes.add(d)
                    while x % d == 0:
                        x //= d
                d += 1
            if x > 1:
                primes.add(x)
        return len(primes)`
  },
  {
    num: 650, title: "2 Keys Keyboard", slug: "2-keys-keyboard", lc: "Medium",
    topic: "math",
    pattern: "Divisors and factorization",
    level: 3,
    order: 440,
    core: false,
    teaches: "Building n by copy-paste costs the sum of its prime factors.",
    learn: ["dsa_math", "dsa-mt-factor"],
    pre: [2521],
    hints: [
      "Copying a block of length d and pasting it k - 1 times multiplies the length by k, at cost k.",
      "So the answer is a factorization of n into factors k with total cost sum(k). Splitting k = a * b costs a + b <= a * b.",
      "So use prime factors: the answer is the sum of n's prime factors (with repeats)."
    ],
    steps: [
      "res = 0; d = 2.",
      "While n > 1: while n % d == 0: res += d; n //= d. d += 1.",
      "Return res."
    ],
    time: "O(sqrt n)", space: "O(1)",
    trap: "n = 1 needs 0 operations.",
    code: `class Solution:
    def minSteps(self, n: int) -> int:
        res, d = 0, 2
        while d * d <= n:
            while n % d == 0:
                res += d
                n //= d
            d += 1
        if n > 1:
            res += n
        return res`
  },
  {
    num: 1922, title: "Count Good Numbers", slug: "count-good-numbers", lc: "Medium",
    topic: "math",
    pattern: "Powers and fast exponentiation",
    level: 3,
    order: 450,
    core: true,
    teaches: "Count = 5^(even positions) * 4^(odd positions) mod 1e9+7, using pow(a, b, m).",
    learn: ["dsa_math", "dsa-mt-pow"],
    pre: [50],
    hints: [
      "Each even index has 5 choices (0,2,4,6,8), each odd index has 4 (2,3,5,7).",
      "There are (n + 1) // 2 even indexes and n // 2 odd ones. n is up to 10^15: use modular fast power."
    ],
    steps: [
      "MOD = 10^9 + 7.",
      "Return pow(5, (n + 1) // 2, MOD) * pow(4, n // 2, MOD) % MOD."
    ],
    time: "O(log n)", space: "O(1)",
    trap: "A loop over n positions can't handle n = 10^15.",
    code: `class Solution:
    def countGoodNumbers(self, n: int) -> int:
        MOD = 10**9 + 7
        return pow(5, (n + 1) // 2, MOD) * pow(4, n // 2, MOD) % MOD`
  },
  {
    num: 2550, title: "Count Collisions of Monkeys on a Polygon", slug: "count-collisions-of-monkeys-on-a-polygon", lc: "Medium",
    topic: "math",
    pattern: "Powers and fast exponentiation",
    level: 3,
    order: 460,
    core: false,
    teaches: "Count the complement: only the 2 all-clockwise / all-anticlockwise moves avoid collisions.",
    learn: ["dsa_math", "dsa-mt-pow"],
    pre: [50],
    hints: [
      "There are 2^n ways in total. How many have no collision at all?",
      "No collision only if every monkey moves the same direction: 2 ways.",
      "Answer (2^n - 2) mod 1e9+7; add MOD before % to keep it non-negative."
    ],
    steps: [
      "Return (pow(2, n, MOD) - 2) % MOD."
    ],
    time: "O(log n)", space: "O(1)",
    trap: "pow(2, n, MOD) can be less than 2, so take % MOD after subtracting.",
    code: `class Solution:
    def monkeyMove(self, n: int) -> int:
        MOD = 10**9 + 7
        return (pow(2, n, MOD) - 2) % MOD`
  },
  {
    num: 1015, title: "Smallest Integer Divisible by K", slug: "smallest-integer-divisible-by-k", lc: "Medium",
    topic: "math",
    pattern: "Modular arithmetic and remainders",
    level: 3,
    order: 470,
    core: true,
    teaches: "Track 11...1 mod k only; within k steps a remainder repeats, so stop after k.",
    learn: ["dsa_math", "dsa-mt-mod"],
    pre: [1018],
    hints: [
      "The number 111...1 overflows fast, but you only need it mod k: r = (r * 10 + 1) % k.",
      "If k is divisible by 2 or 5, no number ending in 1 works.",
      "There are only k remainders, so if none is 0 after k steps, there is no answer."
    ],
    steps: [
      "If k % 2 == 0 or k % 5 == 0 return -1.",
      "r = 0.",
      "For length in 1..k: r = (r * 10 + 1) % k; if r == 0 return length.",
      "Return -1."
    ],
    time: "O(k)", space: "O(1)",
    trap: "Without the k-step bound (pigeonhole), the loop never ends for impossible k.",
    code: `class Solution:
    def smallestRepunitDivByK(self, k: int) -> int:
        if k % 2 == 0 or k % 5 == 0:
            return -1
        r = 0
        for length in range(1, k + 1):
            r = (r * 10 + 1) % k
            if r == 0:
                return length
        return -1`
  },
  {
    num: 1680, title: "Concatenation of Consecutive Binary Numbers", slug: "concatenation-of-consecutive-binary-numbers", lc: "Medium",
    topic: "math",
    pattern: "Modular arithmetic and remainders",
    level: 3,
    order: 480,
    core: false,
    teaches: "Appending i in binary is res << bits(i) | i; the bit length grows by 1 at each power of two.",
    learn: ["dsa_math", "dsa-mt-mod"],
    pre: [1018],
    hints: [
      "Concatenating binary strings = shifting left by the length of the new part and adding it.",
      "Keep the result mod 10^9 + 7 after every step.",
      "The bit length of i increases exactly when i is a power of two (i & (i - 1) == 0)."
    ],
    steps: [
      "res = 0; bits = 0.",
      "For i in 1..n: if i & (i - 1) == 0: bits += 1.",
      "res = ((res << bits) | i) % MOD.",
      "Return res."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Building the full binary string is O(n log n) memory and too slow; stay modular.",
    code: `class Solution:
    def concatenatedBinary(self, n: int) -> int:
        MOD = 10**9 + 7
        res = bits = 0
        for i in range(1, n + 1):
            if i & (i - 1) == 0:       # power of two: one more bit
                bits += 1
            res = ((res << bits) | i) % MOD
        return res`
  },
  {
    num: 1497, title: "Check If Array Pairs Are Divisible by k", slug: "check-if-array-pairs-are-divisible-by-k", lc: "Medium",
    topic: "math",
    pattern: "Modular arithmetic and remainders",
    level: 3,
    order: 490,
    core: false,
    teaches: "Pair remainders r and k - r: their counts must match, and remainder 0 must have an even count.",
    learn: ["dsa_math", "dsa-mt-mod"],
    pre: [1018],
    hints: [
      "Only x % k matters for whether a + b is divisible by k.",
      "A number with remainder r needs a partner with remainder (k - r) % k.",
      "Count remainders; check cnt[r] == cnt[k - r] for r in 1..k-1, and cnt[0] is even."
    ],
    steps: [
      "cnt = Counter(x % k for x in arr).",
      "If cnt[0] is odd return False.",
      "For r in 1..k-1: if cnt[r] != cnt[k - r] return False.",
      "Return True."
    ],
    time: "O(n + k)", space: "O(k)",
    trap: "Negative numbers: Python's % already returns 0..k-1; in Java/C++ use ((x % k) + k) % k.",
    code: `class Solution:
    def canArrange(self, arr: List[int], k: int) -> bool:
        cnt = Counter(x % k for x in arr)
        if cnt[0] % 2:
            return False
        return all(cnt[r] == cnt[k - r] for r in range(1, k))`
  },
  {
    num: 1641, title: "Count Sorted Vowel Strings", slug: "count-sorted-vowel-strings", lc: "Medium",
    topic: "math",
    pattern: "Combinatorics and counting",
    level: 3,
    order: 500,
    core: false,
    teaches: "A sorted string is a multiset choice: stars and bars gives C(n + 4, 4).",
    learn: ["dsa_math", "dsa-mt-comb"],
    pre: [119],
    hints: [
      "A sorted string is decided by how many of each vowel it has.",
      "Count non-negative solutions of a + e + i + o + u = n (stars and bars)."
    ],
    steps: [
      "Return comb(n + 4, 4)."
    ],
    time: "O(1)", space: "O(1)",
    trap: "A DP over (length, last vowel) also works; the formula is the shortcut.",
    code: `class Solution:
    def countVowelStrings(self, n: int) -> int:
        return math.comb(n + 4, 4)`
  },
  {
    num: 2400, title: "Number of Ways to Reach a Position After Exactly k Steps", slug: "number-of-ways-to-reach-a-position-after-exactly-k-steps", lc: "Medium",
    topic: "math",
    pattern: "Combinatorics and counting",
    level: 3,
    order: 510,
    core: false,
    teaches: "Choose which steps go right: R - L = d and R + L = k give R = (k + d) / 2, answer C(k, R).",
    learn: ["dsa_math", "dsa-mt-comb"],
    pre: [119],
    hints: [
      "Only the number of right steps matters, not their order... but the order is what you count.",
      "With R right and L left steps: R + L = k and R - L = endPos - startPos.",
      "If (k + d) is odd or |d| > k there's no way; otherwise C(k, R) mod 1e9+7."
    ],
    steps: [
      "d = abs(endPos - startPos).",
      "If d > k or (k + d) % 2 return 0.",
      "Return comb(k, (k + d) // 2) % MOD."
    ],
    time: "O(k)", space: "O(1)",
    trap: "Parity: k and d must have the same parity.",
    code: `class Solution:
    def numberOfWays(self, startPos: int, endPos: int, k: int) -> int:
        d = abs(endPos - startPos)
        if d > k or (k + d) % 2:
            return 0
        return math.comb(k, (k + d) // 2) % (10**9 + 7)`
  },
  {
    num: 172, title: "Factorial Trailing Zeroes", slug: "factorial-trailing-zeroes", lc: "Medium",
    topic: "math",
    pattern: "Formulas and sums",
    level: 3,
    order: 520,
    core: true,
    teaches: "Each trailing zero needs a factor 10 = 2 * 5; count factors of 5: n//5 + n//25 + ...",
    learn: ["dsa_math", "dsa-mt-factor"],
    pre: [263],
    hints: [
      "A trailing zero comes from a factor 10. Which prime is the bottleneck, 2 or 5?",
      "Multiples of 25 give two 5s, multiples of 125 three... (Legendre's formula)."
    ],
    steps: [
      "count = 0.",
      "While n: n //= 5; count += n.",
      "Return count."
    ],
    time: "O(log n)", space: "O(1)",
    trap: "Only counting n // 5 misses the extra 5s from 25, 125, ...",
    code: `class Solution:
    def trailingZeroes(self, n: int) -> int:
        count = 0
        while n:
            n //= 5
            count += n
        return count`
  },
  {
    num: 223, title: "Rectangle Area", slug: "rectangle-area", lc: "Medium",
    topic: "math",
    pattern: "Geometry",
    level: 3,
    order: 530,
    core: false,
    teaches: "Total area = area1 + area2 - overlap; overlap width = max(0, min(right) - max(left)).",
    learn: ["dsa_math", "dsa-mt-patterns"],
    pre: [836],
    hints: [
      "Add both areas, then remove what you counted twice.",
      "The overlap is a rectangle too: its sides come from the same max/min as Rectangle Overlap, clamped at 0."
    ],
    steps: [
      "a1, a2 = areas.",
      "w = max(0, min(ax2, bx2) - max(ax1, bx1)); h = same on y.",
      "Return a1 + a2 - w * h."
    ],
    time: "O(1)", space: "O(1)",
    trap: "When there is no overlap, the raw width is negative; clamp it to 0.",
    code: `class Solution:
    def computeArea(self, ax1: int, ay1: int, ax2: int, ay2: int,
                    bx1: int, by1: int, bx2: int, by2: int) -> int:
        a1 = (ax2 - ax1) * (ay2 - ay1)
        a2 = (bx2 - bx1) * (by2 - by1)
        w = max(0, min(ax2, bx2) - max(ax1, bx1))
        h = max(0, min(ay2, by2) - max(ay1, by1))
        return a1 + a2 - w * h`
  },
  {
    num: 593, title: "Valid Square", slug: "valid-square", lc: "Medium",
    topic: "math",
    pattern: "Geometry",
    level: 3,
    order: 540,
    core: false,
    teaches: "Sort the 6 squared pairwise distances: 4 equal positive sides and 2 equal diagonals of twice the side.",
    learn: ["dsa_math", "dsa-mt-patterns"],
    pre: [1232],
    hints: [
      "Use squared distances to stay in integers.",
      "A square has 6 pairwise distances: 4 sides of length s and 2 diagonals with squared length 2 * s^2.",
      "Watch out for repeated points: side length must be positive."
    ],
    steps: [
      "d = sorted squared distances of all 6 pairs.",
      "Return d[0] > 0 and d[0] == d[3] and d[4] == d[5] and d[4] == 2 * d[0]."
    ],
    time: "O(1)", space: "O(1)",
    trap: "A rhombus has 4 equal sides; the diagonal check rules it out.",
    code: `class Solution:
    def validSquare(self, p1: List[int], p2: List[int], p3: List[int], p4: List[int]) -> bool:
        pts = [p1, p2, p3, p4]
        d = sorted((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2
                   for i, a in enumerate(pts) for b in pts[i + 1:])
        return d[0] > 0 and d[0] == d[3] and d[4] == d[5] and d[4] == 2 * d[0]`
  },
  {
    num: 1041, title: "Robot Bounded In Circle", slug: "robot-bounded-in-circle", lc: "Medium",
    topic: "math",
    pattern: "Simulation and cycles",
    level: 3,
    order: 550,
    core: false,
    teaches: "After one pass, the robot is bounded iff it is back at the origin or no longer facing north.",
    learn: ["dsa_math", "dsa-mt-patterns"],
    pre: [874],
    hints: [
      "Simulate the instructions once. What can the end state tell you?",
      "If it's not facing north, after 4 repetitions (at most) the drift cancels out.",
      "If it faces north and is not at the origin, it drifts away forever."
    ],
    steps: [
      "Simulate once with (x, y, d).",
      "Return (x, y) == (0, 0) or d != 0."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Checking only for the origin misses paths like 'GL' that return after 4 rounds.",
    code: `class Solution:
    def isRobotBounded(self, instructions: str) -> bool:
        dirs = [(0, 1), (1, 0), (0, -1), (-1, 0)]
        x = y = d = 0
        for c in instructions:
            if c == "G":
                x, y = x + dirs[d][0], y + dirs[d][1]
            elif c == "L":
                d = (d + 3) % 4
            else:
                d = (d + 1) % 4
        return (x, y) == (0, 0) or d != 0`
  },
  {
    num: 398, title: "Random Pick Index", slug: "random-pick-index", lc: "Medium",
    topic: "math",
    pattern: "Randomized algorithms",
    level: 3,
    order: 560,
    core: false,
    teaches: "Reservoir sampling over only the indexes that match the target.",
    learn: ["dsa_math", "dsa-mt-random"],
    pre: [382],
    hints: [
      "Storing a dict of value -> indexes works but uses O(n) extra memory.",
      "Reservoir sampling: scan, and on the c-th match keep its index with probability 1/c."
    ],
    steps: [
      "count = 0; res = -1.",
      "For i, v in enumerate(nums): if v == target: count += 1; if randint(1, count) == 1: res = i.",
      "Return res."
    ],
    time: "O(n) per pick", space: "O(1) extra",
    trap: "The counter is per call; reset it each time pick runs.",
    code: `import random

class Solution:
    def __init__(self, nums: List[int]):
        self.nums = nums

    def pick(self, target: int) -> int:
        count, res = 0, -1
        for i, v in enumerate(self.nums):
            if v == target:
                count += 1
                if random.randint(1, count) == 1:
                    res = i
        return res`
  },
  {
    num: 528, title: "Random Pick with Weight", slug: "random-pick-with-weight", lc: "Medium",
    topic: "math",
    pattern: "Randomized algorithms",
    level: 3,
    order: 570,
    core: true,
    teaches: "Prefix sums turn weights into ranges; a random number in [1, total] lands in range i with probability w[i]/total.",
    learn: ["dsa_math", "dsa-mt-random"],
    pre: [384],
    hints: [
      "Picture laying the weights end to end on a line of length sum(w).",
      "Pick a random point on that line. Which segment is it in?",
      "Prefix sums + binary search (bisect) find the segment in O(log n)."
    ],
    steps: [
      "prefix = running sums of w; total = prefix[-1].",
      "pickIndex: r = randint(1, total); return bisect_left(prefix, r)."
    ],
    time: "O(n) build, O(log n) per pick", space: "O(n)",
    trap: "Using bisect_right with r in [1, total] skips index 0 sometimes; pair the range with the right bisect.",
    code: `import random, bisect

class Solution:
    def __init__(self, w: List[int]):
        self.prefix = []
        total = 0
        for x in w:
            total += x
            self.prefix.append(total)

    def pickIndex(self) -> int:
        r = random.randint(1, self.prefix[-1])
        return bisect.bisect_left(self.prefix, r)`
  },
  {
    num: 478, title: "Generate Random Point in a Circle", slug: "generate-random-point-in-a-circle", lc: "Medium",
    topic: "math",
    pattern: "Randomized algorithms",
    level: 3,
    order: 580,
    core: false,
    teaches: "Rejection sampling: pick a point in the bounding square and retry until it's inside the circle.",
    learn: ["dsa_math", "dsa-mt-random"],
    pre: [384],
    hints: [
      "Uniform in a square is easy. How can you turn it into uniform in a circle?",
      "Keep sampling (x, y) in [-r, r]^2 until x^2 + y^2 <= r^2 (about 79% accept).",
      "Polar alternative: radius r * sqrt(u), not r * u, or points bunch at the centre."
    ],
    steps: [
      "Loop: x = uniform(-r, r), y = uniform(-r, r).",
      "If x*x + y*y <= r*r return [xc + x, yc + y]."
    ],
    time: "O(1) expected", space: "O(1)",
    trap: "Picking radius = r * random() (no sqrt) is not uniform over the area.",
    code: `import random

class Solution:
    def __init__(self, radius: float, x_center: float, y_center: float):
        self.r, self.x, self.y = radius, x_center, y_center

    def randPoint(self) -> List[float]:
        while True:
            dx = random.uniform(-self.r, self.r)
            dy = random.uniform(-self.r, self.r)
            if dx * dx + dy * dy <= self.r * self.r:
                return [self.x + dx, self.y + dy]`
  },
  {
    num: 233, title: "Number of Digit One", slug: "number-of-digit-one", lc: "Hard",
    topic: "math",
    pattern: "Digits: peel with % 10",
    level: 4,
    order: 590,
    core: false,
    teaches: "Count 1s per digit position: look at the higher part, the current digit and the lower part.",
    learn: ["dsa_math", "dsa-mt-digits"],
    pre: [400],
    hints: [
      "Count how often the ones digit is 1, then the tens digit, and so on, separately.",
      "For position p = 10^k: split n into high = n // (10p), cur = (n // p) % 10, low = n % p.",
      "If cur == 0: high * p. If cur == 1: high * p + low + 1. If cur > 1: (high + 1) * p."
    ],
    steps: [
      "res = 0; p = 1.",
      "While p <= n: compute high, cur, low; add the case value from the hint.",
      "p *= 10. Return res."
    ],
    time: "O(log n)", space: "O(1)",
    trap: "When cur == 1 the partial block contributes low + 1, not p.",
    code: `class Solution:
    def countDigitOne(self, n: int) -> int:
        res, p = 0, 1
        while p <= n:
            high, cur, low = n // (p * 10), (n // p) % 10, n % p
            if cur == 0:
                res += high * p
            elif cur == 1:
                res += high * p + low + 1
            else:
                res += (high + 1) * p
            p *= 10
        return res`
  },
  {
    num: 1073, title: "Adding Two Negabinary Numbers", slug: "adding-two-negabinary-numbers", lc: "Medium",
    topic: "math",
    pattern: "Number bases and conversions",
    level: 4,
    order: 600,
    core: false,
    teaches: "Add right to left like base 2, but the carry into the next place is -(sum >> 1).",
    learn: ["dsa_math", "dsa-mt-digits"],
    pre: [1017],
    hints: [
      "Do column addition from the right, as with Add Binary.",
      "A column sum s gives digit s & 1. In base -2, the carry is negated: carry = -(s >> 1).",
      "The carry can be -1, 0 or 1. Strip leading zeros at the end, keeping one digit."
    ],
    steps: [
      "i, j = last indexes; carry = 0; out = [].",
      "While i >= 0 or j >= 0 or carry: s = carry + a[i] + b[j] (missing digits = 0); out.append(s & 1); carry = -(s >> 1).",
      "Reverse, strip leading zeros (keep at least [0])."
    ],
    time: "O(m + n)", space: "O(m + n)",
    trap: "1 + 1 in base -2 is [1, 1, 0], not [1, 0]; the carry flips sign each column.",
    code: `class Solution:
    def addNegabinary(self, arr1: List[int], arr2: List[int]) -> List[int]:
        i, j, carry, out = len(arr1) - 1, len(arr2) - 1, 0, []
        while i >= 0 or j >= 0 or carry:
            s = carry
            if i >= 0:
                s += arr1[i]; i -= 1
            if j >= 0:
                s += arr2[j]; j -= 1
            out.append(s & 1)
            carry = -(s >> 1)          # base -2 carry
        while len(out) > 1 and out[-1] == 0:
            out.pop()
        return out[::-1]`
  },
  {
    num: 1250, title: "Check If It Is a Good Array", slug: "check-if-it-is-a-good-array", lc: "Hard",
    topic: "math",
    pattern: "GCD and LCM",
    level: 4,
    order: 610,
    core: false,
    teaches: "Some integer combination equals 1 exactly when the gcd of the whole array is 1.",
    learn: ["dsa_math", "dsa-mt-gcd"],
    pre: [365],
    hints: [
      "This is Water and Jug for many numbers: which values can sum(a_i * x_i) reach?",
      "Bezout: all multiples of gcd(nums). You need 1 to be one of them."
    ],
    steps: [
      "g = 0; for x in nums: g = gcd(g, x).",
      "Return g == 1."
    ],
    time: "O(n log M)", space: "O(1)",
    trap: "You don't need to find the subset; the gcd of everything decides it.",
    code: `class Solution:
    def isGoodArray(self, nums: List[int]) -> bool:
        g = 0
        for x in nums:
            g = math.gcd(g, x)
            if g == 1:
                return True
        return g == 1`
  },
  {
    num: 372, title: "Super Pow", slug: "super-pow", lc: "Medium",
    topic: "math",
    pattern: "Powers and fast exponentiation",
    level: 4,
    order: 620,
    core: false,
    teaches: "a^(10x + d) = (a^x)^10 * a^d: fold the exponent digits left to right, all mod 1337.",
    learn: ["dsa_math", "dsa-mt-pow"],
    pre: [1922],
    hints: [
      "b is given as an array of digits, too big to turn into one number in other languages.",
      "If you know r = a^x, what is a^(10x + d)?",
      "r = pow(r, 10, 1337) * pow(a, d, 1337) % 1337 for each digit d."
    ],
    steps: [
      "a %= 1337; res = 1.",
      "For d in b: res = pow(res, 10, 1337) * pow(a, d, 1337) % 1337.",
      "Return res."
    ],
    time: "O(len(b))", space: "O(1)",
    trap: "Take a % 1337 first; a can be up to 2^31 - 1.",
    code: `class Solution:
    def superPow(self, a: int, b: List[int]) -> int:
        M = 1337
        a %= M
        res = 1
        for d in b:
            res = pow(res, 10, M) * pow(a, d, M) % M
        return res`
  },
  {
    num: 60, title: "Permutation Sequence", slug: "permutation-sequence", lc: "Hard",
    topic: "math",
    pattern: "Combinatorics and counting",
    level: 4,
    order: 630,
    core: true,
    teaches: "Factorial number system: (k-1) // (n-1)! picks the first digit, and so on.",
    learn: ["dsa_math", "dsa-mt-comb"],
    pre: [2400],
    hints: [
      "How many permutations start with 1? With 2?",
      "Each first digit covers (n - 1)! permutations, so (k - 1) // (n - 1)! tells you which one.",
      "Remove that digit, set k to the remainder, and repeat with (n - 2)!."
    ],
    steps: [
      "digits = [1..n]; k -= 1; out = [].",
      "For i from n-1 down to 0: idx, k = divmod(k, i!); out.append(digits.pop(idx)).",
      "Return joined out."
    ],
    time: "O(n^2)", space: "O(n)",
    trap: "Use k - 1 (0-indexed) or the last permutation of each block goes wrong.",
    code: `class Solution:
    def getPermutation(self, n: int, k: int) -> str:
        digits = [str(i) for i in range(1, n + 1)]
        k -= 1
        out = []
        for i in range(n - 1, -1, -1):
            idx, k = divmod(k, math.factorial(i))
            out.append(digits.pop(idx))
        return "".join(out)`
  },
  {
    num: 1359, title: "Count All Valid Pickup and Delivery Options", slug: "count-all-valid-pickup-and-delivery-options", lc: "Hard",
    topic: "math",
    pattern: "Combinatorics and counting",
    level: 4,
    order: 640,
    core: false,
    teaches: "Insert orders one at a time: the i-th pair has i * (2i - 1) valid slots.",
    learn: ["dsa_math", "dsa-mt-comb"],
    pre: [2400],
    hints: [
      "Suppose i - 1 orders are already placed (2i - 2 items). Add pickup and delivery of order i.",
      "After adding them there are 2i positions in total; P_i and D_i take 2 of them, with P_i first.",
      "That's C(2i, 2) = i * (2i - 1). Multiply over i, mod 1e9+7."
    ],
    steps: [
      "res = 1.",
      "For i in 1..n: res = res * i * (2 * i - 1) % MOD.",
      "Return res."
    ],
    time: "O(n)", space: "O(1)",
    trap: "Reduce after every multiply; the raw product is enormous.",
    code: `class Solution:
    def countOrders(self, n: int) -> int:
        MOD = 10**9 + 7
        res = 1
        for i in range(1, n + 1):
            res = res * i * (2 * i - 1) % MOD   # C(2i, 2) slots for pair i
        return res`
  },
  {
    num: 2147, title: "Number of Ways to Divide a Long Corridor", slug: "number-of-ways-to-divide-a-long-corridor", lc: "Hard",
    topic: "math",
    pattern: "Combinatorics and counting",
    level: 4,
    order: 650,
    core: false,
    teaches: "Seats come in pairs; between consecutive pairs you can put the divider in (plants + 1) places; multiply.",
    learn: ["dsa_math", "dsa-mt-comb"],
    pre: [1359],
    hints: [
      "Each section has exactly two seats, so seats pair up in order: (1st, 2nd), (3rd, 4th), ...",
      "Between the 2nd and 3rd seat (and similar), the divider can go in any of the gaps: distance between them.",
      "Multiply those choices. Zero seats or an odd count: 0 ways."
    ],
    steps: [
      "seats = indexes of 'S'.",
      "If len is 0 or odd return 0.",
      "res = 1; for i in 2, 4, ...: res = res * (seats[i] - seats[i - 1]) % MOD.",
      "Return res."
    ],
    time: "O(n)", space: "O(n)",
    trap: "Plants before the first seat or after the last seat don't create choices.",
    code: `class Solution:
    def numberOfWays(self, corridor: str) -> int:
        MOD = 10**9 + 7
        seats = [i for i, c in enumerate(corridor) if c == "S"]
        if not seats or len(seats) % 2:
            return 0
        res = 1
        for i in range(2, len(seats), 2):
            res = res * (seats[i] - seats[i - 1]) % MOD
        return res`
  },
  {
    num: 829, title: "Consecutive Numbers Sum", slug: "consecutive-numbers-sum", lc: "Hard",
    topic: "math",
    pattern: "Formulas and sums",
    level: 4,
    order: 660,
    core: false,
    teaches: "k consecutive numbers starting at x sum to k*x + k(k-1)/2; try every k up to sqrt(2n).",
    learn: ["dsa_math", "dsa-mt-patterns"],
    pre: [441],
    hints: [
      "Write the sum of k consecutive numbers starting at x with a formula.",
      "n = k*x + k(k-1)/2, so n - k(k-1)/2 must be positive and divisible by k.",
      "k(k-1)/2 < n means k is at most about sqrt(2n)."
    ],
    steps: [
      "res = 0; k = 1.",
      "While k * (k - 1) // 2 < n: if (n - k*(k-1)//2) % k == 0: res += 1. k += 1.",
      "Return res."
    ],
    time: "O(sqrt n)", space: "O(1)",
    trap: "The single number n itself (k = 1) counts as a way.",
    code: `class Solution:
    def consecutiveNumbersSum(self, n: int) -> int:
        res, k = 0, 1
        while k * (k - 1) // 2 < n:
            if (n - k * (k - 1) // 2) % k == 0:
                res += 1
            k += 1
        return res`
  },
  {
    num: 470, title: "Implement Rand10() Using Rand7()", slug: "implement-rand10-using-rand7", lc: "Medium",
    topic: "math",
    pattern: "Randomized algorithms",
    level: 4,
    order: 670,
    core: false,
    teaches: "Two rand7 calls give a uniform number in 1..49; reject 41..49 and map 1..40 to 1..10.",
    learn: ["dsa_math", "dsa-mt-random"],
    pre: [478],
    hints: [
      "One rand7 can't give 10 equal outcomes. What about two calls?",
      "(rand7() - 1) * 7 + rand7() is uniform on 1..49.",
      "Keep only 1..40 (a multiple of 10) and retry otherwise; then return (x - 1) % 10 + 1."
    ],
    steps: [
      "Loop: x = (rand7() - 1) * 7 + rand7().",
      "If x <= 40 return (x - 1) % 10 + 1."
    ],
    time: "O(1) expected (about 2.45 calls)", space: "O(1)",
    trap: "rand7() + rand7() is not uniform (sums near the middle are more likely).",
    code: `class Solution:
    def rand10(self) -> int:
        while True:
            x = (rand7() - 1) * 7 + rand7()   # uniform 1..49
            if x <= 40:
                return (x - 1) % 10 + 1`
  },
  {
    num: 483, title: "Smallest Good Base", slug: "smallest-good-base", lc: "Hard",
    topic: "math",
    pattern: "Number bases and conversions",
    level: 5,
    order: 680,
    core: false,
    teaches: "Try every possible number of 1-digits m (at most 60); the base must be about n^(1/(m-1)).",
    learn: ["dsa_math", "dsa-mt-pow"],
    pre: [1017, 50],
    hints: [
      "n = 1 + k + k^2 + ... + k^(m-1). The number of digits m is at most log2(n) + 1.",
      "For a fixed m, k is close to n ** (1 / (m - 1)); check that integer (and its neighbours) exactly.",
      "Try m from large to small so the first hit gives the smallest base; n - 1 always works with m = 2."
    ],
    steps: [
      "n = int(n).",
      "For m from n.bit_length() down to 3:",
      "k = int(n ** (1 / (m - 1))); for c in (k - 1, k, k + 1) with c >= 2: if sum(c^i, i < m) == n return str(c).",
      "Return str(n - 1)."
    ],
    time: "O(log^2 n)", space: "O(1)",
    trap: "Floating-point roots are off by one for big n; verify neighbours with exact integer arithmetic.",
    code: `class Solution:
    def smallestGoodBase(self, n: str) -> str:
        n = int(n)
        for m in range(n.bit_length(), 2, -1):    # m = number of 1-digits
            k = int(n ** (1 / (m - 1)))
            for c in (k - 1, k, k + 1):
                if c < 2:
                    continue
                total, term = 0, 1
                for _ in range(m):
                    total += term
                    term *= c
                if total == n:
                    return str(c)
        return str(n - 1)`
  },
  {
    num: 780, title: "Reaching Points", slug: "reaching-points", lc: "Hard",
    topic: "math",
    pattern: "GCD and LCM",
    level: 5,
    order: 690,
    core: false,
    teaches: "Go backwards: the bigger coordinate came from subtracting; use % to skip many steps, like Euclid.",
    learn: ["dsa_math", "dsa-mt-gcd"],
    pre: [1250],
    hints: [
      "Forward there are two choices each step; backward there is only one. Which?",
      "From (tx, ty) with tx > ty, the previous point was (tx - ty, ty).",
      "Repeated subtraction is a modulo. Be careful when one coordinate already equals the start."
    ],
    steps: [
      "While tx > sx and ty > sy and tx != ty: if tx > ty: tx %= ty else: ty %= tx.",
      "If tx == sx and ty == sy return True.",
      "If tx == sx: return ty > sy and (ty - sy) % tx == 0.",
      "If ty == sy: return tx > sx and (tx - sx) % ty == 0. Otherwise False."
    ],
    time: "O(log max(tx, ty))", space: "O(1)",
    trap: "Plain subtraction times out on (1, 1, 10^9, 1); use modulo.",
    code: `class Solution:
    def reachingPoints(self, sx: int, sy: int, tx: int, ty: int) -> bool:
        while tx > sx and ty > sy and tx != ty:
            if tx > ty:
                tx %= ty
            else:
                ty %= tx
        if tx == sx and ty == sy:
            return True
        if tx == sx:
            return ty > sy and (ty - sy) % tx == 0
        if ty == sy:
            return tx > sx and (tx - sx) % ty == 0
        return False`
  },
  {
    num: 1569, title: "Number of Ways to Reorder Array to Get Same BST", slug: "number-of-ways-to-reorder-array-to-get-same-bst", lc: "Hard",
    topic: "math",
    pattern: "Combinatorics and counting",
    level: 5,
    order: 700,
    core: false,
    teaches: "Left and right subtrees can interleave freely: ways = C(L + R, L) * ways(left) * ways(right).",
    learn: ["dsa_math", "dsa-mt-comb"],
    pre: [2147, 118],
    hints: [
      "The root must come first. Which elements go to the left subtree, which to the right?",
      "Within each side the relative order matters, but the two sides can be interleaved any way: C(L + R, L).",
      "Recurse, then subtract 1 for the original ordering."
    ],
    steps: [
      "f(arr): if len <= 2 return 1.",
      "left = [x < root], right = [x > root].",
      "Return comb(len(left) + len(right), len(left)) * f(left) * f(right) % MOD.",
      "Answer (f(nums) - 1) % MOD."
    ],
    time: "O(n^2)", space: "O(n^2)",
    trap: "Don't forget to subtract the original order itself.",
    code: `class Solution:
    def numOfWays(self, nums: List[int]) -> int:
        MOD = 10**9 + 7
        def f(arr):
            if len(arr) <= 2:
                return 1
            root = arr[0]
            left = [x for x in arr if x < root]
            right = [x for x in arr if x > root]
            return math.comb(len(left) + len(right), len(left)) * f(left) * f(right) % MOD
        return (f(nums) - 1) % MOD`
  },
  {
    num: 710, title: "Random Pick with Blacklist", slug: "random-pick-with-blacklist", lc: "Hard",
    topic: "math",
    pattern: "Randomized algorithms",
    level: 5,
    order: 710,
    core: false,
    teaches: "Pick uniformly from [0, n - len(blacklist)); remap blacklisted values there to unused white values above.",
    learn: ["dsa_math", "dsa-mt-random"],
    pre: [528, 470],
    hints: [
      "Let m = n - len(blacklist) be the number of allowed values. Can you always draw from [0, m)?",
      "Some numbers below m are blacklisted; there are exactly as many white numbers in [m, n).",
      "Build a map from each blacklisted number < m to a distinct white number >= m."
    ],
    steps: [
      "m = n - len(blacklist); black = set(blacklist).",
      "white_high = iterator over numbers in [m, n) not in black.",
      "For b in blacklist with b < m: mapping[b] = next(white_high).",
      "pick: r = randrange(m); return mapping.get(r, r)."
    ],
    time: "O(B) build, O(1) per pick", space: "O(B)",
    trap: "Rejection sampling over [0, n) is too slow when almost everything is blacklisted.",
    code: `import random

class Solution:
    def __init__(self, n: int, blacklist: List[int]):
        self.m = n - len(blacklist)
        black = set(blacklist)
        high = (x for x in range(self.m, n) if x not in black)   # white numbers >= m
        self.mapping = {b: next(high) for b in blacklist if b < self.m}

    def pick(self) -> int:
        r = random.randrange(self.m)
        return self.mapping.get(r, r)`
  },
  {
    num: 1830, title: "Minimum Number of Operations to Make String Sorted", slug: "minimum-number-of-operations-to-make-string-sorted", lc: "Hard",
    topic: "math",
    pattern: "Combinatorics and counting",
    level: 6,
    order: 720,
    core: false,
    teaches: "The operation steps to the previous permutation, so the answer is the rank of s among its distinct permutations.",
    learn: ["dsa_math", "dsa-mt-comb"],
    pre: [60, 1569],
    hints: [
      "Run the operation by hand on 'cba'. Each step gives the previous permutation in sorted order.",
      "So count permutations of s's letters that are smaller than s (its rank).",
      "Go right to left keeping letter counts; at position i, add (letters smaller than s[i] to the right) * multinomial of the rest, using modular inverses of factorials."
    ],
    steps: [
      "Precompute fact and inverse fact mod p up to n.",
      "cnt = [0] * 26; res = 0.",
      "For i from n-1 down to 0: cnt[s[i]] += 1; m = n - i; smaller = sum of cnt below s[i].",
      "res += smaller * (m-1)! / prod(cnt[c]!) mod p.",
      "Return res."
    ],
    time: "O(26 n)", space: "O(n)",
    trap: "Division mod p needs modular inverses: pow(x, p - 2, p).",
    code: `class Solution:
    def makeStringSorted(self, s: str) -> int:
        MOD = 10**9 + 7
        n = len(s)
        fact = [1] * (n + 1)
        for i in range(1, n + 1):
            fact[i] = fact[i - 1] * i % MOD
        inv = [1] * (n + 1)
        inv[n] = pow(fact[n], MOD - 2, MOD)
        for i in range(n, 0, -1):
            inv[i - 1] = inv[i] * i % MOD
        cnt = [0] * 26
        res = 0
        for i in range(n - 1, -1, -1):
            c = ord(s[i]) - 97
            cnt[c] += 1
            smaller = sum(cnt[:c])
            if smaller:
                ways = smaller * fact[n - i - 1] % MOD    # place a smaller letter at i
                for k in range(26):
                    ways = ways * inv[cnt[k]] % MOD       # divide by repeats
                res = (res + ways) % MOD
        return res`
  }
);
