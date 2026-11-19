// notes/mathstats/st_abtesting.js — A/B Testing
Object.assign(TOPIC_CONTENT, {
  "st_abtesting": `<main>
  <h1>A/B Testing</h1>
  <div class="where"><span>Mathematics &amp; Statistics</span><span>Statistics</span><span>A/B Testing</span></div>
  <p class="lead">An A/B test is how tech companies decide whether a change actually helps: they show the current version to one random half of their users and the new version to the other half, at the same time, and compare a number such as the share of users who buy. It is the hypothesis test from the <a class="xref" data-note="st_hypothesis">Hypothesis Testing</a> note, put to work in production, with all the real-world mess that comes with it: choosing what to measure, deciding how many users you need, catching a broken split, resisting the urge to stop early, and turning the result into money a manager can weigh. Data scientists are asked to design and read these experiments constantly, and "design an A/B test for feature X" is one of the most common interview questions in the field. The whole page follows one experiment: an online shop testing a new one-page checkout against its current three-step checkout, with about 2,200 checkout visitors a day and 10% of them buying. Every idea is added to that same experiment, from the first coin flip to the final slide for leadership.</p>

  <h2 id="sab-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">A/B Testing</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Design (before launch)</div>
        <ul>
          <li>Random assignment, same time → only the change differs</li>
          <li>Hypothesis, MDE, α, power written down first (pre-registration)</li>
          <li>One primary metric + guardrails; randomise and analyse by user</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Sizing</div>
        <ul>
          <li>n per arm = (1.96 + 0.84)² × [p₁(1−p₁) + p₂(1−p₂)] ÷ δ²</li>
          <li>Halve the MDE → 4× the users</li>
          <li>Run whole weeks; CUPED cuts variance by (1 − ρ²)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Analysis</div>
        <ul>
          <li>SRM check first (χ² on user counts)</li>
          <li>Two-proportion z-test + CI for the difference</li>
          <li>Decide by comparing the CI with 0 and with the MDE</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Threats</div>
        <ul>
          <li>Peeking: 5% false alarms → ~22%</li>
          <li>Many variants / metrics: correct α (Bonferroni, Holm, FDR)</li>
          <li>Novelty, primacy, interference between users</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Business impact</div>
        <ul>
          <li>lift × users per year × value per conversion</li>
          <li>Use both CI ends for an honest range</li>
          <li>Winner's curse → keep a holdout</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sab-rand"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Randomised Controlled Experiments</span><span class="rm-sub">control vs treatment, and why a coin flip proves cause</span></div></div>
      <div class="rm-item rm-done" data-target="sab-hyp"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Hypothesis, MDE and Pre-registration</span><span class="rm-sub">deciding everything before the data arrives</span></div></div>
      <div class="rm-item rm-done" data-target="sab-metrics"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Metrics, Guardrails and the Randomisation Unit</span><span class="rm-sub">what to measure and who gets the coin flip</span></div></div>
      <div class="rm-item rm-done" data-target="sab-size"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Sample Size, Power and Duration</span><span class="rm-sub">how many users and how many days</span></div></div>
      <div class="rm-item rm-done" data-target="sab-cuped"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Variance Reduction with CUPED</span><span class="rm-sub">the same answer from fewer users</span></div></div>
      <div class="rm-item rm-done" data-target="sab-srm"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Sample Ratio Mismatch</span><span class="rm-sub">checking the split before reading results</span></div></div>
      <div class="rm-item rm-done" data-target="sab-analysis"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">The z-test and Confidence Interval</span><span class="rm-sub">is the lift real, and how big is it?</span></div></div>
      <div class="rm-item rm-done" data-target="sab-practical"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Statistical vs Practical Significance</span><span class="rm-sub">ship, kill or keep testing</span></div></div>
      <div class="rm-item rm-done" data-target="sab-peek"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Peeking and Sequential Testing</span><span class="rm-sub">why daily checking breaks the 5%</span></div></div>
      <div class="rm-item rm-done" data-target="sab-multi"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Multiple Testing and A/B/n Tests</span><span class="rm-sub">many variants, many metrics, one honest α</span></div></div>
      <div class="rm-item rm-done" data-target="sab-novelty"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Novelty, Primacy and Interference</span><span class="rm-sub">effects that fade, grow or leak between users</span></div></div>
      <div class="rm-item rm-done" data-target="sab-impact"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Business Impact</span><span class="rm-sub">turning a lift into money and a decision</span></div></div>
      <div class="rm-item rm-done" data-target="sab-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">the errors real teams make most</span></div></div>
      <div class="rm-item rm-done" data-target="sab-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">formulas, numbers and traps on one page</span></div></div>
      <div class="rm-item rm-done" data-target="sab-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">design cases and classic pitfalls</span></div></div>
    </div>
  </div>

  <h2 id="sab-rand"><span class="num">01</span>Randomised Controlled Experiments</h2>
  <p>The shop's designers have built a one-page checkout and believe it will make more visitors finish their purchase than the current three-step checkout. The obvious way to find out is to launch it for everyone and compare this week's sales with last week's. Suppose that is exactly what happens: the new checkout goes live on Monday, and by the end of the week the share of visitors who bought has risen. The team celebrates. But that same week was payday, a festival sale started, and a competitor's website was down for a day. Any one of those could have raised sales on its own. Something that changes the outcome and also happens to line up with your change is called a <strong>confounder</strong>, and a before/after comparison mixes your change with every confounder that happened at the same time, so you cannot tell which one did the work. (The <a class="xref" data-note="st_correlation">Correlation</a> note showed the same problem in observational data.)</p>
  <p>The simulation below makes this concrete. In week 2 a festival lifts every visitor's chance of buying from 10% to 11.2%, and the new checkout itself does nothing at all. First we compare the two weeks, as the team did. Then, inside the festival week only, we let a coin flip send each visitor to the old page or the new one and compare the two groups:</p>
  <div class="fx" data-lang="py">import numpy as np
from statsmodels.stats.proportion import proportions_ztest
rng = np.random.default_rng(7)
n = 2200 * 7                                   # one week of checkout visitors

# Week 1: old checkout, a normal week -&gt; 10% of visitors buy.
# Week 2: new checkout for everyone, but a festival sale lifts everyone to 11.2%.
# The new checkout itself does NOTHING (true effect = 0).
week1 = rng.binomial(n, 0.100)
week2 = rng.binomial(n, 0.112)
z, p = proportions_ztest([week2, week1], [n, n])
print(f"before/after : {week1/n:.2%} -&gt; {week2/n:.2%}  diff {100*(week2-week1)/n:+.2f} pp  p={p:.3f}")

# Same festival week, but a coin flip sends each visitor to A or B.
coin = rng.integers(0, 2, n)                   # 0 = control (A), 1 = treatment (B)
bought = rng.random(n) &lt; 0.112                 # the festival hits both arms equally
x = [bought[coin == 1].sum(), bought[coin == 0].sum()]
m = [(coin == 1).sum(), (coin == 0).sum()]
z, p = proportions_ztest(x, m)
print(f"A/B, week 2  : A {x[1]/m[1]:.2%}  B {x[0]/m[0]:.2%}  diff {100*(x[0]/m[0]-x[1]/m[1]):+.2f} pp  p={p:.3f}")</div>
  <div class="fx" data-lang="text">before/after : 9.97% -&gt; 10.86%  diff +0.89 pp  p=0.011
A/B, week 2  : A 10.93%  B 11.17%  diff +0.24 pp  p=0.634</div>
  <p>The before/after comparison shows a rise of 0.89 percentage points with a p-value of 0.011, which looks like a clear, statistically significant win, yet the checkout had no effect; the festival produced the whole rise. The coin-flip comparison inside the same week shows a gap of only 0.24 points with p = 0.634, which is exactly what pure luck looks like. The festival was still there, but it raised both groups equally, so it cancelled out of the comparison.</p>
  <p>That second design is an <strong>A/B test</strong>, also called a <strong>randomised controlled experiment</strong> or online controlled experiment: users are assigned at random, at the same time, either to the current version, called the <strong>control</strong> (group A), or to the new version, called the <strong>treatment</strong> (group B), and a pre-chosen number is compared between the two groups. Each group is called an <strong>arm</strong> of the experiment. Think of a clinical trial for a new medicine. Patients are randomly given either the medicine or a sugar pill, in the same hospital, in the same season. Because chance decided who got what, the two groups end up alike on average in age, diet, mood and everything else, including things nobody thought to measure. So if the medicine group recovers more often, and the gap is bigger than luck would produce, the medicine must be the cause.</p>
  <p>This is the real reason A/B tests are trusted. Random assignment does not try to measure and adjust for every confounder; it makes every confounder, measured or not, equally likely to land in either arm. The only systematic difference left between the arms is the change you made. The statistics then has a single, narrow job: to decide whether the observed gap is bigger than the gap random assignment alone would create, which is precisely what a hypothesis test does. It also explains a common mistake. Comparing users who chose to try the new checkout (say, through an opt-in "try the new design" button) with those who did not is <em>not</em> an A/B test, because the people who opt in are different to begin with: more engaged, often on newer phones, more likely to buy anyway. Only assignment by chance removes that difference.</p>

  <h2 id="sab-hyp"><span class="num">02</span>Hypothesis, MDE and Pre-registration</h2>
  <p>A coin flip makes the comparison fair, but we still have to say what exactly we are comparing and what result would change our minds. If we leave that until after the data arrives, we will be tempted to look at twenty numbers, find the one that moved, and tell a story about it. The fix is to make every important decision before the experiment starts.</p>
  <p>The first decision is the <strong>hypothesis</strong>, a specific, testable claim with a reason behind it. For the checkout it is: "Removing two checkout steps will raise purchase conversion from 10% to at least 11%, because every extra step is a point where people drop off." In the language of hypothesis testing, the <strong>null hypothesis</strong> H₀ is "the two checkouts have the same conversion rate", and the alternative is "they differ". We use a two-sided test (we would want to know if the new page is worse, too), a <strong>significance level</strong> α = 0.05, which is the false-alarm rate we accept when there is truly no difference, and a <strong>power</strong> of 0.8, which is the chance we want of detecting a real lift of the size we care about.</p>
  <p>That "size we care about" is the second decision, and it is the one beginners skip. The <strong>minimum detectable effect</strong>, or MDE, is the smallest lift that would be worth acting on. Here it is +1 percentage point (10% → 11%). A percentage point, written pp, is an absolute difference between two percentages; +1 pp from 10% is the same as a 10% relative increase. The MDE is a business judgement, not a statistical one: below about +1 pp, the engineering work and the risk of changing checkout are not worth it. As we will see, the MDE drives almost everything else, especially how many users we need.</p>
  <p>Writing all of this down before launch, together with the metric, the duration and the exact analysis, is called <strong>pre-registration</strong>. Think of placing a bet at a cricket match: you name the team and the margin before the first ball is bowled. Naming them after the match is not a prediction, it is a story. In the same way, "conversion did not move, but look, time-on-page went up!" is a story told after the fact, and with enough numbers to choose from, something will always look significant by luck. Every serious experiment follows the same sequence, and most of it happens before any data exists:</p>
  <table class="tbl">
    <tr><th>Step</th><th>For the checkout test</th><th>Section</th></tr>
    <tr><td>Hypothesis and MDE</td><td>10% → at least 11%; H₀ no difference; α 0.05, power 0.8</td><td>02</td></tr>
    <tr><td>Metrics</td><td>Primary: purchase conversion per user. Guardrails: latency, payment errors, refunds</td><td>03</td></tr>
    <tr><td>Randomisation unit</td><td>User, assigned by hashing the user id</td><td>03</td></tr>
    <tr><td>Sample size and duration</td><td>14,745 users per arm, 14 days (fewer with CUPED)</td><td>04–05</td></tr>
    <tr><td>Run, then sanity checks</td><td>Sample ratio mismatch check on user counts</td><td>06</td></tr>
    <tr><td>Analyse</td><td>Two-proportion z-test and confidence interval</td><td>07</td></tr>
    <tr><td>Decide and communicate</td><td>CI against 0 and the MDE; value in money</td><td>08, 12</td></tr>
  </table>
  <p>In an interview, "design an experiment for feature X" is mostly answered by walking through these steps in order and giving a sensible choice at each one.</p>

  <h2 id="sab-metrics"><span class="num">03</span>Metrics, Guardrails and the Randomisation Unit</h2>
  <p>A test can only answer the question you measure. Judge a news headline by clicks and the most misleading clickbait wins, even while readers get annoyed and leave. Judge the checkout by yearly revenue and nothing will move within two weeks, so every test is inconclusive. Choosing the metric is therefore a real design decision, and teams usually pick three kinds of number.</p>
  <p>The <strong>primary metric</strong>, sometimes called the OEC (overall evaluation criterion), is the single number that decides the test. It should be close to real value for the business and sensitive enough to move within the length of the test. For the checkout it is <em>purchase conversion per user</em>: the share of users who reached checkout and bought. <strong>Secondary metrics</strong> explain why the primary moved, such as the drop-off at each step or the time taken to pay. <strong>Guardrail metrics</strong> are numbers that must not get worse even if the primary wins: page load time, payment errors, refund rate, average order value. A cricket team trying a new batting order is a good picture: it judges the idea by runs scored (primary), watches the strike rate to understand why (secondary), and makes sure wickets lost do not shoot up (guardrail). Judging only by boundaries hit would reward reckless batting.</p>
  <table class="tbl">
    <tr><th>Kind</th><th>Role</th><th>Checkout test</th></tr>
    <tr><td>Primary (OEC)</td><td>Decides the test; sensitive and tied to value</td><td>Purchase conversion per user</td></tr>
    <tr><td>Secondary</td><td>Explains why the primary moved</td><td>Step drop-off, time to purchase</td></tr>
    <tr><td>Guardrail</td><td>Must not get worse</td><td>Latency, payment errors, refunds, order value</td></tr>
  </table>
  <p>The next decision is what gets the coin flip. The <strong>randomisation unit</strong> is the thing that is assigned to an arm: a user, a session, a page view, or a whole city. For the checkout it must be the user. If we flipped a coin on every page view, the same person could see the three-step checkout in the morning and the one-page checkout in the evening, which is confusing for them and blurs the comparison. Assigning per user gives each person one consistent experience. Session- or page-level assignment is only used for changes users cannot notice, such as search ranking tweaks or speed improvements, and city-level assignment is used when users affect each other (section 11).</p>
  <p>A real backend serving millions of users cannot store a random coin flip for every user in every service. Instead it uses <strong>hashing</strong>: a hash function such as MD5 turns any text into a long, random-looking number, and the same text always gives the same number. We hash the experiment name joined to the user id, take the remainder after dividing by 100 to get a bucket from 0 to 99, and send buckets 0–49 to treatment. Because the result depends only on the input, a user always lands in the same arm (they are "sticky") and no lookup table is needed:</p>
  <div class="fx" data-lang="py">import hashlib
from scipy import stats

def bucket(user_id, experiment="checkout_v2"):
    key = f"{experiment}:{user_id}".encode()
    return int(hashlib.md5(key).hexdigest(), 16) % 100    # 0..99, same every time

def arm(user_id):
    return "treatment" if bucket(user_id) &lt; 50 else "control"

print([arm(u) for u in ["u1", "u2", "u3"]], arm("u1") == arm("u1"))
counts = {"control": 0, "treatment": 0}
for i in range(10000):
    counts[arm(f"user{i}")] += 1
print(counts)
print("same user, two experiments:", bucket("u1"), bucket("u1", "search_rank"))</div>
  <div class="fx" data-lang="text">['control', 'treatment', 'control'] True
{'control': 5021, 'treatment': 4979}
same user, two experiments: 64 38</div>
  <p><code>hashlib.md5(key).hexdigest()</code> produces the hash as a hexadecimal string, <code>int(..., 16)</code> turns it into a whole number, and <code>% 100</code> keeps the remainder. Calling <code>arm("u1")</code> twice gives the same answer (<code>True</code>). Ten thousand users split 5,021 to 4,979, which is the kind of small imbalance pure chance produces; section 06 shows how to test that formally. The last line shows why the experiment name belongs in the key: user u1 is in bucket 64 for the checkout test and bucket 38 for a search test, so the same users are not always the ones in treatment across every experiment the company runs.</p>
  <p>The randomisation unit has one more consequence that catches many people out. The z-test we will use assumes each row of data is an independent observation. If we randomise by user but then analyse every page view as its own row, that assumption breaks: a user who loves shopping views checkout many times and buys often, so their rows move together. The test then thinks it has far more independent evidence than it really has, its standard error comes out too small, and it declares "significant" too often. The simulation runs 2,000 <strong>A/A tests</strong>, experiments where both arms get exactly the same experience, so any "significant" result is a false alarm and should happen 5% of the time:</p>
  <div class="fx" data-lang="py">import numpy as np
from statsmodels.stats.proportion import proportions_ztest
rng = np.random.default_rng(1)

def aa_test():
    # 2,000 users per arm and NO real difference between the arms.
    # Each user has their own taste for buying and their own number of checkout views.
    taste = rng.beta(1, 9, 4000)                  # 10% on average, but varies a lot by user
    views = rng.geometric(1 / 6, 4000)            # most users view a few times, some many
    buys = rng.binomial(views, taste)             # purchases per user
    arm = np.repeat([0, 1], 2000)
    # Wrong: every page view treated as an independent row
    p_views = proportions_ztest([buys[arm == k].sum() for k in (0, 1)],
                                [views[arm == k].sum() for k in (0, 1)])[1]
    # Right: one row per user, the unit that was randomised ("did this user buy?")
    p_users = proportions_ztest([(buys[arm == k] &gt; 0).sum() for k in (0, 1)], [2000, 2000])[1]
    return p_views &lt; 0.05, p_users &lt; 0.05

res = np.array([aa_test() for _ in range(2000)])
print(f"false positives, analysed per page view: {res[:, 0].mean():.1%}")
print(f"false positives, analysed per user:      {res[:, 1].mean():.1%}")</div>
  <div class="fx" data-lang="text">false positives, analysed per page view: 15.1%
false positives, analysed per user:      5.1%</div>
  <p>Analysed per user, the false-alarm rate is 5.1%, as promised. Analysed per page view, it is 15.1%, three times higher, with nothing at all going on. The rule is to analyse at the unit you randomised: one row per user. When the metric is a ratio of two counts, such as clicks per page view, there is a method called the <strong>delta method</strong> that computes the correct standard error from per-user totals. A/A tests are also a standard health check for an experimentation platform: if they come out significant much more than 5% of the time, something in the pipeline is broken.</p>

  <h2 id="sab-size"><span class="num">04</span>Sample Size, Power and Duration</h2>
  <p>Run the checkout test on 500 users and a real +1 pp lift will drown in noise; the test will usually say "not significant" and a good idea will be thrown away. Run it on five million and you waste weeks of traffic that other experiments needed. The number of users must be chosen before launch, and it comes from four inputs: the baseline rate (10%), the MDE (+1 pp), α (0.05) and the power (0.8).</p>
  <p>Think of listening for a friend calling your name across a noisy railway station. A shout you hear at once. A whisper needs you to listen much longer before you are sure it was your name and not the crowd. The MDE is how loud the voice is, the random variation in conversion is the crowd, and the sample size is how long you listen. The quieter the voice, the longer you must listen, and the relationship is steep: the noise in an average shrinks only with the square root of the number of users, so to halve the effect you can detect you need four times as many users.</p>
  <p>The formula for the number of users needed <em>per arm</em> when comparing two proportions (it is derived in the power section of the Hypothesis Testing note) is:</p>
  <div class="fx" data-lang="text">n = (z<sub>1−α/2</sub> + z<sub>1−β</sub>)² × [p₁(1 − p₁) + p₂(1 − p₂)] ÷ δ²</div>
  <p>In words: p₁ is the control rate (0.10) and p₂ the rate we hope treatment reaches (0.11), so δ = p₂ − p₁ is the MDE. Each p(1 − p) is the variance of a single yes/no outcome, so the bracket measures how noisy the data is. The z values translate α and power into standard-normal distances: z<sub>1−α/2</sub> = 1.96 is how far out the significance cut-off sits, and z<sub>1−β</sub> = 0.84 is how much further a true effect must sit to be detected 80% of the time. The formula says: users needed = (how strict we are)² × (how noisy the data is) ÷ (how small the effect is)². By hand: (1.96 + 0.84)² = 7.85; the noise part is 0.10 × 0.90 + 0.11 × 0.89 = 0.090 + 0.0979 = 0.1879; the effect part is 0.01² = 0.0001. So n = 7.85 × 0.1879 ÷ 0.0001 ≈ 14,750 per arm. A handy shortcut follows from 7.85 × 2 ≈ 16: with α 0.05 and power 0.8, n ≈ 16 × p(1 − p) ÷ δ² = 16 × 0.09 ÷ 0.0001 = 14,400. Here is the same calculation in code:</p>
  <div class="fx" data-lang="py">import numpy as np
from scipy import stats
z_a, z_b = stats.norm.ppf(0.975), stats.norm.ppf(0.80)
p1, p2 = 0.10, 0.11
n = (z_a + z_b)**2 * (p1*(1-p1) + p2*(1-p2)) / (p2 - p1)**2
print(f"z_alpha/2={z_a:.3f}  z_beta={z_b:.3f}  (sum)^2={(z_a+z_b)**2:.2f}")
print(f"noise part={p1*(1-p1) + p2*(1-p2):.4f}  n per arm={np.ceil(n):,.0f}")
print(f"rule of thumb 16*p(1-p)/d^2 = {16*0.1*0.9/0.01**2:,.0f}")</div>
  <div class="fx" data-lang="text">z_alpha/2=1.960  z_beta=0.842  (sum)^2=7.85
noise part=0.1879  n per arm=14,749
rule of thumb 16*p(1-p)/d^2 = 14,400</div>
  <p><code>stats.norm.ppf</code> turns a probability into a z value: 0.975 gives 1.960 and 0.80 gives 0.842. The exact answer, 14,749 per arm, matches the hand calculation, and the rule of thumb lands within 3%. In practice people use a library, which also makes it easy to see how strongly the answer depends on the MDE. statsmodels measures the effect on a slightly different scale called Cohen's h, so it gives a figure a few users different:</p>
  <div class="fx" data-lang="py">import numpy as np
from statsmodels.stats.power import NormalIndPower
from statsmodels.stats.proportion import proportion_effectsize

baseline = 0.10
for mde in [0.02, 0.01, 0.005]:
    h = proportion_effectsize(baseline + mde, baseline)    # Cohen's h for two proportions
    n = NormalIndPower().solve_power(effect_size=h, alpha=0.05, power=0.8)
    print(f"MDE {mde*100:.1f} pp -&gt; {np.ceil(n):&gt;7,.0f} per arm")

n_arm, daily_users = 14745, 2200
days = 2 * n_arm / daily_users
print(f"{days:.1f} days -&gt; run {int(np.ceil(days / 7) * 7)} days (whole weeks)")</div>
  <div class="fx" data-lang="text">MDE 2.0 pp -&gt;   3,835 per arm
MDE 1.0 pp -&gt;  14,745 per arm
MDE 0.5 pp -&gt;  57,756 per arm
13.4 days -&gt; run 14 days (whole weeks)</div>
  <p>The library gives 14,745 for our MDE of 1 pp, essentially the same answer. The loop shows the square law plainly: 2 pp needs 3,835 users per arm, 1 pp needs 14,745 (about four times as many), and 0.5 pp needs 57,756 (four times again). The chart draws the whole curve; the cost of chasing small effects rises very fast on the left.</p>
  <figure class="viz"><svg viewBox="0 0 407.388359 215.919219" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="max-width:640px;width:100%;height:auto">
 <defs>
  <style type="text/css">*{stroke-linejoin: round; stroke-linecap: butt}</style>
 </defs>
 <g id="sabszfigure_1">
  <g id="sabszpatch_1">
   <path d="M 0 215.919219 
L 407.388359 215.919219 
L 407.388359 0 
L 0 0 
L 0 215.919219 
z
" style="fill: none"/>
  </g>
  <g id="sabszaxes_1">
   <g id="sabszpatch_2">
    <path d="M 43.068359 173.52 
L 400.188359 173.52 
L 400.188359 7.2 
L 43.068359 7.2 
L 43.068359 173.52 
z
" style="fill: none"/>
   </g>
   <g id="sabszmatplotlib.axis_1">
    <g id="sabszxtick_1">
     <g id="sabszline2d_1">
      <defs>
       <path id="sabszmedb56decd0" d="M 0 0 
L 0 3.5 
" style="stroke: currentColor; stroke-width: 0.8"/>
      </defs>
      <g>
       <use xlink:href="#sabszmedb56decd0" x="71.7878" y="173.52" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="sabsztext_1">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="71.7878" y="190.2075" transform="rotate(-0 71.7878 190.2075)">0.5</text>
     </g>
    </g>
    <g id="sabszxtick_2">
     <g id="sabszline2d_2">
      <g>
       <use xlink:href="#sabszmedb56decd0" x="134.221366" y="173.52" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="sabsztext_2">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="134.221366" y="190.2075" transform="rotate(-0 134.221366 190.2075)">1.0</text>
     </g>
    </g>
    <g id="sabszxtick_3">
     <g id="sabszline2d_3">
      <g>
       <use xlink:href="#sabszmedb56decd0" x="196.654933" y="173.52" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="sabsztext_3">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="196.654933" y="190.2075" transform="rotate(-0 196.654933 190.2075)">1.5</text>
     </g>
    </g>
    <g id="sabszxtick_4">
     <g id="sabszline2d_4">
      <g>
       <use xlink:href="#sabszmedb56decd0" x="259.088499" y="173.52" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="sabsztext_4">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="259.088499" y="190.2075" transform="rotate(-0 259.088499 190.2075)">2.0</text>
     </g>
    </g>
    <g id="sabszxtick_5">
     <g id="sabszline2d_5">
      <g>
       <use xlink:href="#sabszmedb56decd0" x="321.522066" y="173.52" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="sabsztext_5">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="321.522066" y="190.2075" transform="rotate(-0 321.522066 190.2075)">2.5</text>
     </g>
    </g>
    <g id="sabszxtick_6">
     <g id="sabszline2d_6">
      <g>
       <use xlink:href="#sabszmedb56decd0" x="383.955632" y="173.52" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="sabsztext_6">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="383.955632" y="190.2075" transform="rotate(-0 383.955632 190.2075)">3.0</text>
     </g>
    </g>
    <g id="sabsztext_7">
     <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="221.628359" y="206.307109" transform="rotate(-0 221.628359 206.307109)">MDE: smallest lift to detect (percentage points)</text>
    </g>
   </g>
   <g id="sabszmatplotlib.axis_2">
    <g id="sabszytick_1">
     <g id="sabszline2d_7">
      <defs>
       <path id="sabszmcf30224eca" d="M 0 0 
L -3.5 0 
" style="stroke: currentColor; stroke-width: 0.8"/>
      </defs>
      <g>
       <use xlink:href="#sabszmcf30224eca" x="43.068359" y="168.994828" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="sabsztext_8">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="36.068359" y="173.838578" transform="rotate(-0 36.068359 173.838578)">0</text>
     </g>
    </g>
    <g id="sabszytick_2">
     <g id="sabszline2d_8">
      <g>
       <use xlink:href="#sabszmcf30224eca" x="43.068359" y="134.666042" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="sabsztext_9">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="36.068359" y="139.509792" transform="rotate(-0 36.068359 139.509792)">20</text>
     </g>
    </g>
    <g id="sabszytick_3">
     <g id="sabszline2d_9">
      <g>
       <use xlink:href="#sabszmcf30224eca" x="43.068359" y="100.337256" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="sabsztext_10">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="36.068359" y="105.181006" transform="rotate(-0 36.068359 105.181006)">40</text>
     </g>
    </g>
    <g id="sabszytick_4">
     <g id="sabszline2d_10">
      <g>
       <use xlink:href="#sabszmcf30224eca" x="43.068359" y="66.00847" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="sabsztext_11">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="36.068359" y="70.85222" transform="rotate(-0 36.068359 70.85222)">60</text>
     </g>
    </g>
    <g id="sabszytick_5">
     <g id="sabszline2d_11">
      <g>
       <use xlink:href="#sabszmcf30224eca" x="43.068359" y="31.679685" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="sabsztext_12">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="36.068359" y="36.523435" transform="rotate(-0 36.068359 36.523435)">80</text>
     </g>
    </g>
    <g id="sabsztext_13">
     <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="16.8875" y="90.36" transform="rotate(-90 16.8875 90.36)">users per arm (thousands)</text>
    </g>
   </g>
   <g id="sabszline2d_12">
    <path d="M 59.301087 14.76 
L 63.410638 37.133226 
L 67.520189 54.946942 
L 71.62974 69.362304 
L 75.739291 81.192893 
L 79.848843 91.02251 
L 83.958394 99.278891 
L 88.067945 106.281233 
L 92.177496 112.27165 
L 96.287048 117.436488 
L 100.396599 121.92106 
L 104.50615 125.840038 
L 108.615701 129.284888 
L 112.725252 132.329294 
L 116.834804 135.03315 
L 120.944355 137.445544 
L 125.053906 139.607021 
L 129.163457 141.551305 
L 133.273008 143.306634 
L 137.38256 144.896795 
L 141.492111 146.341942 
L 145.601662 147.659244 
L 149.711213 148.863397 
L 153.820764 149.967043 
L 157.930316 150.981103 
L 162.039867 151.915054 
L 166.149418 152.777147 
L 170.258969 153.574599 
L 174.36852 154.313741 
L 178.478072 155.000144 
L 182.587623 155.638731 
L 186.697174 156.233861 
L 190.806725 156.789408 
L 194.916277 157.308821 
L 199.025828 157.795182 
L 203.135379 158.251251 
L 207.24493 158.679504 
L 211.354481 159.08217 
L 215.464033 159.461257 
L 219.573584 159.81858 
L 223.683135 160.155784 
L 227.792686 160.474359 
L 231.902237 160.77566 
L 236.011789 161.06092 
L 240.12134 161.331266 
L 244.230891 161.587725 
L 248.340442 161.831238 
L 252.449993 162.062667 
L 256.559545 162.282803 
L 260.669096 162.492375 
L 264.778647 162.692052 
L 268.888198 162.882451 
L 272.997749 163.064142 
L 277.107301 163.237652 
L 281.216852 163.403468 
L 285.326403 163.562041 
L 289.435954 163.71379 
L 293.545506 163.859105 
L 297.655057 163.998346 
L 301.764608 164.131849 
L 305.874159 164.259929 
L 309.98371 164.382876 
L 314.093262 164.500965 
L 318.202813 164.614449 
L 322.312364 164.723566 
L 326.421915 164.828541 
L 330.531466 164.929581 
L 334.641018 165.026882 
L 338.750569 165.120628 
L 342.86012 165.210992 
L 346.969671 165.298136 
L 351.079222 165.382212 
L 355.188774 165.463364 
L 359.298325 165.541727 
L 363.407876 165.617429 
L 367.517427 165.69059 
L 371.626978 165.761323 
L 375.73653 165.829736 
L 379.846081 165.895929 
L 383.955632 165.96 
" clip-path="url(#sabszpdd851e30cf)" style="fill: none; stroke: #2a78d6; stroke-width: 2.2; stroke-linecap: square"/>
   </g>
   <g id="sabszline2d_13">
    <defs>
     <path id="sabszmb374cfb68b" d="M 0 3 
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
    <g clip-path="url(#sabszpdd851e30cf)">
     <use xlink:href="#sabszmb374cfb68b" x="71.7878" y="69.86078" style="fill: #e8743b; stroke: #e8743b"/>
    </g>
   </g>
   <g id="sabszline2d_14">
    <g clip-path="url(#sabszpdd851e30cf)">
     <use xlink:href="#sabszmb374cfb68b" x="134.221366" y="143.687467" style="fill: #e8743b; stroke: #e8743b"/>
    </g>
   </g>
   <g id="sabszline2d_15">
    <g clip-path="url(#sabszpdd851e30cf)">
     <use xlink:href="#sabszmb374cfb68b" x="259.088499" y="162.412977" style="fill: #e8743b; stroke: #e8743b"/>
    </g>
   </g>
   <g id="sabszpatch_3">
    <path d="M 43.068359 173.52 
L 43.068359 7.2 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
   </g>
   <g id="sabszpatch_4">
    <path d="M 43.068359 173.52 
L 400.188359 173.52 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
   </g>
   <g id="sabsztext_14">
    <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: start" x="79.7878" y="65.86078" transform="rotate(-0 79.7878 65.86078)">57.8k</text>
   </g>
   <g id="sabsztext_15">
    <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: start" x="142.221366" y="139.687467" transform="rotate(-0 142.221366 139.687467)">14.7k (our test)</text>
   </g>
   <g id="sabsztext_16">
    <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: start" x="267.088499" y="158.412977" transform="rotate(-0 267.088499 158.412977)">3.8k</text>
   </g>
  </g>
 </g>
 <defs>
  <clipPath id="sabszpdd851e30cf">
   <rect x="43.068359" y="7.2" width="357.12" height="166.32"/>
  </clipPath>
 </defs>
</svg><figcaption>Users needed per arm against the MDE, for a 10% baseline, α 0.05 and power 0.8. Halving the MDE quadruples the sample.</figcaption></figure>
  <p>The last line of the output turns users into time. Both arms together need 29,490 users; at 2,200 checkout visitors a day that is 13.4 days, which we round up to 14. We round up to <em>whole weeks</em> rather than to the next day because people shop differently on weekends and weekdays, and a test that stops on a Thursday over-represents some days. Most teams run at least one, ideally two, full weekly cycles even if the sample size is reached sooner. The same calculation also tells you when not to run a test: if your traffic would need six months to detect any lift worth having, an A/B test is the wrong tool.</p>

  <h2 id="sab-cuped"><span class="num">05</span>Variance Reduction with CUPED</h2>
  <p>Fourteen days of all checkout traffic is a lot to spend on one question, and the sample size formula tells us where the cost comes from: n is proportional to the noise in the metric. Much of that noise is not random at all. Suppose the metric is spend per user. Some users spend ₹200 a month and others ₹5,000, and they did so long before the experiment began. That spread hides the treatment effect, but we already know most of it from each user's history.</p>
  <p>Think of judging a coaching class by its students' final exam marks. The marks are noisy, mostly because some students were always toppers and some always struggled. If instead you judge each student by "final mark minus what their mock exam predicted", that old difference disappears and the class's real effect stands out much more clearly. <strong>CUPED</strong> (Controlled-experiment Using Pre-Experiment Data) does exactly this for experiments: it subtracts from each user's metric the part that their pre-experiment behaviour predicts.</p>
  <div class="fx" data-lang="text">Y<sub>adj</sub> = Y − θ × (X − X̄),   θ = cov(X, Y) ÷ var(X)
Var(Y<sub>adj</sub>) = Var(Y) × (1 − ρ²)</div>
  <p>Here Y is the metric during the test, X is the same user's metric in the weeks before the test, and X̄ is the average of X. θ is the regression slope of Y on X from the Correlation note, so θ × (X − X̄) is "how much more than average this user is expected to spend, given their past". Subtracting it leaves only the part their past did not predict. Because we subtract something centred on zero, the average of Y does not change, only its spread. The second line says how much the spread shrinks: ρ is the correlation between before and during, and the variance is multiplied by (1 − ρ²). If ρ = 0.88, then 1 − 0.88² = 1 − 0.774 = 0.226, so the adjusted metric has under a quarter of the original variance, and since n is proportional to variance the same test needs only about 23% of the users. The simulation gives 20,000 users a true treatment lift of ₹15 and compares the plain t-test with the CUPED-adjusted one:</p>
  <div class="fx" data-lang="py">import numpy as np
from scipy import stats
rng = np.random.default_rng(3)
n_users = 20000
pre = rng.gamma(2, 250, n_users)                 # spend in the 4 weeks BEFORE the test (Rs)
arm = rng.integers(0, 2, n_users)                # 0 = control, 1 = treatment
post = 0.8 * pre + rng.normal(100, 150, n_users) + 15 * arm   # true lift = Rs 15

theta = np.cov(pre, post)[0, 1] / np.var(pre, ddof=1)
adj = post - theta * (pre - pre.mean())          # CUPED-adjusted metric
rho = np.corrcoef(pre, post)[0, 1]
print(f"corr(pre, post)={rho:.2f}  theta={theta:.2f}")
print(f"variance: raw={post.var():,.0f}  cuped={adj.var():,.0f}  "
      f"ratio={adj.var()/post.var():.2f}  (1-rho^2={1-rho**2:.2f})")
for name, y in [("raw  ", post), ("cuped", adj)]:
    r = stats.ttest_ind(y[arm == 1], y[arm == 0], equal_var=False)
    ci = r.confidence_interval()
    print(f"{name} lift={y[arm == 1].mean() - y[arm == 0].mean():5.1f}  "
          f"95% CI [{ci.low:5.1f}, {ci.high:5.1f}]  p={r.pvalue:.2g}")</div>
  <div class="fx" data-lang="text">corr(pre, post)=0.88  theta=0.80
variance: raw=103,538  cuped=22,772  ratio=0.22  (1-rho^2=0.22)
raw   lift=  8.0  95% CI [ -0.9,  17.0]  p=0.077
cuped lift= 14.8  95% CI [ 10.7,  19.0]  p=3.5e-12</div>
  <p>The correlation is 0.88, and the variance drops to 22% of the original, exactly as 1 − ρ² predicted. The raw comparison misses the ₹15 lift: its estimate is ₹8.0, its confidence interval runs from −0.9 to 17.0, and p = 0.077. The adjusted metric finds it clearly: estimate ₹14.8, interval 10.7 to 19.0, p tiny. Same users, same days; the adjustment simply removed noise we already knew about, which is worth the same as running the test on about 4.5 times as many users.</p>
  <p>One rule keeps CUPED honest: X must be measured <em>before</em> assignment. Then the treatment cannot have affected it, so subtracting it cannot create or remove a real effect. Adjusting for something measured during the test, such as in-test sessions, which the new checkout itself might change, can wipe out part of the true effect or invent one. CUPED works best when the metric is stable per user (spend, sessions); for a new-user feature with no history, there is no X to use.</p>

  <h2 id="sab-srm"><span class="num">06</span>Sample Ratio Mismatch</h2>
  <p>Fourteen days later the data is in. Control had 15,400 users and 1,540 purchases; treatment had 15,380 users and 1,707 purchases. The temptation is to compute the lift straight away. But first we must check that the experiment itself worked, because if the split was broken, every number after it is meaningless. Before reading an exam's results, an examiner checks that both halls received the right number of question papers; if one hall got 10% fewer, something went wrong in distribution, and comparing marks between halls is unfair however careful the marking was.</p>
  <p>A <strong>sample ratio mismatch</strong>, or SRM, is when the number of users in each arm differs from the planned ratio by more than chance allows. We planned 50/50, so we expect 30,780 ÷ 2 = 15,390 users in each arm. The test is the chi-square goodness-of-fit test from the <a class="xref" data-note="st_distributions">Distributions</a> note, which adds up (observed − expected)² ÷ expected over the arms: (15,400 − 15,390)² ÷ 15,390 + (15,380 − 15,390)² ÷ 15,390 = 200 ÷ 15,390 = 0.013. That is tiny, giving p ≈ 0.91. Now imagine the counts had been 15,400 and 14,700: expected is 15,050 each, χ² = 2 × 350² ÷ 15,050 = 16.3, and p ≈ 0.00005.</p>
  <div class="fx" data-lang="py">from scipy import stats
print("ours  :", round(stats.chisquare([15400, 15380]).pvalue, 4))
print("broken:", f"{stats.chisquare([15400, 14700]).pvalue:.1e}")
print("90/10 plan, 27,100 vs 3,000:",
      round(stats.chisquare([27100, 3000], f_exp=[0.9 * 30100, 0.1 * 30100]).pvalue, 4))</div>
  <div class="fx" data-lang="text">ours  : 0.9092
broken: 5.5e-05
90/10 plan, 27,100 vs 3,000: 0.8476</div>
  <p><code>stats.chisquare</code> assumes equal expected counts unless told otherwise, which is exactly the 50/50 plan, and our split passes with p = 0.91. The broken split gives p = 0.000055, far below the usual SRM alarm threshold of p &lt; 0.001 (a stricter cut-off than 0.05, because this check runs on every experiment and should rarely false-alarm). The last line shows that unequal plans work too: for a 90/10 split you pass the expected proportions with <code>f_exp</code>.</p>
  <p>When SRM fires, the rule is: stop, find the bug, and do not read the results. A 2% imbalance can look harmless, but with 30,000 users it is far beyond chance, and the users who went missing are rarely random. Typical causes are a new page that crashes on old browsers so those users never log a visit, bot filtering that hits one arm harder, a redirect that loses some users, or logging that fires at different moments in the two versions. In each case the missing users are often exactly the ones the change affected, so the remaining comparison is biased in an unknown direction.</p>

  <h2 id="sab-analysis"><span class="num">07</span>The z-test and Confidence Interval</h2>
  <p>The split is healthy, so we can ask the main question: is 1,707 out of 15,380 (11.10%) versus 1,540 out of 15,400 (10.00%) a real lift, or the kind of gap luck produces? And if it is real, how big might it truly be? This is the <strong>two-proportion z-test</strong> from the Hypothesis Testing note: it measures how many standard errors apart the two conversion rates are, where the <strong>standard error</strong> (SE) is the typical amount a rate would wobble by chance with this many users.</p>
  <p>Step by step. The rates are 1,707 ÷ 15,380 = 0.1110 and 1,540 ÷ 15,400 = 0.1000, a difference of 0.0110, which is 1.1 pp, or 11% relative. For the test we pretend H₀ is true (no difference), so the best estimate of the one shared rate is the <em>pooled</em> rate: p̂ = 3,247 ÷ 30,780 = 0.1055. The SE of the difference under H₀ is √(p̂(1 − p̂)(1/n<sub>T</sub> + 1/n<sub>C</sub>)) = √(0.0944 × 0.0001299) = 0.00350. Then z = 0.0110 ÷ 0.00350 = 3.14: the gap is 3.14 standard errors wide. The two-sided p-value is the chance of a gap at least that far from zero in either direction if H₀ were true, 2 × P(Z &gt; 3.14) = 0.0017.</p>
  <p>For the confidence interval we no longer assume H₀, so we use each arm's own rate in the SE (the <em>unpooled</em> SE): √(0.111 × 0.889 ÷ 15,380 + 0.100 × 0.900 ÷ 15,400) = 0.00350. The 95% interval is the difference ± 1.96 SE = 0.0110 ± 0.0069, from +0.0041 to +0.0179. The code repeats this by hand, then does it the library way:</p>
  <div class="fx" data-lang="py">import numpy as np
from scipy import stats
xt, nt, xc, nc = 1707, 15380, 1540, 15400          # purchases, users: treatment, control
pt, pc = xt / nt, xc / nc
pool = (xt + xc) / (nt + nc)
se_pool = np.sqrt(pool * (1 - pool) * (1/nt + 1/nc))
se_unpool = np.sqrt(pt * (1 - pt) / nt + pc * (1 - pc) / nc)
z = (pt - pc) / se_pool
print(f"pt={pt:.4f} pc={pc:.4f} diff={pt-pc:.4f} pooled={pool:.4f}")
print(f"se_pooled={se_pool:.5f}  z={z:.2f}  p={2*stats.norm.sf(z):.4f}")
print(f"se_unpooled={se_unpool:.5f}  "
      f"CI=[{pt-pc-1.96*se_unpool:+.4f}, {pt-pc+1.96*se_unpool:+.4f}]")</div>
  <div class="fx" data-lang="text">pt=0.1110 pc=0.1000 diff=0.0110 pooled=0.1055
se_pooled=0.00350  z=3.14  p=0.0017
se_unpooled=0.00350  CI=[+0.0041, +0.0179]</div>
  <div class="fx" data-lang="py">import numpy as np
from statsmodels.stats.proportion import proportions_ztest, confint_proportions_2indep
conv, users = np.array([1707, 1540]), np.array([15380, 15400])   # treatment, control
rates = conv / users
z, p = proportions_ztest(conv, users)
lo, hi = confint_proportions_2indep(conv[0], users[0], conv[1], users[1], compare="diff")
print(f"control {rates[1]:.2%}  treatment {rates[0]:.2%}")
print(f"absolute lift {rates[0]-rates[1]:+.2%} (pp)  relative lift {rates[0]/rates[1]-1:+.1%}")
print(f"z={z:.2f}  p={p:.4f}  95% CI for diff: [{lo:+.2%}, {hi:+.2%}]")</div>
  <div class="fx" data-lang="text">control 10.00%  treatment 11.10%
absolute lift +1.10% (pp)  relative lift +11.0%
z=3.14  p=0.0017  95% CI for diff: [+0.41%, +1.79%]</div>
  <p>The hand calculation and the library agree: z = 3.14, p = 0.0017, and a 95% CI for treatment minus control from +0.41 to +1.79 pp. <code>proportions_ztest</code> uses the pooled SE, and <code>confint_proportions_2indep(..., compare="diff")</code> gives the interval for the difference. In plain words: "if the new checkout made no difference, a gap this big would appear about 2 times in 1,000 experiments; our best estimate of the true lift is 1.1 pp, and the data are consistent with anything from about 0.4 to 1.8 pp." Notice the output prints both kinds of lift. Saying "+1.1%" is ambiguous: it could mean 10.0% → 11.1% (absolute) or 10.0% → 10.11% (relative). Always say "percentage points" for the absolute change.</p>
  <p>The z-test is valid when each arm has at least about ten successes and ten failures, which any real A/B test easily has. For a metric that is an average rather than a yes/no rate, such as revenue per user, the equivalent is Welch's t-test, which is what CUPED used above. The guardrails are checked the same way: a Welch t-test for page load time, z-tests for payment errors and refunds, each with its interval. A new bowling plan that takes more wickets is only good if it does not also leak runs; the z-test counted the wickets, and the guardrails count the runs. For the checkout, none moved meaningfully.</p>

  <h2 id="sab-practical"><span class="num">08</span>Statistical vs Practical Significance</h2>
  <p>p = 0.0017 tells us the lift is very unlikely to be zero. It does not tell us the lift is big enough to be worth the engineering, maintenance and risk. These are two different questions. With ten million users, a 0.02 pp lift is "statistically significant" and worth nothing; with very few users, a valuable lift can fail to be significant. <strong>Statistical significance</strong> means the data would be unlikely if there were no effect (p &lt; α). <strong>Practical significance</strong> means the effect is large enough to matter to the business. A good decision needs both, and the p-value alone cannot make it.</p>
  <p>Think of a new route to the office that saves time "for certain", but somewhere between 10 and 40 seconds a day. It is a real saving, but not worth paying an extra toll for. Another route saves somewhere between −5 and +25 minutes: you simply do not know yet, and should drive it a few more days before deciding. In both cases the useful information is the <em>range</em>, not a yes/no answer about zero.</p>
  <p>So the decision is made from the whole confidence interval, compared against two lines. Zero answers "is there any effect?", and the MDE chosen in section 02 answers "is it worth it?". The chart shows five typical intervals and ours:</p>
  <figure class="viz"><svg viewBox="0 0 452.280937 215.919219" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="max-width:640px;width:100%;height:auto">
 <defs>
  <style type="text/css">*{stroke-linejoin: round; stroke-linecap: butt}</style>
 </defs>
 <g id="sabcifigure_1">
  <g id="sabcipatch_1">
   <path d="M 0 215.919219 
L 452.280937 215.919219 
L 452.280937 0 
L 0 0 
L 0 215.919219 
z
" style="fill: none"/>
  </g>
  <g id="sabciaxes_1">
   <g id="sabcipatch_2">
    <path d="M 87.960938 173.52 
L 445.080938 173.52 
L 445.080938 7.2 
L 87.960938 7.2 
L 87.960938 173.52 
z
" style="fill: none"/>
   </g>
   <g id="sabcimatplotlib.axis_1">
    <g id="sabcixtick_1">
     <g id="sabciline2d_1">
      <defs>
       <path id="sabcimedb56decd0" d="M 0 0 
L 0 3.5 
" style="stroke: currentColor; stroke-width: 0.8"/>
      </defs>
      <g>
       <use xlink:href="#sabcimedb56decd0" x="113.742328" y="173.52" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="sabcitext_1">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="113.742328" y="190.2075" transform="rotate(-0 113.742328 190.2075)">−1.5</text>
     </g>
    </g>
    <g id="sabcixtick_2">
     <g id="sabciline2d_2">
      <g>
       <use xlink:href="#sabcimedb56decd0" x="161.485643" y="173.52" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="sabcitext_2">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="161.485643" y="190.2075" transform="rotate(-0 161.485643 190.2075)">−1.0</text>
     </g>
    </g>
    <g id="sabcixtick_3">
     <g id="sabciline2d_3">
      <g>
       <use xlink:href="#sabcimedb56decd0" x="209.228959" y="173.52" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="sabcitext_3">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="209.228959" y="190.2075" transform="rotate(-0 209.228959 190.2075)">−0.5</text>
     </g>
    </g>
    <g id="sabcixtick_4">
     <g id="sabciline2d_4">
      <g>
       <use xlink:href="#sabcimedb56decd0" x="256.972274" y="173.52" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="sabcitext_4">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="256.972274" y="190.2075" transform="rotate(-0 256.972274 190.2075)">0.0</text>
     </g>
    </g>
    <g id="sabcixtick_5">
     <g id="sabciline2d_5">
      <g>
       <use xlink:href="#sabcimedb56decd0" x="304.71559" y="173.52" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="sabcitext_5">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="304.71559" y="190.2075" transform="rotate(-0 304.71559 190.2075)">0.5</text>
     </g>
    </g>
    <g id="sabcixtick_6">
     <g id="sabciline2d_6">
      <g>
       <use xlink:href="#sabcimedb56decd0" x="352.458905" y="173.52" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="sabcitext_6">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="352.458905" y="190.2075" transform="rotate(-0 352.458905 190.2075)">1.0</text>
     </g>
    </g>
    <g id="sabcixtick_7">
     <g id="sabciline2d_7">
      <g>
       <use xlink:href="#sabcimedb56decd0" x="400.202221" y="173.52" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="sabcitext_7">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="400.202221" y="190.2075" transform="rotate(-0 400.202221 190.2075)">1.5</text>
     </g>
    </g>
    <g id="sabcitext_8">
     <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="266.520938" y="206.307109" transform="rotate(-0 266.520938 206.307109)">95% CI for the lift (percentage points)</text>
    </g>
   </g>
   <g id="sabcimatplotlib.axis_2">
    <g id="sabciytick_1">
     <g id="sabciline2d_8"/>
     <g id="sabcitext_9">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="84.460938" y="162.77125" transform="rotate(-0 84.460938 162.77125)">our test</text>
     </g>
    </g>
    <g id="sabciytick_2">
     <g id="sabciline2d_9"/>
     <g id="sabcitext_10">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="84.460938" y="136.78375" transform="rotate(-0 84.460938 136.78375)">E: kill</text>
     </g>
    </g>
    <g id="sabciytick_3">
     <g id="sabciline2d_10"/>
     <g id="sabcitext_11">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="84.460938" y="110.79625" transform="rotate(-0 84.460938 110.79625)">D: confident null</text>
     </g>
    </g>
    <g id="sabciytick_4">
     <g id="sabciline2d_11"/>
     <g id="sabcitext_12">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="84.460938" y="84.80875" transform="rotate(-0 84.460938 84.80875)">C: inconclusive</text>
     </g>
    </g>
    <g id="sabciytick_5">
     <g id="sabciline2d_12"/>
     <g id="sabcitext_13">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="84.460938" y="58.82125" transform="rotate(-0 84.460938 58.82125)">B: real but tiny</text>
     </g>
    </g>
    <g id="sabciytick_6">
     <g id="sabciline2d_13"/>
     <g id="sabcitext_14">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="84.460938" y="32.83375" transform="rotate(-0 84.460938 32.83375)">A: ship</text>
     </g>
    </g>
   </g>
   <g id="sabciline2d_14">
    <path d="M 296.121793 157.9275 
L 427.893344 157.9275 
" clip-path="url(#sabcipf839272669)" style="fill: none; stroke: #e8743b; stroke-width: 4"/>
   </g>
   <g id="sabciline2d_15">
    <defs>
     <path id="sabcimb374cfb68b" d="M 0 3 
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
    <g clip-path="url(#sabcipf839272669)">
     <use xlink:href="#sabcimb374cfb68b" x="362.007569" y="157.9275" style="fill: #e8743b; stroke: #e8743b"/>
    </g>
   </g>
   <g id="sabciline2d_16">
    <path d="M 104.193665 131.94 
L 218.777622 131.94 
" clip-path="url(#sabcipf839272669)" style="fill: none; stroke: #2a78d6; stroke-width: 4"/>
   </g>
   <g id="sabciline2d_17">
    <defs>
     <path id="sabcime8e5dd379e" d="M 0 3 
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
    <g clip-path="url(#sabcipf839272669)">
     <use xlink:href="#sabcime8e5dd379e" x="161.485643" y="131.94" style="fill: #2a78d6; stroke: #2a78d6"/>
    </g>
   </g>
   <g id="sabciline2d_18">
    <path d="M 233.100617 105.9525 
L 285.618264 105.9525 
" clip-path="url(#sabcipf839272669)" style="fill: none; stroke: #2a78d6; stroke-width: 4"/>
   </g>
   <g id="sabciline2d_19">
    <g clip-path="url(#sabcipf839272669)">
     <use xlink:href="#sabcime8e5dd379e" x="259.35944" y="105.9525" style="fill: #2a78d6; stroke: #2a78d6"/>
    </g>
   </g>
   <g id="sabciline2d_20">
    <path d="M 171.034306 79.965 
L 400.202221 79.965 
" clip-path="url(#sabcipf839272669)" style="fill: none; stroke: #2a78d6; stroke-width: 4"/>
   </g>
   <g id="sabciline2d_21">
    <g clip-path="url(#sabcipf839272669)">
     <use xlink:href="#sabcime8e5dd379e" x="285.618264" y="79.965" style="fill: #2a78d6; stroke: #2a78d6"/>
    </g>
   </g>
   <g id="sabciline2d_22">
    <path d="M 266.520938 53.9775 
L 304.71559 53.9775 
" clip-path="url(#sabcipf839272669)" style="fill: none; stroke: #2a78d6; stroke-width: 4"/>
   </g>
   <g id="sabciline2d_23">
    <g clip-path="url(#sabcipf839272669)">
     <use xlink:href="#sabcime8e5dd379e" x="285.618264" y="53.9775" style="fill: #2a78d6; stroke: #2a78d6"/>
    </g>
   </g>
   <g id="sabciline2d_24">
    <path d="M 314.264253 27.99 
L 428.84821 27.99 
" clip-path="url(#sabcipf839272669)" style="fill: none; stroke: #2a78d6; stroke-width: 4"/>
   </g>
   <g id="sabciline2d_25">
    <g clip-path="url(#sabcipf839272669)">
     <use xlink:href="#sabcime8e5dd379e" x="371.556232" y="27.99" style="fill: #2a78d6; stroke: #2a78d6"/>
    </g>
   </g>
   <g id="sabciline2d_26">
    <path d="M 256.972274 173.52 
L 256.972274 7.2 
" clip-path="url(#sabcipf839272669)" style="fill: none; stroke: currentColor; stroke-linecap: square"/>
   </g>
   <g id="sabciline2d_27">
    <path d="M 352.458905 173.52 
L 352.458905 7.2 
" clip-path="url(#sabcipf839272669)" style="fill: none; stroke-dasharray: 4.44,1.92; stroke-dashoffset: 0; stroke: #3a9d5d; stroke-width: 1.2"/>
   </g>
   <g id="sabcipatch_3">
    <path d="M 87.960938 173.52 
L 445.080938 173.52 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
   </g>
   <g id="sabcitext_15">
    <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: start; fill: #3a9d5d" x="355.323504" y="18.894375" transform="rotate(-0 355.323504 18.894375)">MDE = 1 pp</text>
   </g>
   <g id="sabcitext_16">
    <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: start" x="259.836873" y="18.894375" transform="rotate(-0 259.836873 18.894375)">0</text>
   </g>
  </g>
 </g>
 <defs>
  <clipPath id="sabcipf839272669">
   <rect x="87.960938" y="7.2" width="357.12" height="166.32"/>
  </clipPath>
 </defs>
</svg><figcaption>Each bar is a 95% CI for the lift and the dot is its centre. Judge each against 0 (is it real?) and the MDE of 1 pp (is it worth it?).</figcaption></figure>
  <p>A lies entirely above zero and is centred above the MDE: ship. B is above zero but entirely below the MDE: the effect is real but too small to matter, so ship only if it is cheap and safe. C crosses zero and is wide: the test was underpowered, and it rules out almost nothing, so it must not be reported as "no effect". D also crosses zero but is narrow, ruling out any lift as big as the MDE: that is a confident null, so stop and move on. E is entirely below zero: the change hurts. The same rules written as a function:</p>
  <div class="fx" data-lang="py">def decide(lo, hi, mde):
    """lo, hi = 95% CI for the lift; mde = smallest lift worth shipping (same units)."""
    if hi &lt; 0:
        return "kill: it hurts"
    if lo &gt; 0:
        if (lo + hi) / 2 &gt;= mde:
            return "ship"
        if hi &lt; mde:
            return "real but tiny: ship only if cheap"
        return "real, size unclear: weigh cost"
    if -mde &lt; lo and hi &lt; mde:
        return "confident null: kill, move on"
    return "inconclusive: underpowered"

for name, lo, hi in [("A", 0.6, 1.8), ("B", 0.1, 0.5), ("C", -0.9, 1.5),
                     ("D", -0.25, 0.3), ("E", -1.6, -0.4), ("ours", 0.41, 1.79)]:
    print(f"{name:5s} CI [{lo:+.2f}, {hi:+.2f}] pp -&gt; {decide(lo, hi, mde=1.0)}")</div>
  <div class="fx" data-lang="text">A     CI [+0.60, +1.80] pp -&gt; ship
B     CI [+0.10, +0.50] pp -&gt; real but tiny: ship only if cheap
C     CI [-0.90, +1.50] pp -&gt; inconclusive: underpowered
D     CI [-0.25, +0.30] pp -&gt; confident null: kill, move on
E     CI [-1.60, -0.40] pp -&gt; kill: it hurts
ours  CI [+0.41, +1.79] pp -&gt; ship</div>
  <p>The order of the checks matters: "entirely below 0" first, then "entirely above 0", and only then the two cases that span zero, separated by whether the interval is narrow enough to rule out the MDE. Our interval, +0.41 to +1.79 pp, is above zero with its centre at 1.1, above the MDE, and the guardrails are clean, so the decision is to ship. The case to remember for interviews is C: "not significant" is not the same as "the feature does nothing". Its interval still allows a +1.5 pp lift; the honest reading is "we don't know", and the options are to extend the test or accept the uncertainty knowingly.</p>

  <h2 id="sab-peek"><span class="num">09</span>Peeking and Sequential Testing</h2>
  <p>Everything so far assumed we looked at the result once, at the planned end. Real experimentation tools show a live p-value on a dashboard every day, and people act on it. Suppose on day 6 the p-value dips to 0.017 and the product manager wants to ship immediately. Is the false-alarm rate still 5%?</p>
  <p>It is not, because p-values wander. Even when there is no effect at all, the running p-value drifts up and down as data arrives, and over fourteen days it has fourteen chances to dip below 0.05 by luck. <strong>Peeking</strong> means checking an experiment repeatedly while it runs and stopping as soon as it looks significant. It is the multiple-testing problem in disguise. Think of declaring a cricket match result the first moment your team is ahead: check after every over, and some team will be "winning" at some point even if the match ends in a draw. Only the final scorecard counts. The chart shows one simulated A/A test, where both arms are identical:</p>
  <figure class="viz"><svg viewBox="0 0 410.016484 212.066498" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="max-width:640px;width:100%;height:auto">
 <defs>
  <style type="text/css">*{stroke-linejoin: round; stroke-linecap: butt}</style>
 </defs>
 <g id="sabpkfigure_1">
  <g id="sabpkpatch_1">
   <path d="M 0 212.066498 
L 410.016484 212.066498 
L 410.016484 0 
L 0 0 
L 0 212.066498 
z
" style="fill: none"/>
  </g>
  <g id="sabpkaxes_1">
   <g id="sabpkpatch_2">
    <path d="M 45.696484 169.667279 
L 402.816484 169.667279 
L 402.816484 8.891279 
L 45.696484 8.891279 
L 45.696484 169.667279 
z
" style="fill: none"/>
   </g>
   <g id="sabpkpatch_3">
    <path d="M 45.696484 169.667279 
L 402.816484 169.667279 
L 402.816484 161.786103 
L 45.696484 161.786103 
z
" clip-path="url(#sabpkpe3c232d22a)" style="fill: #d64545; opacity: 0.18"/>
   </g>
   <g id="sabpkmatplotlib.axis_1">
    <g id="sabpkxtick_1">
     <g id="sabpkline2d_1">
      <defs>
       <path id="sabpkmedb56decd0" d="M 0 0 
L 0 3.5 
" style="stroke: currentColor; stroke-width: 0.8"/>
      </defs>
      <g>
       <use xlink:href="#sabpkmedb56decd0" x="61.929212" y="169.667279" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="sabpktext_1">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="61.929212" y="186.354779" transform="rotate(-0 61.929212 186.354779)">1</text>
     </g>
    </g>
    <g id="sabpkxtick_2">
     <g id="sabpkline2d_2">
      <g>
       <use xlink:href="#sabpkmedb56decd0" x="86.902638" y="169.667279" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="sabpktext_2">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="86.902638" y="186.354779" transform="rotate(-0 86.902638 186.354779)">2</text>
     </g>
    </g>
    <g id="sabpkxtick_3">
     <g id="sabpkline2d_3">
      <g>
       <use xlink:href="#sabpkmedb56decd0" x="111.876065" y="169.667279" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="sabpktext_3">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="111.876065" y="186.354779" transform="rotate(-0 111.876065 186.354779)">3</text>
     </g>
    </g>
    <g id="sabpkxtick_4">
     <g id="sabpkline2d_4">
      <g>
       <use xlink:href="#sabpkmedb56decd0" x="136.849491" y="169.667279" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="sabpktext_4">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="136.849491" y="186.354779" transform="rotate(-0 136.849491 186.354779)">4</text>
     </g>
    </g>
    <g id="sabpkxtick_5">
     <g id="sabpkline2d_5">
      <g>
       <use xlink:href="#sabpkmedb56decd0" x="161.822918" y="169.667279" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="sabpktext_5">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="161.822918" y="186.354779" transform="rotate(-0 161.822918 186.354779)">5</text>
     </g>
    </g>
    <g id="sabpkxtick_6">
     <g id="sabpkline2d_6">
      <g>
       <use xlink:href="#sabpkmedb56decd0" x="186.796345" y="169.667279" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="sabpktext_6">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="186.796345" y="186.354779" transform="rotate(-0 186.796345 186.354779)">6</text>
     </g>
    </g>
    <g id="sabpkxtick_7">
     <g id="sabpkline2d_7">
      <g>
       <use xlink:href="#sabpkmedb56decd0" x="211.769771" y="169.667279" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="sabpktext_7">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="211.769771" y="186.354779" transform="rotate(-0 211.769771 186.354779)">7</text>
     </g>
    </g>
    <g id="sabpkxtick_8">
     <g id="sabpkline2d_8">
      <g>
       <use xlink:href="#sabpkmedb56decd0" x="236.743198" y="169.667279" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="sabpktext_8">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="236.743198" y="186.354779" transform="rotate(-0 236.743198 186.354779)">8</text>
     </g>
    </g>
    <g id="sabpkxtick_9">
     <g id="sabpkline2d_9">
      <g>
       <use xlink:href="#sabpkmedb56decd0" x="261.716624" y="169.667279" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="sabpktext_9">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="261.716624" y="186.354779" transform="rotate(-0 261.716624 186.354779)">9</text>
     </g>
    </g>
    <g id="sabpkxtick_10">
     <g id="sabpkline2d_10">
      <g>
       <use xlink:href="#sabpkmedb56decd0" x="286.690051" y="169.667279" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="sabpktext_10">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="286.690051" y="186.354779" transform="rotate(-0 286.690051 186.354779)">10</text>
     </g>
    </g>
    <g id="sabpkxtick_11">
     <g id="sabpkline2d_11">
      <g>
       <use xlink:href="#sabpkmedb56decd0" x="311.663477" y="169.667279" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="sabpktext_11">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="311.663477" y="186.354779" transform="rotate(-0 311.663477 186.354779)">11</text>
     </g>
    </g>
    <g id="sabpkxtick_12">
     <g id="sabpkline2d_12">
      <g>
       <use xlink:href="#sabpkmedb56decd0" x="336.636904" y="169.667279" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="sabpktext_12">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="336.636904" y="186.354779" transform="rotate(-0 336.636904 186.354779)">12</text>
     </g>
    </g>
    <g id="sabpkxtick_13">
     <g id="sabpkline2d_13">
      <g>
       <use xlink:href="#sabpkmedb56decd0" x="361.610331" y="169.667279" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="sabpktext_13">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="361.610331" y="186.354779" transform="rotate(-0 361.610331 186.354779)">13</text>
     </g>
    </g>
    <g id="sabpkxtick_14">
     <g id="sabpkline2d_14">
      <g>
       <use xlink:href="#sabpkmedb56decd0" x="386.583757" y="169.667279" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="sabpktext_14">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="386.583757" y="186.354779" transform="rotate(-0 386.583757 186.354779)">14</text>
     </g>
    </g>
    <g id="sabpktext_15">
     <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="224.256484" y="202.454389" transform="rotate(-0 224.256484 202.454389)">day of the experiment</text>
    </g>
   </g>
   <g id="sabpkmatplotlib.axis_2">
    <g id="sabpkytick_1">
     <g id="sabpkline2d_15">
      <defs>
       <path id="sabpkmcf30224eca" d="M 0 0 
L -3.5 0 
" style="stroke: currentColor; stroke-width: 0.8"/>
      </defs>
      <g>
       <use xlink:href="#sabpkmcf30224eca" x="45.696484" y="169.667279" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="sabpktext_16">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="38.696484" y="174.511029" transform="rotate(-0 38.696484 174.511029)">0.0</text>
     </g>
    </g>
    <g id="sabpkytick_2">
     <g id="sabpkline2d_16">
      <g>
       <use xlink:href="#sabpkmcf30224eca" x="45.696484" y="138.142574" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="sabpktext_17">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="38.696484" y="142.986324" transform="rotate(-0 38.696484 142.986324)">0.2</text>
     </g>
    </g>
    <g id="sabpkytick_3">
     <g id="sabpkline2d_17">
      <g>
       <use xlink:href="#sabpkmcf30224eca" x="45.696484" y="106.617868" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="sabpktext_18">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="38.696484" y="111.461618" transform="rotate(-0 38.696484 111.461618)">0.4</text>
     </g>
    </g>
    <g id="sabpkytick_4">
     <g id="sabpkline2d_18">
      <g>
       <use xlink:href="#sabpkmcf30224eca" x="45.696484" y="75.093162" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="sabpktext_19">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="38.696484" y="79.936912" transform="rotate(-0 38.696484 79.936912)">0.6</text>
     </g>
    </g>
    <g id="sabpkytick_5">
     <g id="sabpkline2d_19">
      <g>
       <use xlink:href="#sabpkmcf30224eca" x="45.696484" y="43.568456" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="sabpktext_20">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="38.696484" y="48.412206" transform="rotate(-0 38.696484 48.412206)">0.8</text>
     </g>
    </g>
    <g id="sabpkytick_6">
     <g id="sabpkline2d_20">
      <g>
       <use xlink:href="#sabpkmcf30224eca" x="45.696484" y="12.04375" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="sabpktext_21">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="38.696484" y="16.8875" transform="rotate(-0 38.696484 16.8875)">1.0</text>
     </g>
    </g>
    <g id="sabpktext_22">
     <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="16.8875" y="89.279279" transform="rotate(-90 16.8875 89.279279)">p-value so far</text>
    </g>
   </g>
   <g id="sabpkline2d_21">
    <path d="M 45.696484 161.786103 
L 402.816484 161.786103 
" clip-path="url(#sabpkpe3c232d22a)" style="fill: none; stroke-dasharray: 3.7,1.6; stroke-dashoffset: 0; stroke: #d64545"/>
   </g>
   <g id="sabpkline2d_22">
    <path d="M 61.929212 75.437213 
L 86.902638 25.239624 
L 111.876065 134.447092 
L 136.849491 160.973438 
L 161.822918 154.204946 
L 186.796345 166.913775 
L 211.769771 139.186563 
L 236.743198 136.061347 
L 261.716624 116.202878 
L 286.690051 56.412947 
L 311.663477 90.211245 
L 336.636904 64.97452 
L 361.610331 51.295338 
L 386.583757 67.764269 
" clip-path="url(#sabpkpe3c232d22a)" style="fill: none; stroke: #2a78d6; stroke-width: 2; stroke-linecap: square"/>
    <defs>
     <path id="sabpkmc92999a729" d="M 0 2 
C 0.530406 2 1.03916 1.789267 1.414214 1.414214 
C 1.789267 1.03916 2 0.530406 2 0 
C 2 -0.530406 1.789267 -1.03916 1.414214 -1.414214 
C 1.03916 -1.789267 0.530406 -2 0 -2 
C -0.530406 -2 -1.03916 -1.789267 -1.414214 -1.414214 
C -1.789267 -1.03916 -2 -0.530406 -2 0 
C -2 0.530406 -1.789267 1.03916 -1.414214 1.414214 
C -1.03916 1.789267 -0.530406 2 0 2 
z
" style="stroke: #2a78d6"/>
    </defs>
    <g clip-path="url(#sabpkpe3c232d22a)">
     <use xlink:href="#sabpkmc92999a729" x="61.929212" y="75.437213" style="fill: #2a78d6; stroke: #2a78d6"/>
     <use xlink:href="#sabpkmc92999a729" x="86.902638" y="25.239624" style="fill: #2a78d6; stroke: #2a78d6"/>
     <use xlink:href="#sabpkmc92999a729" x="111.876065" y="134.447092" style="fill: #2a78d6; stroke: #2a78d6"/>
     <use xlink:href="#sabpkmc92999a729" x="136.849491" y="160.973438" style="fill: #2a78d6; stroke: #2a78d6"/>
     <use xlink:href="#sabpkmc92999a729" x="161.822918" y="154.204946" style="fill: #2a78d6; stroke: #2a78d6"/>
     <use xlink:href="#sabpkmc92999a729" x="186.796345" y="166.913775" style="fill: #2a78d6; stroke: #2a78d6"/>
     <use xlink:href="#sabpkmc92999a729" x="211.769771" y="139.186563" style="fill: #2a78d6; stroke: #2a78d6"/>
     <use xlink:href="#sabpkmc92999a729" x="236.743198" y="136.061347" style="fill: #2a78d6; stroke: #2a78d6"/>
     <use xlink:href="#sabpkmc92999a729" x="261.716624" y="116.202878" style="fill: #2a78d6; stroke: #2a78d6"/>
     <use xlink:href="#sabpkmc92999a729" x="286.690051" y="56.412947" style="fill: #2a78d6; stroke: #2a78d6"/>
     <use xlink:href="#sabpkmc92999a729" x="311.663477" y="90.211245" style="fill: #2a78d6; stroke: #2a78d6"/>
     <use xlink:href="#sabpkmc92999a729" x="336.636904" y="64.97452" style="fill: #2a78d6; stroke: #2a78d6"/>
     <use xlink:href="#sabpkmc92999a729" x="361.610331" y="51.295338" style="fill: #2a78d6; stroke: #2a78d6"/>
     <use xlink:href="#sabpkmc92999a729" x="386.583757" y="67.764269" style="fill: #2a78d6; stroke: #2a78d6"/>
    </g>
   </g>
   <g id="sabpkpatch_4">
    <path d="M 45.696484 169.667279 
L 45.696484 8.891279 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
   </g>
   <g id="sabpkpatch_5">
    <path d="M 45.696484 169.667279 
L 402.816484 169.667279 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
   </g>
   <g id="sabpkpatch_6">
    <path d="M 268.653941 155.442634 
Q 228.715638 161.039401 189.884549 166.481009 
" style="fill: none; stroke: currentColor; stroke-linecap: round"/>
    <path d="M 194.123401 167.906538 
L 189.884549 166.481009 
L 193.568284 163.945245 
" style="fill: none; stroke: currentColor; stroke-linecap: round"/>
   </g>
   <g id="sabpktext_23">
    <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: start" x="269.208652" y="150.752456" transform="rotate(-0 269.208652 150.752456)">day 6: p = 0.017  'ship it!'</text>
   </g>
   <g id="sabpkpatch_7">
    <path d="M 329.719787 28.623551 
Q 357.327481 47.626532 384.014221 65.9956 
" style="fill: none; stroke: currentColor; stroke-linecap: round"/>
    <path d="M 381.853295 62.080195 
L 384.014221 65.9956 
L 379.585341 65.375098 
" style="fill: none; stroke: currentColor; stroke-linecap: round"/>
   </g>
   <g id="sabpktext_24">
    <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: start" x="244.235226" y="23.077397" transform="rotate(-0 244.235226 23.077397)">day 14 (planned end): p = 0.65</text>
   </g>
  </g>
 </g>
 <defs>
  <clipPath id="sabpkpe3c232d22a">
   <rect x="45.696484" y="8.891279" width="357.12" height="160.776"/>
  </clipPath>
 </defs>
</svg><figcaption>Daily p-value of one simulated A/A test (no real difference). It dips into the red zone on day 6, then wanders back up. Stopping at the dip would ship pure noise.</figcaption></figure>
  <p>On day 6 the p-value touched 0.017; by the planned end it was 0.65. Anyone who stopped on day 6 would have shipped a change that does nothing. One picture could be bad luck, so the code runs 2,000 such A/A tests and compares two rules: stop the first day p &lt; 0.05, or look only on day 14.</p>
  <div class="fx" data-lang="py">import numpy as np
from statsmodels.stats.proportion import proportions_ztest
rng = np.random.default_rng(0)                   # A/A tests: no real difference
sims, days, per_day = 2000, 14, 1100
peek_fp = end_fp = 0
for _ in range(sims):
    a = rng.binomial(per_day, 0.10, days).cumsum()     # running totals, like a dashboard
    b = rng.binomial(per_day, 0.10, days).cumsum()
    n_ = per_day * np.arange(1, days + 1)
    ps = [proportions_ztest([a[d], b[d]], [n_[d], n_[d]])[1] for d in range(days)]
    peek_fp += min(ps) &lt; 0.05                    # stop the first day p &lt; 0.05
    end_fp += ps[-1] &lt; 0.05                      # look once, at the planned end
print(f"false positive rate, peeking daily: {peek_fp/sims:.1%}")
print(f"false positive rate, fixed horizon: {end_fp/sims:.1%}")</div>
  <div class="fx" data-lang="text">false positive rate, peeking daily: 21.6%
false positive rate, fixed horizon: 5.0%</div>
  <p><code>rng.binomial(per_day, 0.10, days)</code> simulates each day's purchases, and <code>cumsum()</code> turns them into running totals, as a live dashboard would show. <code>min(ps) &lt; 0.05</code> asks "was the p-value ever below 0.05?". Looking once gives the promised 5.0% false alarms. Peeking daily gives 21.6%, more than four times as many.</p>
  <p>The simplest fix is a <strong>fixed-horizon test</strong>: decide n in advance, analyse once when it is reached, and ignore the dashboard until then. When the business genuinely needs the option to stop early, for example to kill a harmful change fast, the answer is <strong>sequential testing</strong>, a family of designs built to allow repeated looks while keeping the overall false-alarm rate at α. Alpha-spending methods such as O'Brien–Fleming set a very strict threshold for early looks (needing a much smaller p on day 3 than on day 14) and spend most of the α at the end; "always-valid" p-values, used by several commercial platforms, stay correct however often you look. They cost a little power in exchange for that flexibility. "We'll peek but we won't act on it" rarely survives business pressure, so if early answers will be wanted, plan a sequential design from the start.</p>

  <h2 id="sab-multi"><span class="num">10</span>Multiple Testing and A/B/n Tests</h2>
  <p>Peeking is one way of running many tests without noticing. Two more are very common. The design team now wants to test four checkout designs against control at once, which is called an <strong>A/B/n test</strong>. And every experiment dashboard reports twenty or more metrics. Each comparison is a test at α = 0.05, so each has a 5% chance of a false alarm, and those chances add up. The probability of at least one false alarm across m independent comparisons is 1 − (1 − α)<sup>m</sup>, called the <strong>family-wise error rate</strong>. For four variants that is 1 − 0.95⁴ = 1 − 0.815 = 18.5%; for twenty metrics, 64%. Think of five friends each tossing a coin hoping for three heads in a row: one of them will probably manage it, and that does not make his coin special.</p>
  <div class="fx" data-lang="py">import numpy as np
from statsmodels.stats.power import NormalIndPower
from statsmodels.stats.proportion import proportion_effectsize
from statsmodels.stats.multitest import multipletests

for m in (1, 4, 20):
    print(f"{m:2d} comparisons at 0.05 each: P(&gt;=1 false alarm) = {1 - 0.95**m:.3f}")
h = proportion_effectsize(0.11, 0.10)
for a in (0.05, 0.05 / 4):
    n_ = NormalIndPower().solve_power(effect_size=h, alpha=a, power=0.8)
    print(f"alpha={a:.4f}: {np.ceil(n_):,.0f} users per arm")

pvals = [0.004, 0.019, 0.03, 0.21]             # four variants vs control
for method in ("bonferroni", "holm", "fdr_bh"):
    reject, adj, _, _ = multipletests(pvals, alpha=0.05, method=method)
    print(f"{method:10s} adjusted p = {np.round(adj, 3)}  winners = {reject.sum()}")</div>
  <div class="fx" data-lang="text"> 1 comparisons at 0.05 each: P(&gt;=1 false alarm) = 0.050
 4 comparisons at 0.05 each: P(&gt;=1 false alarm) = 0.185
20 comparisons at 0.05 each: P(&gt;=1 false alarm) = 0.642
alpha=0.0500: 14,745 users per arm
alpha=0.0125: 20,948 users per arm
bonferroni adjusted p = [0.016 0.076 0.12  0.84 ]  winners = 1
holm       adjusted p = [0.016 0.057 0.06  0.21 ]  winners = 1
fdr_bh     adjusted p = [0.016 0.038 0.04  0.21 ]  winners = 3</div>
  <p>The first three lines show the error rate climbing from 5% to 18.5% to 64%. The simplest correction is <strong>Bonferroni</strong>: divide α by the number of comparisons, so each of the four variants is tested at 0.05 ÷ 4 = 0.0125. That keeps the family-wise rate at or below 5%, but it has a price, shown in the next two lines: a stricter α needs more users, 20,948 per arm instead of 14,745 (42% more), and there are now five arms instead of two. That is about 104,700 users in total against 29,490, roughly seven weeks of checkout traffic instead of two. This is why teams test only a few variants at once, or screen many ideas cheaply first. Dunnett's test is a method designed specifically for "several treatments against one control" and is slightly less strict than Bonferroni.</p>
  <p>The last three lines apply three corrections to four example p-values with <code>multipletests</code>, which returns adjusted p-values you compare directly with 0.05. Bonferroni multiplies each p by 4, leaving one winner. <strong>Holm</strong> is a step-by-step version of Bonferroni that is never worse and often a little more powerful; here it still finds one. The <strong>Benjamini–Hochberg</strong> method (<code>fdr_bh</code>) controls a different quantity, the <strong>false discovery rate</strong>: the expected share of your "winners" that are false, rather than the chance of even one false alarm. It finds three winners. Family-wise control suits decisions where any false win is costly, such as choosing which variant to ship; FDR suits screening many secondary metrics, where a few false leads are acceptable.</p>
  <p>There is a related trap even after correction. If you pick the best of several arms and report its lift, the estimate is biased upwards, because the arm that came out on top is partly the one luck pushed highest. This is the <strong>winner's curse</strong>. The protection is to treat the winner's lift as optimistic, re-test it, or confirm it with a holdout (section 12). And it is why naming one primary metric in advance matters so much: with one decision metric there is nothing to correct.</p>

  <h2 id="sab-novelty"><span class="num">11</span>Novelty, Primacy and Interference</h2>
  <p>Our analysis made two more quiet assumptions: that the effect is the same in week 1 as in month 6, and that each user's outcome depends only on their own arm. Both can fail.</p>
  <p>A <strong>novelty effect</strong> is a temporary lift caused simply by something being new: users click the shiny new thing out of curiosity, then lose interest. A new restaurant in the neighbourhood is packed for its first fortnight because it is new; the crowd after two months tells you whether the food is good. The opposite is a <strong>primacy effect</strong>, also called change aversion: users who are used to the old design are slowed down or put off by the new one at first, then adapt, so the early result understates the lasting effect. For the checkout, regular customers who have learned the three-step flow might hesitate on the new page for a few days. The chart shows what a novelty effect looks like in an illustrative daily-lift curve:</p>
  <figure class="viz"><svg viewBox="0 0 401.078984 210.375219" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="max-width:640px;width:100%;height:auto">
 <defs>
  <style type="text/css">*{stroke-linejoin: round; stroke-linecap: butt}</style>
 </defs>
 <g id="sabnvfigure_1">
  <g id="sabnvpatch_1">
   <path d="M 0 210.375219 
L 401.078984 210.375219 
L 401.078984 0 
L 0 0 
L 0 210.375219 
z
" style="fill: none"/>
  </g>
  <g id="sabnvaxes_1">
   <g id="sabnvpatch_2">
    <path d="M 36.758984 167.976 
L 393.878984 167.976 
L 393.878984 7.2 
L 36.758984 7.2 
L 36.758984 167.976 
z
" style="fill: none"/>
   </g>
   <g id="sabnvmatplotlib.axis_1">
    <g id="sabnvxtick_1">
     <g id="sabnvline2d_1">
      <defs>
       <path id="sabnvmedb56decd0" d="M 0 0 
L 0 3.5 
" style="stroke: currentColor; stroke-width: 0.8"/>
      </defs>
      <g>
       <use xlink:href="#sabnvmedb56decd0" x="52.991712" y="167.976" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="sabnvtext_1">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="52.991712" y="184.6635" transform="rotate(-0 52.991712 184.6635)">1</text>
     </g>
    </g>
    <g id="sabnvxtick_2">
     <g id="sabnvline2d_2">
      <g>
       <use xlink:href="#sabnvmedb56decd0" x="125.137166" y="167.976" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="sabnvtext_2">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="125.137166" y="184.6635" transform="rotate(-0 125.137166 184.6635)">7</text>
     </g>
    </g>
    <g id="sabnvxtick_3">
     <g id="sabnvline2d_3">
      <g>
       <use xlink:href="#sabnvmedb56decd0" x="209.306863" y="167.976" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="sabnvtext_3">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="209.306863" y="184.6635" transform="rotate(-0 209.306863 184.6635)">14</text>
     </g>
    </g>
    <g id="sabnvxtick_4">
     <g id="sabnvline2d_4">
      <g>
       <use xlink:href="#sabnvmedb56decd0" x="293.47656" y="167.976" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="sabnvtext_4">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="293.47656" y="184.6635" transform="rotate(-0 293.47656 184.6635)">21</text>
     </g>
    </g>
    <g id="sabnvxtick_5">
     <g id="sabnvline2d_5">
      <g>
       <use xlink:href="#sabnvmedb56decd0" x="377.646257" y="167.976" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="sabnvtext_5">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="377.646257" y="184.6635" transform="rotate(-0 377.646257 184.6635)">28</text>
     </g>
    </g>
    <g id="sabnvtext_6">
     <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="215.318984" y="200.763109" transform="rotate(-0 215.318984 200.763109)">day of the experiment</text>
    </g>
   </g>
   <g id="sabnvmatplotlib.axis_2">
    <g id="sabnvytick_1">
     <g id="sabnvline2d_6">
      <defs>
       <path id="sabnvmcf30224eca" d="M 0 0 
L -3.5 0 
" style="stroke: currentColor; stroke-width: 0.8"/>
      </defs>
      <g>
       <use xlink:href="#sabnvmcf30224eca" x="36.758984" y="166.725483" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="sabnvtext_7">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="29.758984" y="171.569233" transform="rotate(-0 29.758984 171.569233)">0</text>
     </g>
    </g>
    <g id="sabnvytick_2">
     <g id="sabnvline2d_7">
      <g>
       <use xlink:href="#sabnvmcf30224eca" x="36.758984" y="143.798162" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="sabnvtext_8">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="29.758984" y="148.641912" transform="rotate(-0 29.758984 148.641912)">1</text>
     </g>
    </g>
    <g id="sabnvytick_3">
     <g id="sabnvline2d_8">
      <g>
       <use xlink:href="#sabnvmcf30224eca" x="36.758984" y="120.870841" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="sabnvtext_9">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="29.758984" y="125.714591" transform="rotate(-0 29.758984 125.714591)">2</text>
     </g>
    </g>
    <g id="sabnvytick_4">
     <g id="sabnvline2d_9">
      <g>
       <use xlink:href="#sabnvmcf30224eca" x="36.758984" y="97.943521" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="sabnvtext_10">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="29.758984" y="102.787271" transform="rotate(-0 29.758984 102.787271)">3</text>
     </g>
    </g>
    <g id="sabnvytick_5">
     <g id="sabnvline2d_10">
      <g>
       <use xlink:href="#sabnvmcf30224eca" x="36.758984" y="75.0162" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="sabnvtext_11">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="29.758984" y="79.85995" transform="rotate(-0 29.758984 79.85995)">4</text>
     </g>
    </g>
    <g id="sabnvytick_6">
     <g id="sabnvline2d_11">
      <g>
       <use xlink:href="#sabnvmcf30224eca" x="36.758984" y="52.088879" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="sabnvtext_12">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="29.758984" y="56.932629" transform="rotate(-0 29.758984 56.932629)">5</text>
     </g>
    </g>
    <g id="sabnvytick_7">
     <g id="sabnvline2d_12">
      <g>
       <use xlink:href="#sabnvmcf30224eca" x="36.758984" y="29.161558" style="stroke: currentColor; stroke-width: 0.8"/>
      </g>
     </g>
     <g id="sabnvtext_13">
      <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: end" x="29.758984" y="34.005308" transform="rotate(-0 29.758984 34.005308)">6</text>
     </g>
    </g>
    <g id="sabnvtext_14">
     <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: middle" x="16.8875" y="87.588" transform="rotate(-90 16.8875 87.588)">daily lift (%)</text>
    </g>
   </g>
   <g id="sabnvline2d_13">
    <path d="M 52.991712 14.508 
L 65.015954 54.085798 
L 77.040196 68.675741 
L 89.064439 81.081911 
L 101.088681 88.207198 
L 113.112924 109.698952 
L 125.137166 124.725782 
L 137.161409 133.277719 
L 149.185651 122.082689 
L 161.209893 116.418124 
L 173.234136 133.08327 
L 185.258378 150.585613 
L 197.282621 149.223222 
L 209.306863 123.93747 
L 221.331106 139.185393 
L 233.355348 159.775707 
L 245.37959 143.238833 
L 257.403833 154.730269 
L 269.428075 149.487205 
L 281.452318 148.229244 
L 293.47656 150.703871 
L 305.500803 137.747807 
L 317.525045 144.192795 
L 329.549287 149.686936 
L 341.57353 139.427103 
L 353.597772 135.127558 
L 365.622015 160.668 
L 377.646257 146.385513 
" clip-path="url(#sabnvp8b877bee5b)" style="fill: none; stroke: #2a78d6; stroke-width: 2; stroke-linecap: square"/>
    <defs>
     <path id="sabnvmbc0315f6a1" d="M 0 1.75 
C 0.464105 1.75 0.909265 1.565609 1.237437 1.237437 
C 1.565609 0.909265 1.75 0.464105 1.75 0 
C 1.75 -0.464105 1.565609 -0.909265 1.237437 -1.237437 
C 0.909265 -1.565609 0.464105 -1.75 0 -1.75 
C -0.464105 -1.75 -0.909265 -1.565609 -1.237437 -1.237437 
C -1.565609 -0.909265 -1.75 -0.464105 -1.75 0 
C -1.75 0.464105 -1.565609 0.909265 -1.237437 1.237437 
C -0.909265 1.565609 -0.464105 1.75 0 1.75 
z
" style="stroke: #2a78d6"/>
    </defs>
    <g clip-path="url(#sabnvp8b877bee5b)">
     <use xlink:href="#sabnvmbc0315f6a1" x="52.991712" y="14.508" style="fill: #2a78d6; stroke: #2a78d6"/>
     <use xlink:href="#sabnvmbc0315f6a1" x="65.015954" y="54.085798" style="fill: #2a78d6; stroke: #2a78d6"/>
     <use xlink:href="#sabnvmbc0315f6a1" x="77.040196" y="68.675741" style="fill: #2a78d6; stroke: #2a78d6"/>
     <use xlink:href="#sabnvmbc0315f6a1" x="89.064439" y="81.081911" style="fill: #2a78d6; stroke: #2a78d6"/>
     <use xlink:href="#sabnvmbc0315f6a1" x="101.088681" y="88.207198" style="fill: #2a78d6; stroke: #2a78d6"/>
     <use xlink:href="#sabnvmbc0315f6a1" x="113.112924" y="109.698952" style="fill: #2a78d6; stroke: #2a78d6"/>
     <use xlink:href="#sabnvmbc0315f6a1" x="125.137166" y="124.725782" style="fill: #2a78d6; stroke: #2a78d6"/>
     <use xlink:href="#sabnvmbc0315f6a1" x="137.161409" y="133.277719" style="fill: #2a78d6; stroke: #2a78d6"/>
     <use xlink:href="#sabnvmbc0315f6a1" x="149.185651" y="122.082689" style="fill: #2a78d6; stroke: #2a78d6"/>
     <use xlink:href="#sabnvmbc0315f6a1" x="161.209893" y="116.418124" style="fill: #2a78d6; stroke: #2a78d6"/>
     <use xlink:href="#sabnvmbc0315f6a1" x="173.234136" y="133.08327" style="fill: #2a78d6; stroke: #2a78d6"/>
     <use xlink:href="#sabnvmbc0315f6a1" x="185.258378" y="150.585613" style="fill: #2a78d6; stroke: #2a78d6"/>
     <use xlink:href="#sabnvmbc0315f6a1" x="197.282621" y="149.223222" style="fill: #2a78d6; stroke: #2a78d6"/>
     <use xlink:href="#sabnvmbc0315f6a1" x="209.306863" y="123.93747" style="fill: #2a78d6; stroke: #2a78d6"/>
     <use xlink:href="#sabnvmbc0315f6a1" x="221.331106" y="139.185393" style="fill: #2a78d6; stroke: #2a78d6"/>
     <use xlink:href="#sabnvmbc0315f6a1" x="233.355348" y="159.775707" style="fill: #2a78d6; stroke: #2a78d6"/>
     <use xlink:href="#sabnvmbc0315f6a1" x="245.37959" y="143.238833" style="fill: #2a78d6; stroke: #2a78d6"/>
     <use xlink:href="#sabnvmbc0315f6a1" x="257.403833" y="154.730269" style="fill: #2a78d6; stroke: #2a78d6"/>
     <use xlink:href="#sabnvmbc0315f6a1" x="269.428075" y="149.487205" style="fill: #2a78d6; stroke: #2a78d6"/>
     <use xlink:href="#sabnvmbc0315f6a1" x="281.452318" y="148.229244" style="fill: #2a78d6; stroke: #2a78d6"/>
     <use xlink:href="#sabnvmbc0315f6a1" x="293.47656" y="150.703871" style="fill: #2a78d6; stroke: #2a78d6"/>
     <use xlink:href="#sabnvmbc0315f6a1" x="305.500803" y="137.747807" style="fill: #2a78d6; stroke: #2a78d6"/>
     <use xlink:href="#sabnvmbc0315f6a1" x="317.525045" y="144.192795" style="fill: #2a78d6; stroke: #2a78d6"/>
     <use xlink:href="#sabnvmbc0315f6a1" x="329.549287" y="149.686936" style="fill: #2a78d6; stroke: #2a78d6"/>
     <use xlink:href="#sabnvmbc0315f6a1" x="341.57353" y="139.427103" style="fill: #2a78d6; stroke: #2a78d6"/>
     <use xlink:href="#sabnvmbc0315f6a1" x="353.597772" y="135.127558" style="fill: #2a78d6; stroke: #2a78d6"/>
     <use xlink:href="#sabnvmbc0315f6a1" x="365.622015" y="160.668" style="fill: #2a78d6; stroke: #2a78d6"/>
     <use xlink:href="#sabnvmbc0315f6a1" x="377.646257" y="146.385513" style="fill: #2a78d6; stroke: #2a78d6"/>
    </g>
   </g>
   <g id="sabnvline2d_14">
    <path d="M 36.758984 143.798162 
L 393.878984 143.798162 
" clip-path="url(#sabnvp8b877bee5b)" style="fill: none; stroke-dasharray: 4.44,1.92; stroke-dashoffset: 0; stroke: #3a9d5d; stroke-width: 1.2"/>
   </g>
   <g id="sabnvline2d_15">
    <path d="M 52.991712 77.28334 
L 125.137166 77.28334 
" clip-path="url(#sabnvp8b877bee5b)" style="fill: none; stroke: #e8743b; stroke-width: 2.5; stroke-linecap: square"/>
   </g>
   <g id="sabnvpatch_3">
    <path d="M 36.758984 167.976 
L 36.758984 7.2 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
   </g>
   <g id="sabnvpatch_4">
    <path d="M 36.758984 167.976 
L 393.878984 167.976 
" style="fill: none; stroke: currentColor; stroke-width: 0.8; stroke-linejoin: miter; stroke-linecap: square"/>
   </g>
   <g id="sabnvtext_15">
    <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: start; fill: #e8743b" x="132.351712" y="72.697876" transform="rotate(-0 132.351712 72.697876)">week-1 average: +3.9%</text>
   </g>
   <g id="sabnvtext_16">
    <text fill="currentColor" style="font-size: 10px; font-family: inherit; text-anchor: start; fill: #3a9d5d" x="257.403833" y="135.7736" transform="rotate(-0 257.403833 135.7736)">lasting lift = +1%</text>
   </g>
  </g>
 </g>
 <defs>
  <clipPath id="sabnvp8b877bee5b">
   <rect x="36.758984" y="7.2" width="357.12" height="160.776"/>
  </clipPath>
 </defs>
</svg><figcaption>Illustrative daily lift of a new feature with a novelty effect. A one-week test would report about +3.9%; the lasting effect is about +1%.</figcaption></figure>
  <p>A test that stopped after the first week would report a lift of about 3.9%, nearly four times the lasting effect of about 1%, and the business case would be built on a number that will never appear again. Both effects are found the same way: plot the lift by day and look for a trend rather than a flat line, and compare new users (who have no old habit to break and nothing to be curious about) with returning users. The fix is to run long enough for the curve to flatten, and to base the decision on the stable part.</p>
  <p><strong>Interference</strong> is the second problem: one user's treatment changes another user's outcome. The standard tests rely on an assumption called SUTVA (the stable unit treatment value assumption), which says that a unit's outcome depends only on its own assignment. On a marketplace that is often false. Suppose a ride-sharing app gives treatment riders a discount. They book more rides, taking drivers away, so control riders wait longer and book fewer rides. Treatment goes up, control goes down, and the measured gap is inflated from both sides; when the discount is launched for everyone, most of that "lift" disappears. For our shop, if the faster checkout lets treatment users grab limited-stock items first, control users find them sold out, which makes treatment look better than it would at full launch. Think of testing a new lane-changing rule by giving it to half the cars on a road: the treated cars push in, the untreated cars slow down, and the difference partly measures the treated cars taking space from the others.</p>
  <p>The fixes randomise at a level that contains the spill-over. <strong>Cluster randomisation</strong> assigns whole groups, such as cities or friend circles, to one arm, so treated and control users do not share supply. <strong>Switchback testing</strong> switches a whole market between A and B over random time slots (say, every hour), which is how ride-sharing pricing and delivery dispatch are tested. Both have far fewer independent units, perhaps 20 cities rather than 30,000 users, so power is lower and, by the rule from section 03, the analysis must be done at the cluster or time-slot level; analysing per user after randomising per city gives falsely tiny p-values.</p>

  <h2 id="sab-impact"><span class="num">12</span>Business Impact</h2>
  <p>Our checkout test is clean: no SRM, analysed once after 14 full days, stable lift, no interference, one primary comparison. But leadership does not decide on "z = 3.14". They decide on money, risk and effort, and a data scientist who stops at the p-value leaves the most important step to someone who may misread it. Translating the result into yearly value, with an honest range, is what gets good features shipped and bad launches stopped.</p>
  <p>A shopkeeper deciding whether to open on Sundays does not care that "Sunday footfall is significantly above zero". He wants "about ₹12,000 extra a month, at worst ₹5,000, at best ₹20,000", which he can weigh against an extra salary. The calculation for us is the same: multiply the lift by the number of users who will see the change per year and by the value of each extra conversion. By hand for the point estimate: 2,200 users a day × 365 = 803,000 users a year; × 0.0110 extra conversion rate = 8,833 extra purchases; × $60 average margin per purchase = about $530,000 a year. Doing the same with the two ends of the confidence interval carries the uncertainty into the money:</p>
  <div class="fx" data-lang="py">users_per_year = 2200 * 365
value_per_purchase = 60                         # $ average margin per order, from finance
for name, lift in [("low (CI)", 0.0041), ("point", 0.0110), ("high (CI)", 0.0179)]:
    print(f"{name:9s} &#36;{lift * users_per_year * value_per_purchase:&gt;9,.0f} / year")</div>
  <div class="fx" data-lang="text">low (CI)  $  197,538 / year
point     $  529,980 / year
high (CI) $  862,422 / year</div>
  <p>The point estimate is about $530k a year and the interval ends give $198k to $862k. Even the pessimistic end is clearly positive, which is a strong case. The comment in the code records an assumption that belongs on the slide: the value per purchase comes from finance. Others are that traffic stays at today's level and the effect lasts, which is why the novelty check mattered. A one-slide readout then looks like this: <em>What</em>: one-page checkout vs three-step, 14 days, 30,780 users. <em>Result</em>: conversion 10.0% → 11.1% (+11% relative, p = 0.002, 95% CI +0.4 to +1.8 pp). <em>Worth</em>: about $530k a year (range $200k–$860k). <em>Guardrails</em>: latency, payment errors and refunds unchanged. <em>Recommendation</em>: ship to everyone, and keep a 5% holdout for a month.</p>
  <p>A <strong>holdout</strong> is a small group of users kept on the old version after launch. It guards against the winner's curse from section 10: across many experiments, the ones that crossed the significance line are disproportionately the ones noise pushed upwards, so launched features tend to deliver less than their tests promised. Comparing the holdout with everyone else over the following weeks measures the real, long-run impact, and it is also the honest answer when leadership later asks "did that checkout change actually pay off?".</p>

  <h2 id="sab-traps"><span class="num">13</span>Common Mistakes</h2>
  <p>The most damaging mistake is reading results before checking the split. If the user counts are off, every metric is suspect, however good it looks. The check takes one line and should always come first:</p>
  <div class="fx" data-lang="py">from scipy import stats
# Wrong: compute the lift straight away. Right: check the split first.
p_srm = stats.chisquare([50000, 48500]).pvalue
print(f"SRM p = {p_srm:.1e}", "-&gt; STOP, find the bug" if p_srm &lt; 0.001 else "-&gt; ok")</div>
  <div class="fx" data-lang="text">SRM p = 1.8e-06 -&gt; STOP, find the bug</div>
  <p>A 50,000 to 48,500 split looks only 3% off, but the p-value is about two in a million, so the experiment is broken and its lift should not be read at all.</p>
  <p>The second is peeking: checking the dashboard daily and stopping at the first p &lt; 0.05 raised false alarms from 5% to 21.6% in our simulation. Fix the horizon, or use a sequential design if early stopping is genuinely needed. The third is analysing at the wrong unit: randomising by user and analysing by page view tripled the false-alarm rate in section 03. Keep one row per randomised user, or use the delta method for ratio metrics.</p>
  <p>The fourth is reading "not significant" as "no effect". A wide interval that crosses zero means "we don't know"; only a narrow interval around zero supports "no meaningful effect". A closely related error is trusting an underpowered pilot as a verdict. The arithmetic shows how easily it happens:</p>
  <div class="fx" data-lang="py">from statsmodels.stats.power import NormalIndPower
from statsmodels.stats.proportion import proportion_effectsize
h = proportion_effectsize(0.11, 0.10)
for n in (1000, 7700, 14745):          # pilot, "just run it a week", properly sized
    print(f"{n:6,d} per arm -&gt; power {NormalIndPower().power(h, nobs1=n, alpha=0.05):.0%}")</div>
  <div class="fx" data-lang="text"> 1,000 per arm -&gt; power 11%
 7,700 per arm -&gt; power 53%
14,745 per arm -&gt; power 80%</div>
  <p>A 1,000-per-arm pilot catches a real +1 pp lift only 11% of the time, and "just run it for a week" (about 7,700 per arm) only about half the time (53%): a coin flip on whether a $530k-a-year improvement shows up. Size the test before running it.</p>
  <p>The remaining mistakes are about discipline. Tracking many metrics with no named primary guarantees that something is "significant" by luck; name one before launch and treat the rest as explanations, with an FDR correction. Stopping mid-week or after a few days lets weekday patterns and novelty distort the result; run whole weeks and plot the lift by day. Confusing absolute and relative lift misleads everyone downstream; say "pp" for absolute changes. And ignoring interference on marketplaces or social features inflates the lift; use cluster or switchback designs there.</p>

  <h2 id="sab-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Running example</h3>
  <ul>
    <li>One-page checkout (B, treatment) vs three-step (A, control); 2,200 checkout visitors a day; baseline conversion 10%.</li>
    <li>MDE +1 pp, α 0.05 two-sided, power 0.8 → 14,745 per arm, 14 days.</li>
    <li>Result: control 1,540 / 15,400 (10.00%), treatment 1,707 / 15,380 (11.10%); z 3.14, p 0.0017, CI +0.41 to +1.79 pp; ≈ $530k/yr ($198k–$862k).</li>
  </ul>
  <h3>Definitions</h3>
  <ul>
    <li><b>A/B test</b>: users randomly assigned, at the same time, to control or treatment; a pre-chosen metric is compared. Randomisation balances every confounder, so the gap estimates the causal effect.</li>
    <li><b>MDE</b>: smallest lift worth detecting/acting on; a business choice that drives n.</li>
    <li><b>Pre-registration</b>: hypothesis, metric, MDE, duration and analysis fixed before launch.</li>
    <li><b>Primary metric (OEC)</b>: the one decision metric. <b>Guardrails</b>: must not get worse.</li>
    <li><b>Randomisation unit</b>: what gets the coin flip (user, session, city). Analyse at that unit.</li>
    <li><b>A/A test</b>: both arms identical; should be "significant" only ~5% of the time.</li>
    <li><b>SRM</b>: arm counts differ from the planned split beyond chance (χ², alarm at p &lt; 0.001).</li>
    <li><b>CUPED</b>: subtract what pre-experiment data predicts; variance × (1 − ρ²).</li>
    <li><b>Peeking</b>: stopping when the live p-value dips below α; inflates false positives.</li>
    <li><b>Novelty / primacy</b>: temporary lift from newness / temporary drop from habit.</li>
    <li><b>SUTVA / interference</b>: one unit's outcome must not depend on others' assignment.</li>
    <li><b>Winner's curse</b>: winning tests overstate their lift; confirm with a holdout.</li>
  </ul>
  <h3>Formulas</h3>
  <table class="tbl">
    <tr><th>What</th><th>Formula</th><th>Checkout value</th></tr>
    <tr><td>Sample size per arm</td><td>(z<sub>1−α/2</sub> + z<sub>1−β</sub>)² [p₁(1−p₁) + p₂(1−p₂)] ÷ δ²</td><td>7.85 × 0.1879 ÷ 0.0001 ≈ 14,750</td></tr>
    <tr><td>Rule of thumb</td><td>16 p(1−p) ÷ δ²</td><td>14,400</td></tr>
    <tr><td>Duration</td><td>2n ÷ daily users, round up to whole weeks</td><td>13.4 → 14 days</td></tr>
    <tr><td>CUPED</td><td>Y − θ(X − X̄), θ = cov(X,Y) ÷ var(X)</td><td>variance × 0.22</td></tr>
    <tr><td>SRM</td><td>χ² = Σ (O − E)² ÷ E on arm counts</td><td>0.013, p 0.91</td></tr>
    <tr><td>z-test</td><td>(p̂<sub>T</sub> − p̂<sub>C</sub>) ÷ √(p̂(1−p̂)(1/n<sub>T</sub> + 1/n<sub>C</sub>)), p̂ pooled</td><td>z 3.14, p 0.0017</td></tr>
    <tr><td>CI for the difference</td><td>diff ± 1.96 √(p<sub>T</sub>(1−p<sub>T</sub>)/n<sub>T</sub> + p<sub>C</sub>(1−p<sub>C</sub>)/n<sub>C</sub>)</td><td>+0.41 to +1.79 pp</td></tr>
    <tr><td>Family-wise error</td><td>1 − (1 − α)<sup>m</sup>; Bonferroni α ÷ m</td><td>4 arms: 18.5% → 0.0125</td></tr>
    <tr><td>Impact</td><td>lift × users per year × value per conversion</td><td>$530k ($198k–$862k)</td></tr>
  </table>
  <h3>Reading the CI</h3>
  <table class="tbl">
    <tr><th>CI for the lift</th><th>Decision</th></tr>
    <tr><td>Above 0, centre ≥ MDE</td><td>Ship</td></tr>
    <tr><td>Above 0, entirely below MDE</td><td>Real but tiny: ship only if cheap</td></tr>
    <tr><td>Spans 0, wide</td><td>Inconclusive (underpowered), not "no effect"</td></tr>
    <tr><td>Spans 0, narrow (within ±MDE)</td><td>Confident null: kill</td></tr>
    <tr><td>Entirely below 0</td><td>Kill, learn why</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="py">from scipy import stats
from statsmodels.stats.power import NormalIndPower
from statsmodels.stats.proportion import (proportion_effectsize, proportions_ztest,
                                          confint_proportions_2indep)
from statsmodels.stats.multitest import multipletests

h = proportion_effectsize(0.11, 0.10)                          # effect size
n = NormalIndPower().solve_power(h, alpha=0.05, power=0.8)     # users per arm
stats.chisquare([15400, 15380])                                # SRM check
proportions_ztest([1707, 1540], [15380, 15400])                # z, p
confint_proportions_2indep(1707, 15380, 1540, 15400, compare="diff")   # CI
stats.ttest_ind(y_t, y_c, equal_var=False)                     # Welch t (means)
multipletests(pvals, method="holm")                            # or "bonferroni", "fdr_bh"</div>
  <h3>Gotchas</h3>
  <ul>
    <li>SRM check before anything else; p &lt; 0.001 → stop and debug.</li>
    <li>No peeking (daily looks: 5% → ~22% false alarms) unless the design is sequential.</li>
    <li>Analyse at the randomisation unit (per-view analysis: 5% → 15% false alarms).</li>
    <li>Halving the MDE needs 4× the users; run whole weeks.</li>
    <li>"Not significant" ≠ "no effect"; read the CI width.</li>
    <li>Say pp for absolute lift; 10% → 11% is +1 pp and +10% relative.</li>
    <li>Correct for many variants or metrics; expect the winner's lift to shrink.</li>
    <li>CUPED covariate must be measured before assignment.</li>
    <li>Marketplaces and social features: cluster or switchback, analysed at that level.</li>
  </ul>

  <h2 id="sab-qa"><span class="num">14</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is an A/B test, and why does it show causation when a correlation can't?</summary><div class="qa-body">An A/B test randomly assigns users, at the same time, to the current version (control) or a new version (treatment) and compares a pre-chosen metric. In observational data a correlation can come from confounders such as payday, motivation or user type. Random assignment makes the two groups alike on average on every variable, measured or not, so the only systematic difference is the change; the hypothesis test then only has to rule out luck.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Walk me through designing an A/B test for a new recommendation widget.</summary><div class="qa-body">State the hypothesis (the widget raises purchases per user, because it surfaces relevant items) and the MDE. Pick one primary metric (purchases or revenue per user), secondary metrics (widget click-through) and guardrails (latency, errors, overall engagement). Randomise by user with a hash, compute the sample size from baseline, MDE, α 0.05 and power 0.8, and run whole weeks. Then check SRM, analyse once with a z-test or t-test and CI, check guardrails and novelty, and decide by comparing the CI with the MDE.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between a primary metric and a guardrail metric?</summary><div class="qa-body">The primary metric (OEC) is the single number that decides whether the change wins; it should be sensitive within the test period and tied to business value. Guardrail metrics are numbers that must not get worse even if the primary improves, such as latency, crash rate, refunds or unsubscribes. A change that wins on the primary but breaks a guardrail is usually not shipped.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Estimate the sample size: baseline 10%, MDE +1 pp, α 0.05, power 0.8.</summary><div class="qa-body">The rule of thumb is n ≈ 16 × p(1 − p) ÷ δ² = 16 × 0.09 ÷ 0.0001 = 14,400 per arm; the exact formula gives about 14,750. With 2,200 eligible users a day that is about 13.4 days for both arms, rounded up to two full weeks.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What happens to the required sample size if you halve the MDE? If you want 90% power instead of 80%?</summary><div class="qa-body">n is proportional to 1 ÷ δ², so halving the MDE multiplies n by four (about 58,000 per arm for 0.5 pp). Raising power to 90% changes z<sub>1−β</sub> from 0.84 to 1.28, so (1.96 + 1.28)² ÷ (1.96 + 0.84)² ≈ 10.5 ÷ 7.85 ≈ 1.34, about a third more users.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain Type I and Type II errors and power in the context of an A/B test.</summary><div class="qa-body">A Type I error is shipping a change that does nothing because noise looked like a win; its rate is α (5%). A Type II error is missing a real improvement because the test said "not significant"; its rate is β. Power is 1 − β, the chance of detecting a true effect of size MDE; 80% is the usual target, and it is set through the sample size.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your test shows p = 0.03 after 3 days of a planned 14. The PM wants to ship. What do you say?</summary><div class="qa-body">Not yet. Stopping at the first significant look inflates the false-positive rate; checking daily over 14 days pushes it from 5% to roughly 20%. Three days also misses weekly patterns and any novelty effect. Finish the planned run, and if early stopping matters for future tests, use a sequential design such as alpha-spending or always-valid p-values.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Control has 50,000 users and treatment 48,500 in a planned 50/50 test. What now?</summary><div class="qa-body">Run an SRM check: a chi-square test on the counts gives p ≈ 2 × 10⁻⁶, so the split is broken and no metric can be trusted. Look for the cause: treatment crashing on some browsers, a redirect losing users, uneven bot filtering, or logging that fires at different points. Fix it and rerun rather than reading the results.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain this test's p-value and confidence interval to a non-technical manager.</summary><div class="qa-body">"If the new checkout made no difference, a gap as large as 1.1 points would appear only about 2 times in 1,000 experiments, so we're confident the improvement is real. Our best estimate is +1.1 points of conversion, and the plausible range is +0.4 to +1.8 points, which is roughly $200k to $860k a year." Avoid saying the p-value is "the probability the result is due to chance".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>The result is significant, but the lift is 0.1 pp with a CI of [0.02, 0.18] pp. Ship?</summary><div class="qa-body">It is statistically real but practically small. Compare it with the MDE and the costs: if the feature adds maintenance, complexity or risk, probably not; if it is a free configuration change, maybe. Statistical significance answers "is it non-zero?", not "is it worth it?".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>The test came out "not significant". Can you conclude the feature has no effect?</summary><div class="qa-body">Only if the confidence interval is narrow and sits inside ±MDE, which rules out any effect worth having. If the interval is wide and spans zero, the test was underpowered and the honest answer is "we don't know": it may still contain a valuable lift. Absence of evidence is not evidence of absence.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How can you reduce the sample size an experiment needs?</summary><div class="qa-body">Reduce variance: CUPED (adjust for each user's pre-experiment metric, which multiplies variance by 1 − ρ²), stratification, or capping extreme values. Use a more sensitive metric closer to the change, such as checkout completion rather than monthly revenue. Accept a larger MDE, or test fewer variants so α need not be split.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You randomised by user but computed click-through rate per page view. What's wrong?</summary><div class="qa-body">Page views from the same user are correlated, so treating them as independent rows overstates the amount of evidence; the standard error is too small and false positives rise (three times higher in a simulated A/A test). Analyse at the randomisation unit with one row per user, or use the delta method to get the correct variance for the ratio metric.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You test four variants against control at α = 0.05 each. What's the problem and how do you fix it?</summary><div class="qa-body">The chance of at least one false winner is 1 − 0.95⁴ ≈ 18.5%, not 5%. Correct with Bonferroni (test each at 0.0125), Holm, or Dunnett's test, which is built for many-versus-one-control comparisons; this needs more users per arm. Also expect the best arm's lift to be overstated (winner's curse) and confirm it with a re-test or holdout.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between controlling the family-wise error rate and the false discovery rate?</summary><div class="qa-body">Family-wise error rate (Bonferroni, Holm) controls the chance of making even one false discovery, which suits a ship decision. False discovery rate (Benjamini–Hochberg) controls the expected share of discoveries that are false, which is less strict and suits screening many secondary metrics, where a few false leads are acceptable in exchange for more power.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Engagement rose 8% in week 1 but is only +1% in week 3. What's happening?</summary><div class="qa-body">Most likely a novelty effect: curiosity about the new feature wears off. Plot the lift by day, compare new users (who have no novelty) with returning users, and run until the curve flattens. Report the stable long-run lift, around 1%, not the week-1 number.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How would you A/B test a new surge-pricing algorithm at a ride-sharing company?</summary><div class="qa-body">User-level randomisation fails because riders and drivers share one market: treatment changes the supply control sees, violating SUTVA. Use switchback testing, alternating the whole city between algorithms in random time blocks, or randomise by city or region. Analyse at the level of the time block or city, accepting lower power because there are fewer units.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Conversion rose overall in treatment, but fell for both mobile and desktop users separately. How?</summary><div class="qa-body">This is Simpson's paradox: treatment's traffic mix shifted towards the segment that converts better (for example more desktop users), so the overall rate rose while each segment fell. Randomisation should balance segments, so a mix shift like this suggests a bug; check SRM within each segment before trusting anything.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is CUPED and when can it go wrong?</summary><div class="qa-body">CUPED adjusts each user's metric by subtracting θ(X − X̄), where X is the same metric measured before the experiment and θ is the regression slope; variance falls by a factor of 1 − ρ², so fewer users are needed. It stays unbiased only if X is measured before assignment; using an in-experiment covariate that the treatment can affect can remove or invent effect. It helps little for new users with no history.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When should you NOT run an A/B test?</summary><div class="qa-body">When traffic is too low to detect any useful effect in reasonable time; when the change cannot be hidden from the control group (a brand redesign or a public price change); when there are ethical or legal problems with withholding something; or when the decision is small and cheap to reverse. Alternatives include qualitative user research, difference-in-differences on observational data, or a careful before/after with its limitations stated.</div></details>
</main>
`
});
