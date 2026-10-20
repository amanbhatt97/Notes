// notes/softeng/se_git.js — Git & GitHub
Object.assign(TOPIC_CONTENT, {
  "se_git": `<main>
<h1>Git &amp; GitHub</h1>
  <div class="where"><span>Software Engineering</span><span>Git &amp; GitHub</span></div>
  <p class="lead">Git keeps every saved version of a project, so you can go back in time, try ideas on the side and work with a team without overwriting each other. GitHub is a website that hosts Git projects and adds pull requests and code review. Every DS, ML and backend job uses both, and interviewers expect you to branch, merge, fix a conflict and undo a mistake calmly. This note follows one small project from chaos to a tagged release: the chai stall's <code>sales_report.py</code>, which reads Monday's sheet <code>orders_2026-10-19.csv</code> (9 rows) and prints <strong>Total sales: ₹230 from 6 valid orders, rejected: 3</strong>. Every command was really run (git 2.43, Python 3.13) in a scratch folder and its output is pasted as printed; the scratch folder is shown as <code>/home/meera</code> (<code>~</code>).</p>

  <h2 id="sg-fits" class="open"><span class="num">★</span>Where this fits</h2>
  <figure class="viz"><svg viewBox="0 0 660 200" width="660">
<defs><marker id="sg-a0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="220" y="8" width="220" height="34" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="330" y="30" text-anchor="middle" font-size="12">Software Engineering track</text>
<line x1="330" y1="42" x2="115" y2="70" stroke="currentColor" stroke-opacity="0.45"/><line x1="330" y1="42" x2="330" y2="70" stroke="currentColor" stroke-opacity="0.45"/><line x1="330" y1="42" x2="545" y2="70" stroke="currentColor" stroke-opacity="0.45"/>
<rect x="20" y="72" width="190" height="52" rx="7" class="fg sg" stroke-width="2.5"/><text x="115" y="93" text-anchor="middle" font-size="12" font-weight="700">1 · Git &amp; GitHub</text><text x="115" y="111" text-anchor="middle" class="tg" font-size="10">YOU ARE HERE · version the script</text>
<rect x="235" y="72" width="190" height="52" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="330" y="93" text-anchor="middle" font-size="12">2 · Linux &amp; Terminal</text><text x="330" y="111" text-anchor="middle" class="tm" font-size="10">run it on a server, cron, logs</text>
<rect x="450" y="72" width="190" height="52" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="545" y="93" text-anchor="middle" font-size="12">3 · Docker</text><text x="545" y="111" text-anchor="middle" class="tm" font-size="10">ship it + Postgres anywhere</text>
<line x1="210" y1="98" x2="233" y2="98" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#sg-a0)"/><line x1="425" y1="98" x2="448" y2="98" stroke="currentColor" stroke-dasharray="3 3" marker-end="url(#sg-a0)"/>
<text x="330" y="152" text-anchor="middle" class="tm" font-size="10.5">one running example: sales_report.py + orders_2026-10-19.csv → Total sales: ₹230 from 6 valid orders, rejected: 3</text>
<text x="330" y="172" text-anchor="middle" class="tm" font-size="10.5">this note ends with tag v1.0.0 on a shared server repo; the Linux note clones exactly that tag</text>
</svg><figcaption>The Software Engineering track is one story in three steps. Git keeps the script's history safe, Linux runs it every night, Docker packs it with its database.</figcaption></figure>
  <ol class="story">
    <li><b>Came from: <a class="xref" data-note="py_modules">Modules, Packages &amp; Environments</a></b><span>The Python track ended with working code for the chai stall: a script that reads the day's order sheet, skips bad rows and prints the total. Left open: the code lives in one folder on one laptop. Copies multiply (<code>final</code>, <code>final_v2_REAL</code>), nobody knows which one gave the right ₹230, and a teammate cannot work on it safely at the same time.</span></li>
    <li><b>This note adds: history and teamwork for code</b><span>Commits (snapshots), the object model behind them, staging, history and diffs, branches, merges, conflicts, rebase, remotes, pull requests, undoing mistakes, .gitignore and tags.</span></li>
    <li><b>Leads to</b><span><a class="xref" data-note="se_linux">Linux &amp; Terminal</a> (clone the tagged script onto a server, run it every night with cron and analyse its log) and then <a class="xref" data-note="se_docker">Docker</a> (pack the same commit, Python and a Postgres database into images). Git is also the first half of reproducibility in <a class="xref" data-note="mlops_lifecycle">MLOps</a>.</span></li>
  </ol>

  <h2 id="sg-ladder" class="open"><span class="num">?</span>The Question Ladder</h2>
  <p>The whole note as one chain. Each idea answers the question above it; its weakness raises the next question. Running example: <code>sales_report.py</code> on <code>sample_orders.csv</code> (the 9-row Monday sheet), worked on by Meera and later her cousin Ravi.</p>
  <ol class="story">
    <li><b>The chaos</b><span>Q: why not just keep copies? → Four copies of the script gave four different answers (a crash, ₹210, ₹230, "Rs 230") and nothing says which is current or what changed. We need saved versions with notes, in one place.</span></li>
    <li><b>Snapshots (commits)</b><span>Q: how do we save a version? → <code>git init</code>, <code>git add</code>, <code>git commit</code>: a commit is a saved snapshot of the project with a message. Two commits, one file, two versions. But what exactly did Git save, and why are commits so cheap?</span></li>
    <li><b>What a commit really is</b><span>Q: what is inside <code>.git</code>? → Three object types named by their content hash: blob (file content), tree (folder), commit (tree + parent + author + message). The unchanged CSV is one blob shared by both commits. But a commit takes whatever we hand it; how do we hand it only part of our work?</span></li>
    <li><b>The staging area</b><span>Q: how do we commit the finished change but not the debug line next to it? → <code>git add</code> copies content into the index, the draft of the next commit; <code>git diff --staged</code> shows exactly what will be saved. Now we have several commits; how do we read them?</span></li>
    <li><b>History &amp; diff</b><span>Q: what changed, when, and why? → <code>git log</code>, <code>git show</code>, <code>git diff A B</code>, <code>git blame</code>, plus messages that say why. But all of it is on one line of work; how do we try an idea without risking the working version?</span></li>
    <li><b>Branches are pointers</b><span>Q: how do we work on the side? → A branch is a 41-byte file holding one commit hash (<code>cat .git/refs/heads/main</code>); HEAD says which branch you are on. Committing moves only that pointer. But the side work has to come back…</span></li>
    <li><b>Merge: fast-forward vs three-way</b><span>Q: how do two lines of work become one? → If main did not move, the pointer just slides (fast-forward). If both moved, Git compares both tips with their common ancestor and writes a merge commit with two parents. But what if both sides changed the same line?</span></li>
    <li><b>Conflicts</b><span>Q: what happens when Git cannot decide? → It stops, writes both versions between markers, marks the file <code>UU</code>; you write the final line, <code>git add</code>, <code>git commit</code>. Merges join history honestly but make it branchy; is there a cleaner way?</span></li>
    <li><b>Rebase vs merge</b><span>Q: can history stay a straight line? → <code>git rebase</code> replays your commits on top of main as new commits (new hashes), then main fast-forwards. Same files, different shape. Golden rule: never rebase what others already have. So far everything is on one laptop…</span></li>
    <li><b>Remotes: push, fetch, pull</b><span>Q: how do Meera and Ravi share? → A remote is another full copy (here a bare repo standing in for GitHub); <code>push</code> uploads, <code>fetch</code> downloads into <code>origin/main</code>, <code>pull</code> = fetch + merge. A rejected push means someone pushed first. But who checks code before it reaches main?</span></li>
    <li><b>Pull requests &amp; review</b><span>Q: how does a team check changes before they land? → Push a branch, open a PR: its page is <code>git log main..branch</code> + <code>git diff main...branch</code> + tests + comments; merge (often squash) after approval. Mistakes still get through…</span></li>
    <li><b>Undoing things</b><span>Q: how do we take back a change? → <code>restore</code> (edits), <code>restore --staged</code> (staging), <code>commit --amend</code> (last unpushed commit), <code>revert</code> (pushed commit, safe), <code>reset</code> (move the branch; <code>--hard</code> deletes work ⚠), <code>reflog</code> (recover commits). But some files should never have been committed at all…</span></li>
    <li><b>.gitignore &amp; tags</b><span>Q: what stays out, and how do we name a release? → <code>.gitignore</code> keeps data, outputs and <code>.env</code> out (but not files already tracked, and not old commits); an annotated tag <code>v1.0.0</code> names the exact commit we deploy. Big data files need one more tool…</span></li>
    <li><b>Git for data science</b><span>Q: what about 2 GB data and model files? → Keep a pointer (hash + size) in Git and the file elsewhere: Git LFS or DVC. Code + data version + parameters = a reproducible result.</span></li>
  </ol>

  <h2 id="sg-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Git &amp; GitHub</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why &amp; first commits</div>
        <ul>
          <li><b>Problem</b> — <code>sales_report_final_v2_REAL.py</code>: 4 copies, 4 answers</li>
          <li><b>Repo</b> — project folder + hidden <code>.git</code> folder with all history</li>
          <li><b>Setup once</b> — <code>git config --global user.name / user.email</code></li>
          <li><b>Loop</b> — edit → <code>git add</code> → <code>git commit -m "…"</code> → <code>git log --oneline</code></li>
          <li><b>Git vs GitHub</b> — tool on your laptop vs website that hosts repos + PRs</li>
          <li>💡 save points in a video game, each with a note</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">What a commit is</div>
        <ul>
          <li><b>blob</b> file content · <b>tree</b> folder listing · <b>commit</b> tree + parent + author + message</li>
          <li><b>Named by hash</b> (SHA-1 of content): same content → same blob, stored once</li>
          <li><b>Snapshots, not diffs</b>; diffs are computed on demand</li>
          <li><b>Inspect</b> — <code>git cat-file -p HEAD</code>, <code>HEAD^{tree}</code>, <code>git hash-object</code></li>
          <li><b>History = DAG</b>: child → parent; merge commit has 2 parents</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Staging area</div>
        <ul>
          <li><b>Working tree</b> → <code>add</code> → <b>index</b> → <code>commit</code> → <b>repository</b></li>
          <li><b><code>status --short</code></b> — left = staged, right = not staged
            <ul><li><code>A</code> new · <code>MM</code> staged then edited · <code>??</code> untracked · <code>UU</code> conflict</li></ul>
          </li>
          <li><b><code>git diff</code></b> = not staged yet; <b><code>--staged</code></b> = going into the commit</li>
          <li>⚠ <code>add</code> copies content <em>at that moment</em></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">History &amp; diff</div>
        <ul>
          <li><code>git log</code>, <code>--oneline</code>, <code>--stat</code>, <code>--graph --all --decorate</code></li>
          <li><code>git show HASH</code> · <code>git diff A B</code> · <code>git log -- file</code> · <code>git blame</code></li>
          <li><b>Messages</b> — imperative subject ≤ ~50 chars; body says <em>why</em></li>
          <li><b>One logical change per commit</b> — easy to review and revert</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Branches &amp; HEAD</div>
        <ul>
          <li><b>Branch</b> = file in <code>.git/refs/heads/</code> with one commit hash</li>
          <li><b>HEAD</b> = "you are here": <code>ref: refs/heads/main</code></li>
          <li><code>git switch -c feature/x</code> · <code>git switch main</code> · <code>git branch -d</code></li>
          <li>Committing moves only the branch HEAD points to</li>
          <li>⚠ <b>Detached HEAD</b> → <code>git switch -c rescue</code> to keep work</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Merge &amp; conflicts</div>
        <ul>
          <li><b>Fast-forward</b> — main did not move → pointer slides, no new commit</li>
          <li><b>Three-way</b> — base + ours + theirs → merge commit with 2 parents</li>
          <li><b>Conflict</b> — both changed the same lines → <code>UU</code> + markers</li>
          <li><b>Fix</b> — write final text, delete markers → <code>add</code> → <code>commit</code>; <code>merge --abort</code> escapes</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Rebase</div>
        <ul>
          <li>Replays your commits on top of main → straight line, <em>new hashes</em></li>
          <li>Same files as a merge; different history shape</li>
          <li><b>Use</b> — tidy your own branch before a PR</li>
          <li>⚠ <b>Golden rule</b> — never rebase commits others already pulled</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Remotes &amp; PRs</div>
        <ul>
          <li><b>origin</b> = the copy you cloned; <code>origin/main</code> = last-known view of it</li>
          <li><b>clone</b> copy · <b>push</b> upload · <b>fetch</b> download only · <b>pull</b> = fetch + merge</li>
          <li><b>Rejected push</b> → <code>pull --rebase</code>, then push; never force on shared branches</li>
          <li><b>PR</b> = <code>log main..branch</code> + <code>diff main...branch</code> + CI + review → squash-merge</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Undoing safely</div>
        <ul>
          <li><b><code>restore file</code></b> drop edits · <b><code>restore --staged</code></b> unstage</li>
          <li><b><code>commit --amend</code></b> fix the last <em>unpushed</em> commit</li>
          <li><b><code>revert HASH</code></b> new opposite commit; safe after push</li>
          <li><b><code>reset</code></b> <code>--soft</code> keep staged · <code>--mixed</code> keep unstaged · <code>--hard</code> ⚠ delete</li>
          <li><b><code>reflog</code></b> → <code>reset --hard HEAD@{1}</code> recovers commits (not uncommitted edits)</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">.gitignore, tags, big files</div>
        <ul>
          <li><b>Ignore</b> <code>data/</code>, <code>out/</code>, <code>.env</code>, <code>__pycache__/</code>, <code>.venv/</code>; <code>check-ignore -v</code></li>
          <li>⚠ Already tracked → <code>git rm --cached</code>; old commits still hold it → rotate secrets</li>
          <li><b>Tag</b> <code>git tag -a v1.0.0 -m …</code>; push it explicitly; <code>git describe</code></li>
          <li><b>LFS / DVC</b> — pointer (hash + size) in Git, file elsewhere</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sg-ladder"><span class="rm-num">?</span><div class="rm-text"><span class="rm-label">The Question Ladder</span><span class="rm-sub">The note as one chain</span></div></div>
      <div class="rm-item rm-done" data-target="sg-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">The Chaos</span><span class="rm-sub">final_v2_REAL.py</span></div></div>
      <div class="rm-item rm-done" data-target="sg-first"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Snapshots: First Commits</span><span class="rm-sub">init, add, commit, log</span></div></div>
      <div class="rm-item rm-done" data-target="sg-model"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">What a Commit Really Is</span><span class="rm-sub">blob, tree, commit</span></div></div>
      <div class="rm-item rm-done" data-target="sg-areas"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">The Staging Area</span><span class="rm-sub">Why a draft step</span></div></div>
      <div class="rm-item rm-done" data-target="sg-history"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">History &amp; Diff</span><span class="rm-sub">log, show, diff, blame</span></div></div>
      <div class="rm-item rm-done" data-target="sg-branch"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Branches Are Pointers</span><span class="rm-sub">cat .git/refs</span></div></div>
      <div class="rm-item rm-done" data-target="sg-merge"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Merging</span><span class="rm-sub">Fast-forward vs three-way</span></div></div>
      <div class="rm-item rm-done" data-target="sg-conflict"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Conflicts</span><span class="rm-sub">Reproduced and resolved</span></div></div>
      <div class="rm-item rm-done" data-target="sg-rebase"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Rebase vs Merge</span><span class="rm-sub">Same history, two shapes</span></div></div>
      <div class="rm-item rm-done" data-target="sg-remote"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Remotes</span><span class="rm-sub">push, fetch, pull</span></div></div>
      <div class="rm-item rm-done" data-target="sg-pr"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Pull Requests &amp; Review</span><span class="rm-sub">The team flow</span></div></div>
      <div class="rm-item rm-done" data-target="sg-undo"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Undoing Things</span><span class="rm-sub">restore, revert, reset ⚠</span></div></div>
      <div class="rm-item rm-done" data-target="sg-ignore"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">.gitignore &amp; Tags</span><span class="rm-sub">What stays out; releases</span></div></div>
      <div class="rm-item rm-done" data-target="sg-ds"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Git for Data Science</span><span class="rm-sub">LFS, DVC, notebooks</span></div></div>
      <div class="rm-item rm-done" data-target="sg-connect"><span class="rm-num">15</span><div class="rm-text"><span class="rm-label">How It All Connects</span><span class="rm-sub">One picture, one table</span></div></div>
      <div class="rm-item rm-done" data-target="sg-traps"><span class="rm-num">16</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">The ones that cost a day</span></div></div>
      <div class="rm-item rm-done" data-target="sg-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">The note in 15 minutes</span></div></div>
      <div class="rm-item rm-done" data-target="sg-qa"><span class="rm-num">17</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Including connection questions</span></div></div>
    </div>
  </div>

  <h2 id="sg-why"><span class="num">01</span>The Chaos: final_v2_REAL.py</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The chai stall's report script works, but it has been edited for three weeks by two people, copied, renamed and sent over WhatsApp. Today the owner asks one simple question: "was Monday ₹230 or ₹210?" Which copy of the script is right, and what changed between them?</p>
  </div>
  <p>Here is Meera's folder before Git. Every "save" was a new file name. Let us look at the files and run each one on Monday's sheet.</p>
  <div class="fx" data-lang="text">$ cd ~/chai-old
$ ls -l
total 20
-rw-r--r-- 1 meera meera 351 Oct 19 21:00 orders_2026-10-19.csv
-rw-r--r-- 1 meera meera 189 Oct  2 21:14 sales_report.py
-rw-r--r-- 1 meera meera 250 Oct  9 22:40 sales_report_final.py
-rw-r--r-- 1 meera meera 310 Oct 17 23:55 sales_report_final_v2_REAL.py
-rw-r--r-- 1 meera meera 311 Oct 12 08:03 sales_report_ravi.py
$ python3 sales_report.py orders_2026-10-19.csv
Traceback (most recent call last):
  File "/home/meera/chai-old/sales_report.py", line 7, in &lt;module&gt;
    total += int(row["qty"]) * int(row["price"])
             ~~~^^^^^^^^^^^^
ValueError: invalid literal for int() with base 10: 'two'
$ python3 sales_report_final.py orders_2026-10-19.csv
total: ₹210
$ python3 sales_report_final_v2_REAL.py orders_2026-10-19.csv
total: ₹230
$ python3 sales_report_ravi.py orders_2026-10-19.csv
Total = Rs 230
$ diff sales_report_final.py sales_report_final_v2_REAL.py
8c8
&lt;             total += int(row["qty"]) * int(row["price"])
---
&gt;             qty, price = int(row["qty"]), int(row["price"])
10c10,12
&lt;             pass
---
&gt;             continue
&gt;         if qty &gt; 0:
&gt;             total += qty * price</div>
  <p>Four copies, four answers. The oldest one crashes on row 7, where the helper typed <code>two</code> instead of <code>2</code>. <code>final</code> gives ₹210: it skips bad numbers but still counts Gita's refund (−1 × ₹20). <code>final_v2_REAL</code> gives ₹230 because it also skips quantities ≤ 0. Ravi's copy gives the same number in a different format, and nobody knows whether he started from <code>final</code> or <code>final_v2_REAL</code>. <code>diff</code> can compare two files, but it cannot tell us <em>why</em> a line changed, <em>who</em> changed it, or <em>which</em> file is the current one. The file dates do not help either: Ravi's copy is newer than <code>final</code> but older than <code>final_v2_REAL</code>.</p>
  <p>What we want instead: <strong>one</strong> <code>sales_report.py</code>; every time it is in a state worth keeping, we tell a tool "save this moment, with this note"; later we can list all saved moments, see exactly what changed between any two and bring back any old one; and two people can work at the same time and have their work joined line by line. That tool is Git.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A video game with save points. Before the boss fight you save. If it goes badly you load the save and try again. Git is unlimited save points for a whole folder, and every save point carries a note saying what you did and who did it.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Version control</strong>: a system that records changes to files over time so you can recall any version, see who changed what and why, and combine work from several people. Git is a <strong>distributed</strong> version control system: every copy holds the full history, so you can commit, branch and read the log offline. <strong>GitHub</strong> (GitLab, Bitbucket) is a website that hosts a shared copy and adds pull requests, review and CI.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"I will just be careful with file names." Names describe <em>that</em> a version exists, never <em>what</em> changed or <em>why</em>. And emailed copies cannot be combined automatically: someone ends up pasting changes by hand, and one wrong paste deletes a colleague's work.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Snapshots: Your First Commits.</b> We know what we want: saved versions with notes. How do we actually make Git save one?</div>

  <h2 id="sg-first"><span class="num">02</span>Snapshots: Your First Commits</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We picked the correct copy (<code>final_v2_REAL</code>, ₹230). How do we turn the folder into something that remembers every version from now on, and how do we save the first one?</p>
  </div>
  <p>Four words first. A <strong>repository</strong> (repo) is a project folder that Git tracks; Git keeps everything in a hidden sub-folder called <code>.git</code>. A <strong>commit</strong> is one saved snapshot of the project plus a message. <strong>Tracked</strong> files are the ones Git has been told to save. The loop you will repeat thousands of times is: edit → <code>git add</code> (choose what to save) → <code>git commit</code> (save it) → <code>git log</code> (look at the history).</p>
  <p>Worked example in six steps: (1) tell Git who you are, once per laptop, because every commit records its author; (2) make a repo; (3) copy in the correct script and the sample sheet; (4) ask Git what it sees; (5) add and commit; (6) change the script (count the rejected rows), look at the change, and commit again.</p>
  <div class="fx" data-lang="text">$ cd ~
$ git config --global user.name "Meera"
$ git config --global user.email "meera@example.com"
$ git config --global init.defaultBranch main
$ git init chai-report
Initialized empty Git repository in /home/meera/chai-report/.git/
$ cd chai-report
$ cp ~/chai-old/sales_report_final_v2_REAL.py sales_report.py
$ cp ~/chai-old/orders_2026-10-19.csv sample_orders.csv
$ git status
On branch main

No commits yet

Untracked files:
  (use "git add &lt;file&gt;..." to include in what will be committed)
	sales_report.py
	sample_orders.csv

nothing added to commit but untracked files present (use "git add" to track)
$ git add sales_report.py sample_orders.csv
$ git status --short
A  sales_report.py
A  sample_orders.csv
$ git commit -m "Add sales report: total of valid orders"
[main (root-commit) 9dcb14a] Add sales report: total of valid orders
 2 files changed, 23 insertions(+)
 create mode 100644 sales_report.py
 create mode 100644 sample_orders.csv
$ python3 sales_report.py sample_orders.csv
total: ₹230
$ git status --short
 M sales_report.py
$ git diff
diff --git a/sales_report.py b/sales_report.py
index 71f1d8c..33e1c2a 100644
--- a/sales_report.py
+++ b/sales_report.py
@@ -2,12 +2,16 @@ import csv
 import sys
 
 total = 0
+rejected = 0
 with open(sys.argv[1], newline="") as f:
     for row in csv.DictReader(f):
         try:
             qty, price = int(row["qty"]), int(row["price"])
         except ValueError:
+            rejected += 1
             continue
         if qty &gt; 0:
             total += qty * price
-print(f"total: ₹{total}")
+        else:
+            rejected += 1
+print(f"total: ₹{total}, rejected: {rejected}")
$ git commit -am "Count rejected rows"
[main 348ba6a] Count rejected rows
 1 file changed, 5 insertions(+), 1 deletion(-)
$ python3 sales_report.py sample_orders.csv
total: ₹230, rejected: 3
$ git log --oneline
348ba6a Count rejected rows
9dcb14a Add sales report: total of valid orders</div>
  <p>Read it line by line. <code>git init</code> created <code>.git</code>; nothing else in the folder changed. <code>git status</code> says both files are <strong>untracked</strong>: Git sees them but is not saving them. After <code>git add</code>, the short status shows <code>A</code> (added, will be in the next commit). <code>git commit</code> printed <code>9dcb14a</code>, the short ID (hash) of the new commit, and "root-commit" because it is the first. Then we edited the script to count rejected rows: status shows <code>&#160;M</code> (modified, not yet added) and <code>git diff</code> shows the change: lines starting with <code>+</code> were added, <code>-</code> removed, the rest is context. <code>git commit -am</code> means "add every changed <em>tracked</em> file, then commit". The log lists two save points, newest first. One file name, two versions, each with a note: the chaos of section 01 cannot happen again.</p>
  <table class="tbl">
    <tr><th>Commit</th><th>Message</th><th>Output on the sheet</th></tr>
    <tr><td><code>9dcb14a</code></td><td>Add sales report: total of valid orders</td><td>total: ₹230</td></tr>
    <tr><td><code>348ba6a</code></td><td>Count rejected rows</td><td>total: ₹230, rejected: 3</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A photo album of the project. Each commit is a photo of the whole folder at one moment, with a caption written under it. You never paint over an old photo; you add a new one.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Repository</strong>: a folder plus its <code>.git</code> database of history. <strong>Commit</strong>: a permanent snapshot of all tracked files, with author, time, message and a link to the previous commit. <code>git commit -a</code> stages changes to tracked files only; new files always need one <code>git add</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Running <code>git init</code> in your home folder by mistake turns your whole home into one repo, and every <code>git status</code> lists thousands of files. Run it inside the project folder; if it happens, delete the stray <code>~/.git</code>. Also: forgetting <code>git config user.email</code> makes Git invent an address from your machine name, and those commits will not link to your GitHub account.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: What a Commit Really Is.</b> We said "snapshot", yet the second commit took no extra time even though it "saved everything again". What did Git actually write into <code>.git</code>?</div>

  <h2 id="sg-model"><span class="num">03</span>What a Commit Really Is</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>If every commit is a full snapshot, a project with 10,000 commits should be enormous, yet Git repos are small and commits are instant. What is inside <code>.git</code>, and why does Git never store the unchanged sample sheet twice?</p>
  </div>
  <p>Most beginners imagine Git stores "what changed" (a list of edits). It does not. It stores <strong>objects</strong>, and it names each object by a <strong>hash</strong>: a 40-character fingerprint computed from the object's content (SHA-1). Same content, same hash; change one byte, completely different hash. Because the name <em>is</em> the content's fingerprint, an unchanged file gets the same name in every snapshot and is stored once.</p>
  <p>There are three object types you need. A <strong>blob</strong> holds the content of one file (no name, just bytes). A <strong>tree</strong> is a folder listing: each line maps a file name to a blob hash (or a sub-folder to another tree). A <strong>commit</strong> points to one tree (the whole project at that moment) plus the parent commit, author, time and message. Let us open the real objects of our two commits with <code>git cat-file</code> (<code>-t</code> = type, <code>-p</code> = pretty-print).</p>
  <div class="fx" data-lang="text">$ git cat-file -t HEAD
commit
$ git cat-file -p HEAD
tree 9b7e628924da5753f1732f1b2816ad118d059174
parent 9dcb14adbac24476d2501b4ab727717adf964965
author Meera &lt;meera@example.com&gt; 1792381920 +0530
committer Meera &lt;meera@example.com&gt; 1792381920 +0530

Count rejected rows
$ git cat-file -p HEAD^{tree}
100644 blob 33e1c2a9e76661fb19dda121e2ec9e6503620f03	sales_report.py
100644 blob c475533070b4713949ca43c546d3f013c9a84e8c	sample_orders.csv
$ git cat-file -p HEAD~1^{tree}
100644 blob 71f1d8cd97899999a18af2023fa19561d0c9aaad	sales_report.py
100644 blob c475533070b4713949ca43c546d3f013c9a84e8c	sample_orders.csv
$ git cat-file -p HEAD:sample_orders.csv | head -3
order_id,time,customer,item,qty,price,note
1,08:05,Asha,masala chai,2,20,
2,08:12,Ben,samosa,3,15,"extra chutney, no onion"
$ git hash-object sample_orders.csv
c475533070b4713949ca43c546d3f013c9a84e8c
$ find .git/objects -type f | sort
.git/objects/33/e1c2a9e76661fb19dda121e2ec9e6503620f03
.git/objects/34/8ba6ad66de46ca922a91719c5acbe52043f769
.git/objects/71/f1d8cd97899999a18af2023fa19561d0c9aaad
.git/objects/9b/7e628924da5753f1732f1b2816ad118d059174
.git/objects/9d/cb14adbac24476d2501b4ab727717adf964965
.git/objects/af/a5696e723e762480ad6d7e34ea0a62f8b73625
.git/objects/c4/75533070b4713949ca43c546d3f013c9a84e8c
$ cat .git/HEAD
ref: refs/heads/main
$ cat .git/refs/heads/main
348ba6ad66de46ca922a91719c5acbe52043f769</div>
  <p>Trace it by hand. The commit <code>348ba6a</code> is plain text: a <code>tree</code> line, a <code>parent</code> line pointing at <code>9dcb14a</code> (our first commit), author and committer with a Unix timestamp and time zone, a blank line, the message. Its tree lists two blobs. The tree of the first commit (<code>HEAD~1^{tree}</code>, "the tree of the parent of HEAD") lists a <em>different</em> blob for <code>sales_report.py</code> (<code>71f1d8c</code> → <code>33e1c2a</code>, because we edited it) and the <strong>same</strong> blob <code>c475533</code> for <code>sample_orders.csv</code>. <code>git hash-object</code> recomputes the hash from the file on disk and gets <code>c475533…</code> again: the name really is the content's fingerprint. The <code>find</code> lists exactly 7 objects:</p>
  <table class="tbl">
    <tr><th>Object</th><th>Type</th><th>What it is</th></tr>
    <tr><td><code>71f1d8c</code></td><td>blob</td><td>sales_report.py, version 1 (total only)</td></tr>
    <tr><td><code>33e1c2a</code></td><td>blob</td><td>sales_report.py, version 2 (rejected count)</td></tr>
    <tr><td><code>c475533</code></td><td>blob</td><td>sample_orders.csv (stored once, used by both trees)</td></tr>
    <tr><td><code>afa5696</code></td><td>tree</td><td>folder of commit 1: 71f1d8c + c475533</td></tr>
    <tr><td><code>9b7e628</code></td><td>tree</td><td>folder of commit 2: 33e1c2a + c475533</td></tr>
    <tr><td><code>9dcb14a</code></td><td>commit</td><td>tree afa5696, no parent, "Add sales report…"</td></tr>
    <tr><td><code>348ba6a</code></td><td>commit</td><td>tree 9b7e628, parent 9dcb14a, "Count rejected rows"</td></tr>
  </table>
  <figure class="viz"><svg viewBox="0 0 640 230" width="640">
<defs><marker id="sg-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="20" y="20" width="150" height="40" rx="7" class="fb sb"/><text x="95" y="38" text-anchor="middle" font-size="11.5" font-weight="700">commit 9dcb14a</text><text x="95" y="53" text-anchor="middle" class="tm" font-size="10">Add sales report…</text>
<rect x="400" y="20" width="170" height="40" rx="7" class="fb sb"/><text x="485" y="38" text-anchor="middle" font-size="11.5" font-weight="700">commit 348ba6a</text><text x="485" y="53" text-anchor="middle" class="tm" font-size="10">Count rejected rows</text>
<line x1="398" y1="40" x2="174" y2="40" stroke="currentColor" marker-end="url(#sg-a1)"/><text x="285" y="34" text-anchor="middle" class="tm" font-size="10">parent</text>
<rect x="45" y="95" width="100" height="34" rx="6" class="ft st"/><text x="95" y="116" text-anchor="middle" font-size="11">tree afa5696</text>
<rect x="435" y="95" width="100" height="34" rx="6" class="ft st"/><text x="485" y="116" text-anchor="middle" font-size="11">tree 9b7e628</text>
<line x1="95" y1="60" x2="95" y2="92" stroke="currentColor" marker-end="url(#sg-a1)"/><line x1="485" y1="60" x2="485" y2="92" stroke="currentColor" marker-end="url(#sg-a1)"/>
<rect x="20" y="170" width="150" height="40" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="95" y="188" text-anchor="middle" font-size="11">blob 71f1d8c</text><text x="95" y="202" text-anchor="middle" class="tm" font-size="10">sales_report.py v1</text>
<rect x="245" y="170" width="150" height="40" rx="6" class="fg sg"/><text x="320" y="188" text-anchor="middle" font-size="11">blob c475533</text><text x="320" y="202" text-anchor="middle" class="tm" font-size="10">sample_orders.csv (shared)</text>
<rect x="470" y="170" width="150" height="40" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="545" y="188" text-anchor="middle" font-size="11">blob 33e1c2a</text><text x="545" y="202" text-anchor="middle" class="tm" font-size="10">sales_report.py v2</text>
<line x1="85" y1="129" x2="85" y2="167" stroke="currentColor" marker-end="url(#sg-a1)"/><line x1="115" y1="129" x2="290" y2="167" stroke="currentColor" marker-end="url(#sg-a1)"/>
<line x1="465" y1="129" x2="350" y2="167" stroke="currentColor" marker-end="url(#sg-a1)"/><line x1="500" y1="129" x2="540" y2="167" stroke="currentColor" marker-end="url(#sg-a1)"/>
</svg><figcaption>Our real repo after two commits: 7 objects. Commits point to trees and to their parent; trees point to blobs. The unchanged CSV is one blob used by both snapshots.</figcaption></figure>
  <p>Finally <code>.git/HEAD</code> just says "I am on main", and <code>.git/refs/heads/main</code> is a tiny text file holding one commit hash. Hold on to that; section 06 is built on it. The arrows between commits only point backwards (child → parent) and never loop, so history forms a <strong>DAG</strong> (directed acyclic graph).</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A library that files every page by a fingerprint of its text. If two editions of a book share an unchanged chapter, the shelf holds that chapter once and both editions' tables of contents (trees) point to it. A commit is the title page: "this edition = this table of contents, previous edition = that one, edited by Meera".</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Blob</strong>: file content. <strong>Tree</strong>: names → blobs/trees (a folder). <strong>Commit</strong>: tree + parent(s) + author + committer + message. <strong>Object hash</strong>: SHA-1 of the object's content; change anything, even a commit message, and the hash changes. <code>HEAD~1</code> = parent of HEAD, <code>HEAD~2</code> = grandparent, <code>X^{tree}</code> = the tree of commit X.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Git stores diffs" is a common wrong interview answer. Git stores snapshots made of shared objects; <code>git diff</code> computes differences when you ask. (Later, Git packs objects on disk with delta compression, but that is a storage detail, not the model.)</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: The Staging Area.</b> A commit saves a tree, but which content goes into that tree? <code>git commit -a</code> took every change. What if only some of today's changes are ready?</div>

  <h2 id="sg-areas"><span class="num">04</span>The Staging Area</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Meera finished counting valid orders, but while testing she also put a <code>print("DEBUG", row)</code> line in the same file, and a notes file sits in the folder. If "commit" always took every change, the debug line and the notes would be saved too. How do we commit exactly the finished part?</p>
  </div>
  <p>Git has a middle step. Files move through three places. The <strong>working tree</strong> is the normal folder you edit. The <strong>index</strong>, also called the <strong>staging area</strong>, is a draft of the next commit. The <strong>repository</strong> is the history in <code>.git</code>. <code>git add file</code> copies the file's current content into the draft (as a blob, the object from section 03). <code>git commit</code> turns the draft into a permanent tree and commit.</p>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600">
    <defs><marker id="sg-arr2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="20" width="160" height="60" rx="8" class="fs"/><text x="90" y="46" text-anchor="middle">Working tree</text><text x="90" y="66" text-anchor="middle" class="tm">files you edit</text>
    <rect x="220" y="20" width="160" height="60" rx="8" class="fb sb"/><text x="300" y="46" text-anchor="middle">Index (staging)</text><text x="300" y="66" text-anchor="middle" class="tm">next commit draft</text>
    <rect x="430" y="20" width="160" height="60" rx="8" class="fg sg"/><text x="510" y="46" text-anchor="middle">Repository</text><text x="510" y="66" text-anchor="middle" class="tm">.git (commits)</text>
    <g stroke="currentColor" fill="none" stroke-width="1.5">
      <line x1="172" y1="40" x2="216" y2="40" marker-end="url(#sg-arr2)"/>
      <line x1="382" y1="40" x2="426" y2="40" marker-end="url(#sg-arr2)"/>
      <path d="M510,82 C510,130 90,130 90,84" marker-end="url(#sg-arr2)"/>
    </g>
    <text x="194" y="32" text-anchor="middle" class="tb">add</text>
    <text x="404" y="32" text-anchor="middle" class="tb">commit</text>
    <text x="300" y="140" text-anchor="middle" class="tm">switch / restore copy committed versions back into files</text>
  </svg><figcaption>You choose exactly what goes into a commit by staging it first.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Packing a courier parcel. The room is the working tree: things lying everywhere. The open box on the table is the staging area: you put in only what should go. Sealing the box and handing it to the courier is the commit. Things still lying in the room are not sent.</p>
  </div>
  <p>The plan, state by state (what each place holds for <code>sales_report.py</code>):</p>
  <table class="tbl">
    <tr><th>Step</th><th>Working tree</th><th>Staging</th><th>Last commit</th></tr>
    <tr><td>start</td><td>rejected count</td><td>rejected count</td><td>rejected count</td></tr>
    <tr><td>add the orders counter, <code>git add</code></td><td>+ orders</td><td>+ orders</td><td>rejected count</td></tr>
    <tr><td>add a DEBUG print, no add</td><td>+ orders + DEBUG</td><td>+ orders</td><td>rejected count</td></tr>
    <tr><td><code>git commit</code></td><td>+ orders + DEBUG</td><td>+ orders</td><td>+ orders (DEBUG not saved)</td></tr>
  </table>
  <p>Played out for real. <code>git ls-files --stage</code> prints what the index holds: one blob hash per file, the very objects of section 03.</p>
  <div class="fx" data-lang="text">$ git add sales_report.py
$ git ls-files --stage
100644 b4a5abbb6b2999365da43ba67d91e0f1ebada0d0 0	sales_report.py
100644 c475533070b4713949ca43c546d3f013c9a84e8c 0	sample_orders.csv
$ echo "ask Ravi: count refunds separately?" &gt; notes.txt
$ git status
On branch main
Changes to be committed:
  (use "git restore --staged &lt;file&gt;..." to unstage)
	modified:   sales_report.py

Changes not staged for commit:
  (use "git add &lt;file&gt;..." to update what will be committed)
  (use "git restore &lt;file&gt;..." to discard changes in working directory)
	modified:   sales_report.py

Untracked files:
  (use "git add &lt;file&gt;..." to include in what will be committed)
	notes.txt

$ git status --short
MM sales_report.py
?? notes.txt
$ git diff
diff --git a/sales_report.py b/sales_report.py
index b4a5abb..2a6a86c 100644
--- a/sales_report.py
+++ b/sales_report.py
@@ -6,6 +6,7 @@ orders = 0
 rejected = 0
 with open(sys.argv[1], newline="") as f:
     for row in csv.DictReader(f):
+        print("DEBUG", row)
         try:
             qty, price = int(row["qty"]), int(row["price"])
         except ValueError:
$ git diff --staged
diff --git a/sales_report.py b/sales_report.py
index 33e1c2a..b4a5abb 100644
--- a/sales_report.py
+++ b/sales_report.py
@@ -2,6 +2,7 @@ import csv
 import sys
 
 total = 0
+orders = 0
 rejected = 0
 with open(sys.argv[1], newline="") as f:
     for row in csv.DictReader(f):
@@ -12,6 +13,7 @@ with open(sys.argv[1], newline="") as f:
             continue
         if qty &gt; 0:
             total += qty * price
+            orders += 1
         else:
             rejected += 1
-print(f"total: ₹{total}, rejected: {rejected}")
+print(f"total: ₹{total} from {orders} orders, rejected: {rejected}")
$ git commit -m "Count valid orders"
[main a2c291e] Count valid orders
 1 file changed, 3 insertions(+), 1 deletion(-)
$ git status --short
 M sales_report.py
?? notes.txt
$ rm notes.txt
$ git status --short
$ python3 sales_report.py sample_orders.csv
total: ₹230 from 6 orders, rejected: 3</div>
  <p>Read the two-letter codes of <code>git status --short</code>: the <strong>left</strong> letter compares staging with the last commit, the <strong>right</strong> letter compares the working tree with staging. <code>MM</code> = "modified and staged, then modified again". <code>??</code> = untracked. Plain <code>git diff</code> showed only the DEBUG line (working tree vs staging); <code>git diff --staged</code> showed only the orders counter (staging vs last commit), and that is exactly what the commit saved. Afterwards <code>&#160;M</code> said the DEBUG line was still waiting in the working tree; we deleted it by hand and removed the notes file, and the report now reads ₹230 from 6 orders.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Index / staging area</strong>: a file in <code>.git</code> listing the exact blob for every path in the next commit. <code>git add</code> = "put the current content in the draft". <code>git diff</code> = working tree vs index; <code>git diff --staged</code> = index vs last commit.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>git add</code> takes a copy <em>at that moment</em>. Edit after adding and the commit holds the older version. Always read <code>git diff --staged</code> before committing. And <code>git add .</code> stages everything in the folder, including notes and debug files; add by name, or use <code>git add -p</code> to pick individual changes inside a file.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: History &amp; Diff.</b> We now have three clean commits. A month from now someone asks "when did the report start counting rejected rows, and why?" How do we read the history?</div>

  <h2 id="sg-history"><span class="num">05</span>History &amp; Diff</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Saving versions is only half the value; the other half is reading them. Which commit changed which file, what exactly changed between any two versions, and who wrote a given line?</p>
  </div>
  <p>Five commands answer almost every history question: <code>git log</code> (the list), <code>git show</code> (one commit in full), <code>git diff A B</code> (difference between any two snapshots), <code>git log -- file</code> (only commits touching that file) and <code>git blame</code> (which commit last changed each line).</p>
  <div class="fx" data-lang="text">$ git log
commit a2c291ea4fe2637a29f71ccc822e638e3edb63ac
Author: Meera &lt;meera@example.com&gt;
Date:   Mon Oct 19 09:48:00 2026 +0530

    Count valid orders

commit 348ba6ad66de46ca922a91719c5acbe52043f769
Author: Meera &lt;meera@example.com&gt;
Date:   Mon Oct 19 09:22:00 2026 +0530

    Count rejected rows

commit 9dcb14adbac24476d2501b4ab727717adf964965
Author: Meera &lt;meera@example.com&gt;
Date:   Mon Oct 19 09:16:00 2026 +0530

    Add sales report: total of valid orders
$ git log --oneline --stat
a2c291e Count valid orders
 sales_report.py | 4 +++-
 1 file changed, 3 insertions(+), 1 deletion(-)
348ba6a Count rejected rows
 sales_report.py | 6 +++++-
 1 file changed, 5 insertions(+), 1 deletion(-)
9dcb14a Add sales report: total of valid orders
 sales_report.py   | 13 +++++++++++++
 sample_orders.csv | 10 ++++++++++
 2 files changed, 23 insertions(+)
$ git show HEAD~1
commit 348ba6ad66de46ca922a91719c5acbe52043f769
Author: Meera &lt;meera@example.com&gt;
Date:   Mon Oct 19 09:22:00 2026 +0530

    Count rejected rows

diff --git a/sales_report.py b/sales_report.py
index 71f1d8c..33e1c2a 100644
--- a/sales_report.py
+++ b/sales_report.py
@@ -2,12 +2,16 @@ import csv
 import sys
 
 total = 0
+rejected = 0
 with open(sys.argv[1], newline="") as f:
     for row in csv.DictReader(f):
         try:
             qty, price = int(row["qty"]), int(row["price"])
         except ValueError:
+            rejected += 1
             continue
         if qty &gt; 0:
             total += qty * price
-print(f"total: ₹{total}")
+        else:
+            rejected += 1
+print(f"total: ₹{total}, rejected: {rejected}")
$ git diff HEAD~2 HEAD --stat
 sales_report.py | 8 +++++++-
 1 file changed, 7 insertions(+), 1 deletion(-)
$ git log --oneline -- sample_orders.csv
9dcb14a Add sales report: total of valid orders
$ git blame -s sales_report.py
^9dcb14a  1) import csv
^9dcb14a  2) import sys
^9dcb14a  3) 
^9dcb14a  4) total = 0
a2c291ea  5) orders = 0
348ba6ad  6) rejected = 0
^9dcb14a  7) with open(sys.argv[1], newline="") as f:
^9dcb14a  8)     for row in csv.DictReader(f):
^9dcb14a  9)         try:
^9dcb14a 10)             qty, price = int(row["qty"]), int(row["price"])
^9dcb14a 11)         except ValueError:
348ba6ad 12)             rejected += 1
^9dcb14a 13)             continue
^9dcb14a 14)         if qty &gt; 0:
^9dcb14a 15)             total += qty * price
a2c291ea 16)             orders += 1
348ba6ad 17)         else:
348ba6ad 18)             rejected += 1
a2c291ea 19) print(f"total: ₹{total} from {orders} orders, rejected: {rejected}")</div>
  <p>The full <code>git log</code> shows the 40-character hash, author, date and message of each commit. <code>--oneline --stat</code> adds which files changed and how many lines. <code>git show HEAD~1</code> is the commit plus its diff: the answer to "what did 'Count rejected rows' do?". <code>git diff HEAD~2 HEAD --stat</code> compares the first and the latest snapshot directly, skipping everything in between (7 lines added, 1 removed in total). <code>git log -- sample_orders.csv</code> proves the sheet has been touched only once. In <code>git blame</code> each line carries the commit that last changed it: <code>orders = 0</code> came from <code>a2c291e</code>, <code>rejected = 0</code> from <code>348ba6a</code>, and <code>^9dcb14a</code> (the caret) marks lines unchanged since the very first commit.</p>
  <p>History is only as useful as its messages. Compare:</p>
  <table class="tbl">
    <tr><th>Bad message</th><th>Good message</th></tr>
    <tr><td>fix</td><td>Skip rows with qty 0 or less (refunds were counted)</td></tr>
    <tr><td>updates</td><td>Count rejected rows</td></tr>
    <tr><td>wip stuff final v2</td><td>Show the best-selling item</td></tr>
  </table>
  <p>Rules: a subject of about 50 characters in the imperative ("Add", not "Added"), as if finishing the sentence "this commit will…". Then a blank line and a body explaining <em>why</em>; the diff already shows <em>what</em>. And keep one logical change per commit, so each one can be read, reviewed and undone on its own.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A shop's daily ledger. <code>log</code> is reading the list of days; <code>show</code> is opening one day's page; <code>diff</code> is laying two pages side by side; <code>blame</code> is the initials next to each entry saying who wrote it and on which day.</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>git log</strong>: walk commits from HEAD back through parents. <strong>git diff A B</strong>: compare the trees of two commits (or the working tree/index). <strong>git blame</strong>: for each line, the last commit that changed it. A <strong>revision</strong> can be a hash, a branch, <code>HEAD</code>, <code>HEAD~n</code> or a tag.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>git blame</code> answers "who touched this line last", not "whose fault is it": a reformatting commit takes over every line it touches. And messages like "fix" make <code>log</code> useless exactly when you need it most, during an incident.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Branches Are Just Pointers.</b> Every commit so far went straight onto one line. Meera wants to try a "top item" feature without risking the version the owner uses every evening. How?</div>

  <h2 id="sg-branch"><span class="num">06</span>Branches Are Just Pointers</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Without branches you would copy the folder to experiment, which is exactly the chaos of section 01. How does Git let us work on the side, and why is creating a branch instant even for a huge project?</p>
  </div>
  <p>Remember <code>.git/refs/heads/main</code> from section 03: a tiny file holding one commit hash. That file <em>is</em> the branch. A <strong>branch</strong> is a movable label pointing at a commit, and <strong>HEAD</strong> is a second label saying which branch you are on. Making a branch writes one more 41-byte file. Committing moves only the branch HEAD points to. Let us watch the files.</p>
  <div class="fx" data-lang="text">$ git branch
* main
$ git switch -c feature/top-item
Switched to a new branch 'feature/top-item'
$ git branch
* feature/top-item
  main
$ cat .git/HEAD
ref: refs/heads/feature/top-item
$ cat .git/refs/heads/main .git/refs/heads/feature/top-item
a2c291ea4fe2637a29f71ccc822e638e3edb63ac
a2c291ea4fe2637a29f71ccc822e638e3edb63ac
$ git commit -am "Show the best-selling item"
[feature/top-item 18e6652] Show the best-selling item
 1 file changed, 5 insertions(+)
$ cat .git/refs/heads/main .git/refs/heads/feature/top-item
a2c291ea4fe2637a29f71ccc822e638e3edb63ac
18e6652016b5dcf8b318a931c8659767857fd430
$ git log --oneline --graph --all --decorate
* 18e6652 (HEAD -&gt; feature/top-item) Show the best-selling item
* a2c291e (main) Count valid orders
* 348ba6a Count rejected rows
* 9dcb14a Add sales report: total of valid orders
$ python3 sales_report.py sample_orders.csv
total: ₹230 from 6 orders, rejected: 3
top item: masala chai (5 sold)
$ git switch main
Switched to branch 'main'
$ python3 sales_report.py sample_orders.csv
total: ₹230 from 6 orders, rejected: 3</div>
  <p>Trace it. <code>git switch -c feature/top-item</code> created the label and moved HEAD to it: <code>.git/HEAD</code> now says <code>ref: refs/heads/feature/top-item</code>. Right after creation both branch files hold the same hash <code>a2c291e…</code>. The new commit moved only <code>feature/top-item</code> (to <code>18e6652…</code>); <code>main</code> stayed. The graph shows both labels in brackets. On the branch the report prints the top item (masala chai, 5 cups); after <code>git switch main</code>, Git rewrote <code>sales_report.py</code> on disk to main's version, so the top-item line is gone. Nothing was lost; it waits on its branch.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Sticky notes in the photo album. "main" is a sticky note on one page, "feature/top-item" another. Adding a photo moves the note you are holding. Moving a sticky note costs nothing, which is why branching is cheap.</p>
  </div>
  <p>One state confuses everyone: <strong>detached HEAD</strong>. If you check out a commit instead of a branch, HEAD holds a hash directly. You can look around and even commit, but no branch label follows the new commit:</p>
  <div class="fx" data-lang="text">$ git checkout HEAD~1
Note: switching to 'HEAD~1'.

You are in 'detached HEAD' state. You can look around, make experimental
changes and commit them, and you can discard any commits you make in this
state without impacting any branches by switching back to a branch.

If you want to create a new branch to retain commits you create, you may
do so (now or later) by using -c with the switch command. Example:

  git switch -c &lt;new-branch-name&gt;

Or undo this operation with:

  git switch -

Turn off this advice by setting config variable advice.detachedHead to false

HEAD is now at 348ba6a Count rejected rows
$ cat .git/HEAD
348ba6ad66de46ca922a91719c5acbe52043f769
$ git commit -qam "Experiment: round totals"
$ git switch main
Warning: you are leaving 1 commit behind, not connected to
any of your branches:

  bdce092 Experiment: round totals

If you want to keep it by creating a new branch, this may be a good time
to do so with:

 git branch &lt;new-branch-name&gt; bdce092

Switched to branch 'main'</div>
  <p><code>.git/HEAD</code> now holds a raw hash instead of <code>ref: refs/heads/…</code>. When we left, Git warned that commit <code>bdce092</code> is connected to no branch and printed the rescue command. To keep such work, run <code>git switch -c rescue</code> before leaving (or <code>git branch rescue bdce092</code> right after). Switching with uncommitted edits: Git carries them along if they do not clash, or refuses; commit first, or park them with <code>git stash</code> and restore with <code>git stash pop</code>.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Branch</strong>: a movable pointer to a commit, stored in <code>.git/refs/heads/NAME</code>. <strong>HEAD</strong>: pointer to the current branch (or, when detached, to a commit). <code>git switch</code> (change branch) and <code>git restore</code> (restore files) are the clearer halves of the old do-everything <code>git checkout</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Deleting a branch deletes the label, not the commits; but commits that no label reaches (like <code>bdce092</code>) are cleaned up by Git after about 90 days. Name anything you want to keep.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Merging.</b> The top-item feature works on its branch. How does it get into <code>main</code>, and what if <code>main</code> moved on in the meantime?</div>

  <h2 id="sg-merge"><span class="num">07</span>Merging: Fast-Forward vs Three-Way</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Two lines of work must become one. Sometimes main has not changed since we branched; sometimes both sides have new commits. How does Git combine them, and how can it do so automatically?</p>
  </div>
  <p><strong>Case 1: main did not move.</strong> Since we branched, main got no new commits, so main's commit is an ancestor of the feature's commit. Git needs no new commit: it slides the <code>main</code> label forward. That is a <strong>fast-forward</strong>. Watch the branch file.</p>
  <div class="fx" data-lang="text">$ git log --oneline --graph --all --decorate
* 18e6652 (feature/top-item) Show the best-selling item
* a2c291e (HEAD -&gt; main) Count valid orders
* 348ba6a Count rejected rows
* 9dcb14a Add sales report: total of valid orders
$ git merge feature/top-item
Updating a2c291e..18e6652
Fast-forward
 sales_report.py | 5 +++++
 1 file changed, 5 insertions(+)
$ cat .git/refs/heads/main
18e6652016b5dcf8b318a931c8659767857fd430
$ git log --oneline --graph --all --decorate
* 18e6652 (HEAD -&gt; main, feature/top-item) Show the best-selling item
* a2c291e Count valid orders
* 348ba6a Count rejected rows
* 9dcb14a Add sales report: total of valid orders
$ git branch -d feature/top-item
Deleted branch feature/top-item (was 18e6652).</div>
  <p>Before: main at <code>a2c291e</code>, feature at <code>18e6652</code>. After: <code>.git/refs/heads/main</code> holds <code>18e6652…</code> and both labels sit on the same commit. No merge commit was created. <code>git branch -d</code> then deleted the now-redundant label.</p>
  <p><strong>Case 2: both moved.</strong> Meera starts <code>feature/usage-check</code> (print a usage message and exit with code 2 when no file is given) and, before merging it, adds a README on main. Now neither tip is an ancestor of the other, so no label can "slide". Git does a <strong>three-way merge</strong>: it finds the <strong>merge base</strong> (the last common ancestor) and, for each file, compares base, ours (main) and theirs (feature).</p>
  <div class="fx" data-lang="text">$ git switch -c feature/usage-check
Switched to a new branch 'feature/usage-check'
$ git commit -qam "Exit with a usage message when no file is given"
$ git switch main
Switched to branch 'main'
$ git add README.md
$ git commit -qm "Add README"
$ git log --oneline --graph --all --decorate
* f70064c (HEAD -&gt; main) Add README
| * f9bc33d (feature/usage-check) Exit with a usage message when no file is given
|/  
* 18e6652 Show the best-selling item
* a2c291e Count valid orders
* 348ba6a Count rejected rows
* 9dcb14a Add sales report: total of valid orders
$ git merge-base main feature/usage-check
18e6652016b5dcf8b318a931c8659767857fd430
$ git merge --no-edit feature/usage-check
Merge made by the 'ort' strategy.
 sales_report.py | 4 ++++
 1 file changed, 4 insertions(+)
$ git log --oneline --graph --decorate
*   81c2d38 (HEAD -&gt; main) Merge branch 'feature/usage-check'
|\\  
| * f9bc33d (feature/usage-check) Exit with a usage message when no file is given
* | f70064c Add README
|/  
* 18e6652 Show the best-selling item
* a2c291e Count valid orders
* 348ba6a Count rejected rows
* 9dcb14a Add sales report: total of valid orders
$ git cat-file -p HEAD
tree c51b5a0c71bb7d2665bcebea603e091ad3ba6c1f
parent f70064c60f07bde08edca4c456397d6ddfd75b51
parent f9bc33d7e33e7cf5fd17b9958f2eb1f128d97f7b
author Meera &lt;meera@example.com&gt; 1792386960 +0530
committer Meera &lt;meera@example.com&gt; 1792386960 +0530

Merge branch 'feature/usage-check'
$ python3 sales_report.py; echo "exit code: $?"
usage: python3 sales_report.py ORDERS.csv
exit code: 2
$ git branch -d feature/usage-check
Deleted branch feature/usage-check (was f9bc33d).</div>
  <p>The merge base is <code>18e6652</code>. The three-way rule, file by file, traced by hand:</p>
  <table class="tbl">
    <tr><th>File</th><th>Base 18e6652</th><th>Ours f70064c (main)</th><th>Theirs f9bc33d (feature)</th><th>Result</th></tr>
    <tr><td>README.md</td><td>absent</td><td>added</td><td>absent</td><td>only ours changed → take ours</td></tr>
    <tr><td>sales_report.py</td><td>X</td><td>X (unchanged)</td><td>X + usage check</td><td>only theirs changed → take theirs</td></tr>
    <tr><td>sample_orders.csv</td><td>S</td><td>S</td><td>S</td><td>nobody changed → keep S</td></tr>
    <tr><td><em>same lines in one file</em></td><td>L</td><td>L′</td><td>L″</td><td>both changed differently → <strong>conflict</strong> (section 08)</td></tr>
  </table>
  <p>The new commit <code>81c2d38</code> really has two <code>parent</code> lines, <code>f70064c</code> and <code>f9bc33d</code>: a merge is just a commit with two parents. <code>ort</code> is the name of Git's default merge strategy. The merged script prints the usage line and exits with code 2 when run without a file; exit codes return in the Linux note.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two cooks start from the same recipe card (the base). One adds a garnish note at the bottom, the other changes the oven time. Comparing each version with the original card, a third person can apply both changes without asking anyone. Only if both changed the oven time differently must they ask (a conflict).</p>
  </div>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Fast-forward merge</strong>: the target branch is an ancestor of the source, so its pointer just moves. <strong>Three-way merge</strong>: combine two tips using their merge base; record a merge commit with two parents. <code>git merge --no-ff</code> forces a merge commit even when a fast-forward is possible (some teams want to see where a feature landed).</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Merged without conflicts" does not mean "correct". Git merges <em>text</em>: if one branch renamed a variable and the other added a new use of the old name in another line, both merge cleanly and the program breaks. Run the script or the tests after every merge.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Conflicts.</b> The three-way rule fails when both sides changed the same line. What does Git do then, and what do we do?</div>

  <h2 id="sg-conflict"><span class="num">08</span>Conflicts: Reproduced and Resolved</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Ravi's branch rewords the summary line to say "valid orders"; meanwhile main relabels the same line "Total sales". Relative to the base, both changed line 26. Git cannot know which is right. What happens, and how do we finish the merge?</p>
  </div>
  <p>Git stops and asks. That is a <strong>merge conflict</strong>. It is not an error and nothing is broken; it is a question only a human can answer.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two family members edit the same shopping list. One changed "1 kg rice" to "2 kg rice", the other to "5 kg rice". Whoever collects the lists cannot guess; she writes both versions on the paper and asks the family to decide.</p>
  </div>
  <div class="flow"><span>Both branches edit the same line</span><span>merge stops (UU)</span><span>you write the final text</span><span>git add</span><span>git commit</span></div>
  <div class="fx" data-lang="text">$ git switch -c fix/wording
Switched to a new branch 'fix/wording'
$ git commit -qam "Say 'valid orders' in the summary line"
$ git switch main
Switched to branch 'main'
$ git commit -qam "Label the total as 'Total sales'"
$ git merge fix/wording
Auto-merging sales_report.py
CONFLICT (content): Merge conflict in sales_report.py
Automatic merge failed; fix conflicts and then commit the result.
$ git status --short
UU sales_report.py
$ sed -n '25,32p' sales_report.py
            rejected += 1
&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD
print(f"Total sales: ₹{total} from {orders} orders, rejected: {rejected}")
=======
print(f"total: ₹{total} from {orders} valid orders, rejected: {rejected}")
&gt;&gt;&gt;&gt;&gt;&gt;&gt; fix/wording
item, n = cups.most_common(1)[0]
print(f"top item: {item} ({n} sold)")
$ git merge --abort
$ git status --short
$ git merge fix/wording
Auto-merging sales_report.py
CONFLICT (content): Merge conflict in sales_report.py
Automatic merge failed; fix conflicts and then commit the result.
$ sed -n '26p' sales_report.py
print(f"Total sales: ₹{total} from {orders} valid orders, rejected: {rejected}")
$ grep -c '&lt;&lt;&lt;&lt;&lt;&lt;&lt;' sales_report.py
0
$ python3 sales_report.py sample_orders.csv
Total sales: ₹230 from 6 valid orders, rejected: 3
top item: masala chai (5 sold)
$ git add sales_report.py
$ git status --short
M  sales_report.py
$ git commit --no-edit
[main d4ed59f] Merge branch 'fix/wording'
$ git log --oneline --graph --decorate -4
*   d4ed59f (HEAD -&gt; main) Merge branch 'fix/wording'
|\\  
| * ca71337 (fix/wording) Say 'valid orders' in the summary line
* | 6b74ef3 Label the total as 'Total sales'
|/  
*   81c2d38 Merge branch 'feature/usage-check'
|\\  
$ git branch -d fix/wording
Deleted branch fix/wording (was ca71337).</div>
  <p>Git wrote both versions into the file between <strong>conflict markers</strong>. Between <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD</code> and <code>=======</code> is the current branch's line (main: "Total sales"); between <code>=======</code> and <code>&gt;&gt;&gt;&gt;&gt;&gt;&gt; fix/wording</code> is the incoming line ("valid orders"). Lines around it merged normally and appear once. <code>UU</code> = "unmerged, both modified". <code>git merge --abort</code> put everything back to before the merge (empty status). On the second try we resolved it: the final line keeps <em>both</em> intentions, "Total sales … valid orders", and the three marker lines are deleted. <code>grep -c</code> confirms no marker is left (0), the script runs, <code>git add</code> turns <code>UU</code> into <code>M&#160;</code> (resolved and staged), and <code>git commit --no-edit</code> records the merge commit <code>d4ed59f</code> with its default message.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Merge conflict</strong>: Git cannot combine two changes automatically because they touch the same region of a file relative to the merge base (or one side deleted a file the other edited). Conflicts also happen during <code>rebase</code>, <code>cherry-pick</code> and <code>pull</code>; the fix is the same, followed by <code>git rebase --continue</code> for a rebase.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Committing with leftover markers: Python sees <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code> as a syntax error and the nightly report fails. Search for markers and run the script before committing. If the intent is unclear, ask the other author rather than guessing. Editors (VS Code, PyCharm) show "Accept current / incoming / both" buttons over the markers.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Rebase vs Merge.</b> Every merge leaves a fork-and-join shape in the log. With many small features the history becomes a tangle. Can the same work land as one straight line?</div>

  <h2 id="sg-rebase"><span class="num">09</span>Rebase vs Merge</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Merging records the true, branchy shape of history. Many teams prefer a straight line that reads like a story. How do we get one, what does it cost, and when is it dangerous?</p>
  </div>
  <p><strong>Rebase</strong> takes your branch's commits and replays them, one by one, on top of the latest main, as <em>new</em> commits. Afterwards your branch starts from main's tip, so merging it is a fast-forward. To compare fairly we create one situation and join it both ways: branch <code>feature/by-item</code> gets two commits (C: track revenue per item, D: sort items by revenue) while main gets E (document the output in README). We copy the whole repo to <code>~/try-merge</code> and merge there, then rebase in the original.</p>
  <div class="fx" data-lang="text">$ git switch -c feature/by-item
Switched to a new branch 'feature/by-item'
$ git commit -qam "Track revenue per item"
$ git commit -qam "Sort items by revenue"
$ git switch main
Switched to branch 'main'
$ git commit -qam "Document the output in README"
$ git log --oneline --graph --all --decorate -6
* 912abb9 (HEAD -&gt; main) Document the output in README
| * f5e0c65 (feature/by-item) Sort items by revenue
| * 5325b71 Track revenue per item
|/  
*   d4ed59f Merge branch 'fix/wording'
|\\  
| * ca71337 Say 'valid orders' in the summary line
* | 6b74ef3 Label the total as 'Total sales'
|/  
$ cp -r ~/chai-report ~/try-merge
$ cd ~/try-merge
$ git merge --no-edit feature/by-item
Merge made by the 'ort' strategy.
 sales_report.py | 4 ++++
 1 file changed, 4 insertions(+)
$ git log --oneline --graph --decorate -6
*   37fdc99 (HEAD -&gt; main) Merge branch 'feature/by-item'
|\\  
| * f5e0c65 (feature/by-item) Sort items by revenue
| * 5325b71 Track revenue per item
* | 912abb9 Document the output in README
|/  
*   d4ed59f Merge branch 'fix/wording'
|\\  
| * ca71337 Say 'valid orders' in the summary line
$ cd ~/chai-report
$ git switch feature/by-item
Switched to branch 'feature/by-item'
$ git rebase main
Successfully rebased and updated refs/heads/feature/by-item.
$ git log --oneline --graph --all --decorate -6
* 1240ffd (HEAD -&gt; feature/by-item) Sort items by revenue
* f6d1553 Track revenue per item
* 912abb9 (main) Document the output in README
*   d4ed59f Merge branch 'fix/wording'
|\\  
| * ca71337 Say 'valid orders' in the summary line
* | 6b74ef3 Label the total as 'Total sales'
|/  
$ git switch main
Switched to branch 'main'
$ git merge feature/by-item
Updating 912abb9..1240ffd
Fast-forward
 sales_report.py | 4 ++++
 1 file changed, 4 insertions(+)
$ git log --oneline --graph --decorate -6
* 1240ffd (HEAD -&gt; main, feature/by-item) Sort items by revenue
* f6d1553 Track revenue per item
* 912abb9 Document the output in README
*   d4ed59f Merge branch 'fix/wording'
|\\  
| * ca71337 Say 'valid orders' in the summary line
* | 6b74ef3 Label the total as 'Total sales'
|/  
$ git branch -d feature/by-item
Deleted branch feature/by-item (was 1240ffd).
$ python3 sales_report.py sample_orders.csv
Total sales: ₹230 from 6 valid orders, rejected: 3
top item: masala chai (5 sold)
  masala chai  ₹100
  bun maska    ₹60
  samosa       ₹45
  ginger chai  ₹25</div>
  <p>Same starting graph, two endings. In <code>try-merge</code>, merge commit <code>37fdc99</code> joins E and D, and C and D keep their hashes (<code>5325b71</code>, <code>f5e0c65</code>). After the rebase, the same two changes sit after E as <code>f6d1553</code> and <code>1240ffd</code>: <strong>new hashes</strong>, because a commit's hash covers its parent (section 03) and the parent changed from <code>d4ed59f</code> to <code>912abb9</code>. Main then fast-forwarded and history is one line. The files are identical either way: the report now ends with revenue per item, masala chai ₹100, bun maska ₹60, samosa ₹45, ginger chai ₹25 (sum ₹230).</p>
  <figure class="viz"><svg viewBox="0 0 600 190" width="600">
    <text x="140" y="18" text-anchor="middle" class="tb">git merge feature (on main)</text>
    <text x="455" y="18" text-anchor="middle" class="tb">git rebase main (on feature)</text>
    <g stroke="currentColor" fill="none" stroke-width="1.5">
      <line x1="45" y1="120" x2="55" y2="120"/><line x1="85" y1="120" x2="195" y2="120"/><line x1="78" y1="107" x2="102" y2="73"/><line x1="125" y1="60" x2="155" y2="60"/><line x1="182" y1="70" x2="237" y2="108"/><line x1="225" y1="120" x2="233" y2="120"/>
      <line x1="345" y1="120" x2="365" y2="120"/><line x1="395" y1="120" x2="415" y2="120"/><line x1="445" y1="120" x2="475" y2="120"/><line x1="505" y1="120" x2="535" y2="120"/>
    </g>
    <line x1="300" y1="30" x2="300" y2="180" stroke="currentColor" stroke-dasharray="3 4"/>
    <circle cx="30" cy="120" r="15" class="fb sb"/><text x="30" y="125" text-anchor="middle" font-size="10">…</text>
    <circle cx="70" cy="120" r="15" class="fb sb"/><text x="70" y="125" text-anchor="middle" font-size="9">d4ed</text>
    <circle cx="110" cy="60" r="15" class="ft st"/><text x="110" y="65" text-anchor="middle">C</text>
    <circle cx="170" cy="60" r="15" class="ft st"/><text x="170" y="65" text-anchor="middle">D</text>
    <circle cx="210" cy="120" r="15" class="fb sb"/><text x="210" y="125" text-anchor="middle">E</text>
    <circle cx="250" cy="120" r="17" class="fg sg"/><text x="250" y="125" text-anchor="middle">M</text>
    <text x="280" y="160" text-anchor="end" class="tm">M = 37fdc99, 2 parents</text>
    <circle cx="330" cy="120" r="15" class="fb sb"/><text x="330" y="125" text-anchor="middle" font-size="10">…</text>
    <circle cx="380" cy="120" r="15" class="fb sb"/><text x="380" y="125" text-anchor="middle" font-size="9">d4ed</text>
    <circle cx="430" cy="120" r="15" class="fb sb"/><text x="430" y="125" text-anchor="middle">E</text>
    <circle cx="490" cy="120" r="15" class="ft st"/><text x="490" y="125" text-anchor="middle">C'</text>
    <circle cx="550" cy="120" r="15" class="ft st"/><text x="550" y="125" text-anchor="middle">D'</text>
    <text x="520" y="160" text-anchor="middle" class="tm">C' = f6d1553, D' = 1240ffd</text>
  </svg><figcaption>Merge keeps the true shape and adds M. Rebase replays C and D on top of E as new commits C', D'.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two friends write chapters of a group report in parallel. <strong>Merge</strong>: staple both stacks together with a cover note "joined here" (honest about the parallel work). <strong>Rebase</strong>: retype your chapters as if you had started after your friend finished (neat, but they are new pages, not the originals).</p>
  </div>
  <table class="tbl">
    <tr><th></th><th>Merge</th><th>Rebase</th></tr>
    <tr><td>History</td><td>True, branchy</td><td>Straight line, rewritten</td></tr>
    <tr><td>Commit hashes</td><td>Unchanged (5325b71, f5e0c65)</td><td>New for replayed commits (f6d1553, 1240ffd)</td></tr>
    <tr><td>Extra commit</td><td>Merge commit 37fdc99</td><td>None (main fast-forwards)</td></tr>
    <tr><td>Safe on a shared branch?</td><td>Yes</td><td>No: others still have the old commits</td></tr>
    <tr><td>Use for</td><td>Bringing finished work into a shared branch</td><td>Tidying your own branch before a PR</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Rebase</strong>: re-apply a series of commits onto a new base, creating new commits; the old ones remain only in the reflog until cleaned up. <code>git rebase -i</code> (interactive) also lets you reorder, squash and reword commits before sharing them.</p>
  </div>
  <div class="callout trap"><span class="label">Golden rule</span>
    <p>Never rebase commits that others have already pulled. Their copies contain C and D; yours contain C′ and D′ with the same changes. The next pull brings both, and the history fills with duplicates and conflicts. Rebase only your own unshared branch.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Remotes.</b> All of this lives in one folder on Meera's laptop. If the laptop dies, the history dies; and Ravi cannot see or add to it. How do two people share one history?</div>

  <h2 id="sg-remote"><span class="num">10</span>Remotes: push, fetch, pull</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Ravi wants to improve the README while Meera keeps working on the script. Where does the shared copy live, how does each person send and receive commits, and what happens when both push at the same time?</p>
  </div>
  <p>A <strong>remote</strong> is another copy of the repo, usually on GitHub, that everyone pushes to and pulls from. Because every copy holds the full history, there is technically no master copy; the team simply agrees that GitHub's copy is the one to share. To run everything offline we use a <strong>bare</strong> repo (history only, no working files, exactly what GitHub stores) in <code>~/server</code>; on GitHub only the URL changes.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A shared class register kept in the staff room. You work on your own copy at your desk. <strong>push</strong> carries your new pages to the register. <strong>fetch</strong> photocopies what others added and puts it in a tray on your desk without touching your work. <strong>pull</strong> photocopies and immediately files it into your copy.</p>
  </div>
  <table class="tbl">
    <tr><th>Command</th><th>What it does</th><th>Changes your files?</th></tr>
    <tr><td><code>git clone URL</code></td><td>Copy the whole repo and history; the remote is named <code>origin</code></td><td>Creates the folder</td></tr>
    <tr><td><code>git push</code></td><td>Upload your new commits to the remote branch</td><td>No</td></tr>
    <tr><td><code>git fetch</code></td><td>Download new commits; move <code>origin/main</code> only</td><td>No</td></tr>
    <tr><td><code>git pull</code></td><td><code>fetch</code> + merge (or <code>--rebase</code>) into your branch</td><td>Yes</td></tr>
  </table>
  <p>Meera publishes, Ravi clones and pushes a README line, Meera catches up. Then both commit at the same time: Ravi pushes a contact line first, and Meera's push of a CHANGELOG is rejected.</p>
  <div class="fx" data-lang="text">$ git init --bare ~/server/chai-report.git
Initialized empty Git repository in /home/meera/server/chai-report.git/
$ git remote add origin ~/server/chai-report.git
$ git remote -v
origin	/home/meera/server/chai-report.git (fetch)
origin	/home/meera/server/chai-report.git (push)
$ git push -u origin main
To /home/meera/server/chai-report.git
 * [new branch]      main -&gt; main
branch 'main' set up to track 'origin/main'.
$ cd ~
$ git clone server/chai-report.git ravi-laptop
Cloning into 'ravi-laptop'...
done.
$ cd ravi-laptop
$ git config user.name "Ravi"
$ git config user.email "ravi@example.com"
$ git branch -a
* main
  remotes/origin/HEAD -&gt; origin/main
  remotes/origin/main
$ git commit -qam "Explain rejected rows in README"
$ git push
To /home/meera/server/chai-report.git
   1240ffd..ddc38f6  main -&gt; main
$ cd ~/chai-report
$ git status -sb
## main...origin/main
$ git fetch
From /home/meera/server/chai-report
   1240ffd..ddc38f6  main       -&gt; origin/main
$ git status -sb
## main...origin/main [behind 1]
$ git log --oneline --graph --all --decorate -3
* ddc38f6 (origin/main) Explain rejected rows in README
* 1240ffd (HEAD -&gt; main) Sort items by revenue
* f6d1553 Track revenue per item
$ git pull
Updating 1240ffd..ddc38f6
Fast-forward
 README.md | 2 ++
 1 file changed, 2 insertions(+)
$ git add CHANGELOG.md
$ git commit -qm "Add CHANGELOG"
$ git push
To /home/meera/server/chai-report.git
 ! [rejected]        main -&gt; main (fetch first)
error: failed to push some refs to '/home/meera/server/chai-report.git'
hint: Updates were rejected because the remote contains work that you do not
hint: have locally. This is usually caused by another repository pushing to
hint: the same ref. If you want to integrate the remote changes, use
hint: 'git pull' before pushing again.
hint: See the 'Note about fast-forwards' in 'git push --help' for details.
$ git pull --rebase
From /home/meera/server/chai-report
   ddc38f6..abf5909  main       -&gt; origin/main
Successfully rebased and updated refs/heads/main.
$ git push
To /home/meera/server/chai-report.git
   abf5909..ca3c9b7  main -&gt; main
$ git log --oneline --graph --decorate -4
* ca3c9b7 (HEAD -&gt; main, origin/main) Add CHANGELOG
* abf5909 Add contact line to README
* ddc38f6 Explain rejected rows in README
* 1240ffd Sort items by revenue</div>
  <p>Point by point. <code>push -u</code> uploaded main and set its <strong>upstream</strong>, so later a plain <code>git push</code> knows where to go. In Ravi's clone, <code>git branch -a</code> shows <code>remotes/origin/main</code>: a <strong>remote-tracking branch</strong>, his laptop's memory of where main was on the server. After Ravi pushed, Meera's <code>status -sb</code> still said "up to date": it compares with <code>origin/main</code>, which only moves when you fetch. After <code>fetch</code> it said <code>[behind 1]</code>, the graph showed <code>origin/main</code> one commit ahead, and <code>pull</code> fast-forwarded. Later Ravi pushed first, so Meera's push was <strong>rejected</strong>: the server's main contained a commit she did not have. <code>pull --rebase</code> fetched it and replayed her CHANGELOG commit on top (section 09, but on her own unpushed commit, so it is safe), and the second push succeeded. The final log is one straight line containing both people's work.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Remote</strong>: a named URL of another copy (<code>git remote -v</code>). <strong>origin</strong>: the default name of the one you cloned from. <strong>Upstream branch</strong>: the remote branch your local branch pushes to and pulls from. <strong>Bare repository</strong>: a repo without a working tree, used on servers.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Never "fix" a rejected push with <code>git push --force</code> on a shared branch: it replaces the server's main with yours and deletes Ravi's commits there. Pull (or pull --rebase), resolve, test, push. And <code>origin/main</code> is only as fresh as your last fetch.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Pull Requests &amp; Review.</b> Now anyone can push to main, including a change that turns ₹230 into ₹23,000 on the owner's phone. How does a team check a change before it lands?</div>

  <h2 id="sg-pr"><span class="num">11</span>Pull Requests &amp; Code Review</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Pushing straight to main means nobody looks at a change before it reaches the nightly report. How do teams propose a change, test it, discuss it line by line, and only then merge it?</p>
  </div>
  <p>On a team, nobody pushes straight to <code>main</code>. You push a <strong>branch</strong> and open a <strong>pull request</strong> (PR) on GitHub: a web page that says "please merge my branch into main". It shows the branch's commits and the combined diff, runs automatic tests (CI), and lets teammates comment on lines before anything is merged.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Submitting a college assignment through the class teacher instead of pasting it straight into the printed magazine. The teacher reads it, marks corrections in red, you fix them, and only the approved version is printed.</p>
  </div>
  <div class="flow"><span>branch from main</span><span>commit + push</span><span>open PR</span><span>CI runs tests</span><span>review + fix</span><span>merge (squash)</span><span>delete branch</span></div>
  <p>Meera's change: log <em>why</em> each row was rejected, with its line number, to stderr (this log line is what the Linux note will search). The PR page itself needs GitHub, but everything it displays comes from two Git commands, which we ran: <code>git log main..BRANCH</code> (commits on the branch that main does not have) and <code>git diff main...BRANCH</code> (three dots: changes since the branch left main). After approval we did what GitHub's "Squash and merge" button does.</p>
  <div class="fx" data-lang="text">$ git switch -c feat/log-rejections
Switched to a new branch 'feat/log-rejections'
$ git commit -qam "Log why each row was rejected"
$ python3 sales_report.py sample_orders.csv
WARN line 8: bad number qty='two' price='15'
WARN line 9: bad number qty='1' price=''
WARN line 10: qty -1 is not positive
Total sales: ₹230 from 6 valid orders, rejected: 3
top item: masala chai (5 sold)
  masala chai  ₹100
  bun maska    ₹60
  samosa       ₹45
  ginger chai  ₹25
$ git push -u origin feat/log-rejections
To /home/meera/server/chai-report.git
 * [new branch]      feat/log-rejections -&gt; feat/log-rejections
branch 'feat/log-rejections' set up to track 'origin/feat/log-rejections'.
$ git log --oneline main..feat/log-rejections
4533294 Log why each row was rejected
$ git diff --stat main...feat/log-rejections
 sales_report.py | 16 +++++++++-------
 1 file changed, 9 insertions(+), 7 deletions(-)
$ git switch main
Switched to branch 'main'
Your branch is up to date with 'origin/main'.
$ git merge --squash feat/log-rejections
Updating ca3c9b7..4533294
Fast-forward
Squash commit -- not updating HEAD
 sales_report.py | 16 +++++++++-------
 1 file changed, 9 insertions(+), 7 deletions(-)
$ git commit -qm "Log why each row was rejected (#1)"
$ git push
To /home/meera/server/chai-report.git
   ca3c9b7..29629a8  main -&gt; main
$ git branch -D feat/log-rejections
Deleted branch feat/log-rejections (was 4533294).
$ git push origin --delete feat/log-rejections
To /home/meera/server/chai-report.git
 - [deleted]         feat/log-rejections
$ git log --oneline -3
29629a8 Log why each row was rejected (#1)
ca3c9b7 Add CHANGELOG
abf5909 Add contact line to README</div>
  <p>The script now prints three <code>WARN</code> lines naming lines 8, 9 and 10 of the sheet (Esha's "two", Farid's missing price, Gita's refund) before the summary. <code>main..feat/log-rejections</code> lists the one commit the PR would show; the three-dot diff is the "Files changed" tab: 9 lines in, 7 out. <code>git merge --squash</code> staged the branch's combined change without committing; one commit <code>29629a8</code> with the PR number in its message landed on main. Deleting the branch locally and on the server (<code>push origin --delete</code>) is the "Delete branch" button. The commands that need GitHub itself were not run here:</p>
  <div class="fx" data-lang="text">gh pr create --fill                          # open the PR from the pushed branch (or click on GitHub)
git pull --rebase origin main                # keep your branch current while the PR waits
git push --force-with-lease                  # required after that rebase; your own branch only</div>
  <p>Rebasing your PR branch rewrites its commits, so the next push must be forced. <code>--force-with-lease</code> is the safe version: it refuses if someone else pushed to your branch in the meantime.</p>
  <div class="cards">
    <div><b>Small PRs</b><p>Under ~400 lines gets a real review; 3,000 lines gets "LGTM" (looks good to me) without reading.</p></div>
    <div><b>Description</b><p>What, why, how it was tested; before/after output (₹230 stays ₹230; WARN lines added).</p></div>
    <div><b>Reviewer checks</b><p>Correctness, edge cases (empty sheet?), tests, naming, secrets, data files, notebook junk.</p></div>
    <div><b>Merge styles</b><p>Merge commit (keeps all), squash (one commit), rebase-and-merge (straight line).</p></div>
  </div>
  <p>A <strong>fork</strong> is your own server-side copy of someone else's repo: for open source you cannot push to their repo, so you push to your fork and open the PR from there. <strong>Branch protection</strong> rules ("main needs one approval and passing CI") make the PR flow mandatory.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Pull request</strong> (GitLab: merge request): a request to merge one branch into another, with commit list, diff, discussion, CI status and approvals. <strong>CI</strong> (continuous integration): automatic tests run on every push, e.g. GitHub Actions.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>One giant PR mixing a refactor, a feature and a dependency upgrade cannot be reviewed well and cannot be reverted in parts. Split by idea. In interviews, "how do you review code?" expects: understand the goal, run it, check tests and edge cases, comment kindly and specifically.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Undoing Things.</b> Review reduces mistakes; it does not remove them. A bad commit will reach main one day. How do we take back changes at each stage without making things worse?</div>

  <h2 id="sg-undo"><span class="num">12</span>Undoing Things</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A stray line in a file, a file staged by mistake, a typo in the last message, a bad commit already pushed, commits you want gone, commits you deleted by accident: each needs a different tool. Which one, and which one can destroy work?</p>
  </div>
  <p>Ask two questions. <strong>Where is the mistake</strong>: an unstaged edit, a staged file, or a commit? <strong>Has it been pushed</strong>? Then pick the matching tool.</p>
  <table class="tbl">
    <tr><th>Situation</th><th>Command</th><th>Rewrites history?</th></tr>
    <tr><td>Throw away edits to a file</td><td><code>git restore file</code></td><td>No (but the edits are lost)</td></tr>
    <tr><td>Unstage a file, keep the edits</td><td><code>git restore --staged file</code></td><td>No</td></tr>
    <tr><td>Fix the last commit (not pushed)</td><td><code>git commit --amend</code></td><td>Yes</td></tr>
    <tr><td>Undo a pushed commit</td><td><code>git revert HASH</code></td><td>No: adds an opposite commit</td></tr>
    <tr><td>Move the branch back (local commits)</td><td><code>git reset --soft / --mixed / --hard</code> ⚠</td><td>Yes; <code>--hard</code> also deletes file changes</td></tr>
    <tr><td>"I lost a commit"</td><td><code>git reflog</code>, then <code>git reset --hard HEAD@{n}</code></td><td>Recovery</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A newspaper. <strong>revert</strong> is a correction printed in tomorrow's edition: honest, safe after delivery. <strong>reset</strong> is pulping today's edition: fine before the trucks leave, chaos after readers have it. <strong>reflog</strong> is the press-room CCTV that shows every edition ever printed, so you can recover one you pulped.</p>
  </div>
  <h3>Step 1: edits and staging</h3>
  <div class="fx" data-lang="text">$ echo 'print(1/0)' &gt;&gt; sales_report.py
$ git status --short
 M sales_report.py
$ git restore sales_report.py
$ git status --short
$ echo "TODO: weekly report" &gt;&gt; README.md
$ git add README.md
$ git status --short
M  README.md
$ git restore --staged README.md
$ git status --short
 M README.md
$ git restore README.md</div>
  <p><code>git restore</code> put the file back to the last commit (the <code>print(1/0)</code> line is gone, status empty). For the README, <code>restore --staged</code> moved the M from the left column (staged) to the right column (not staged): the edit itself was kept, just taken out of the draft. The final <code>restore</code> threw it away.</p>
  <h3>Step 2: amend and revert</h3>
  <div class="fx" data-lang="text">$ git commit -qam "Updte changelog"
$ git log --oneline -2
c3591e3 Updte changelog
29629a8 Log why each row was rejected (#1)
$ git commit --amend -qm "Update changelog"
$ git log --oneline -2
4088acb Update changelog
29629a8 Log why each row was rejected (#1)
$ git commit -qam "Show amounts in paise"
$ python3 sales_report.py sample_orders.csv 2&gt;/dev/null | head -1
Total sales: ₹23000 from 6 valid orders, rejected: 3
$ git push -q
$ git revert --no-edit HEAD
[main 196ea51] Revert "Show amounts in paise"
 Date: Mon Oct 19 13:30:00 2026 +0530
 1 file changed, 1 insertion(+), 1 deletion(-)
$ python3 sales_report.py sample_orders.csv 2&gt;/dev/null | head -1
Total sales: ₹230 from 6 valid orders, rejected: 3
$ git log --oneline -4
196ea51 Revert "Show amounts in paise"
a31a9d5 Show amounts in paise
4088acb Update changelog
29629a8 Log why each row was rejected (#1)
$ git push -q</div>
  <p><code>--amend</code> replaced the typo commit <code>c3591e3</code> with <code>4088acb</code>: a new hash, because the message is part of the commit. Fine here, because it was not pushed. Then a really bad commit, "Show amounts in paise", was pushed: the owner's report now says ₹23000. Since others may already have it, we must not rewrite history. <code>git revert</code> kept the bad commit <code>a31a9d5</code> and added <code>196ea51</code> that applies the exact opposite change: the report is back to ₹230 and nobody's copy of history was altered.</p>
  <h3>Step 3: the three resets ⚠</h3>
  <p><code>reset</code> moves the current branch to another commit. The three modes differ in what happens to the changes of the commits you step back over. To compare them from the same starting point, we make two lab commits and copy the repo three times.</p>
  <div class="fx" data-lang="text">$ git switch -c reset-lab
Switched to a new branch 'reset-lab'
$ echo "line A" &gt; lab.txt
$ git add lab.txt
$ git commit -qm "Add line A"
$ echo "line B" &gt;&gt; lab.txt
$ git commit -qam "Add line B"
$ git log --oneline -2
d93ec39 Add line B
0518730 Add line A
$ cp -r ~/chai-report ~/lab-soft
$ cp -r ~/chai-report ~/lab-mixed
$ cp -r ~/chai-report ~/lab-hard
$ cd ~/lab-soft
$ git reset --soft HEAD~1
$ git status --short
M  lab.txt
$ cd ~/lab-mixed
$ git reset --mixed HEAD~1
Unstaged changes after reset:
M	lab.txt
$ git status --short
 M lab.txt
$ cd ~/lab-hard
$ git reset --hard HEAD~1
HEAD is now at 0518730 Add line A
$ git status --short
$ cat lab.txt
line A</div>
  <div class="cards">
    <div><b>reset --soft</b><p>Move the branch; keep the undone change <strong>staged</strong> (<code>M&#160;</code>). Use: squash the last few commits into one.</p></div>
    <div><b>reset --mixed</b><p>Default. Move the branch; keep the change in the file, <strong>unstaged</strong> (<code>&#160;M</code>).</p></div>
    <div><b>reset --hard ⚠</b><p>Move the branch and <strong>overwrite files</strong>: "line B" is gone from lab.txt. The dangerous one.</p></div>
  </div>
  <h3>Step 4: recovery with reflog, and its limit</h3>
  <div class="fx" data-lang="text">$ git reflog -4
0518730 HEAD@{0}: reset: moving to HEAD~1
d93ec39 HEAD@{1}: commit: Add line B
0518730 HEAD@{2}: commit: Add line A
196ea51 HEAD@{3}: checkout: moving from main to reset-lab
$ git reset --hard HEAD@{1}
HEAD is now at d93ec39 Add line B
$ cat lab.txt
line A
line B
$ echo "line C, never committed" &gt;&gt; lab.txt
$ git reset --hard
HEAD is now at d93ec39 Add line B
$ cat lab.txt
line A
line B</div>
  <p>The <strong>reflog</strong> is a local diary of every place HEAD has been. <code>HEAD@{1}</code> = "where HEAD was one move ago" = <code>d93ec39</code>, the commit we threw away; resetting to it brought "line B" back. But "line C" was never committed: <code>reset --hard</code> erased it and no diary has it. Commits can be recovered for about 90 days; uncommitted edits cannot.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>restore</strong>: copy a file from the index (or a commit) over the working copy. <strong>amend</strong>: replace the last commit. <strong>revert</strong>: new commit that inverts an old one. <strong>reset</strong>: move the current branch, optionally resetting index (<code>--mixed</code>) and files (<code>--hard</code>). <strong>reflog</strong>: local, unshared log of HEAD movements.</p>
  </div>
  <div class="callout trap"><span class="label">Trap ⚠</span>
    <p><code>git reset --hard</code> with uncommitted work deletes it for good, and <code>reset</code> + <code>push --force</code> on a shared branch deletes teammates' history. On shared branches use <code>revert</code>. When unsure, commit (or <code>git stash</code>) first; you can always tidy commits later.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: .gitignore &amp; Tags.</b> Undo tools fix commits we regret. Some files should never enter a commit at all (daily data, outputs, a password file), and some commits deserve a permanent name. How?</div>

  <h2 id="sg-ignore"><span class="num">13</span>.gitignore, Tags &amp; Releases</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>The real stall will produce a new orders sheet and a report every day, and the Docker note will need a database password in a <code>.env</code> file. None of that belongs in history. And when the script goes onto the server, how will anyone know exactly which commit is running?</p>
  </div>
  <p>A <code>.gitignore</code> file lists patterns Git should pretend not to see: daily data, generated outputs, secrets, caches, virtual environments. Worked example: we create today's real data and output, and a <code>.env</code> that someone <em>already committed</em> by mistake. Watch what happens to each.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A "do not pack" list stuck on your suitcase: wet towels, the hotel's hangers, your passport photocopies. Whatever matches the list is never put in the bag, however many times you pack. But it does nothing about things already in the bag.</p>
  </div>
  <div class="fx" data-lang="text">$ mkdir -p data out
$ cp sample_orders.csv data/orders_2026-10-19.csv
$ python3 sales_report.py data/orders_2026-10-19.csv &gt; out/report_2026-10-19.txt 2&gt;&amp;1
$ echo "DATABASE_URL=postgresql://chai:chai-secret@localhost:5432/stall" &gt; .env
$ git add .env
$ git commit -qm "Add local settings"
$ git status --short
?? data/
?? out/
$ printf 'data/\\nout/\\n.env\\n__pycache__/\\n.venv/\\n' &gt; .gitignore
$ git status --short
?? .gitignore
$ git check-ignore -v data/orders_2026-10-19.csv out/report_2026-10-19.txt .env
.gitignore:1:data/	data/orders_2026-10-19.csv
.gitignore:2:out/	out/report_2026-10-19.txt
$ echo "DATABASE_URL=postgresql://chai:NEW-secret@localhost:5432/stall" &gt; .env
$ git status --short
 M .env
?? .gitignore
$ git rm --cached .env
rm '.env'
$ git check-ignore -v .env
.gitignore:3:.env	.env
$ git add .gitignore
$ git commit -qm "Stop tracking .env; add .gitignore"
$ git status --short
$ git show HEAD~1:.env
DATABASE_URL=postgresql://chai:chai-secret@localhost:5432/stall</div>
  <p>After writing <code>.gitignore</code>, <code>data/</code> and <code>out/</code> vanished from status, and <code>check-ignore -v</code> names the file, line number and pattern that hides each path. But <code>.env</code> was not listed and still showed as <code>&#160;M</code>: <strong>ignore rules do not apply to files Git already tracks</strong>. <code>git rm --cached</code> removed it from tracking without deleting it from disk; only then did rule 3 apply. The last command is the scary part: the commit before still contains the old password, and anyone who clones the repo can read it.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Pushed a secret? Deleting it in a new commit is not enough. <strong>Rotate (revoke and replace) the password or key first</strong>, because bots scan GitHub within minutes. Then rewrite history with <code>git filter-repo</code> or BFG, force-push with the team's agreement, and load secrets from environment variables (Linux note) or a secret manager.</p>
  </div>
  <p>Now <strong>tags</strong>. The Linux note will install this script on a server. A month later someone asks "which code produced last Tuesday's report?" A hash works, but nobody remembers <code>b4f0033</code>. A tag is a human name fixed to one commit; unlike a branch, it never moves.</p>
  <div class="fx" data-lang="text">$ git tag -a v1.0.0 -m "First release: daily report with item breakdown"
$ git tag
v1.0.0
$ git cat-file -p v1.0.0
object b4f0033b8093f6d5dedd993594e7dceb98dbf337
type commit
tag v1.0.0
tagger Meera &lt;meera@example.com&gt; 1792400520 +0530

First release: daily report with item breakdown
$ git describe
v1.0.0
$ git commit -qam "Note the release in CHANGELOG"
$ git describe
v1.0.0-1-gdc2bfe3
$ git push -q
$ git push origin v1.0.0
To /home/meera/server/chai-report.git
 * [new tag]         v1.0.0 -&gt; v1.0.0
$ git ls-remote --tags origin
4f16afcd8842b8249a71ac28f426a82641a8a7ba	refs/tags/v1.0.0
b4f0033b8093f6d5dedd993594e7dceb98dbf337	refs/tags/v1.0.0^{}</div>
  <p><code>-a</code> makes an <strong>annotated tag</strong>: a fourth object type (<code>git cat-file -p</code> shows it: the commit it points to, tagger, date, message). <code>git describe</code> names the current commit relative to the nearest tag: right after tagging it is <code>v1.0.0</code>; one commit later <code>v1.0.0-1-gdc2bfe3</code> ("1 commit after v1.0.0, at hash dc2bfe3"). Tags are <strong>not</strong> sent by a plain <code>git push</code>; we pushed it explicitly, and <code>ls-remote</code> shows the server has the tag object (<code>4f16afc</code>) and the commit it peels to (<code>^{}</code> = <code>b4f0033</code>). A GitHub <strong>Release</strong> is a tag plus release notes plus attached files.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>.gitignore</strong>: patterns of untracked paths to ignore (<code>dir/</code>, <code>*.ext</code>, <code>!keep.me</code>). <strong>Tag</strong>: fixed name for a commit; annotated tags carry author, date and message. <strong>Semantic versioning</strong> MAJOR.MINOR.PATCH: bump MAJOR for breaking changes (output format changed), MINOR for compatible features, PATCH for bug fixes.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Moving a tag that others already fetched (<code>git tag -f</code>) silently gives two people two different "v1.0.0"s. Never reuse a version number; make v1.0.1.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Git for Data Science.</b> We ignored the daily data to keep it out of Git. But for ML we also need to know <em>which</em> data produced a result. How do we version big files without putting them in Git?</div>

  <h2 id="sg-ds"><span class="num">14</span>Git for Data Science</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>A year of order archives, a trained model, a 2 GB parquet file: commit them and every clone downloads every version forever, and GitHub rejects files over 100 MB. Yet a result is only reproducible if we know the exact data behind it. How do we get both?</p>
  </div>
  <p>Git was built for source code: many small text files. The fix in every tool is the same idea as a blob hash (section 03): keep a tiny <strong>pointer</strong> file in Git (the big file's hash and size) and store the big file somewhere built for big files. Git versions the pointer; the pointer says exactly which big file to download.</p>
  <figure class="viz"><svg viewBox="0 0 600 130" width="600">
    <defs><marker id="sg-arr3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="30" width="170" height="70" rx="8" class="fb sb"/><text x="95" y="56" text-anchor="middle">Git repo</text><text x="95" y="78" text-anchor="middle" class="tm">code + pointer</text>
    <rect x="250" y="30" width="110" height="70" rx="8" class="fs"/><text x="305" y="60" text-anchor="middle">pointer</text><text x="305" y="80" text-anchor="middle" class="tm">hash + size</text>
    <rect x="430" y="30" width="160" height="70" rx="8" class="fg sg"/><text x="510" y="56" text-anchor="middle">Big-file storage</text><text x="510" y="78" text-anchor="middle" class="tm">LFS / S3 / GCS</text>
    <g stroke="currentColor" fill="none" stroke-width="1.5"><line x1="182" y1="65" x2="246" y2="65" marker-end="url(#sg-arr3)"/><line x1="362" y1="65" x2="426" y2="65" marker-end="url(#sg-arr3)"/></g>
  </svg><figcaption>Git versions a small pointer; the big file lives elsewhere and is fetched by its hash.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A cloakroom token at a wedding hall. You do not carry your heavy bag around the hall; you carry a small numbered token. The token is cheap to keep and copy, and it gets you exactly your bag back.</p>
  </div>
  <p><strong>Git LFS</strong> (Large File Storage) does this inside Git. In a separate demo repo, a 2 MB archive file goes through LFS, and then we ask Git what it really stored:</p>
  <div class="fx" data-lang="text">$ cd ~
$ git init -q lfs-demo
$ cd lfs-demo
$ git lfs install
Updated Git hooks.
Git LFS initialized.
$ git lfs track "*.parquet"
Tracking "*.parquet"
$ cat .gitattributes
*.parquet filter=lfs diff=lfs merge=lfs -text
$ head -c 2000000 /dev/urandom &gt; orders_2026-10.parquet
$ git add .gitattributes orders_2026-10.parquet
$ git commit -qm "Archive October orders via LFS"
$ git show HEAD:orders_2026-10.parquet
version https://git-lfs.github.com/spec/v1
oid sha256:70e42ad0c2efac3b97c8ba947cf8c37af7c950795b07c1508bf53d8c44b1792a
size 2000000
$ ls -lh orders_2026-10.parquet | awk '{print $5, $9}'
2.0M orders_2026-10.parquet</div>
  <p><code>lfs track</code> wrote a rule into <code>.gitattributes</code> (commit that file too). The commit holds only three lines: the spec version, the SHA-256 of the content and its size. The real 2 MB file sits in the working folder and, after a push to GitHub, on its LFS server.</p>
  <p><strong>DVC</strong> (Data Version Control) is the DS favourite: data lives in your own S3/GCS/Azure bucket, and DVC can also describe pipelines (which script turned which data into which model). Typical commands (not run here, DVC is not installed in this sandbox):</p>
  <div class="fx" data-lang="text">dvc add data/orders_2026-10.parquet  # writes data/orders_2026-10.parquet.dvc (pointer), ignores the file
git add data/orders_2026-10.parquet.dvc data/.gitignore
git commit -m "Track October orders v1"
dvc push                             # upload the data to remote storage
# a teammate later: git pull &amp;&amp; dvc pull</div>
  <p><strong>Notebooks</strong>: an <code>.ipynb</code> file is JSON that also stores outputs, images and execution counts. Re-running one cell changes dozens of lines, so diffs are unreadable and conflicts common. Fixes: strip outputs before commit (<code>nbstripout</code> as a pre-commit hook), review with <code>nbdime</code>, or pair each notebook with a <code>.py</code> file using Jupytext. Move reusable code into modules (like <code>sales_report.py</code>).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Reproducibility</strong>: anyone can rebuild the same result from the same <strong>code commit</strong> (tag v1.0.0) + <strong>data version</strong> (pointer hash) + <strong>parameters</strong> + <strong>environment</strong> (<a class="xref" data-note="se_docker">Docker</a>). Git alone covers only the code.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Adding LFS after a big file is already committed does not shrink the repo: the old commits still contain it. Set up LFS/DVC before the first big file, or migrate history with <code>git lfs migrate</code>.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: How It All Connects.</b> Fourteen sections, one repo. How do the pieces (objects, index, refs, remotes) fit into one picture?</div>

  <h2 id="sg-connect"><span class="num">15</span>How It All Connects</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>We met many commands. Underneath, are they separate tools, or a few simple pieces combined? What does each command actually touch?</p>
  </div>
  <figure class="viz"><svg viewBox="0 0 660 300" width="660">
<defs><marker id="sg-a9" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="10" y="20" width="140" height="56" rx="7" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="80" y="42" text-anchor="middle" font-size="11.5" font-weight="700">Working tree</text><text x="80" y="60" text-anchor="middle" class="tm" font-size="10">sales_report.py</text>
<rect x="185" y="20" width="140" height="56" rx="7" class="fb sb"/><text x="255" y="42" text-anchor="middle" font-size="11.5" font-weight="700">Index</text><text x="255" y="60" text-anchor="middle" class="tm" font-size="10">path → blob hash</text>
<rect x="360" y="20" width="140" height="56" rx="7" class="ft st"/><text x="430" y="42" text-anchor="middle" font-size="11.5" font-weight="700">Objects</text><text x="430" y="60" text-anchor="middle" class="tm" font-size="10">blob · tree · commit · tag</text>
<rect x="535" y="20" width="115" height="56" rx="7" class="fg sg"/><text x="592" y="42" text-anchor="middle" font-size="11.5" font-weight="700">Refs</text><text x="592" y="60" text-anchor="middle" class="tm" font-size="10">HEAD, main, v1.0.0</text>
<line x1="150" y1="48" x2="182" y2="48" stroke="currentColor" marker-end="url(#sg-a9)"/><text x="166" y="40" text-anchor="middle" class="tm" font-size="9">add</text>
<line x1="325" y1="48" x2="357" y2="48" stroke="currentColor" marker-end="url(#sg-a9)"/><text x="341" y="40" text-anchor="middle" class="tm" font-size="9">commit</text>
<line x1="500" y1="48" x2="532" y2="48" stroke="currentColor" marker-end="url(#sg-a9)"/><text x="516" y="40" text-anchor="middle" class="tm" font-size="9">moves</text>
<rect x="100" y="120" width="460" height="64" rx="8" class="fs" stroke="currentColor" stroke-opacity="0.5"/>
<text x="330" y="140" text-anchor="middle" font-size="11" font-weight="700">Operations on refs and commits</text>
<text x="330" y="158" text-anchor="middle" class="tm" font-size="10">branch = new ref · merge = commit with 2 parents (or ff = move ref) · rebase = copy commits, move ref</text>
<text x="330" y="174" text-anchor="middle" class="tm" font-size="10">revert = new inverse commit · reset = move ref (+ index, + files with --hard) · tag = fixed ref</text>
<line x1="430" y1="76" x2="430" y2="118" stroke="currentColor" marker-end="url(#sg-a9)"/><line x1="592" y1="76" x2="520" y2="118" stroke="currentColor" marker-end="url(#sg-a9)"/>
<rect x="160" y="222" width="340" height="56" rx="8" class="fg sg"/><text x="330" y="244" text-anchor="middle" font-size="11.5" font-weight="700">Remote (bare repo / GitHub)</text><text x="330" y="262" text-anchor="middle" class="tm" font-size="10">push = send objects + move remote ref · fetch = get objects + move origin/main</text>
<line x1="330" y1="184" x2="330" y2="220" stroke="currentColor" marker-end="url(#sg-a9)"/>
<text x="560" y="250" class="tm" font-size="10">PR = log main..b</text><text x="560" y="264" class="tm" font-size="10">+ diff main...b</text>
</svg><figcaption>Four stores (working tree, index, objects, refs) plus a remote. Every command reads or writes one or more of them.</figcaption></figure>
  <table class="tbl"><caption>Every idea on the chai-report repo</caption>
    <tr><th>Concept</th><th>Built from</th><th>Answers which question</th><th>Value on the running example</th><th>When to use</th></tr>
    <tr><td>Commit</td><td>tree + parent + message</td><td>how do I save a version?</td><td>9dcb14a "total: ₹230" → 348ba6a "rejected: 3"</td><td>every logical change</td></tr>
    <tr><td>Objects</td><td>content hashes</td><td>what is stored, why cheap?</td><td>7 objects; CSV blob c475533 shared</td><td>to understand everything else</td></tr>
    <tr><td>Index</td><td>blobs</td><td>commit only part of my work?</td><td>MM: orders counter saved, DEBUG not</td><td>every commit (read diff --staged)</td></tr>
    <tr><td>log / diff / blame</td><td>commits + parents</td><td>what changed, when, who?</td><td><code>orders = 0</code> ← a2c291e</td><td>reviews, incidents</td></tr>
    <tr><td>Branch, HEAD</td><td>a ref file</td><td>work on the side?</td><td>main a2c291e vs feature 18e6652</td><td>every feature or experiment</td></tr>
    <tr><td>Fast-forward</td><td>moving a ref</td><td>join when main did not move?</td><td>main a2c291e → 18e6652</td><td>automatic</td></tr>
    <tr><td>Three-way merge</td><td>merge base + 2 tips</td><td>join when both moved?</td><td>81c2d38, parents f70064c + f9bc33d</td><td>finished work into shared branches</td></tr>
    <tr><td>Conflict</td><td>3-way on the same lines</td><td>what if both changed one line?</td><td>"Total sales … valid orders" (d4ed59f)</td><td>resolve by hand, then test</td></tr>
    <tr><td>Rebase</td><td>copy commits onto new base</td><td>straight history?</td><td>5325b71 → f6d1553, f5e0c65 → 1240ffd</td><td>own unshared branches only</td></tr>
    <tr><td>Remote</td><td>a second repo + refs</td><td>share with Ravi?</td><td>[behind 1]; rejected push → pull --rebase</td><td>always (backup + team)</td></tr>
    <tr><td>Pull request</td><td>branch + remote + review</td><td>check before main?</td><td>squash 29629a8 "(#1)"; WARN lines 8, 9, 10</td><td>every change in a team</td></tr>
    <tr><td>restore / revert / reset / reflog</td><td>index, commits, refs</td><td>take a change back?</td><td>₹23000 reverted to ₹230 (196ea51)</td><td>by where the mistake is + pushed?</td></tr>
    <tr><td>.gitignore</td><td>patterns on untracked paths</td><td>what never enters history?</td><td>data/, out/, .env (after rm --cached)</td><td>day one of every repo</td></tr>
    <tr><td>Tag</td><td>fixed ref (+ tag object)</td><td>which commit is deployed?</td><td>v1.0.0 → b4f0033</td><td>every release</td></tr>
    <tr><td>LFS / DVC</td><td>pointer = hash + size</td><td>version big files?</td><td>2 MB file → 3-line pointer</td><td>data and model files</td></tr>
  </table>
  <div class="callout intu"><span class="label">Key insight</span><p>One sentence holds the note: <strong>Git stores content-addressed snapshots (blobs, trees, commits) linked to their parents, and everything else (branches, HEAD, tags, origin/main) is a small named pointer to one of those commits; merging, rebasing, resetting and pushing are just ways of creating commits and moving pointers.</strong></p></div>
  <div class="bridge"><b>What this still can't tell us → next: Common Mistakes.</b> The habits that turn these simple pieces into lost work or leaked secrets.</div>

  <h2 id="sg-traps"><span class="num">16</span>Common Mistakes</h2>
  <div class="callout intu"><span class="label">The question we can't answer yet</span>
    <p>Which Git habits cost a day (or a leaked password), and what is the safe habit for each?</p>
  </div>
  <div class="callout trap"><span class="label">Trap: committing secrets and data</span>
    <p>Add a <code>.gitignore</code> on day one (<code>.env</code>, <code>data/</code>, <code>out/</code>, <code>*.pkl</code>, <code>.venv/</code>). If a key gets pushed, rotate it first, then clean history.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: force-pushing a shared branch</span>
    <p><code>git push --force</code> on main overwrites teammates' commits on the server. Use <code>revert</code> on shared branches; use <code>--force-with-lease</code> only on your own branch.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: rebasing public history</span>
    <p>Rebase creates new commits. If others built on the old ones, everyone gets duplicates. Rebase only what you alone have.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: the "commit everything" habit</span>
    <p><code>git add .</code> plus <code>git commit -m "updates"</code> mixes unrelated changes and stray files. Look at <code>git status</code> and <code>git diff --staged</code>, and write a message that says why.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: working directly on main</span>
    <p>Local commits on main make the next <code>pull</code> messy and tempt you to push untested code. Always <code>git switch -c</code> a branch first.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: reset --hard with uncommitted work</span>
    <p>Reflog brings back commits, not uncommitted edits ("line C" was gone for good). Commit or stash before any <code>--hard</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: leftover conflict markers</span>
    <p>The file still contains <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code> and the script dies with a syntax error. <code>grep -n '&lt;&lt;&lt;&lt;&lt;&lt;&lt;'</code> and run it before committing.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: forgetting to fetch</span>
    <p><code>origin/main</code> is only as fresh as your last fetch; "up to date" can be stale (as Meera's status showed). Run <code>git fetch</code> before comparing with the remote.</p>
  </div>
  <div class="bridge"><b>What this still can't tell us → next: Revision Sheet.</b> The whole note on one page.</div>

  <h2 id="sg-rev"><span class="num">R</span>Revision Sheet</h2>
  <p>Running example: <code>sales_report.py</code> on <code>sample_orders.csv</code> (9 rows) → <strong>Total sales: ₹230 from 6 valid orders, rejected: 3</strong>; top item masala chai (5 sold); revenue per item ₹100 / ₹60 / ₹45 / ₹25; WARN lines for sheet lines 8, 9, 10; released as tag <code>v1.0.0</code> (commit <code>b4f0033</code>) on the server repo <code>~/server/chai-report.git</code>.</p>
  <h3>The question ladder</h3>
  <table class="tbl">
    <tr><th>Idea</th><th>Question it answers</th><th>On our repo</th><th>Weakness → next</th></tr>
    <tr><td>Chaos</td><td>why not copies?</td><td>4 copies: crash, ₹210, ₹230, Rs 230</td><td>need saved versions with notes</td></tr>
    <tr><td>Commits</td><td>save a version?</td><td>9dcb14a, 348ba6a</td><td>what is saved?</td></tr>
    <tr><td>Objects</td><td>what is in .git?</td><td>7 objects; CSV blob shared</td><td>commit takes everything</td></tr>
    <tr><td>Staging</td><td>commit only part?</td><td>MM; orders counter in, DEBUG out</td><td>how to read history?</td></tr>
    <tr><td>History &amp; diff</td><td>what changed, who, why?</td><td>log, show, diff, blame</td><td>one line of work only</td></tr>
    <tr><td>Branches</td><td>work on the side?</td><td>refs/heads files: a2c291e vs 18e6652</td><td>bring work back</td></tr>
    <tr><td>Merge</td><td>join two lines?</td><td>ff; three-way 81c2d38 (2 parents)</td><td>same line changed twice</td></tr>
    <tr><td>Conflicts</td><td>Git cannot decide?</td><td>UU, markers, resolved d4ed59f</td><td>branchy history</td></tr>
    <tr><td>Rebase</td><td>straight history?</td><td>C, D → C′, D′ (new hashes)</td><td>still one laptop</td></tr>
    <tr><td>Remotes</td><td>share?</td><td>push -u, fetch, [behind 1], rejected push</td><td>no checks before main</td></tr>
    <tr><td>PRs</td><td>review first?</td><td>log main..b, diff main...b, squash (#1)</td><td>mistakes still land</td></tr>
    <tr><td>Undo</td><td>take it back?</td><td>restore, amend, revert ₹23000, reset ⚠, reflog</td><td>files that never belong</td></tr>
    <tr><td>.gitignore &amp; tags</td><td>keep out; name releases?</td><td>data/ out/ .env; v1.0.0</td><td>big data files</td></tr>
    <tr><td>LFS / DVC</td><td>version big files?</td><td>3-line pointer for 2 MB</td><td>→ Linux, Docker</td></tr>
  </table>
  <h3>Definitions and commands</h3>
  <ul>
    <li><strong>Repository</strong> = folder + <code>.git</code>. <strong>Commit</strong> = snapshot: tree + parent(s) + author + message, named by its SHA-1 hash.</li>
    <li><strong>Blob</strong> = file content; <strong>tree</strong> = folder (name → blob/tree); <strong>tag object</strong> = name + message → commit. Same content ⇒ same hash ⇒ stored once. <code>git cat-file -t/-p X</code>, <code>git hash-object f</code>.</li>
    <li>Revisions: <code>HEAD</code> (you are here), <code>HEAD~n</code> (n-th parent), <code>X^{tree}</code>, <code>HEAD@{n}</code> (reflog), <code>a..b</code> (commits in b not in a), <code>a...b</code> (diff since the merge base).</li>
    <li>Three areas: working tree → <code>git add</code> → index → <code>git commit</code> → repository. <code>git diff</code> = tree vs index; <code>git diff --staged</code> = index vs last commit. Status letters: left = staged, right = unstaged; <code>A</code>, <code>M</code>, <code>MM</code>, <code>??</code>, <code>UU</code>.</li>
    <li><strong>Branch</strong> = <code>.git/refs/heads/NAME</code> holding one hash; <strong>HEAD</strong> = <code>ref: refs/heads/NAME</code> (or a raw hash = detached). <code>git switch -c b</code>, <code>git switch b</code>, <code>git branch -d b</code>, <code>git stash</code> / <code>stash pop</code>.</li>
    <li><strong>Fast-forward</strong>: target is an ancestor → pointer moves. <strong>Three-way</strong>: merge base + ours + theirs → merge commit with 2 parents. <strong>Conflict</strong>: both changed the same lines → markers <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code> / <code>=======</code> / <code>&gt;&gt;&gt;&gt;&gt;&gt;&gt;</code>; fix, <code>add</code>, <code>commit</code>; or <code>merge --abort</code>.</li>
    <li><strong>Rebase</strong>: replay commits onto a new base → new hashes; never on shared commits.</li>
    <li><strong>Remotes</strong>: <code>clone</code>, <code>remote -v</code>, <code>push -u origin b</code>, <code>fetch</code> (moves <code>origin/b</code>), <code>pull</code> = fetch + merge, <code>pull --rebase</code>; <code>push --force-with-lease</code> only on your own branch.</li>
    <li><strong>Undo</strong>: <code>restore f</code>, <code>restore --staged f</code>, <code>commit --amend</code> (unpushed), <code>revert H</code> (pushed), <code>reset --soft/--mixed/--hard H</code>, <code>reflog</code>.</li>
    <li><strong>.gitignore</strong> only affects untracked files → <code>git rm --cached f</code>; <code>check-ignore -v</code>. <strong>Tag</strong>: <code>git tag -a v1.0.0 -m …</code>, <code>git push origin v1.0.0</code>, <code>git describe</code>. SemVer MAJOR.MINOR.PATCH.</li>
  </ul>
  <h3>When to use, when not</h3>
  <div class="cards">
    <div><b>Merge</b><p>Bring finished work into a shared branch; keeps true history.</p><small>Noisy if used for every tiny update</small></div>
    <div><b>Rebase</b><p>Update or tidy your own branch before a PR.</p><small>Never on commits others have</small></div>
    <div><b>revert</b><p>Undo anything already pushed.</p><small>Leaves both commits in the log (by design)</small></div>
    <div><b>reset --hard ⚠</b><p>Throw away local commits and edits you are sure about.</p><small>Never with uncommitted work you need; never + force-push on shared branches</small></div>
    <div><b>amend</b><p>Fix the last commit's message or content before pushing.</p><small>Not after pushing</small></div>
    <div><b>LFS / DVC</b><p>Data and model files, from the first commit.</p><small>Not for code; adding later does not shrink history</small></div>
  </div>
  <div class="callout trap"><span class="label">Key traps</span><p>Secrets committed (rotate first); force-push on shared branches; rebasing shared commits; <code>add .</code> + "updates"; working on main; <code>reset --hard</code> with uncommitted work; leftover conflict markers; stale <code>origin/main</code> without fetch; ignore rules on already-tracked files; tags not pushed.</p></div>
  <h3>Five rapid-fire checks</h3>
  <table class="tbl">
    <tr><th>Question</th><th>Answer</th></tr>
    <tr><td>Two commits changed only the script. How many blobs does the CSV use?</td><td>One (c475533): same content, same hash, stored once</td></tr>
    <tr><td>What is inside <code>.git/refs/heads/main</code>?</td><td>One 40-character commit hash (plus a newline)</td></tr>
    <tr><td>When is a merge a fast-forward?</td><td>When the target branch has no commits the other lacks (it is an ancestor)</td></tr>
    <tr><td>Why did rebasing change C's hash?</td><td>A commit's hash covers its parent; the parent changed</td></tr>
    <tr><td>A pushed commit broke the report. Which command?</td><td><code>git revert HASH</code>, then push</td></tr>
  </table>

  <h2 id="sg-qa"><span class="num">17</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between Git and GitHub?</summary><div class="qa-body">Git is the version control program that runs on your machine and stores history in <code>.git</code>. GitHub is a hosting website for Git repos that adds collaboration: pull requests, reviews, issues, CI (Actions), permissions. GitLab and Bitbucket are alternatives.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does Git store diffs or snapshots?</summary><div class="qa-body">Snapshots: each commit points to a tree of the whole project. Unchanged files reuse the same blob hash, so they cost nothing extra (our CSV blob c475533 is shared by both trees). Diffs are computed on demand. (Packfiles use delta compression on disk, but that is a storage detail.)</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Name Git's object types and what each holds.</summary><div class="qa-body">Blob: file content. Tree: a folder listing (names → blobs/trees). Commit: tree + parent(s) + author/committer + message. Annotated tag: name + message + tagger → a commit. All are named by the hash of their content.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a branch, physically? Why is branching cheap?</summary><div class="qa-body">A file in <code>.git/refs/heads/</code> containing one 40-character commit hash. Creating a branch writes that small file; committing moves it forward. No project files are copied.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is HEAD, and what is a detached HEAD?</summary><div class="qa-body">HEAD is "where you are": normally <code>ref: refs/heads/main</code>, i.e. it points to a branch, which points to a commit. Detached HEAD means HEAD holds a commit hash directly (after <code>git checkout HASH</code>). New commits there belong to no branch; create one with <code>git switch -c name</code> to keep them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does <code>git status --short</code> show after you stage a file, then edit it again? What does a commit save?</summary><div class="qa-body"><code>MM file</code>: modified in staging (vs last commit) and modified again in the working tree (vs staging). A commit saves only the staged version; the later edit stays uncommitted.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>git diff</code> vs <code>git diff --staged</code>?</summary><div class="qa-body"><code>git diff</code> compares the working tree with staging (what you have not added yet). <code>git diff --staged</code> compares staging with the last commit (what the next commit will contain).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When does Git do a fast-forward merge, and when a three-way merge?</summary><div class="qa-body">Fast-forward when the branch you merge into is an ancestor of the other: the label just moves, no new commit (<code>--no-ff</code> forces one). Three-way when both moved: Git uses the merge base and both tips and records a merge commit with two parents.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Merge vs rebase: when do you use each?</summary><div class="qa-body">Rebase your own, unshared feature branch onto main to get a clean straight history before a PR. Merge (or squash-merge) to bring finished work into a shared branch. Never rebase commits others have, because rebase creates new hashes and causes duplicates.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Walk me through resolving a merge conflict.</summary><div class="qa-body"><code>git status</code> lists <code>UU</code> files. Open each, decide the final content between <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code>, <code>=======</code>, <code>&gt;&gt;&gt;&gt;&gt;&gt;&gt;</code> (ours, theirs, both or something new), delete the markers, run the tests, <code>git add</code> the file, <code>git commit</code>. Ask the other author if the intent is unclear. <code>git merge --abort</code> backs out.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>fetch vs pull?</summary><div class="qa-body"><code>fetch</code> downloads remote commits and updates remote-tracking branches like <code>origin/main</code> without touching your branch or files. <code>pull</code> = fetch + merge (or rebase with <code>--rebase</code>) into your current branch.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your push is rejected: "the remote contains work that you do not have". What now?</summary><div class="qa-body">Someone pushed first. <code>git pull --rebase</code> (or plain pull), resolve any conflicts, run the tests, push again. Do not force-push a shared branch.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You pushed a commit that broke production. How do you undo it?</summary><div class="qa-body"><code>git revert HASH</code> and push. It adds a new commit that inverts the bad one, so nobody's history is rewritten (the paise bug: a31a9d5 reverted by 196ea51). Don't <code>reset</code> + force-push a shared branch.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>reset --soft vs --mixed vs --hard?</summary><div class="qa-body">All move the current branch to another commit. Soft keeps the undone changes staged; mixed (default) keeps them in the files, unstaged; hard discards them from the files too. Only hard loses work, and reflog can still find the commits (not uncommitted edits).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You ran <code>git reset --hard</code> and lost 3 commits. Recover them.</summary><div class="qa-body"><code>git reflog</code> to find where HEAD was before the reset (e.g. <code>HEAD@{1}</code>), then <code>git reset --hard HEAD@{1}</code> or <code>git branch rescue HASH</code>. Uncommitted changes, though, are gone.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You committed a database password last week and pushed. What do you do?</summary><div class="qa-body">Rotate the password immediately and assume it is compromised. Then remove it from history (<code>git filter-repo</code> or BFG), force-push with team coordination, add the file to .gitignore, and load secrets from env vars or a secret manager.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You added <code>.env</code> to .gitignore but Git still shows it as modified. Why?</summary><div class="qa-body">It is already tracked; ignore rules only affect untracked files. Run <code>git rm --cached .env</code> and commit. The old commits still contain it, so rotate any secret inside.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why not commit a 3 GB training CSV, and what instead?</summary><div class="qa-body">Every clone downloads every version forever, and GitHub rejects files over 100 MB. Use DVC (or Git LFS) so Git stores a small pointer (hash + size) and the data lives in S3/GCS, versioned by hash.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why are notebooks painful in Git and how do you fix it?</summary><div class="qa-body">An .ipynb is JSON containing outputs, images and execution counts, so tiny changes give huge diffs and conflicts. Strip outputs before commit (nbstripout / pre-commit hook), review with nbdime, or pair with a .py via Jupytext; move reusable code into modules.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What makes a good pull request?</summary><div class="qa-body">Small and focused (one idea, a few hundred lines), a description of what/why/how tested, passing CI, tests for new behaviour, before/after output for behaviour changes, no secrets or data files. Respond to every review comment.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does a branch need the object model to be cheap?</summary><div class="qa-body">Because commits are immutable, content-addressed snapshots, a branch never has to copy files: it only needs to remember one commit hash. If Git stored mutable folders, a branch would have to duplicate them. The cheapness of branching is a direct consequence of "everything is a hashed object, refs are just names".</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why does rebase change hashes while a fast-forward merge does not?</summary><div class="qa-body">A fast-forward only moves a ref to an existing commit, so no object changes. Rebase creates new commits with a different parent; the parent hash is part of each commit's content, so every replayed commit gets a new hash. That is also why rebasing shared commits breaks other people's copies.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: what breaks if you skip the staging area habit (always <code>commit -a</code> / <code>add .</code>)?</summary><div class="qa-body">Commits mix unrelated changes (the DEBUG print, notes files), so history and blame lie about why lines changed, reviews get harder, and <code>revert</code> can no longer undo one idea without undoing others. Small, staged-on-purpose commits are what make history, review and undo work.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Connection: why is <code>revert</code> safe after pushing but <code>reset</code> is not?</summary><div class="qa-body"><code>revert</code> only adds a commit, which every clone can fast-forward to. <code>reset</code> moves the branch back, so the shared branch would need a force-push and everyone who already has the old commits ends up with history the server no longer has.</div></details>
</main>
`
});
