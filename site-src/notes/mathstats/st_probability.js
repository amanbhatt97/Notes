// notes/mathstats/st_probability.js — Probability
Object.assign(TOPIC_CONTENT, {
  "st_probability": `<main>
  <h1>Probability</h1>
  <div class="where"><span>Mathematics &amp; Statistics</span><span>Statistics</span><span>Probability</span></div>
  <p class="lead">The language of uncertainty. Every classifier score, A/B test and Bayesian model is built from the few rules on this page, and interviewers love testing them with Bayes and simulation puzzles. This note builds them all on ONE running example, a clinic that screens people for a disease with a "95% accurate" test: outcomes and events, the complement, addition and multiplication rules, joint, marginal and conditional probability from one 2×2 table, independence, Bayes' theorem (why a positive test means only a 16% chance of being sick), random variables with expectation and variance (the clinic's cost per person), and the law of large numbers and central limit theorem (how the daily positive rate settles and wobbles). Classic interview puzzles close the note, solved with the same rules.</p>

  <h2 id="spr-fit" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 170" width="660">
<defs><marker id="spr-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="20" width="120" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="70" y="41" text-anchor="middle" font-size="12">Descriptive</text><text x="70" y="58" text-anchor="middle" class="tm" font-size="10">data in hand</text>
<line x1="130" y1="45" x2="148" y2="45" stroke="currentColor" marker-end="url(#spr-a0)"/>
<rect x="150" y="20" width="110" height="50" rx="8" class="fg sg" stroke-width="3"/><text x="205" y="41" text-anchor="middle" font-size="12" font-weight="700">Probability</text><text x="205" y="59" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE</text>
<line x1="260" y1="45" x2="278" y2="45" stroke="currentColor" marker-end="url(#spr-a0)"/>
<rect x="280" y="20" width="110" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="335" y="41" text-anchor="middle" font-size="12">Distributions</text><text x="335" y="58" text-anchor="middle" class="tm" font-size="10">named shapes</text>
<line x1="390" y1="45" x2="408" y2="45" stroke="currentColor" marker-end="url(#spr-a0)"/>
<rect x="410" y="20" width="110" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="465" y="41" text-anchor="middle" font-size="12">Hypothesis</text><text x="465" y="58" text-anchor="middle" class="tm" font-size="10">real or noise?</text>
<line x1="520" y1="45" x2="538" y2="45" stroke="currentColor" marker-end="url(#spr-a0)"/>
<rect x="540" y="20" width="110" height="50" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="595" y="41" text-anchor="middle" font-size="12">A/B Testing</text><text x="595" y="58" text-anchor="middle" class="tm" font-size="10">decide with data</text>
<line x1="205" y1="70" x2="205" y2="108" stroke="currentColor" stroke-dasharray="4 3" marker-end="url(#spr-a0)"/>
<rect x="120" y="110" width="170" height="46" rx="8" class="fv" stroke="currentColor" stroke-opacity="0.3"/><text x="205" y="130" text-anchor="middle" font-size="12">Naive Bayes, metrics</text><text x="205" y="147" text-anchor="middle" class="tm" font-size="10">Bayes and precision in ML</text>
<text x="470" y="125" text-anchor="middle" class="tm" font-size="10.5">conditional probability, Bayes and the CLT</text><text x="470" y="141" text-anchor="middle" class="tm" font-size="10.5">are used by every note to the right</text>
</svg><figcaption>The Statistics group. Probability turns "describe the data we have" into "reason about data we haven't seen yet".</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="st_descriptive">Descriptive Statistics</a></b><span>We summarised ten salaries with a mean, an SD, a skewness. Left open: everything there describes data already in hand. How likely is the next value, and how far can a mean move by pure chance?</span></li>
    <li><b>This note adds: rules for "how likely"</b><span>A number between 0 and 1 for any event, rules to combine events, conditional probability and its correct flip (Bayes), random variables with expected value and variance, and the two laws that make averages predictable (LLN, CLT).</span></li>
    <li><b>Leads to: <a class="xref" data-note="st_distributions">Probability Distributions</a></b><span>Here we build probabilities case by case; distributions give ready-made shapes (the Bernoulli and binomial behind our test results, the normal from the CLT). Then <a class="xref" data-note="st_hypothesis">Hypothesis Testing</a> uses the CLT to ask "real or noise?", and <a class="xref" data-note="st_abtesting">A/B Testing</a> applies it to product decisions. In ML, Bayes becomes <a class="xref" data-note="ml_naivebayes">Naive Bayes</a> and P(sick | +) becomes precision in <a class="xref" data-note="ml_evaluation">Classification Metrics</a>.</span></li>
  </ol>

  <h2 id="spr-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each concept answers the question above it; its limitation raises the next question. All the numbers come from one clinic: 10,000 people screened, 1% have the disease, the test catches 95% of sick people and clears 95% of healthy ones.</p>
  <ol class="story">
    <li><b>Outcomes, events, probability</b><span>Q: how do we put a number on "might happen"? → List every outcome (sick &amp; +, sick &amp; −, healthy &amp; +, healthy &amp; −), and a probability is a share: P(test +) = 590 / 10,000 = 0.059. But real questions combine events: "sick OR positive", "at least one false alarm"…</span></li>
    <li><b>Complement, addition, multiplication</b><span>Q: how do we combine events? → "not A" = 1 − P(A); "A or B" = add, minus the overlap (0.0595); "A and B" = P(A) × P(B given A) (0.01 × 0.95). But what exactly is "B given A"?</span></li>
    <li><b>Joint, marginal, conditional</b><span>Q: how do "and", "overall" and "given" relate? → One 2×2 table: joint 0.0095, marginal 0.059, conditional P(+ | sick) = 0.95 but P(sick | +) = 0.161. When does "given" make no difference at all?</span></li>
    <li><b>Independence</b><span>Q: when can we just multiply plain probabilities? → When knowing B leaves P(A) unchanged. Disease and test are strongly dependent (0.0095 vs 0.00059 if independent); two tests are independent given the true status. But the patient wants P(sick | +), and we only know P(+ | sick)…</span></li>
    <li><b>Bayes' theorem</b><span>Q: how do we flip a conditional? → prior × likelihood ÷ evidence: 0.0095 / 0.059 = 16.1%; a second positive lifts it to 78.5%. But events are yes/no, and the clinic's budget is a number that depends on chance…</span></li>
    <li><b>Random variables, E[X], Var(X)</b><span>Q: what number do we expect on average, and how much does it swing? → Cost per person: ₹500 test + ₹2,000 follow-up if positive, E = ₹618, SD ₹471. One person is unpredictable; is a whole day predictable?</span></li>
    <li><b>Law of large numbers</b><span>Q: does the observed positive rate settle down? → Running share: 0.1 after 10 people, 0.0596 after 10,000, heading to 0.059. But on a day of 100 people, how far off can it be?</span></li>
    <li><b>Central limit theorem &amp; standard error</b><span>Q: what shape does a day's rate wobble in? → Approximately Normal(0.059, √(0.059 × 0.941 / n)): SE 0.0236 for n = 100, even though one person's result (0 or 1) has skew 3.74. Then: interview puzzles use exactly these rules…</span></li>
    <li><b>Classic puzzles</b><span>Q: can the rules beat intuition? → Birthday (complement: 23 people, 50.7%), Monty Hall (Bayes: the host's door is evidence, switch wins 2/3).</span></li>
  </ol>

  <h2 id="spr-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Probability</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Basics &amp; Rules</div>
        <ul>
          <li><b>Sample space S</b> — all outcomes; <b>event</b> — subset you care about</li>
          <li><b>Screening</b> — 4 outcomes: 95, 5, 495, 9,405 of 10,000</li>
          <li><b>Complement</b> — <code>P(not A) = 1 − P(A)</code>; ≥ 1 false alarm in 4 healthy = 1 − 0.95⁴ = 0.186</li>
          <li><b>Addition</b> — <code>P(A∪B) = P(A) + P(B) − P(A∩B)</code>; sick or + = 0.0595</li>
          <li><b>Multiplication</b> — <code>P(A∩B) = P(A)·P(B|A)</code>; 0.01 × 0.95 = 0.0095</li>
          <li>⚠ <b>Trap</b> — mutually exclusive ≠ independent (exclusive events are dependent)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Joint, Marginal, Conditional</div>
        <ul>
          <li><b>Joint</b> — P(sick ∩ +): one cell ÷ total = 0.0095</li>
          <li><b>Marginal</b> — row/column total ÷ total: P(+) = 0.059</li>
          <li><b>Conditional</b> — <code>P(A|B) = P(A∩B)/P(B)</code>; zoom into one row or column</li>
          <li>⚠ <b>P(A|B) ≠ P(B|A)</b> — P(+|sick) 0.95 vs P(sick|+) 0.161 (prosecutor's fallacy)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Independence</div>
        <ul>
          <li><b>Definition</b> — P(A|B) = P(A) ⇔ <code>P(A∩B) = P(A)·P(B)</code></li>
          <li><b>Check</b> — 0.01 × 0.059 = 0.00059 ≠ 0.0095 → disease and test dependent</li>
          <li><b>Conditional independence</b> — two tests independent <em>given</em> status: 0.95² = 0.9025</li>
          <li>⚠ <b>Gambler's fallacy</b> — after 5 heads, next is still 0.5</li>
          <li><b>Naive Bayes</b> — assumes features independent given class</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Bayes' Theorem</div>
        <ul>
          <li><b>Formula</b> — <code>P(A|B) = P(B|A)·P(A) / P(B)</code>; posterior ∝ likelihood × prior</li>
          <li><b>Evidence</b> — P(B) = Σ P(B|Aᵢ)P(Aᵢ) (total probability) = 0.059</li>
          <li><b>Clinic</b> — P(sick|+) = 95/590 = 16.1%</li>
          <li><b>Base rate</b> — prevalence 0.1% → 1.9%; 10% → 67.9%; 50% → 95%</li>
          <li><b>Update again</b> — 2nd positive: prior 16.1% → 78.5%</li>
          <li><b>Spam</b> — P(spam|"free") = 0.10/0.112 = 89%</li>
          <li><b>Tip</b> — use natural frequencies (count 10,000 people)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Random Variables</div>
        <ul>
          <li><b>Random variable</b> — a number attached to each outcome</li>
          <li><b>E[X]</b> — <code>Σ x·P(x)</code>; positives among 2 people = 0.118</li>
          <li><b>Var(X)</b> — <code>E[(X − μ)²]</code>; indicator: q(1 − q) = 0.0555</li>
          <li><b>Cost</b> — ₹500 + ₹2,000 if +: E = ₹618, SD ₹471</li>
          <li><b>Linearity</b> — E[aX + b] = aE[X] + b, always</li>
          <li><b>Var(aX + b)</b> — a²Var(X); <b>Var(X ± Y)</b> = VarX + VarY if independent</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">LLN &amp; CLT</div>
        <ul>
          <li><b>LLN</b> — running share of + → 0.059 (0.1 at 10, 0.0596 at 10,000)</li>
          <li><b>CLT</b> — mean of n draws ≈ <code>Normal(μ, σ/√n)</code>, any shape</li>
          <li><b>Standard error</b> — √(q(1 − q)/n): 0.043, 0.0236, 0.0136 for n = 30, 100, 300</li>
          <li><b>Skew</b> — 3.74 for one person → 0.68, 0.37, 0.21 (÷ √n)</li>
          <li><b>Why it matters</b> — t-tests, CIs, A/B tests on skewed metrics</li>
          <li>⚠ <b>Trap</b> — CLT is about the mean, not the data; rare events need bigger n</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Puzzles</div>
        <ul>
          <li><b>Birthday</b> — 23 people → 50.7%; 253 pairs, use complement</li>
          <li><b>Monty Hall</b> — Bayes: P(car behind other door | host's reveal) = 2/3</li>
          <li>💡 100 doors, host opens 98 → obviously switch</li>
          <li><b>First head</b> — expected 1/p flips (geometric)</li>
          <li><b>All 6 faces</b> — 6(1 + ½ + … + ⅙) = 14.7 rolls</li>
          <li><b>When unsure</b> — simulate with numpy</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="spr-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="spr-space"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Outcomes, Events &amp; Probability</span><span class="rm-sub">One clinic, 10,000 people</span></div></div>
      <div class="rm-item rm-done" data-target="spr-rules"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Combining Events</span><span class="rm-sub">Complement, addition, multiplication</span></div></div>
      <div class="rm-item rm-done" data-target="spr-cond"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Joint, Marginal, Conditional</span><span class="rm-sub">One 2×2 table explains all</span></div></div>
      <div class="rm-item rm-done" data-target="spr-indep"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Independence</span><span class="rm-sub">When knowing B tells nothing</span></div></div>
      <div class="rm-item rm-done" data-target="spr-bayes"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Bayes' Theorem</span><span class="rm-sub">Why a positive test means 16%</span></div></div>
      <div class="rm-item rm-done" data-target="spr-rv"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Random Variables</span><span class="rm-sub">Expectation and variance</span></div></div>
      <div class="rm-item rm-done" data-target="spr-lln"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Law of Large Numbers</span><span class="rm-sub">Why the rate settles</span></div></div>
      <div class="rm-item rm-done" data-target="spr-clt"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Central Limit Theorem</span><span class="rm-sub">How averages wobble</span></div></div>
      <div class="rm-item rm-done" data-target="spr-puzzles"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Classic Puzzles</span><span class="rm-sub">Birthday, Monty Hall, simulated</span></div></div>
      <div class="rm-item rm-done" data-target="spr-connect"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">From counts to the CLT</span></div></div>
      <div class="rm-item rm-done" data-target="spr-traps"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">Fallacies and slips</span></div></div>
      <div class="rm-item rm-done" data-target="spr-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The whole note in 10 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="spr-qa"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="spr-space"><span class="num">01</span>Outcomes, Events &amp; Probability</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Descriptive statistics told us what happened. Now we need to talk about what <em>might</em> happen: will this person test positive, is this patient sick? "I don't know" is useless for decisions. How do we put a number on "how likely"?</p>
  </div>
  <p>Will it rain today? Will this customer repay the loan? Will the delivery arrive in 30 minutes? Nobody knows for sure. <strong>Probability</strong> is the way to say "how likely" with a number between 0 (impossible) and 1 (certain). Every spam filter, every "90% chance of rain", every credit score and every A/B test is built from the few rules in this note.</p>
  <h3>The running example</h3>
  <p>A clinic screens people for a disease. Last year it screened 10,000 people. About 1% of people have the disease (the <strong>prevalence</strong>). The test is called "95% accurate": it is positive for 95% of sick people (its <strong>sensitivity</strong>) and negative for 95% of healthy people (its <strong>specificity</strong>). Each screened person ends up in exactly one of four boxes:</p>
  <table class="tbl out"><caption>10,000 people screened: the four possible outcomes</caption>
    <tr><th></th><th>test +</th><th>test −</th><th>total</th></tr>
    <tr><th>sick</th><td>95</td><td>5</td><td>100</td></tr>
    <tr><th>healthy</th><td>495</td><td>9,405</td><td>9,900</td></tr>
    <tr><th>total</th><td>590</td><td>9,410</td><td>10,000</td></tr>
  </table>
  <p>The list of everything that can happen to one person is the <strong>sample space</strong>: S = {sick &amp; +, sick &amp; −, healthy &amp; +, healthy &amp; −}. Something you care about, such as "tests positive", is an <strong>event</strong>: a set of outcomes, here {sick &amp; +, healthy &amp; +}. Its probability is the share of people it covers: (95 + 495) / 10,000 = <strong>0.059</strong>. (When outcomes are equally likely, as with a fair die, this becomes "favourable outcomes ÷ all outcomes": P(even) = 3/6.)</p>
  <div class="cards">
    <div><b>Sample space S</b><p>Every possible outcome.</p><small>Screening: 4 outcomes; die: {1,…,6}</small></div>
    <div><b>Event A</b><p>A set of outcomes you care about.</p><small>"Test +" = {sick &amp; +, healthy &amp; +}</small></div>
    <div><b>P(A)</b><p>The share of all outcomes that fall in A.</p><small>P(+) = 590/10,000 = 0.059</small></div>
  </div>
  <div class="fx" data-lang="py">import numpy as np
import pandas as pd
from scipy import stats
# last year's screening: 10,000 people, each is sick or healthy, tests + or -
counts = {"sick &amp; +": 95, "sick &amp; -": 5, "healthy &amp; +": 495, "healthy &amp; -": 9405}
N = sum(counts.values())
p = {k: v / N for k, v in counts.items()}        # probability = share of outcomes
for k in counts:
    print(f"{k:12s} {counts[k]:5d}  P = {p[k]:.4f}")
print("total P =", sum(p.values()))
p_pos = p["sick &amp; +"] + p["healthy &amp; +"]          # event "test +" = two outcomes
print("P(test +) =", round(p_pos, 4))</div>
  <div class="fx" data-lang="text">sick &amp; +        95  P = 0.0095
sick &amp; -         5  P = 0.0005
healthy &amp; +    495  P = 0.0495
healthy &amp; -   9405  P = 0.9405
total P = 1.0
P(test +) = 0.059</div>
  <p>What the code does: it stores the four counts, divides each by the total to get a probability, checks that the four probabilities add to 1 (something must happen), and adds the two outcomes that make up the event "test +".</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Probability is a pie shared among all outcomes. The whole pie is 1. Each outcome gets a slice (healthy &amp; − gets 94%; sick &amp; − a sliver of 0.05%). An event is a set of slices; its probability is how much pie those slices cover.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>probability</strong> assigns each event A a number P(A) with three rules (Kolmogorov's axioms): P(A) ≥ 0; P(S) = 1; and for events that cannot happen together, P(A or B) = P(A) + P(B). Everything else in this note follows from these three. Read as long-run frequencies: P(+) = 0.059 means about 59 positives per 1,000 people screened.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Equally likely outcomes" is an assumption, not a rule. The four screening outcomes are not equally likely (0.9405 vs 0.0005), so "1 out of 4" would be badly wrong. Use counts or given rates, and use "favourable ÷ total" only for fair dice, cards and coins.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: combining events.</b> We can read off single events. Real questions combine them: "sick OR positive", "sick AND positive", "at least one false alarm among four people". We need rules for "not", "or" and "and".</div>

  <h2 id="spr-rules"><span class="num">02</span>Combining Events: Complement, Addition, Multiplication</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Given P(sick) = 0.01 and P(+) = 0.059, what is P(sick or +)? What is P(sick and +) if we only know the rates, not last year's table? And what is the chance that a family of four healthy people gets at least one false alarm?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 560 200" width="560"><rect x="10" y="10" width="540" height="180" fill="none" stroke="currentColor" stroke-opacity=".4"/><text x="20" y="28" class="tm" font-size="11">S = 10,000 people screened</text>
<circle cx="225" cy="98" r="58" class="fr sr" fill-opacity=".6"/><circle cx="320" cy="98" r="70" class="fb sb" fill-opacity=".6"/>
<text x="200" y="94" text-anchor="middle" font-size="12">Sick</text><text x="200" y="110" text-anchor="middle" font-size="11">only 5</text>
<text x="345" y="94" text-anchor="middle" font-size="12">Positive</text><text x="345" y="110" text-anchor="middle" font-size="11">only 495</text>
<text x="268" y="94" text-anchor="middle" font-size="12" font-weight="bold">both</text><text x="268" y="110" text-anchor="middle" font-size="11">95</text>
<text x="280" y="184" text-anchor="middle" font-size="12">P(sick ∪ +) = 100/10,000 + 590/10,000 − 95/10,000 = 595/10,000</text>
<text x="470" y="40" text-anchor="middle" font-size="11" class="tm">neither: 9,405</text></svg><figcaption>Add the two circles, then subtract the overlap you counted twice. (Circle sizes not to scale.)</figcaption></figure>
  <p>Count the people in the two circles. Sick: 100. Positive: 590. Add them and you get 690, but the 95 people who are both sick and positive were counted twice, once in each circle. Subtract them once: 595. That is the <strong>addition rule</strong>.</p>
  <table class="tbl">
    <tr><th>Rule</th><th>Formula</th><th>In words</th><th>On the clinic</th></tr>
    <tr><td><strong>Complement</strong></td><td><code>P(not A) = 1 − P(A)</code></td><td>"At least one" is easier as 1 − "none"</td><td>P(healthy) = 1 − 0.01 = 0.99. Four healthy people, P(at least one false alarm) = 1 − 0.95⁴ = 1 − 0.8145 = <strong>0.186</strong></td></tr>
    <tr><td><strong>Addition</strong></td><td><code>P(A∪B) = P(A) + P(B) − P(A∩B)</code></td><td>"A or B": add, then remove the double count</td><td>P(sick or +) = 0.01 + 0.059 − 0.0095 = <strong>0.0595</strong></td></tr>
    <tr><td><strong>Multiplication</strong></td><td><code>P(A∩B) = P(A) · P(B|A)</code></td><td>"A and B": chance of A, times chance of B once A has happened</td><td>P(sick and +) = 0.01 × 0.95 = <strong>0.0095</strong>, i.e. 95 per 10,000</td></tr>
  </table>
  <p>Symbols: ∪ means "or" (either one, or both), ∩ means "and" (both), and "|" means "given that" (the thing on the right has already happened). The multiplication rule is exactly how the 10,000-person table was built: of 100 sick people, 95% test positive → 95; of 9,900 healthy people, 5% test positive → 495. The same rule works for cards: two aces in a row without putting back = 4/52 × 3/51 = 0.0045, because after the first ace only 3 aces and 51 cards remain.</p>
  <div class="fx" data-lang="py">p_sick = p["sick &amp; +"] + p["sick &amp; -"]
print("complement     P(healthy)      =", round(1 - p_sick, 4))
print("addition       P(sick or +)    =", round(p_sick + p_pos - p["sick &amp; +"], 4))
print("multiplication P(sick and +)   =", round(p_sick * 0.95, 4))
print("4 healthy people, P(at least one false alarm) =", round(1 - 0.95 ** 4, 4))</div>
  <div class="fx" data-lang="text">complement     P(healthy)      = 0.99
addition       P(sick or +)    = 0.0595
multiplication P(sick and +)   = 0.0095
4 healthy people, P(at least one false alarm) = 0.1855</div>
  <p>What the code does: the first three lines apply the three rules to the probabilities from block 01; the multiplication line rebuilds the joint cell 0.0095 from the rates alone. The last line is the complement rule: "no false alarm" for one healthy person is 0.95, for four independent people 0.95⁴, so "at least one" is 1 − 0.95⁴.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>The complement rule is like checking whether any shop in the market is open: instead of checking "shop 1 open or shop 2 open or …", check the one case "all closed" and subtract from 1.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>For any events A, B: P(Aᶜ) = 1 − P(A); P(A ∪ B) = P(A) + P(B) − P(A ∩ B); P(A ∩ B) = P(A) P(B | A) = P(B) P(A | B). Events are <strong>mutually exclusive</strong> if P(A ∩ B) = 0, and then the addition rule loses its last term.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Adding without subtracting the overlap only works for <strong>mutually exclusive</strong> events (they can't both happen, like "sick &amp; +" and "healthy &amp; +"). Mutually exclusive is not the same as independent (section 04): if one happened, the other's chance dropped to zero, so exclusive events are strongly <em>dependent</em>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: joint, marginal and conditional.</b> The multiplication rule used P(+ | sick), "positive given sick". What exactly is a conditional probability, how is it computed from data, and how does it relate to the "and" and the "overall" probabilities?</div>

  <h2 id="spr-cond"><span class="num">03</span>Joint, Marginal &amp; Conditional</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>"95% of sick people test positive" and "16% of positive people are sick" sound like they should be the same fact. They are not. What is the difference between "and", "overall" and "given", and how do we read each from one table?</p>
  </div>
  <p>Put the counts in a 2×2 table (as in section 01) and every probability question about these two things is just "which cell, divided by which total".</p>
  <div class="cards">
    <div><b>Joint</b><p>P(sick ∩ +): "sick <em>and</em> positive". One cell ÷ grand total.</p><small>95 / 10,000 = 0.0095</small></div>
    <div><b>Marginal</b><p>P(+): "positive, sick or not". A row or column total ÷ grand total.</p><small>590 / 10,000 = 0.059</small></div>
    <div><b>Conditional</b><p>P(+ | sick): "positive, <em>given</em> sick". Zoom into the sick row only.</p><small>95 / 100 = 0.95</small></div>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>"Marginal" is the number written in the margin of the table (the totals). "Conditional" is putting on blinkers: you only look at one row (or column) and ask what share of <em>that row</em> has the property.</p>
  </div>
  <p>Formula: <code>P(A|B) = P(A∩B) / P(B)</code>. In words: the share of both-happening, out of the share where B happened. Check: P(+ ∩ sick) = 0.0095 and P(sick) = 0.01, so P(+ | sick) = 0.0095 / 0.01 = 0.95. Now zoom into the <em>positive column</em> instead: P(sick | +) = 0.0095 / 0.059 = 95 / 590 = <strong>0.161</strong>. Same cell, different total, very different number.</p>
  <div class="fx" data-lang="py">t = pd.DataFrame({"+": [95, 495], "-": [5, 9405]}, index=["sick", "healthy"])
joint = t / t.values.sum()
print(joint)
print("marginal P(sick) =", joint.loc["sick"].sum(), "  P(+) =", round(joint["+"].sum(), 4))
print("P(+ | sick) =", joint.loc["sick", "+"] / joint.loc["sick"].sum())
print("P(sick | +) =", round(joint.loc["sick", "+"] / joint["+"].sum(), 4))</div>
  <div class="fx" data-lang="text">              +       -
sick     0.0095  0.0005
healthy  0.0495  0.9405
marginal P(sick) = 0.01   P(+) = 0.059
P(+ | sick) = 0.95
P(sick | +) = 0.161</div>
  <p>What the code does: dividing the count table by its grand total gives the joint table (all four cells add to 1). Summing a row gives a marginal; dividing a cell by its row or column total gives a conditional. Rearranged, the definition is the multiplication rule from section 02: P(A ∩ B) = P(B) · P(A | B).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Joint</strong> probability P(A ∩ B); <strong>marginal</strong> probability P(A) = Σ over B of P(A ∩ B); <strong>conditional</strong> probability P(A | B) = P(A ∩ B) / P(B), defined when P(B) &gt; 0. A conditional probability is an ordinary probability inside the smaller world where B happened.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: P(A|B) ≠ P(B|A)</span>
    <p>P(+ | sick) = 95/100 = 95%: of sick people, 95% test positive. P(sick | +) = 95/590 = 16%: of positive people, 16% are sick. Swapping them is a famous mistake (the "prosecutor's fallacy": "the evidence is 99% likely if guilty" is not "99% likely guilty"). Bayes' theorem (section 05) is the correct way to flip them.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: independence.</b> Sometimes "given B" changes nothing: knowing yesterday's coin flip doesn't change today's. When is that true, and when can we simply multiply plain probabilities?</div>

  <h2 id="spr-indep"><span class="num">04</span>Independence</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The complement example multiplied 0.95 four times for four people. Was that allowed? When does knowing one thing tell us nothing about another, so that "and" is just a product of plain probabilities?</p>
  </div>
  <p>Does knowing one thing change your guess about another? If a coin shows heads, does that change the chance the next flip is heads? No. If a person is sick, does that change the chance their test is positive? Very much: from 5.9% overall to 95%. Two events are <strong>independent</strong> when knowing one tells you nothing about the other.</p>
  <div class="flow"><span>Is P(A|B) = P(A)?</span><span>Yes → independent</span><span>P(A∩B) = P(A)·P(B)</span></div>
  <p>The test, in words: the conditional probability equals the plain probability. Equivalent shortcut: for independent events, "both happen" is just the two probabilities multiplied. Check the clinic: if disease and test were independent, P(sick ∩ +) would be P(sick) × P(+) = 0.01 × 0.059 = 0.00059. The real cell is 0.0095, sixteen times larger. So disease and test result are strongly <strong>dependent</strong>, which is exactly what you want from a test: a test independent of the disease would be useless.</p>
  <div class="fx" data-lang="py">print("if independent, P(sick and +) would be", round(p_sick * p_pos, 5), " real:", p["sick &amp; +"])
print("P(+ | sick) =", 0.95, "  P(+) =", round(p_pos, 3), "  P(+ | healthy) =", 0.05)
# two tests on the same person: independent GIVEN the true status
print("P(both + | sick)    =", round(0.95 ** 2, 4))
print("P(both + | healthy) =", round(0.05 ** 2, 4))</div>
  <div class="fx" data-lang="text">if independent, P(sick and +) would be 0.00059  real: 0.0095
P(+ | sick) = 0.95   P(+) = 0.059   P(+ | healthy) = 0.05
P(both + | sick)    = 0.9025
P(both + | healthy) = 0.0025</div>
  <h3>Conditional independence</h3>
  <p>Now test the same person twice. The two results are <em>not</em> independent overall: if the first is positive, the person is more likely sick, so the second is more likely positive too. But <em>given</em> the true status, a well-run test's errors are usually independent: for a sick person each test is positive with probability 0.95 regardless of the other, so P(both + | sick) = 0.95 × 0.95 = 0.9025, and P(both + | healthy) = 0.05 × 0.05 = 0.0025. This is called <strong>conditional independence</strong>, and section 05 uses it to update after a second test. The four healthy family members of section 02 are the same idea: their false alarms are independent given that all four are healthy.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two coin flips are independent: the coin has no memory. Rain and umbrella sales are not: seeing one tells you a lot about the other. Two thermometers in the same room disagree independently by a little, but both read high in a hot room: independent given the true temperature, dependent overall.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p>A and B are <strong>independent</strong> if P(A ∩ B) = P(A) P(B), equivalently P(A | B) = P(A). A and B are <strong>conditionally independent given C</strong> if P(A ∩ B | C) = P(A | C) P(B | C).</p>
  </div>
  <div class="callout trap"><span class="label">Trap: gambler's fallacy, and assumed independence</span>
    <p>After 5 heads in a row, tails is not "due": the next fair flip is still 0.5. The opposite mistake is assuming independence that isn't there: if both tests run in the same faulty lab, their errors are linked and 0.05² badly understates a double false alarm. Naive Bayes (a spam-filter model) <em>assumes</em> words are independent given the class; that is false, but the model often works anyway.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Bayes' theorem.</b> The patient holding a positive result wants P(sick | +). The test maker only tells us P(+ | sick) = 0.95. We need a rule to flip a conditional around without last year's table.</div>

  <h2 id="spr-bayes"><span class="num">05</span>Bayes' Theorem</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>You get a positive result on a "95% accurate" test. Are you 95% likely to be sick? Almost everyone says yes. The real answer is about 16%. How do we get from what the test maker tells us, P(+ | sick), to what the patient needs, P(sick | +)?</p>
  </div>
  <p>The flip needs one extra piece of information: how common the disease is to begin with (the <strong>prior</strong>, or base rate). <strong>Bayes' theorem</strong> combines it with the test's behaviour.</p>
  <div class="flow"><span>Prior P(A)</span><span>× Likelihood P(B|A)</span><span>÷ Evidence P(B)</span><span>= Posterior P(A|B)</span></div>
  <p>Formula: <code>P(A|B) = P(B|A) · P(A) / P(B)</code>. It is just the definition of conditional probability (section 03) written twice: P(A ∩ B) = P(A) P(B | A) = P(B) P(A | B), then divide by P(B). The words: <em>prior</em> is what you believed before seeing the evidence; <em>likelihood</em> is how likely the evidence is if A is true; <em>evidence</em> is how likely that evidence is overall, found by adding every route to it (the law of total probability); <em>posterior</em> is your updated belief.</p>
  <h3>The clinic, by counting people</h3>
  <figure class="viz"><svg viewBox="0 0 580 210" width="580"><defs><marker id="spr-ab" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs><rect x="220" y="8" width="140" height="26" rx="5" class="fs" stroke="currentColor" stroke-opacity=".4"/><text x="290.0" y="25" text-anchor="middle">10,000 people</text><line x1="260" y1="34" x2="130" y2="68" stroke="currentColor" stroke-opacity=".6" marker-end="url(#spr-ab)"/><text x="150" y="52" font-size="10" class="tm">1% sick</text><line x1="320" y1="34" x2="440" y2="68" stroke="currentColor" stroke-opacity=".6" marker-end="url(#spr-ab)"/><text x="395" y="52" font-size="10" class="tm">99% healthy</text><rect x="70" y="70" width="120" height="26" rx="5" class="fs" stroke="currentColor" stroke-opacity=".4"/><text x="130.0" y="87" text-anchor="middle">100 sick</text><rect x="380" y="70" width="140" height="26" rx="5" class="fs" stroke="currentColor" stroke-opacity=".4"/><text x="450.0" y="87" text-anchor="middle">9,900 healthy</text><line x1="110" y1="96" x2="60" y2="136" stroke="currentColor" stroke-opacity=".6" marker-end="url(#spr-ab)"/><text x="58" y="118" font-size="10" class="tm">95%</text><line x1="150" y1="96" x2="190" y2="136" stroke="currentColor" stroke-opacity=".6" marker-end="url(#spr-ab)"/><text x="178" y="118" font-size="10" class="tm">5%</text><line x1="420" y1="96" x2="380" y2="136" stroke="currentColor" stroke-opacity=".6" marker-end="url(#spr-ab)"/><text x="346" y="118" font-size="10" class="tm">5% FP</text><line x1="480" y1="96" x2="520" y2="136" stroke="currentColor" stroke-opacity=".6" marker-end="url(#spr-ab)"/><text x="510" y="118" font-size="10" class="tm">95%</text><rect x="10" y="138" width="95" height="26" rx="5" class="fg sg" stroke="currentColor" stroke-opacity=".4"/><text x="57.5" y="155" text-anchor="middle">95 test +</text><rect x="150" y="138" width="90" height="26" rx="5" class="fs" stroke="currentColor" stroke-opacity=".4"/><text x="195.0" y="155" text-anchor="middle">5 test −</text><rect x="330" y="138" width="110" height="26" rx="5" class="fr sr" stroke="currentColor" stroke-opacity=".4"/><text x="385.0" y="155" text-anchor="middle">495 test +</text><rect x="470" y="138" width="105" height="26" rx="5" class="fs" stroke="currentColor" stroke-opacity=".4"/><text x="522.5" y="155" text-anchor="middle">9,405 test −</text><text x="290" y="196" text-anchor="middle" font-weight="bold">P(sick | +) = 95 / (95 + 495) = 16.1%</text></svg><figcaption>Count people, not percentages. False positives from the huge healthy group swamp the true positives.</figcaption></figure>
  <p>Follow the tree. Of 10,000 people, 100 are sick; the test catches 95 of them. 9,900 are healthy; the test wrongly flags 5% of them, which is 495 people. So 95 + 495 = 590 people test positive, and only 95 of them are actually sick: 95 / 590 = 16%. The healthy crowd is so big that even a small error rate produces more false alarms than true catches.</p>
  <table class="tbl out"><caption>The same answer with the formula</caption>
    <tr><th>Prior</th><td>P(sick) = 0.01</td></tr>
    <tr><th>Likelihood</th><td>P(+ | sick) = 0.95</td></tr>
    <tr><th>Evidence</th><td>P(+) = 0.95 × 0.01 + 0.05 × 0.99 = 0.0095 + 0.0495 = 0.059</td></tr>
    <tr><th>Posterior</th><td>P(sick | +) = 0.0095 / 0.059 = <strong>0.161</strong></td></tr>
  </table>
  <div class="fx" data-lang="py">prev, sens, spec = 0.01, 0.95, 0.95
p_pos = sens * prev + (1 - spec) * (1 - prev)    # total probability of "+"
post = sens * prev / p_pos
print("P(+) =", round(p_pos, 4), "  P(sick|+) =", round(post, 4))
p2 = sens * post + (1 - spec) * (1 - post)      # yesterday's posterior = today's prior
print("after a 2nd +:", round(sens * post / p2, 4))
for pr in [0.001, 0.01, 0.1, 0.5]:              # same test, different base rates
    print(f"prevalence {pr:5.3f} -&gt; P(sick|+) = {sens * pr / (sens * pr + (1 - spec) * (1 - pr)):.3f}")</div>
  <div class="fx" data-lang="text">P(+) = 0.059   P(sick|+) = 0.161
after a 2nd +: 0.7848
prevalence 0.001 -&gt; P(sick|+) = 0.019
prevalence 0.010 -&gt; P(sick|+) = 0.161
prevalence 0.100 -&gt; P(sick|+) = 0.679
prevalence 0.500 -&gt; P(sick|+) = 0.950</div>
  <p>What the code does: <code>p_pos</code> is the evidence, built by adding the two ways to test positive (sick and caught, healthy and wrongly flagged). Then it runs Bayes again with 16.1% as the new prior: a second positive test (independent given status, section 04) lifts the belief to 78.5%. Each piece of evidence updates the last belief; that is Bayesian thinking. The loop keeps the test fixed and changes only the prevalence: the same "95% accurate" test gives 1.9%, 16.1%, 67.9% or 95% depending on the base rate.</p>
  <p>Don't trust the algebra? Simulate a million people:</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(0)
sick = rng.random(1_000_000) &lt; prev
pos = np.where(sick, rng.random(sick.size) &lt; sens, rng.random(sick.size) &lt; 1 - spec)
print("simulated P(sick|+) =", round(sick[pos].mean(), 4), " from", pos.sum(), "positives")</div>
  <div class="fx" data-lang="text">simulated P(sick|+) = 0.1612  from 58773 positives</div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A smoke alarm that rings for 95% of real fires and for 5% of burnt toast. In a house where fires are rare and toast is daily, most rings are toast. The alarm is fine; the base rate decides what a ring means.</p>
  </div>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>The rare base rate (1%) dominates. Same reason a fraud model with 99% accuracy still flags mostly honest transactions when fraud is 0.1%: the honest pile is a thousand times bigger. In ML language, P(sick | +) is the <em>precision</em> of the test (see <a class="xref" data-note="ml_evaluation">Classification Metrics</a>).</p>
  </div>
  <h3>The same rule elsewhere: a spam filter</h3>
  <p>40% of mail is spam. The word "free" appears in 25% of spam and in 2% of normal mail. An email contains "free". What is the chance it is spam?</p>
  <div class="fx" data-lang="py">ps, pw_s, pw_h = 0.4, 0.25, 0.02
print("P(spam|free) =", round(pw_s*ps / (pw_s*ps + pw_h*(1-ps)), 4))</div>
  <div class="fx" data-lang="text">P(spam|free) = 0.8929</div>
  <p>By hand, per 1,000 emails: 400 spam, of which 100 say "free"; 600 normal, of which 12 say "free". Of the 112 emails saying "free", 100 are spam: 100 / 112 = 89%. A <a class="xref" data-note="ml_naivebayes">Naive Bayes</a> spam filter multiplies one such likelihood per word, assuming words are independent given the class.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Bayes' theorem</strong>: P(A | B) = P(B | A) P(A) / P(B), with P(B) = Σᵢ P(B | Aᵢ) P(Aᵢ) over a set of exclusive, exhaustive cases Aᵢ (the <strong>law of total probability</strong>). In odds form: posterior odds = prior odds × likelihood ratio; for the clinic, (1/99) × (0.95/0.05) = 19/99, i.e. 19/(19 + 99) = 16.1%.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: base-rate neglect</span>
    <p>Ignoring the prior and reading the sensitivity as the answer ("95% accurate, so 95% sure") is the most common probability mistake in medicine, fraud and security. Always ask "out of how many?" and count people, not percentages.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: random variables.</b> So far every event is yes/no. The clinic's manager asks a numeric question: "what will screening cost per person, on average, and how much can that swing?" We need numbers that depend on chance.</div>

  <h2 id="spr-rv"><span class="num">06</span>Random Variables, Expectation &amp; Variance</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Events give probabilities, but budgets need numbers: how many positives in a batch, how many rupees per person. How do we attach numbers to chance outcomes and summarise them, the way the mean and variance summarised data?</p>
  </div>
  <p>A number attached to a random outcome is a <strong>random variable</strong> (written X): the count of positives in a batch, the cost of screening one person, the face of a die. Two questions about any random variable: what do I get on average, and how much does it swing? The average is the <strong>expected value</strong> E[X]: each possible value weighted by its probability, then added. The swing is the <strong>variance</strong>: the probability-weighted average squared gap from E[X], exactly as in <a class="xref" data-note="st_descriptive">Descriptive Statistics</a> but with probabilities as weights instead of 1/n.</p>
  <h3>Positives among two people, by hand</h3>
  <p>Each screened person tests positive with probability q = 0.059 (section 01), independently of others. Let X = number of positives among two people.</p>
  <table class="tbl out"><caption>X = positives among 2 people, q = 0.059</caption>
    <tr><th>x</th><th>how</th><th>P(X = x)</th><th>x · P</th><th>(x − 0.118)² · P</th></tr>
    <tr><td>0</td><td>0.941 × 0.941</td><td>0.885481</td><td>0</td><td>0.013924 × 0.885481 = 0.012329</td></tr>
    <tr><td>1</td><td>2 × 0.059 × 0.941 (either person)</td><td>0.111038</td><td>0.111038</td><td>0.777924 × 0.111038 = 0.086379</td></tr>
    <tr><td>2</td><td>0.059 × 0.059</td><td>0.003481</td><td>0.006962</td><td>3.541924 × 0.003481 = 0.012329</td></tr>
    <tr><th>sum</th><td></td><td>1</td><td><strong>E[X] = 0.118</strong></td><td><strong>Var(X) = 0.111038</strong></td></tr>
  </table>
  <p>E[X] = 0.118 = 2 × 0.059: two people, each contributing 0.059 positives on average. Var(X) = 0.111 = 2 × 0.059 × 0.941: each person's 0/1 result has variance q(1 − q) = 0.0555, and the two independent variances add. Both shortcuts are general rules (table below), and they are the heart of the binomial distribution in <a class="xref" data-note="st_distributions">Distributions</a>.</p>
  <h3>Cost per person</h3>
  <p>Each screen costs ₹500; a positive triggers a ₹2,000 follow-up. Cost C = 500 + 2,000 · I, where I = 1 if positive, else 0. E[C] = 500 + 2,000 × 0.059 = <strong>₹618</strong>. Var(C) = 2,000² × 0.0555 = 222,076, so SD = <strong>₹471</strong>: one person costs either ₹500 or ₹2,500, never ₹618, but the average over many people is ₹618.</p>
  <div class="fx" data-lang="py">q = 0.059                                    # P(a screened person tests +)
x = np.array([0, 1, 2])                      # X = positives among 2 people
px = np.array([(1 - q) ** 2, 2 * q * (1 - q), q ** 2])
E = (x * px).sum(); Var = ((x - E) ** 2 * px).sum()
print("P(X=0,1,2) =", px.round(6), " sum", px.sum())
print("E[X] =", round(E, 4), "  Var(X) =", round(Var, 6))
cost = np.array([500, 2500])                 # Rs per person: test only, or test + follow-up
pc = np.array([1 - q, q])
Ec = (cost * pc).sum(); sdc = np.sqrt(((cost - Ec) ** 2 * pc).sum())
print("E[cost] =", round(Ec, 1), "  SD =", round(sdc, 1))
print("10,000 people: expected Rs", round(Ec * 10_000), " -&gt; per sick person found:", round(Ec * 10_000 / 95))</div>
  <div class="fx" data-lang="text">P(X=0,1,2) = [0.885481 0.111038 0.003481]  sum 1.0
E[X] = 0.118   Var(X) = 0.111038
E[cost] = 618.0   SD = 471.2
10,000 people: expected Rs 6180000  -&gt; per sick person found: 65053</div>
  <p>What the code does: it lists X's possible values and their probabilities, then computes Σ x·P(x) and Σ (x − E)²·P(x). The cost part does the same for the two possible costs. The last line combines this note's results: 10,000 people cost ₹61.8 lakh, and since only 95 of them are truly sick (section 05), each sick person found costs about ₹65,000, a number a hospital manager actually needs.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>E[X] is what you'd pay per person if you screened a million people and split the bill equally. A lottery ticket costs ₹10 and pays ₹1 crore with chance 1 in 10 crore: E = 1 crore × (1/10 crore) − 10 = 0.1 − 10 = −₹9.9 per ticket. The lottery owner relies on this.</p>
  </div>
  <table class="tbl">
    <tr><th>Property</th><th>Rule</th><th>On the clinic</th></tr>
    <tr><td>Linearity</td><td><code>E[aX + bY + c] = aE[X] + bE[Y] + c</code>, always, even if X and Y are related</td><td>E[500 + 2,000·I] = 500 + 2,000 × 0.059 = 618</td></tr>
    <tr><td>Scaling</td><td><code>Var(aX + b) = a² Var(X)</code></td><td>Var(C) = 2,000² × 0.0555; the ₹500 shift adds no spread</td></tr>
    <tr><td>Sum</td><td><code>Var(X + Y) = Var X + Var Y</code> <em>only if independent</em></td><td>two people: 0.0555 + 0.0555 = 0.111</td></tr>
    <tr><td>Indicator</td><td>I ∈ {0, 1}: E[I] = q, Var(I) = q(1 − q)</td><td>0.059 and 0.0555</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p>A <strong>random variable</strong> X maps each outcome to a number. For discrete X: <strong>E[X]</strong> = Σ x P(X = x); <strong>Var(X)</strong> = E[(X − E[X])²] = E[X²] − (E[X])²; SD = √Var(X). E[X] is often written μ and Var(X) σ².</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>E[X] need not be a value X can take (₹618 never occurs; a die's E is 3.5). And Var(X − Y) is Var X + Var Y, not the difference, when X and Y are independent: subtracting adds noise.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the law of large numbers.</b> One person is unpredictable: ₹500 or ₹2,500, positive or not. Does the clinic's observed positive rate settle down to 0.059 as it screens more people?</div>

  <h2 id="spr-lln"><span class="num">07</span>Law of Large Numbers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>P(+) = 0.059 is a long-run statement. The clinic sees people one at a time. Does the share of positives it actually observes really approach 0.059, and how fast?</p>
  </div>
  <p>After 10 people the share of positives might be 0.1 (one positive) or 0 (none). After 10,000 it will be very close to 0.059. Averages settle down as you collect more data. That simple fact is the <strong>law of large numbers</strong> (LLN), and it is why casinos, insurers and A/B tests all work: one customer is unpredictable, a million customers are not.</p>
  <figure class="viz"><svg viewBox="0 0 560 185" width="560"><line x1="30" y1="152" x2="530" y2="152" stroke="currentColor" stroke-opacity=".5"/><text x="30" y="167" text-anchor="middle" font-size="11">1</text><text x="155" y="167" text-anchor="middle" font-size="11">10</text><text x="280" y="167" text-anchor="middle" font-size="11">100</text><text x="405" y="167" text-anchor="middle" font-size="11">1,000</text><text x="530" y="167" text-anchor="middle" font-size="11">10,000</text><text x="530" y="182" text-anchor="end" font-size="11" class="tm">people screened (log scale)</text><text x="26" y="96" text-anchor="end" font-size="10" class="tm">0.1</text><line x1="30" y1="92" x2="530" y2="92" stroke="currentColor" stroke-opacity=".12"/><text x="26" y="36" text-anchor="end" font-size="10" class="tm">0.2</text><line x1="30" y1="32" x2="530" y2="32" stroke="currentColor" stroke-opacity=".12"/><line x1="30" y1="116.6" x2="530" y2="116.6" class="sr" stroke-dasharray="4 3"/><path d="M30.0,152.0 L67.6,152.0 L89.6,152.0 L105.3,152.0 L117.4,152.0 L127.3,152.0 L135.6,152.0 L142.9,152.0 L149.3,152.0 L155.0,92.0 L160.2,97.5 L164.9,102.0 L169.2,105.8 L173.3,109.1 L177.0,112.0 L180.5,114.5 L183.8,116.7 L186.9,118.7 L189.8,120.4 L192.6,122.0 L195.3,123.4 L197.8,124.7 L202.5,127.0 L204.7,128.0 L208.9,129.8 L210.9,130.6 L214.6,132.0 L218.1,133.2 L219.8,133.8 L223.0,134.9 L227.5,120.4 L230.3,122.0 L232.9,123.4 L236.7,125.3 L239.0,126.5 L242.4,128.0 L245.5,129.4 L248.5,130.6 L252.3,132.0 L254.9,123.4 L258.3,125.1 L261.4,126.6 L264.4,128.0 L267.2,121.6 L270.5,123.4 L273.7,125.0 L276.6,120.1 L280.0,122.0 L283.2,123.7 L286.2,125.2 L289.4,126.8 L292.5,128.2 L295.5,129.4 L298.7,130.7 L302.0,132.0 L304.8,133.0 L308.2,134.1 L311.3,131.8 L314.3,129.7 L317.6,128.0 L320.5,129.3 L323.8,127.9 L326.8,126.7 L330.0,125.7 L333.1,120.4 L336.3,122.2 L339.5,119.9 L342.5,119.7 L345.6,114.4 L348.8,116.5 L351.9,115.3 L355.0,117.3 L358.2,116.5 L361.3,118.4 L364.4,119.0 L367.5,118.5 L370.6,119.2 L373.7,120.0 L376.9,121.8 L380.0,120.6 L383.1,122.4 L386.3,121.5 L389.4,123.2 L392.5,122.5 L395.6,119.2 L398.7,119.0 L401.9,119.6 L405.0,120.2 L408.1,120.8 L411.2,121.0 L414.4,120.2 L417.5,119.6 L420.6,119.2 L423.8,118.9 L426.9,119.1 L430.0,117.6 L433.1,117.0 L436.2,116.9 L439.4,117.0 L442.5,117.1 L445.6,116.5 L448.8,116.4 L451.9,116.3 L455.0,115.7 L458.1,115.2 L461.2,115.2 L464.4,114.6 L467.5,114.4 L470.6,114.4 L473.7,115.1 L476.9,115.3 L480.0,114.3 L483.1,114.7 L486.3,114.5 L489.4,115.2 L492.5,115.2 L495.6,116.1 L498.7,116.3 L501.9,116.6 L505.0,116.6 L508.1,117.2 L511.2,117.5 L514.4,117.1 L517.5,116.7 L520.6,116.7 L523.8,116.9 L526.9,116.9 L530.0,116.2" fill="none" class="sb" stroke-width="2"/><text x="40" y="16" font-size="11" class="tb">running share of positive tests</text><text x="524" y="111" text-anchor="end" font-size="11" class="tr">true P(+) = 0.059</text></svg><figcaption>The first nine people all test negative (share 0), the tenth is positive (share 0.1). As people pile up the running share hugs the true 0.059.</figcaption></figure>
  <div class="fx" data-lang="py">rng = np.random.default_rng(1)
tests = (rng.random(10_000) &lt; 0.059).astype(int)     # 1 = positive, in arrival order
running = np.cumsum(tests) / np.arange(1, 10_001)
for n in [10, 100, 1000, 10000]:
    print(n, round(running[n - 1], 4))</div>
  <div class="fx" data-lang="text">10 0.1
100 0.05
1000 0.053
10000 0.0596</div>
  <p>What the code does: it draws 10,000 people's results (1 = positive with probability 0.059), keeps a running total with <code>np.cumsum</code>, and divides by the count so far. The share is a <em>mean</em> of 0/1 values, so the LLN for shares and the LLN for averages are the same law.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Pouring sugar into a cup of tea one grain at a time: the first few grains land wherever, but after a spoonful the sweetness is what the recipe says. Each new grain changes the average less and less.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Law of large numbers</strong>: for independent draws X₁, X₂, … with mean μ, the sample mean X̄ₙ = (X₁ + … + Xₙ)/n gets arbitrarily close to μ as n → ∞ (with probability 1, in the "strong" version).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The LLN does not say outcomes "balance out" in the short run (the gambler's fallacy again): it works by <em>swamping</em> early luck with many new draws, not by correcting it. A run of 10 positives does not make the next people more likely to be negative.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: the central limit theorem.</b> The LLN says where the average ends up. It doesn't say how far a single day's rate, from 100 people, is likely to stray, or what shape those day-to-day wobbles have.</div>

  <h2 id="spr-clt"><span class="num">08</span>Central Limit Theorem &amp; Standard Error</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>On a day with 100 people, the clinic sees 4 positives. Is that suspiciously low, or normal day-to-day noise around 5.9? To answer, we need the shape and width of the wobble of an average.</p>
  </div>
  <p>Repeat "screen n people, compute the share positive" over many days and plot the shares. Two things happen as n grows. The spread shrinks like 1/√n: this spread of an average is the <strong>standard error</strong>, SE = σ/√n, where σ² = q(1 − q) = 0.0555 is one person's variance from section 06. And the shape becomes a bell curve, even though one person's result (0 or 1) is extremely lopsided. That second fact is the <strong>central limit theorem</strong> (CLT).</p>
  <div class="fx" data-lang="py">q = 0.059
print("one person (0/1): skew", round(stats.skew((rng.random(1_000_000) &lt; q).astype(float)), 2))
for n in [30, 100, 300]:
    rates = rng.binomial(n, q, 100_000) / n        # 100k days, n people each
    print(f"n={n:3d}  mean {rates.mean():.4f}  SD {rates.std():.4f}"
          f"  theory {np.sqrt(q * (1 - q) / n):.4f}  skew {stats.skew(rates):.2f}")</div>
  <div class="fx" data-lang="text">one person (0/1): skew 3.74
n= 30  mean 0.0590  SD 0.0430  theory 0.0430  skew 0.68
n=100  mean 0.0591  SD 0.0236  theory 0.0236  skew 0.37
n=300  mean 0.0589  SD 0.0136  theory 0.0136  skew 0.21</div>
  <p>Read it: one person's 0/1 result has skew 3.74 (a tall bar at 0, a tiny one at 1). Averaging 30 people cuts the skew to 0.68, 100 people to 0.37, 300 to 0.21: roughly ÷ √n each time. The simulated SD of the daily rate matches the formula √(0.059 × 0.941 / n) to four decimals: 0.043, 0.0236, 0.0136. So for n = 100, a day's rate is 0.059 give or take 0.024, and 4 positives (0.04) is less than one SE below normal: ordinary noise.</p>
  <figure class="viz"><svg viewBox="0 0 580 210" width="580"><line x1="30" y1="172" x2="550" y2="172" stroke="currentColor" stroke-opacity=".5"/><text x="30.0" y="187" text-anchor="middle" font-size="11">0</text><text x="116.7" y="187" text-anchor="middle" font-size="11">0.02</text><text x="203.3" y="187" text-anchor="middle" font-size="11">0.04</text><text x="290.0" y="187" text-anchor="middle" font-size="11">0.06</text><text x="376.7" y="187" text-anchor="middle" font-size="11">0.08</text><text x="463.3" y="187" text-anchor="middle" font-size="11">0.1</text><text x="550.0" y="187" text-anchor="middle" font-size="11">0.12</text><text x="550" y="205" text-anchor="end" font-size="11" class="tm">share positive in a day</text><path d="M51.7,172V172.0H80.6V172M80.6,172V171.9H109.4V172M109.4,172V170.7H138.3V172M138.3,172V165.1H167.2V172M167.2,172V150.3H196.1V172M196.1,172V123.6H225.0V172M225.0,172V92.0H253.9V172M253.9,172V72.0H282.8V172M282.8,172V74.6H311.7V172M311.7,172V96.6H340.6V172M340.6,172V124.1H369.4V172M369.4,172V145.9H398.3V172M398.3,172V160.7H427.2V172M427.2,172V167.8H456.1V172M456.1,172V170.5H485.0V172M485.0,172V171.6H513.9V172M513.9,172V171.9H542.8V172" class="fb sb"/><path d="M30.0,172.0 L36.6,172.0 L43.2,172.0 L49.7,172.0 L56.3,171.9 L62.9,171.9 L69.5,171.9 L76.1,171.8 L82.7,171.7 L89.2,171.6 L95.8,171.4 L102.4,171.2 L109.0,170.9 L115.6,170.4 L122.2,169.8 L128.7,169.0 L135.3,168.0 L141.9,166.8 L148.5,165.2 L155.1,163.2 L161.6,160.8 L168.2,158.0 L174.8,154.6 L181.4,150.6 L188.0,146.1 L194.6,141.0 L201.1,135.4 L207.7,129.4 L214.3,122.9 L220.9,116.1 L227.5,109.2 L234.1,102.3 L240.6,95.7 L247.2,89.4 L253.8,83.7 L260.4,78.8 L267.0,74.8 L273.5,71.9 L280.1,70.3 L286.7,69.8 L293.3,70.7 L299.9,72.7 L306.5,76.0 L313.0,80.2 L319.6,85.4 L326.2,91.3 L332.8,97.7 L339.4,104.5 L345.9,111.4 L352.5,118.3 L359.1,125.0 L365.7,131.3 L372.3,137.3 L378.9,142.7 L385.4,147.6 L392.0,151.9 L398.6,155.7 L405.2,158.9 L411.8,161.6 L418.4,163.9 L424.9,165.7 L431.5,167.2 L438.1,168.4 L444.7,169.3 L451.3,170.0 L457.8,170.6 L464.4,171.0 L471.0,171.3 L477.6,171.5 L484.2,171.6 L490.8,171.8 L497.3,171.8 L503.9,171.9 L510.5,171.9 L517.1,172.0 L523.7,172.0 L530.3,172.0 L536.8,172.0 L543.4,172.0 L550.0,172.0" fill="none" class="sr" stroke-width="1.8"/><text x="40" y="18" font-size="11" class="tb">bars: 100,000 days of 300 people</text><text x="40" y="34" font-size="11" class="tr">curve: Normal(0.059, SE 0.0136)</text><text x="40" y="50" font-size="11" class="tm">one person is 0 or 1 (skew 3.74)</text></svg><figcaption>Each bar counts how often a day of 300 people produced that share of positives. A 0/1 variable with skew 3.74, yet the daily averages trace the red normal curve.</figcaption></figure>
  <h3>Why averaging makes a hump: the smallest picture</h3>
  <p>With a die it is easy to see by hand. One die is flat: every face has chance 1/6. Average two dice. There is only one way to get an average of 1 (both show 1) but six ways to get 3.5 (1+6, 2+5, 3+4, 4+3, 5+2, 6+1). Extremes need everything to go the same way; middling values can happen many ways.</p>
  <div class="fx" data-lang="py">from itertools import product
means = np.array([np.mean(r) for r in product(range(1, 7), repeat=2)])   # all 36 pairs
vals, counts2 = np.unique(means, return_counts=True)
for v, c in zip(vals, counts2):
    print(f"{v:3.1f} {'#' * c}")</div>
  <div class="fx" data-lang="text">1.0 #
1.5 ##
2.0 ###
2.5 ####
3.0 #####
3.5 ######
4.0 #####
4.5 ####
5.0 ###
5.5 ##
6.0 #</div>
  <figure class="viz"><svg viewBox="0 0 560 170" width="560"><line x1="30" y1="140" x2="550" y2="140" stroke="currentColor" stroke-opacity=".5"/><rect x="40" y="124" width="30" height="16" class="fb sb"/><text x="55.0" y="120" text-anchor="middle" font-size="10">1/36</text><text x="55.0" y="155" text-anchor="middle" font-size="11">1</text><rect x="86" y="108" width="30" height="32" class="fb sb"/><text x="101.0" y="104" text-anchor="middle" font-size="10">2/36</text><text x="101.0" y="155" text-anchor="middle" font-size="11">1.5</text><rect x="132" y="92" width="30" height="48" class="fb sb"/><text x="147.0" y="88" text-anchor="middle" font-size="10">3/36</text><text x="147.0" y="155" text-anchor="middle" font-size="11">2</text><rect x="178" y="76" width="30" height="64" class="fb sb"/><text x="193.0" y="72" text-anchor="middle" font-size="10">4/36</text><text x="193.0" y="155" text-anchor="middle" font-size="11">2.5</text><rect x="224" y="60" width="30" height="80" class="fb sb"/><text x="239.0" y="56" text-anchor="middle" font-size="10">5/36</text><text x="239.0" y="155" text-anchor="middle" font-size="11">3</text><rect x="270" y="44" width="30" height="96" class="fb sb"/><text x="285.0" y="40" text-anchor="middle" font-size="10">6/36</text><text x="285.0" y="155" text-anchor="middle" font-size="11">3.5</text><rect x="316" y="60" width="30" height="80" class="fb sb"/><text x="331.0" y="56" text-anchor="middle" font-size="10">5/36</text><text x="331.0" y="155" text-anchor="middle" font-size="11">4</text><rect x="362" y="76" width="30" height="64" class="fb sb"/><text x="377.0" y="72" text-anchor="middle" font-size="10">4/36</text><text x="377.0" y="155" text-anchor="middle" font-size="11">4.5</text><rect x="408" y="92" width="30" height="48" class="fb sb"/><text x="423.0" y="88" text-anchor="middle" font-size="10">3/36</text><text x="423.0" y="155" text-anchor="middle" font-size="11">5</text><rect x="454" y="108" width="30" height="32" class="fb sb"/><text x="469.0" y="104" text-anchor="middle" font-size="10">2/36</text><text x="469.0" y="155" text-anchor="middle" font-size="11">5.5</text><rect x="500" y="124" width="30" height="16" class="fb sb"/><text x="515.0" y="120" text-anchor="middle" font-size="10">1/36</text><text x="515.0" y="155" text-anchor="middle" font-size="11">6</text><text x="550" y="170" text-anchor="end" font-size="11" class="tm">average of 2 dice</text></svg><figcaption>One die is flat: every face 1/6. The average of just two dice already piles up in the middle. More dice, taller and narrower hump.</figcaption></figure>
  <p>A flat start became a triangle after averaging just two values; averaging more turns it into the bell. The screening rates do the same, only starting from a much more lopsided shape, which is why they need more people per day before the bell appears.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A class's average height barely changes from one class of 40 to the next, even though individual students vary a lot. Individual quirks cancel in the average, and the leftover wobble is small and bell-shaped.</p>
  </div>
  <div class="callout def"><span class="label">CLT in one line</span>
    <p>Averages of n independent draws from any distribution with mean μ and finite variance σ² are approximately Normal(μ, σ/√n) for large n, whatever the original shape. Skew shrinks by about √n, so n ≈ 30 is enough for mild skew; very lopsided data (rare events, heavy tails) needs more. A common rule for shares: n·q ≥ 10 (here n ≥ 170).</p>
  </div>
  <div class="callout intu"><span class="label">Why it matters</span>
    <p>It's why t-tests, confidence intervals and A/B tests work on non-normal metrics like conversion (0/1) and revenue: they test the <em>mean</em>, and the mean is normal. And since the error is σ/√n, 4× the data halves the noise. <a class="xref" data-note="st_hypothesis">Hypothesis Testing</a> turns "4 positives vs 5.9 expected" into a formal test, and <a class="xref" data-note="st_abtesting">A/B Testing</a> uses the SE to size experiments.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>The CLT is about the distribution of the <em>mean</em>, not the data: individual results stay 0 or 1. Extremely heavy tails (e.g. Cauchy, which has no finite variance), dependent draws (people from the same outbreak) or too small n for a rare event break it.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: classic puzzles.</b> We have the full toolkit. Interviewers test it with puzzles whose right answers feel wrong. Can the same rules beat intuition?</div>

  <h2 id="spr-puzzles"><span class="num">09</span>Classic Interview Puzzles</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Our intuition failed on the medical test. Where else does it fail, and can the complement rule, Bayes and a quick simulation rescue us every time?</p>
  </div>
  <h3>Birthday problem: the complement rule</h3>
  <p>In a room of 23 people, is it more likely than not that two share a birthday? Most people say no, 23 is far below 365. Use the complement, as with the family's false alarms: find P(all 23 birthdays different), then subtract from 1. The first person can have any birthday (365/365). The second must avoid one day (364/365). The third must avoid two (363/365), and so on; multiply all 23 fractions (multiplication rule).</p>
  <div class="fx" data-lang="py">from math import prod
for n in [23, 50, 70]:
    print(n, "exact:", round(1 - prod((365-i)/365 for i in range(n)), 4))
rng = np.random.default_rng(0)
bdays = rng.integers(0, 365, (100_000, 23))
shared = np.array([len(set(r)) &lt; 23 for r in bdays])
print("simulated, n=23:", shared.mean())</div>
  <div class="fx" data-lang="text">23 exact: 0.5073
50 exact: 0.9704
70 exact: 0.9992
simulated, n=23: 0.50699</div>
  <p>Just 23 people gives a 50.7% chance; the simulation (100,000 random rooms) agrees. Intuition fails because there are 23 × 22 / 2 = 253 <em>pairs</em> of people, and any pair can match, not just one.</p>
  <h3>Monty Hall: Bayes with a host</h3>
  <p>Three doors: one hides a car, two hide goats. You pick door 1. The host, who knows where the car is, opens another door, say door 3, and shows a goat. He offers you a switch to door 2. Should you?</p>
  <div class="flow"><span>Pick door 1</span><span>Host opens a goat door (he knows)</span><span>Stay or switch?</span></div>
  <table class="tbl out"><caption>Bayes by hand: evidence = "host opens door 3"</caption>
    <tr><th>Car behind</th><th>Prior</th><th>Likelihood P(host opens 3 | car here)</th><th>Prior × likelihood</th><th>Posterior</th></tr>
    <tr><td>door 1 (yours)</td><td>1/3</td><td>1/2 (he can open 2 or 3)</td><td>1/6</td><td>(1/6)/(1/2) = <strong>1/3</strong></td></tr>
    <tr><td>door 2</td><td>1/3</td><td>1 (he must open 3)</td><td>1/3</td><td>(1/3)/(1/2) = <strong>2/3</strong></td></tr>
    <tr><td>door 3</td><td>1/3</td><td>0 (he never reveals the car)</td><td>0</td><td>0</td></tr>
    <tr><th>evidence</th><td></td><td></td><td>1/6 + 1/3 + 0 = 1/2</td><td></td></tr>
  </table>
  <p>Exactly the clinic's structure: a prior, a likelihood for the evidence under each case, the evidence by total probability, a posterior. The host's choice is evidence because it depends on where the car is.</p>
  <div class="fx" data-lang="py">rng = np.random.default_rng(0)
n = 100_000
car = rng.integers(0, 3, n)
pick = rng.integers(0, 3, n)
print("stay wins  :", (pick == car).mean())
print("switch wins:", (pick != car).mean())   # switching wins whenever first pick was wrong</div>
  <div class="fx" data-lang="text">stay wins  : 0.33168
switch wins: 0.66832</div>
  <div class="callout anlg"><span class="label">Intuition</span>
    <p>Imagine 100 doors; you pick one and the host opens 98 goats. Your door kept its 1/100 chance; the one he carefully avoided holds the other 99/100.</p>
  </div>
  <table class="tbl">
    <tr><th>Puzzle</th><th>Answer</th><th>Trick</th></tr>
    <tr><td>P(at least one 6 in 4 rolls)</td><td>1 − (5/6)⁴ = 0.518</td><td>Complement</td></tr>
    <tr><td>Heart or king from a deck</td><td>13/52 + 4/52 − 1/52 = 16/52 = 0.308</td><td>Addition, minus the king of hearts</td></tr>
    <tr><td>Two children, at least one boy. P(two boys)?</td><td>1/3</td><td>List the equally likely cases {BB, BG, GB}; GG is ruled out</td></tr>
    <tr><td>Expected value of a fair die</td><td>21/6 = 3.5; Var = 35/12 = 2.92</td><td>Σ x·P(x) with P = 1/6</td></tr>
    <tr><td>A game pays $10 on a 6, costs $2. Play?</td><td>E = 10/6 − 2 = −$0.33. No</td><td>Expected value</td></tr>
    <tr><td>Expected flips until first head</td><td>2</td><td>Geometric: 1/p, with p = 0.5</td></tr>
    <tr><td>Expected rolls to see all 6 faces</td><td>6(1 + 1/2 + … + 1/6) = 14.7</td><td>Coupon collector: add the expected wait for each new face</td></tr>
  </table>
  <div class="callout def"><span class="label">Method</span>
    <p>For any puzzle: (1) write the sample space, (2) decide whether outcomes are equally likely, (3) use the complement for "at least one", Bayes for "given what I saw", linearity for expected counts, and (4) when unsure, simulate 100,000 trials with numpy.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Monty Hall only works because the host <em>knows</em> and <em>always</em> opens a goat door. If he opened a random door that happened to show a goat, his likelihoods change and staying or switching are both 1/2. The rules of the process are part of the evidence.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: how it all connects.</b> We have a dozen tools. How do they grow out of each other?</div>

  <h2 id="spr-connect"><span class="num">10</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Sample space, three rules, conditional probability, independence, Bayes, random variables, LLN, CLT: separate topics, or one chain built on a single table of counts?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 780 300" width="780">
<defs><marker id="spr-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="5" y="20" width="140" height="44" rx="7" class="fb sb"/><text x="75" y="39" text-anchor="middle" font-size="11.5" font-weight="700">outcomes, counts</text><text x="75" y="55" text-anchor="middle" class="tm" font-size="10">95, 5, 495, 9,405</text>
<line x1="140" y1="42" x2="158" y2="42" stroke="currentColor" marker-end="url(#spr-a9)"/>
<rect x="160" y="20" width="120" height="44" rx="7" class="fb sb"/><text x="220" y="39" text-anchor="middle" font-size="11.5" font-weight="700">P(event)</text><text x="220" y="55" text-anchor="middle" class="tm" font-size="10">P(+) = 0.059</text>
<line x1="280" y1="42" x2="298" y2="42" stroke="currentColor" marker-end="url(#spr-a9)"/>
<rect x="300" y="20" width="130" height="44" rx="7" class="fb sb"/><text x="365" y="39" text-anchor="middle" font-size="11.5" font-weight="700">3 rules</text><text x="365" y="55" text-anchor="middle" class="tm" font-size="10">not · or · and</text>
<line x1="430" y1="42" x2="448" y2="42" stroke="currentColor" marker-end="url(#spr-a9)"/>
<rect x="450" y="20" width="140" height="44" rx="7" class="ft st"/><text x="520" y="39" text-anchor="middle" font-size="11.5" font-weight="700">conditional</text><text x="520" y="55" text-anchor="middle" class="tm" font-size="10">P(+|sick) = 0.95</text>
<line x1="520" y1="64" x2="520" y2="96" stroke="currentColor" marker-end="url(#spr-a9)"/><line x1="490" y1="64" x2="380" y2="96" stroke="currentColor" marker-end="url(#spr-a9)"/>
<rect x="300" y="98" width="150" height="44" rx="7" class="ft st"/><text x="375" y="117" text-anchor="middle" font-size="11.5" font-weight="700">independence</text><text x="375" y="133" text-anchor="middle" class="tm" font-size="10">P(A|B) = P(A)?</text>
<rect x="470" y="98" width="150" height="44" rx="7" class="fg sg"/><text x="545" y="117" text-anchor="middle" font-size="11.5" font-weight="700">Bayes</text><text x="545" y="133" text-anchor="middle" class="tm" font-size="10">P(sick|+) = 0.161</text>
<line x1="450" y1="120" x2="468" y2="120" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#spr-a9)"/><text x="545" y="158" text-anchor="middle" class="tm" font-size="9.5">2nd test: 0.785</text>
<line x1="220" y1="64" x2="150" y2="176" stroke="currentColor" marker-end="url(#spr-a9)"/>
<rect x="40" y="178" width="200" height="44" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.3"/><text x="140" y="197" text-anchor="middle" font-size="11.5" font-weight="700">random variable, E, Var</text><text x="140" y="213" text-anchor="middle" class="tm" font-size="10">E[cost] ₹618, Var(I) 0.0555</text>
<line x1="240" y1="200" x2="278" y2="200" stroke="currentColor" marker-end="url(#spr-a9)"/>
<rect x="280" y="178" width="150" height="44" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.3"/><text x="355" y="197" text-anchor="middle" font-size="11.5" font-weight="700">LLN</text><text x="355" y="213" text-anchor="middle" class="tm" font-size="10">share → 0.059</text>
<line x1="430" y1="200" x2="468" y2="200" stroke="currentColor" marker-end="url(#spr-a9)"/>
<rect x="470" y="178" width="200" height="44" rx="7" class="fv" stroke="currentColor" stroke-opacity="0.3"/><text x="570" y="197" text-anchor="middle" font-size="11.5" font-weight="700">CLT, standard error</text><text x="570" y="213" text-anchor="middle" class="tm" font-size="10">N(0.059, 0.0236) at n = 100</text>
<line x1="375" y1="142" x2="200" y2="176" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#spr-a9)"/><text x="225" y="150" text-anchor="middle" class="tm" font-size="9.5">Var adds if independent</text>
<line x1="570" y1="222" x2="570" y2="248" stroke="currentColor" marker-end="url(#spr-a9)"/><line x1="620" y1="120" x2="643" y2="120" stroke="currentColor" marker-end="url(#spr-a9)"/>
<rect x="645" y="98" width="130" height="44" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="710" y="117" text-anchor="middle" font-size="10.5">Naive Bayes,</text><text x="710" y="133" text-anchor="middle" font-size="10.5">precision (ML)</text>
<rect x="430" y="250" width="260" height="36" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.4"/><text x="560" y="272" text-anchor="middle" font-size="10.5">hypothesis tests, CIs, A/B tests</text>
</svg><figcaption>Everything grows out of one table of counts. Shares give probabilities; the three rules combine them; dividing by a row or column gives conditionals; comparing a conditional with the plain probability gives independence; writing the joint two ways gives Bayes. Attaching numbers gives random variables, whose averages obey the LLN and CLT.</figcaption></figure>
  <table class="tbl"><caption>Every concept on the same clinic</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>On the clinic</th><th>Use when</th></tr>
    <tr><td>Probability of an event</td><td>share of outcomes in the sample space</td><td>how likely is A?</td><td>P(+) = 590/10,000 = 0.059</td><td>always the starting point</td></tr>
    <tr><td>Complement</td><td>P(S) = 1</td><td>"not A", "at least one"?</td><td>1 − 0.95⁴ = 0.186</td><td>"at least one" questions</td></tr>
    <tr><td>Addition rule</td><td>counting, minus double count</td><td>A or B?</td><td>0.01 + 0.059 − 0.0095 = 0.0595</td><td>unions of events</td></tr>
    <tr><td>Multiplication rule</td><td>conditional probability</td><td>A and B?</td><td>0.01 × 0.95 = 0.0095</td><td>sequences, trees</td></tr>
    <tr><td>Joint / marginal</td><td>cells / totals of the table</td><td>how common is each combination / each event?</td><td>0.0095 / 0.059</td><td>two-way tables, crosstabs</td></tr>
    <tr><td>Conditional</td><td>joint ÷ marginal</td><td>how likely is A inside B?</td><td>P(+|sick) = 0.95</td><td>whenever information is known</td></tr>
    <tr><td>Independence</td><td>conditional = plain probability</td><td>can we just multiply?</td><td>0.00059 ≠ 0.0095: dependent</td><td>simplifying products; checking assumptions</td></tr>
    <tr><td>Conditional independence</td><td>independence inside a condition</td><td>are repeat tests separate evidence?</td><td>0.95² = 0.9025 given sick</td><td>repeat tests, Naive Bayes</td></tr>
    <tr><td>Total probability</td><td>multiplication + addition over cases</td><td>how likely is the evidence overall?</td><td>0.0095 + 0.0495 = 0.059</td><td>denominator of Bayes</td></tr>
    <tr><td>Bayes' theorem</td><td>joint written two ways</td><td>flip a conditional?</td><td>0.0095 / 0.059 = 0.161; then 0.785</td><td>diagnosis, spam, fraud, updating beliefs</td></tr>
    <tr><td>Random variable, E[X]</td><td>numbers × probabilities</td><td>average numeric outcome?</td><td>E[cost] = ₹618</td><td>costs, counts, payoffs</td></tr>
    <tr><td>Var(X), SD</td><td>squared gaps × probabilities</td><td>how much does it swing?</td><td>Var(I) = 0.0555; SD(cost) ₹471</td><td>risk; input to the SE</td></tr>
    <tr><td>LLN</td><td>E[X] + independence</td><td>does the average settle?</td><td>0.1 → 0.05 → 0.053 → 0.0596</td><td>trusting long-run rates</td></tr>
    <tr><td>CLT, SE</td><td>Var(X), independence, n</td><td>how does the average wobble?</td><td>N(0.059, 0.0236), n = 100</td><td>tests, CIs, A/B sizing</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span>
    <p>One sentence holds the note: <strong>probability is counting shares of a table, and conditioning is choosing which row or column to count in.</strong> Bayes is the same cell divided by a different total; independence is "the row doesn't change the share"; expectation is a weighted average; and the LLN and CLT say what happens to those averages when you count many independent people.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: common mistakes.</b> Which slips do people still make, even knowing all this?</div>

  <h2 id="spr-traps"><span class="num">11</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Where does probability reasoning usually go wrong in interviews and in real analyses?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: flipping a conditional</span><p>P(+ | sick) = 0.95 is not P(sick | +) = 0.161. Use Bayes.</p></div>
  <div class="callout trap"><span class="label">Trap: ignoring the base rate</span><p>The same test means 1.9% or 67.9% depending on prevalence. Always ask "out of how many?"</p></div>
  <div class="callout trap"><span class="label">Trap: adding without the overlap</span><p>P(A or B) = P(A) + P(B) only for mutually exclusive events.</p></div>
  <div class="callout trap"><span class="label">Trap: exclusive = independent</span><p>Exclusive events are maximally dependent: one happening rules out the other.</p></div>
  <div class="callout trap"><span class="label">Trap: assuming independence</span><p>Repeat tests in the same faulty lab, customers in the same household, days in the same outbreak: multiplying probabilities overstates certainty.</p></div>
  <div class="callout trap"><span class="label">Trap: gambler's fallacy</span><p>Independent events have no memory; the LLN works by swamping, not correcting.</p></div>
  <div class="callout trap"><span class="label">Trap: subtracting variances</span><p>Var(X − Y) = Var X + Var Y for independent X, Y.</p></div>
  <div class="callout trap"><span class="label">Trap: CLT on the data</span><p>The CLT makes the mean normal, not the individual values; rare events need larger n.</p></div>
  <div class="bridge"><b>What this still can't tell us → next: the revision sheet.</b> Everything above, condensed to one page.</div>

  <h2 id="spr-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>The whole note on one sheet. Running example: a clinic screens 10,000 people; prevalence 1%, sensitivity 95% (P(+ | sick)), specificity 95% (P(− | healthy)). Counts: sick &amp; + 95, sick &amp; − 5, healthy &amp; + 495, healthy &amp; − 9,405.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Concept</th><th>Question it answers</th><th>On the clinic</th><th>Limitation → next</th></tr>
    <tr><td>Outcomes, events, P</td><td>how likely is A?</td><td>P(+) = 0.059</td><td>events combine → rules</td></tr>
    <tr><td>Complement, addition, multiplication</td><td>not / or / and?</td><td>0.186; 0.0595; 0.0095</td><td>what is "given"? → conditional</td></tr>
    <tr><td>Joint, marginal, conditional</td><td>and / overall / given?</td><td>0.0095; 0.059; 0.95 vs 0.161</td><td>when does "given" not matter? → independence</td></tr>
    <tr><td>Independence</td><td>can we just multiply?</td><td>0.00059 vs 0.0095: dependent</td><td>need P(sick | +) → Bayes</td></tr>
    <tr><td>Bayes</td><td>flip a conditional?</td><td>16.1%; 2nd test 78.5%</td><td>need numbers → random variables</td></tr>
    <tr><td>E[X], Var(X)</td><td>average and swing of a number?</td><td>E[cost] ₹618, SD ₹471</td><td>one person unpredictable → LLN</td></tr>
    <tr><td>LLN</td><td>does the rate settle?</td><td>0.0596 after 10,000</td><td>how big is a day's wobble? → CLT</td></tr>
    <tr><td>CLT, SE</td><td>shape and width of the wobble?</td><td>SE 0.0236 at n = 100</td><td>→ tests and A/B (next notes)</td></tr>
    <tr><td>Puzzles</td><td>can rules beat intuition?</td><td>birthday 50.7%; Monty 2/3</td><td>—</td></tr>
  </table>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>Name</th><th>Formula</th><th>Symbols</th></tr>
    <tr><td>Probability (equally likely)</td><td>P(A) = |A| / |S|</td><td>|A| outcomes in A, |S| all outcomes</td></tr>
    <tr><td>Complement</td><td>P(Aᶜ) = 1 − P(A)</td><td>Aᶜ "not A"</td></tr>
    <tr><td>Addition</td><td>P(A ∪ B) = P(A) + P(B) − P(A ∩ B)</td><td>∪ or, ∩ and</td></tr>
    <tr><td>Conditional</td><td>P(A | B) = P(A ∩ B) / P(B)</td><td>| "given"; P(B) &gt; 0</td></tr>
    <tr><td>Multiplication</td><td>P(A ∩ B) = P(A) P(B | A)</td><td>chain for sequences</td></tr>
    <tr><td>Independence</td><td>P(A ∩ B) = P(A) P(B)</td><td>⇔ P(A | B) = P(A)</td></tr>
    <tr><td>Total probability</td><td>P(B) = Σ P(B | Aᵢ) P(Aᵢ)</td><td>Aᵢ exclusive, exhaustive cases</td></tr>
    <tr><td>Bayes</td><td>P(A | B) = P(B | A) P(A) / P(B)</td><td>prior P(A), likelihood P(B | A), evidence P(B), posterior P(A | B)</td></tr>
    <tr><td>Expectation</td><td>E[X] = Σ x P(X = x)</td><td>long-run average</td></tr>
    <tr><td>Variance</td><td>Var(X) = E[(X − μ)²] = E[X²] − μ²</td><td>μ = E[X]; indicator: q(1 − q)</td></tr>
    <tr><td>Linear rules</td><td>E[aX + b] = aE[X] + b; Var(aX + b) = a² Var(X)</td><td>Var(X ± Y) = Var X + Var Y if independent</td></tr>
    <tr><td>CLT, SE</td><td>X̄ ≈ Normal(μ, σ/√n); SE = σ/√n</td><td>for shares: √(q(1 − q)/n)</td></tr>
  </table>
  <h3>The running example in one table</h3>
  <table class="tbl">
    <tr><th>Quantity</th><th>Value</th><th>Quantity</th><th>Value</th></tr>
    <tr><td>P(sick)</td><td>0.01</td><td>P(+)</td><td>0.059</td></tr>
    <tr><td>P(sick ∩ +)</td><td>0.0095</td><td>P(sick ∪ +)</td><td>0.0595</td></tr>
    <tr><td>P(+ | sick)</td><td>0.95</td><td>P(sick | +)</td><td>0.161</td></tr>
    <tr><td>after 2nd +</td><td>0.785</td><td>≥ 1 false alarm in 4 healthy</td><td>0.186</td></tr>
    <tr><td>E[cost per person]</td><td>₹618 (SD ₹471)</td><td>cost per sick person found</td><td>≈ ₹65,000</td></tr>
    <tr><td>Var of one 0/1 result</td><td>0.0555</td><td>SE of daily rate, n = 30 / 100 / 300</td><td>0.043 / 0.0236 / 0.0136</td></tr>
  </table>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Natural frequencies</b><p>Use counts of 10,000 people for any Bayes or conditional question; they make the base rate visible.</p><small>Avoid juggling percentages in your head</small></div>
    <div><b>Complement</b><p>Use for "at least one" questions: 1 − P(none).</p><small>Needs independence to multiply the "none" cases</small></div>
    <div><b>Independence</b><p>Use to multiply probabilities only after checking P(A | B) = P(A) or having a physical reason.</p><small>Avoid for linked events (same lab, household, outbreak)</small></div>
    <div><b>CLT / SE</b><p>Use for means and shares of many independent draws: tests, intervals, A/B sizing.</p><small>Avoid for tiny n with rare events, heavy tails, dependent data</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span>
    <p>Flipping P(A | B) and P(B | A); ignoring the base rate; adding without removing the overlap; confusing exclusive with independent; multiplying dependent probabilities; gambler's fallacy; subtracting variances; applying the CLT to individual values.</p>
  </div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Prevalence 2%, sensitivity 90%, specificity 90%: P(sick | +)?</td><td>0.018 / (0.018 + 0.098) = 0.155</td></tr>
    <tr><td>P(A) = 0.3, P(B) = 0.5, independent: P(A or B)?</td><td>0.3 + 0.5 − 0.15 = 0.65</td></tr>
    <tr><td>Indicator with q = 0.2: E and Var?</td><td>0.2 and 0.16</td></tr>
    <tr><td>SD of one value is 10. SE of a mean of 400?</td><td>10 / 20 = 0.5</td></tr>
    <tr><td>Two dice: P(sum = 7)? P(at least one 6)?</td><td>6/36 = 1/6; 1 − (5/6)² = 11/36</td></tr>
  </table>

  <h2 id="spr-qa"><span class="num">12</span>Questions &amp; Answers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Can you explain each rule, and why the next one is needed, out loud without notes?</p>
  </div>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>A fraud model flags 1% of legit transactions and catches 90% of fraud. Fraud rate is 0.1%. What fraction of flags are real fraud?</summary><div class="qa-body">Per 100,000: 100 fraud → 90 flagged; 99,900 legit → 999 flagged. Precision = 90 / 1,089 ≈ 8.3%. Same structure as the clinic: a low base rate kills precision, which is why fraud teams look at precision/recall, not accuracy.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Are mutually exclusive events independent?</summary><div class="qa-body">No (unless one has probability 0). If A happens, B certainly didn't, so knowing A changes P(B) to 0. That's maximum dependence. "Sick &amp; +" and "healthy &amp; +" are exclusive and dependent.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Can two variables have zero correlation but be dependent?</summary><div class="qa-body">Yes. X uniform on [−1, 1] and Y = X²: Y is fully determined by X, yet their correlation is 0 because the relationship isn't linear. Independence implies zero correlation, not the reverse (see <a class="xref" data-note="st_correlation">Correlation</a>).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>State the CLT and why A/B testing relies on it.</summary><div class="qa-body">The mean of n independent draws from any distribution with finite variance is approximately Normal(μ, σ/√n) for large n. A/B tests compare means of metrics that are rarely normal (conversion is 0/1, like our test results; revenue is skewed); the CLT makes the z/t-test on those means valid.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>LLN vs CLT in one line each?</summary><div class="qa-body">LLN: the sample mean converges to the true mean (the clinic's share → 0.059). CLT: the sample mean's error around the truth is normally distributed with spread σ/√n (0.0236 for 100 people). LLN says where it goes; CLT says how it wobbles on the way.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You roll two dice. P(sum = 7)? P(at least one 6)?</summary><div class="qa-body">Sum 7: 6 of 36 combos → 1/6. At least one 6: 1 − (5/6)² = 11/36 ≈ 0.306.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain Monty Hall in 20 seconds.</summary><div class="qa-body">Your first pick is right 1/3 of the time. The host always reveals a goat, which doesn't change that. So the remaining door carries the other 2/3. In Bayes terms: the host opening door 3 is twice as likely if the car is behind door 2 (prob 1) as behind door 1 (prob 1/2). Simulation confirms ≈ 0.667.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does a second positive test raise P(sick) from 16% to 78%?</summary><div class="qa-body">The first posterior (16.1%) becomes the new prior. Applying Bayes again: 0.95 × 0.161 / (0.95 × 0.161 + 0.05 × 0.839) = 0.785. This sequential updating is the core of Bayesian thinking, and it assumes the two tests' errors are independent given the true status.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Write <code>Var(X − Y)</code> for independent X, Y.</summary><div class="qa-body">Var X + Var Y. Variances add even for a difference, because Var(−Y) = (−1)² Var Y. This is why the standard error of a difference of two group means is √(σ₁²/n₁ + σ₂²/n₂).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Expected number of flips to get one head with p = 0.2?</summary><div class="qa-body">1/p = 5 (geometric distribution). Intuition: 20% success per try → about one success per 5 tries.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does Bayes' theorem need the law of total probability?</summary><div class="qa-body">Its denominator, P(+), is rarely given directly. You build it by adding every route to the evidence: sick and caught (0.0095) plus healthy and wrongly flagged (0.0495) = 0.059. Those routes come from the multiplication rule, which comes from conditional probability. Skip the false-positive route and you get P(sick | +) = 1, which is absurd.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you assume independence when it doesn't hold?</summary><div class="qa-body">Every multiplication of probabilities. If both tests run in the same lab with a shared fault, P(both + | healthy) is much more than 0.05² = 0.0025, so the second test adds less evidence and the 78.5% is overconfident. In the CLT, dependent draws (people from one outbreak) make the true SE larger than σ/√n, so tests declare noise "significant".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how does variance from section 06 feed the CLT?</summary><div class="qa-body">The CLT's spread is σ/√n, and σ² is exactly the random variable's variance: for a 0/1 test result, q(1 − q) = 0.0555. It comes from the sum rule: Var(X₁ + … + Xₙ) = nσ² for independent draws, so the mean has variance σ²/n. Without Var(X) and independence there is no standard error.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: how is the clinic's P(sick | +) related to ML classification metrics?</summary><div class="qa-body">The 2×2 table is a confusion matrix: sick &amp; + are true positives (95), healthy &amp; + false positives (495). Sensitivity P(+ | sick) is recall (0.95); P(sick | +) is precision (0.161); specificity is the true negative rate. Bayes explains why precision collapses when the positive class is rare (see <a class="xref" data-note="ml_evaluation">Classification Metrics</a>).</div></details>
  <div class="bridge"><b>What this still can't tell us → next: <a class="xref" data-note="st_distributions">Probability Distributions</a>.</b> We built every probability by hand from one table. Many real situations share a few standard shapes: the number of positives in a day is binomial, the CLT's bell is the normal, waiting times are exponential. Named distributions let us skip the table and reuse ready-made formulas.</div>
</main>`
});
