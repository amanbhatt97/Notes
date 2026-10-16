// notes/softeng/se_git.js — Git & GitHub
Object.assign(TOPIC_CONTENT, {
  "se_git": `<main>
  <h1>Git &amp; GitHub</h1>
  <p class="lead">Git records every version of your code so a team can work in parallel and undo anything. Interviewers expect you to branch, merge, resolve a conflict and recover a mistake without panic; DS repos add data, models and notebooks on top.</p>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sg-model"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">How Git Stores History</span><span class="rm-sub">Snapshots, DAG, HEAD</span></div></div>
      <div class="rm-item rm-done" data-target="sg-areas"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">The Three Areas</span><span class="rm-sub">Working tree → index → repo</span></div></div>
      <div class="rm-item rm-done" data-target="sg-commit"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">Commits &amp; Branches</span><span class="rm-sub">Good messages, cheap pointers</span></div></div>
      <div class="rm-item rm-done" data-target="sg-merge"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Merge vs Rebase</span><span class="rm-sub">Two shapes of history</span></div></div>
      <div class="rm-item rm-done" data-target="sg-conflict"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Resolving a Conflict</span><span class="rm-sub">Real markers, real fix</span></div></div>
      <div class="rm-item rm-done" data-target="sg-pr"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Pull Requests &amp; Review</span><span class="rm-sub">The GitHub team flow</span></div></div>
      <div class="rm-item rm-done" data-target="sg-ignore"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">.gitignore, Tags, Releases</span><span class="rm-sub">What never gets committed</span></div></div>
      <div class="rm-item rm-done" data-target="sg-undo"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Undoing Things Safely</span><span class="rm-sub">restore, revert, reset, reflog</span></div></div>
      <div class="rm-item rm-done" data-target="sg-ds"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Git for Data Science</span><span class="rm-sub">Big files, DVC, notebooks</span></div></div>
      <div class="rm-item rm-done" data-target="sg-rev"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Quick Revision</span><span class="rm-sub">Everything in 9 lines</span></div></div>
      <div class="rm-item rm-done" data-target="sg-qa"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="sg-model"><span class="num">01</span>How Git Stores History</h2>
  <figure class="viz"><svg viewBox="0 0 600 170" width="600">
    <defs><marker id="sg-arr1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <g stroke="currentColor" fill="none" stroke-width="1.5">
      <line x1="122" y1="110" x2="78" y2="110" marker-end="url(#sg-arr1)"/>
      <line x1="222" y1="110" x2="178" y2="110" marker-end="url(#sg-arr1)"/>
      <line x1="322" y1="110" x2="278" y2="110" marker-end="url(#sg-arr1)"/>
      <line x1="322" y1="50" x2="275" y2="98" marker-end="url(#sg-arr1)"/>
      <line x1="422" y1="50" x2="378" y2="50" marker-end="url(#sg-arr1)"/>
    </g>
    <circle cx="50" cy="110" r="22" class="fb sb"/><text x="50" y="115" text-anchor="middle">A</text>
    <circle cx="150" cy="110" r="22" class="fb sb"/><text x="150" y="115" text-anchor="middle">B</text>
    <circle cx="250" cy="110" r="22" class="fb sb"/><text x="250" y="115" text-anchor="middle">C</text>
    <circle cx="350" cy="110" r="22" class="fb sb"/><text x="350" y="115" text-anchor="middle">D</text>
    <circle cx="350" cy="50" r="22" class="ft st"/><text x="350" y="55" text-anchor="middle">E</text>
    <circle cx="450" cy="50" r="22" class="ft st"/><text x="450" y="55" text-anchor="middle">F</text>
    <rect x="395" y="96" width="60" height="28" rx="6" class="fg sg"/><text x="425" y="115" text-anchor="middle">main</text>
    <rect x="495" y="36" width="80" height="28" rx="6" class="fg sg"/><text x="535" y="55" text-anchor="middle">feature</text>
    <rect x="495" y="96" width="60" height="28" rx="6" class="fv"/><text x="525" y="115" text-anchor="middle">HEAD</text>
    <line x1="495" y1="110" x2="458" y2="110" stroke="currentColor" marker-end="url(#sg-arr1)"/>
    <text x="300" y="160" text-anchor="middle" class="tm">each commit points back to its parent(s); branches are just labels on commits</text>
  </svg><figcaption>History is a DAG of snapshots. HEAD → main → D. Committing on main moves only the main label.</figcaption></figure>
  <ul>
    <li><strong>Commit</strong>: a full <em>snapshot</em> of the project (not a diff), plus author, message and parent pointer(s).</li>
    <li><strong>DAG</strong> (directed acyclic graph): commits point to parents, never forward. A merge commit has two parents.</li>
    <li><strong>Branch</strong>: a 41-byte file holding one commit hash. Creating one is instant.</li>
    <li><strong>HEAD</strong>: "where you are now" — usually points to a branch name.</li>
  </ul>
  <p>Real objects from a tiny repo (<code>git cat-file -p</code> prints an object):</p>
  <div class="fx" data-lang="text">$ git cat-file -p HEAD
tree 703aabb90ba7582fd56b035e2d58f90a0989ae97
parent 75e647279234b1e9875806fb92b32e79c4eeffc0
author Asha &lt;asha@example.com&gt; 1792132054 +0000
committer Asha &lt;asha@example.com&gt; 1792132054 +0000

Add epochs

$ git cat-file -p HEAD^{tree}
040000 tree 0fcda21f6a0da5d45e8c1f6a242ff0ff4af7c7eb	src
100644 blob ea53b8c8491e45d7f131df499bade220eafa9a62	train.py

$ cat .git/HEAD;  cat .git/refs/heads/main
ref: refs/heads/main
53e648e28035973b7b326a22a10d5fbadeb19f35</div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A photo album: each commit is a photo of the whole room, captioned and linked to the previous photo. A branch is a sticky note on one photo. Unchanged files are not re-stored — the snapshot just reuses the same blob hash.</p>
  </div>

  <h2 id="sg-areas"><span class="num">02</span>The Three Areas</h2>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600">
    <defs><marker id="sg-arr2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="20" width="160" height="60" rx="8" class="fs"/><text x="90" y="46" text-anchor="middle">Working tree</text><text x="90" y="66" text-anchor="middle" class="tm">files you edit</text>
    <rect x="220" y="20" width="160" height="60" rx="8" class="fb sb"/><text x="300" y="46" text-anchor="middle">Index (staging)</text><text x="300" y="66" text-anchor="middle" class="tm">next commit draft</text>
    <rect x="430" y="20" width="160" height="60" rx="8" class="fg sg"/><text x="510" y="46" text-anchor="middle">Repository</text><text x="510" y="66" text-anchor="middle" class="tm">.git (commits)</text>
    <g stroke="currentColor" fill="none" stroke-width="1.5">
      <line x1="172" y1="40" x2="216" y2="40" marker-end="url(#sg-arr2)"/>
      <line x1="382" y1="40" x2="426" y2="40" marker-end="url(#sg-arr2)"/>
      <path d="M510,82 C510,130 90,130 90,84" marker-end="url(#sg-arr2)"/>
      <path d="M300,82 C300,105 120,105 100,86" marker-end="url(#sg-arr2)" stroke-dasharray="4 3"/>
    </g>
    <text x="194" y="32" text-anchor="middle" class="tb">add</text>
    <text x="404" y="32" text-anchor="middle" class="tb">commit</text>
    <text x="300" y="140" text-anchor="middle" class="tm">switch / restore --source copies commits back to files</text>
  </svg><figcaption>You choose exactly what goes into a commit by staging it first.</figcaption></figure>
  <div class="fx" data-lang="text">$ echo "BATCH_SIZE = 32" &gt;&gt; train.py; git add train.py   # staged
$ echo "SEED = 42" &gt;&gt; train.py                            # edited again, not staged
$ echo notes &gt; notes.md                                  # brand-new file
$ git status --short
MM train.py
?? notes.md</div>
  <p><code>MM</code>: left letter = index vs last commit, right letter = working tree vs index. <code>??</code> = untracked. <code>git diff</code> shows unstaged changes; <code>git diff --staged</code> shows what will be committed.</p>

  <h2 id="sg-commit"><span class="num">03</span>Commits &amp; Branches</h2>
  <table class="tbl">
    <tr><th>Bad message</th><th>Good message</th></tr>
    <tr><td>fix</td><td>Fix NaN loss when batch has all-zero labels</td></tr>
    <tr><td>updates</td><td>Add stratified split to keep class ratio in val set</td></tr>
    <tr><td>wip stuff final v2</td><td>Cache tokenizer output to cut preprocessing 40%</td></tr>
  </table>
  <ul>
    <li>Subject ≤ ~50 chars, imperative ("Add", not "Added"). Blank line, then body: <em>why</em>, not what.</li>
    <li>One logical change per commit, so it can be reviewed and reverted alone.</li>
  </ul>
  <div class="fx" data-lang="text">git switch -c feature/tune-lr     # create + move to branch
git branch                        # list (* = current)
git switch main                   # go back
git branch -d feature/tune-lr     # delete after merge</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><strong>Detached HEAD</strong>: after <code>git checkout &lt;hash&gt;</code>, HEAD points at a commit, not a branch. New commits there belong to no branch; make one with <code>git switch -c rescue</code> before leaving.</p>
  </div>

  <h2 id="sg-merge"><span class="num">04</span>Merge vs Rebase</h2>
  <p>Start: <code>feature</code> (C, D) branched from B; <code>main</code> got E meanwhile.</p>
  <figure class="viz"><svg viewBox="0 0 600 190" width="600">
    <text x="140" y="18" text-anchor="middle" class="tb">git merge feature (on main)</text>
    <text x="455" y="18" text-anchor="middle" class="tb">git rebase main (on feature)</text>
    <g stroke="currentColor" fill="none" stroke-width="1.5">
      <line x1="45" y1="120" x2="55" y2="120"/><line x1="85" y1="120" x2="195" y2="120"/><line x1="78" y1="107" x2="102" y2="73"/><line x1="125" y1="60" x2="155" y2="60"/><line x1="182" y1="70" x2="237" y2="108"/><line x1="225" y1="120" x2="233" y2="120"/>
      <line x1="345" y1="120" x2="365" y2="120"/><line x1="395" y1="120" x2="415" y2="120"/><line x1="445" y1="120" x2="475" y2="120"/><line x1="505" y1="120" x2="535" y2="120"/>
    </g>
    <line x1="300" y1="30" x2="300" y2="180" stroke="currentColor" stroke-dasharray="3 4"/>
    <circle cx="30" cy="120" r="15" class="fb sb"/><text x="30" y="125" text-anchor="middle">A</text>
    <circle cx="70" cy="120" r="15" class="fb sb"/><text x="70" y="125" text-anchor="middle">B</text>
    <circle cx="110" cy="60" r="15" class="ft st"/><text x="110" y="65" text-anchor="middle">C</text>
    <circle cx="170" cy="60" r="15" class="ft st"/><text x="170" y="65" text-anchor="middle">D</text>
    <circle cx="210" cy="120" r="15" class="fb sb"/><text x="210" y="125" text-anchor="middle">E</text>
    <circle cx="250" cy="120" r="17" class="fg sg"/><text x="250" y="125" text-anchor="middle">M</text>
    <text x="280" y="160" text-anchor="end" class="tm">M has 2 parents</text>
    <circle cx="330" cy="120" r="15" class="fb sb"/><text x="330" y="125" text-anchor="middle">A</text>
    <circle cx="380" cy="120" r="15" class="fb sb"/><text x="380" y="125" text-anchor="middle">B</text>
    <circle cx="430" cy="120" r="15" class="fb sb"/><text x="430" y="125" text-anchor="middle">E</text>
    <circle cx="490" cy="120" r="15" class="ft st"/><text x="490" y="125" text-anchor="middle">C'</text>
    <circle cx="550" cy="120" r="15" class="ft st"/><text x="550" y="125" text-anchor="middle">D'</text>
    <text x="520" y="160" text-anchor="middle" class="tm">new hashes, linear</text>
  </svg><figcaption>Merge keeps true history and adds M. Rebase replays C, D on top of E as new commits C', D'.</figcaption></figure>
  <p>Real output from the rebase case:</p>
  <div class="fx" data-lang="text">$ git log --oneline --graph --all        # before
* 36aa63f D
* 0159d8e C
| * 1733598 E
|/
* 2c12dce B
* a6639f3 A
$ git switch feature &amp;&amp; git rebase main
Successfully rebased and updated refs/heads/feature.
$ git log --oneline --graph --all        # after: C, D got new hashes
* de35266 D
* d030de7 C
* 1733598 E
* 2c12dce B
* a6639f3 A</div>
  <table class="tbl">
    <tr><th></th><th>Merge</th><th>Rebase</th></tr>
    <tr><td>History</td><td>True, branchy</td><td>Linear, rewritten</td></tr>
    <tr><td>Commit hashes</td><td>Unchanged</td><td>New for replayed commits</td></tr>
    <tr><td>Safe on shared branch?</td><td>Yes</td><td>No — others still have the old commits</td></tr>
    <tr><td>Use for</td><td>Bringing a finished feature into main</td><td>Tidying your own branch before a PR</td></tr>
  </table>
  <div class="callout trap"><span class="label">Golden rule</span>
    <p>Never rebase commits others have pulled. Fast-forward merge (no M) happens when main has no new commits: Git just slides the label forward.</p>
  </div>

  <h2 id="sg-conflict"><span class="num">05</span>Resolving a Conflict</h2>
  <div class="flow"><span>Both branches edit the same line</span><span>merge stops</span><span>edit file</span><span>git add</span><span>git commit</span></div>
  <p>Real run: <code>main</code> set lr to 0.05, <code>feature/tune-lr</code> set it to 0.001.</p>
  <div class="fx" data-lang="text">$ git merge feature/tune-lr
Auto-merging train.py
CONFLICT (content): Merge conflict in train.py
Automatic merge failed; fix conflicts and then commit the result.

$ cat train.py
&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD
LEARNING_RATE = 0.05
=======
LEARNING_RATE = 0.001
&gt;&gt;&gt;&gt;&gt;&gt;&gt; feature/tune-lr
EPOCHS = 10

$ git status --short
UU train.py</div>
  <ul>
    <li>Between <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD</code> and <code>=======</code>: your current branch. Below it: the incoming branch.</li>
    <li>Fix = write the final content and delete all three marker lines. It may be either side, both, or something new.</li>
  </ul>
  <div class="fx" data-lang="text">$ printf 'LEARNING_RATE = 0.001&#92;nEPOCHS = 10&#92;n' &gt; train.py   # chosen result
$ git add train.py
$ git commit -m "Merge feature/tune-lr: keep lr 0.001"
$ git log --oneline --graph
*   d3dda69 Merge feature/tune-lr: keep lr 0.001
|&#92;
| * e63408d Lower learning rate to 0.001
* | 67eb268 Raise learning rate to 0.05
|/
* 08ce8ac Add training config</div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Committing leftover markers breaks the code (Python sees <code>&lt;&lt;&lt;</code> as a syntax error). Run tests before committing. Scared? <code>git merge --abort</code> returns to before the merge.</p>
  </div>

  <h2 id="sg-pr"><span class="num">06</span>Pull Requests &amp; Code Review</h2>
  <div class="flow"><span>branch from main</span><span>commit + push</span><span>open PR</span><span>CI runs tests</span><span>review + fix</span><span>merge (squash)</span><span>delete branch</span></div>
  <div class="fx" data-lang="text">git switch -c feat/stratified-split
git commit -am "Add stratified split"
git push -u origin feat/stratified-split    # -u: remember upstream
# open the PR on GitHub (or: gh pr create --fill)
git pull --rebase origin main               # keep branch current</div>
  <div class="cards">
    <div><b>Small PRs</b><p>Under ~400 lines gets a real review; 3,000 lines gets "LGTM".</p></div>
    <div><b>Description</b><p>What, why, how tested, screenshots/metrics for model changes.</p></div>
    <div><b>Reviewer checks</b><p>Correctness, edge cases, tests, naming, leakage, secrets.</p></div>
    <div><b>Merge styles</b><p>Merge commit, squash (1 commit), or rebase-and-merge.</p></div>
  </div>
  <p><strong>Fork</strong> = your server-side copy of someone else's repo; you PR from it. <code>origin</code> is the default name of the remote you cloned from. <code>fetch</code> downloads; <code>pull</code> = fetch + merge (or rebase).</p>

  <h2 id="sg-ignore"><span class="num">07</span>.gitignore, Tags &amp; Releases</h2>
  <div class="fx" data-lang="text">$ cat .gitignore
data/
models/*.pkl
.env
__pycache__/
.ipynb_checkpoints/

$ git check-ignore -v data/train.csv models/rf.pkl .env
.gitignore:1:data/	data/train.csv
.gitignore:2:models/*.pkl	models/rf.pkl
.gitignore:3:.env	.env</div>
  <p><code>check-ignore -v</code> shows which rule hides a file. In DS repos ignore raw data, model binaries, secrets (<code>.env</code>, keys), caches and virtualenvs.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>.gitignore does not untrack files already committed: use <code>git rm --cached file</code>. A pushed secret is leaked even after deletion (history keeps it) — <strong>rotate the key</strong> first, then purge history.</p>
  </div>
  <div class="fx" data-lang="text">$ git tag -a v1.0.0 -m "First release"     # annotated tag on HEAD
$ git push origin v1.0.0
$ git describe
v1.0.0</div>
  <p>A <strong>tag</strong> is a branch that never moves — perfect for "the model in production was trained from v1.0.0". A GitHub <strong>Release</strong> = tag + notes + attached files. Use semantic versions: MAJOR.MINOR.PATCH.</p>

  <h2 id="sg-undo"><span class="num">08</span>Undoing Things Safely</h2>
  <table class="tbl">
    <tr><th>Situation</th><th>Command</th><th>Rewrites history?</th></tr>
    <tr><td>Discard edits to a file</td><td><code>git restore file</code></td><td>No (but edits are lost)</td></tr>
    <tr><td>Unstage a file</td><td><code>git restore --staged file</code></td><td>No</td></tr>
    <tr><td>Fix the last (unpushed) commit</td><td><code>git commit --amend</code></td><td>Yes</td></tr>
    <tr><td>Undo a pushed commit</td><td><code>git revert &lt;hash&gt;</code></td><td>No — adds an inverse commit</td></tr>
    <tr><td>Throw away local commits</td><td><code>git reset --hard HEAD~2</code></td><td>Yes</td></tr>
    <tr><td>"I lost a commit"</td><td><code>git reflog</code> then <code>git reset --hard HEAD@{n}</code></td><td>Recovery</td></tr>
  </table>
  <div class="fx" data-lang="text">$ git revert --no-edit HEAD
[feature 0c65d0d] Revert "D"
$ git reset --hard HEAD~2
HEAD is now at d030de7 C
$ git reflog -4
d030de7 HEAD@{0}: reset: moving to HEAD~2
0c65d0d HEAD@{1}: revert: Revert "D"
de35266 HEAD@{2}: rebase (finish): returning to refs/heads/feature
de35266 HEAD@{3}: rebase (pick): D</div>
  <p>Reset "lost" D and its revert, but reflog still lists them; <code>git reset --hard de35266</code> brings D back.</p>
  <div class="cards">
    <div><b>reset --soft</b><p>Move branch; keep changes staged.</p></div>
    <div><b>reset --mixed</b><p>Default. Move branch; keep changes unstaged.</p></div>
    <div><b>reset --hard</b><p>Move branch; delete changes. Dangerous.</p></div>
  </div>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p><strong>revert</strong> is a correction notice printed in tomorrow's paper. <strong>reset</strong> is pulping today's edition — fine before delivery, chaos after. <strong>reflog</strong> is the CCTV of where HEAD has been (local only, ~90 days).</p>
  </div>

  <h2 id="sg-ds"><span class="num">09</span>Git for Data Science</h2>
  <figure class="viz"><svg viewBox="0 0 600 130" width="600">
    <defs><marker id="sg-arr3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="30" width="170" height="70" rx="8" class="fb sb"/><text x="95" y="56" text-anchor="middle">Git repo</text><text x="95" y="78" text-anchor="middle" class="tm">code + pointer</text>
    <rect x="250" y="30" width="110" height="70" rx="8" class="fs"/><text x="305" y="60" text-anchor="middle">pointer</text><text x="305" y="80" text-anchor="middle" class="tm">hash + size</text>
    <rect x="430" y="30" width="160" height="70" rx="8" class="fg sg"/><text x="510" y="56" text-anchor="middle">Big-file storage</text><text x="510" y="78" text-anchor="middle" class="tm">LFS / S3 / GCS</text>
    <g stroke="currentColor" fill="none" stroke-width="1.5"><line x1="182" y1="65" x2="246" y2="65" marker-end="url(#sg-arr3)"/><line x1="362" y1="65" x2="426" y2="65" marker-end="url(#sg-arr3)"/></g>
  </svg><figcaption>Git versions a small pointer; the 2 GB file lives elsewhere and is fetched by hash.</figcaption></figure>
  <p>Real Git LFS pointer for a 2 MB <code>model.onnx</code> — this is all Git stores:</p>
  <div class="fx" data-lang="text">$ git lfs track "*.onnx"
$ git add .gitattributes model.onnx &amp;&amp; git commit -m "Add model via LFS"
$ git show HEAD:model.onnx
version https://git-lfs.github.com/spec/v1
oid sha256:26de04576232220841755884b032381258d5ba5b6f63aaf432cc2364ec1903f8
size 2000000</div>
  <div class="cards">
    <div><b>Git LFS</b><p>Large binaries (models, images) behind pointers. GitHub quota applies.</p><small>git lfs track</small></div>
    <div><b>DVC</b><p>Versions datasets + pipelines; <code>.dvc</code> pointer in Git, data in S3/GCS.</p><small>dvc add / dvc push (not run here)</small></div>
    <div><b>Notebooks</b><p>.ipynb is JSON with outputs — noisy diffs. Strip outputs (<code>nbstripout</code>), diff with <code>nbdime</code>, or pair with a .py via Jupytext.</p></div>
  </div>
  <div class="fx" data-lang="text">dvc add data/train.csv          # writes data/train.csv.dvc (pointer) + adds data to .gitignore
git add data/train.csv.dvc data/.gitignore
git commit -m "Track training data v1"
dvc push                         # upload data to remote storage</div>
  <div class="callout intu"><span class="label">Why it matters</span>
    <p>Reproducibility = same <strong>code commit</strong> + same <strong>data version</strong> + same <strong>params</strong>. Git alone covers only the first.</p>
  </div>

  <h2 id="sg-rev"><span class="num">10</span>Quick Revision</h2>
  <div class="panel"><ol>
    <li><strong>Commit</strong> = snapshot + parent pointer; history is a DAG.</li>
    <li><strong>Branch</strong> = movable pointer; <strong>HEAD</strong> = where you are; <strong>tag</strong> = fixed pointer.</li>
    <li>Working tree → <code>add</code> → index → <code>commit</code> → repo.</li>
    <li><strong>Merge</strong> keeps history (merge commit); <strong>rebase</strong> rewrites it linear — never on shared branches.</li>
    <li>Conflict: edit file, remove markers, <code>git add</code>, <code>git commit</code> (or <code>--abort</code>).</li>
    <li>PR flow: branch → push → PR → CI → review → squash-merge.</li>
    <li>Pushed mistake → <code>revert</code>. Local mess → <code>reset</code>. Lost commit → <code>reflog</code>.</li>
    <li>Ignore data, models, <code>.env</code>; a leaked secret must be rotated.</li>
    <li>Big files → LFS/DVC pointers; notebooks → strip outputs.</li>
  </ol></div>

  <h2 id="sg-qa"><span class="num">11</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>Does Git store diffs or snapshots?</summary><div class="qa-body">Snapshots: each commit points to a tree of the whole project. Unchanged files reuse the same blob, so it's cheap. (Packfiles compress with deltas on disk, but that's a storage detail.)</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a branch, physically?</summary><div class="qa-body">A file in <code>.git/refs/heads/</code> containing one commit hash. Committing moves it forward. That's why branching is instant and cheap.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Merge vs rebase — when do you use each?</summary><div class="qa-body">Rebase your own unpushed/feature branch onto main to get a clean linear history before a PR. Merge (or squash-merge) to integrate into a shared branch. Never rebase commits others have — it creates new hashes and duplicates.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You pushed a commit that broke production. How do you undo it?</summary><div class="qa-body"><code>git revert &lt;hash&gt;</code> and push. It adds a new commit that inverts the bad one, so nobody's history is rewritten. Don't <code>reset</code> + force-push a shared branch.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output of <code>git status --short</code> after you stage a file, then edit it again?</summary><div class="qa-body"><code>MM file</code>: modified in the index (vs HEAD) and modified again in the working tree (vs index). Committing now saves only the staged version.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Walk me through resolving a merge conflict.</summary><div class="qa-body"><code>git status</code> lists <code>UU</code> files. Open each, pick or combine the sections between <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code>, <code>=======</code>, <code>&gt;&gt;&gt;&gt;&gt;&gt;&gt;</code>, delete markers, run tests, <code>git add</code>, <code>git commit</code>. Talk to the other author if intent is unclear.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>reset --soft vs --mixed vs --hard?</summary><div class="qa-body">All move the branch pointer. Soft keeps changes staged; mixed (default) keeps them in the working tree, unstaged; hard discards them. Hard is the only one that loses work (reflog can still find the commits).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You accidentally ran <code>git reset --hard</code> and lost 3 commits. Recover them.</summary><div class="qa-body"><code>git reflog</code> to find the hash HEAD was at before the reset, then <code>git reset --hard HEAD@{1}</code> (or that hash). Uncommitted changes, though, are gone.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You committed an AWS key last week and pushed. What do you do?</summary><div class="qa-body">Revoke/rotate the key immediately — assume it's compromised. Then remove it from history (<code>git filter-repo</code> or BFG), force-push, and add the file to .gitignore; load secrets from env vars or a secret manager.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why not commit a 3 GB training CSV, and what instead?</summary><div class="qa-body">Every clone downloads every version forever; GitHub rejects files over 100 MB. Use DVC (or LFS) so Git stores a small pointer and the data lives in S3/GCS, versioned by hash.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why are notebooks painful in Git and how do you fix it?</summary><div class="qa-body">An .ipynb is JSON containing outputs, images and execution counts, so tiny changes give huge diffs and conflicts. Strip outputs before commit (nbstripout / pre-commit hook), review with nbdime, or keep a paired .py via Jupytext; move reusable code into modules.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>fetch vs pull?</summary><div class="qa-body"><code>fetch</code> downloads remote commits and updates <code>origin/main</code> without touching your branch. <code>pull</code> = fetch + merge (or rebase with <code>--rebase</code>) into your current branch.</div></details>
</main>`
});
