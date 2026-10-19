// notes/softeng/se_git.js — Git & GitHub
Object.assign(TOPIC_CONTENT, {
  "se_git": `<main>
  <h1>Git &amp; GitHub</h1>
  <p class="lead">Git keeps every saved version of your project, so you can go back in time, try ideas on the side and work with a team without overwriting each other. GitHub is a website that hosts Git projects and adds pull requests and code review. Every DS, ML and backend job uses both, and interviewers expect you to branch, merge, fix a conflict and undo a mistake calmly. No earlier note is needed; a little terminal comfort (<a class="xref" data-note="se_linux">Linux &amp; Terminal</a>) helps.</p>

  <h2 id="sg-map" class="open"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Git &amp; GitHub</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Why &amp; first repo</div>
        <ul>
          <li><b>Problem</b> — <code>model_final_v3_REAL.py</code>, emailed zips, lost work, overwritten edits</li>
          <li><b>Repo</b> — project folder + hidden <code>.git</code> folder that holds all history</li>
          <li><b>Setup once</b> — <code>git config --global user.name / user.email</code></li>
          <li><b>Loop</b> — edit → <code>git add</code> → <code>git commit -m "…"</code> → <code>git log --oneline</code></li>
          <li><b>Git vs GitHub</b> — tool on your laptop vs website that hosts repos + PRs</li>
          <li>💡 a save-game in a video game: go back to any checkpoint</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">How Git stores history</div>
        <ul>
          <li><b>Commit</b> — full snapshot (tree) + author + time + message + parent pointer(s)</li>
          <li><b>Objects</b> — blob (file content), tree (folder), commit; named by SHA-1 hash</li>
          <li><b>Snapshots, not diffs</b> — unchanged file = same blob hash, stored once</li>
          <li><b>DAG</b> — commits point back to parents; merge commit has 2 parents</li>
          <li><b>Branch</b> — tiny file holding one commit hash; <b>HEAD</b> — "you are here"</li>
          <li><b>Inspect</b> — <code>git cat-file -p HEAD</code>, <code>cat .git/HEAD</code></li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Three areas</div>
        <ul>
          <li><b>Working tree</b> → <code>add</code> → <b>index (staging)</b> → <code>commit</code> → <b>repository</b></li>
          <li><b>Staging</b> — choose exactly what goes into the next commit</li>
          <li><b><code>status --short</code></b> — left letter = staged, right letter = not staged
            <ul><li><code>A</code> new staged · <code>MM</code> staged then edited · <code>??</code> untracked · <code>UU</code> conflict</li></ul>
          </li>
          <li><b><code>git diff</code></b> = not yet staged; <b><code>git diff --staged</code></b> = going into commit</li>
          <li>⚠ Commit after re-editing saves only the staged version</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Commits &amp; branches</div>
        <ul>
          <li><b>Message</b> — short imperative subject ("Add…", ≤ ~50 chars); body says <em>why</em></li>
          <li><b>One logical change per commit</b> — easy to review and revert</li>
          <li><b>Branch</b> — <code>git switch -c feat/x</code>, <code>git switch main</code>, <code>git branch -d feat/x</code></li>
          <li><b>Committing</b> moves only the branch HEAD points to</li>
          <li>⚠ <b>Detached HEAD</b> — HEAD on a commit, not a branch → <code>git switch -c rescue</code> to keep work</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Merge vs rebase</div>
        <ul>
          <li><b>Fast-forward</b> — main has nothing new → label slides forward, no new commit</li>
          <li><b>Merge commit</b> — both moved → new commit M with 2 parents; true history</li>
          <li><b>Rebase</b> — replay your commits on top of main → straight line, <em>new hashes</em> (C → C′)</li>
          <li><b>Use</b> — rebase your own branch before a PR; merge/squash into shared main</li>
          <li>⚠ <b>Golden rule</b> — never rebase commits others already pulled</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Conflicts</div>
        <ul>
          <li><b>Cause</b> — both branches changed the same lines → merge stops, file is <code>UU</code></li>
          <li><b>Markers</b> — <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD</code> yours · <code>=======</code> · <code>&gt;&gt;&gt;&gt;&gt;&gt;&gt; branch</code> theirs</li>
          <li><b>Fix</b> — write final text, delete markers → <code>git add</code> → <code>git commit</code></li>
          <li><b>Escape</b> — <code>git merge --abort</code> = back to before the merge</li>
          <li>⚠ Leftover markers = syntax error; run tests first</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Remotes &amp; PRs</div>
        <ul>
          <li><b>origin</b> — default name of the server copy; <code>origin/main</code> = your last-known view of it</li>
          <li><b>clone</b> copy · <b>push</b> upload · <b>fetch</b> download only · <b>pull</b> = fetch + merge</li>
          <li><b><code>push -u</code></b> — remember the upstream; then plain <code>git push</code></li>
          <li><b>PR flow</b> — branch → commit → push → PR → CI → review → squash-merge → delete branch</li>
          <li><b>Good PR</b> — small (&lt; ~400 lines), clear description, tests, metrics for model changes</li>
          <li><b>Fork</b> — your own server copy of someone else's repo</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">.gitignore &amp; tags</div>
        <ul>
          <li><b>Ignore</b> — <code>data/</code>, <code>*.pkl</code>, <code>.env</code>, <code>__pycache__/</code>, checkpoints, venvs</li>
          <li><b><code>check-ignore -v</code></b> — which rule hides a file</li>
          <li>⚠ Already tracked? ignore does nothing → <code>git rm --cached file</code></li>
          <li>⚠ Pushed secret stays in history → rotate the key FIRST, then purge</li>
          <li><b>Tag</b> — fixed name for one commit: <code>git tag -a v1.0.0 -m …</code>; push it explicitly</li>
          <li><b>Release</b> — tag + notes + files; versions MAJOR.MINOR.PATCH</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Undoing safely</div>
        <ul>
          <li><b><code>restore file</code></b> — throw away edits · <b><code>restore --staged</code></b> — unstage</li>
          <li><b><code>commit --amend</code></b> — fix the last <em>unpushed</em> commit</li>
          <li><b><code>revert &lt;hash&gt;</code></b> — new opposite commit; safe after push</li>
          <li><b><code>reset</code></b> — move the branch back
            <ul><li><code>--soft</code> keep staged · <code>--mixed</code> keep unstaged · <code>--hard</code> delete</li></ul>
          </li>
          <li><b><code>reflog</code></b> — diary of where HEAD was → <code>reset --hard HEAD@{1}</code> recovers</li>
          <li>💡 revert = correction printed tomorrow; reset = pulping today's paper</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Git for data science</div>
        <ul>
          <li><b>Problem</b> — big files bloat every clone forever; GitHub rejects &gt; 100 MB</li>
          <li><b>Git LFS</b> — Git stores a pointer (sha256 + size); file lives on LFS server</li>
          <li><b>DVC</b> — <code>dvc add</code> → <code>.dvc</code> pointer in Git; <code>dvc push</code> data to S3/GCS</li>
          <li><b>Notebooks</b> — JSON + outputs → noisy diffs; nbstripout, nbdime, Jupytext</li>
          <li><b>Reproducible</b> = code commit + data version + params</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sg-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Git &amp; Your First Repo</span><span class="rm-sub">init, add, commit, log</span></div></div>
      <div class="rm-item rm-done" data-target="sg-model"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">How Git Stores History</span><span class="rm-sub">Snapshots, hashes, HEAD</span></div></div>
      <div class="rm-item rm-done" data-target="sg-areas"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">The Three Areas</span><span class="rm-sub">Working tree → staging → repo</span></div></div>
      <div class="rm-item rm-done" data-target="sg-commit"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">Commits &amp; Branches</span><span class="rm-sub">Good messages, cheap labels</span></div></div>
      <div class="rm-item rm-done" data-target="sg-merge"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Merge vs Rebase</span><span class="rm-sub">Two ways to join work</span></div></div>
      <div class="rm-item rm-done" data-target="sg-conflict"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Resolving a Conflict</span><span class="rm-sub">Real markers, real fix</span></div></div>
      <div class="rm-item rm-done" data-target="sg-remote"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Remotes</span><span class="rm-sub">clone, push, fetch, pull</span></div></div>
      <div class="rm-item rm-done" data-target="sg-pr"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Pull Requests &amp; Review</span><span class="rm-sub">The GitHub team flow</span></div></div>
      <div class="rm-item rm-done" data-target="sg-ignore"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">.gitignore, Tags, Releases</span><span class="rm-sub">What never gets committed</span></div></div>
      <div class="rm-item rm-done" data-target="sg-undo"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Undoing Things Safely</span><span class="rm-sub">restore, revert, reset, reflog</span></div></div>
      <div class="rm-item rm-done" data-target="sg-ds"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">Git for Data Science</span><span class="rm-sub">Big files, DVC, notebooks</span></div></div>
      <div class="rm-item rm-done" data-target="sg-traps"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">The ones that cost a day</span></div></div>
      <div class="rm-item rm-done" data-target="sg-qa"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Questions &amp; Answers</span><span class="rm-sub">Interview-style checks</span></div></div>
    </div>
  </div>

  <h2 id="sg-why"><span class="num">01</span>Why Git &amp; Your First Repo</h2>
  <p>Picture a college project folder without Git. You have <code>train.py</code>, <code>train_old.py</code>, <code>train_final.py</code> and <code>train_final_v2_REAL.py</code>. Last week's version gave better accuracy, but you do not know which file it was or what you changed since. Your teammate emails you her copy, and you paste her changes into yours by hand. One wrong paste and her work is gone.</p>
  <p>Git solves this. You keep <strong>one</strong> <code>train.py</code>. Whenever the code is in a state worth keeping, you tell Git "save this moment, with this note". Git stores that moment forever. Later you can list all saved moments, see exactly what changed between any two, and bring back any old one. Two people can work on separate copies and Git joins their work, line by line.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A video game with save points. Before the boss fight you save. If it goes badly you load the save and try again. Git is unlimited save points for a whole folder, and every save point has a note saying what you did.</p>
  </div>
  <p>A few words first. A <strong>repository</strong> (repo) is a project folder that Git is tracking. Git keeps everything in a hidden sub-folder called <code>.git</code>. A <strong>commit</strong> is one save point. <strong>Git</strong> is the program on your laptop. <strong>GitHub</strong> (or GitLab, Bitbucket) is a website that stores a copy of the repo so a team can share it.</p>
  <p>Tiny worked example. Step 1: make a repo. Step 2: write a file. Step 3: tell Git to include it (<code>add</code>). Step 4: save (<code>commit</code>). Step 5: change the file and save again. Step 6: look at the history. The commands below do exactly these six steps. Run once per laptop first: <code>git config --global user.name "Asha"</code> and <code>git config --global user.email asha@example.com</code>, because every commit records who made it.</p>
  <div class="fx" data-lang="text">git init churn-model                         # 1. new repo (creates churn-model/.git)
cd churn-model
printf "LEARNING_RATE = 0.01&#92;n" &gt; train.py   # 2. write a file
git status                                   #    what does Git see?
git add train.py                             # 3. include it in the next save
git commit -m "Add training config"          # 4. save point #1
printf "EPOCHS = 10&#92;n" &gt;&gt; train.py           # 5. change the file
git diff                                     #    what changed since the save?
git commit -am "Add epochs"                  #    save point #2 (-a = add changed tracked files)
git log --oneline                            # 6. history, newest first</div>
  <div class="fx" data-lang="text">Initialized empty Git repository in .../churn-model/.git/
$ git status
On branch main

No commits yet

Untracked files:
  (use "git add &lt;file&gt;..." to include in what will be committed)
	train.py

nothing added to commit but untracked files present (use "git add" to track)
$ git commit -m "Add training config"
[main (root-commit) f3841fd] Add training config
 1 file changed, 1 insertion(+)
 create mode 100644 train.py
$ git diff
diff --git a/train.py b/train.py
index ebdd4da..ea53b8c 100644
--- a/train.py
+++ b/train.py
@@ -1 +1,2 @@
 LEARNING_RATE = 0.01
+EPOCHS = 10
$ git commit -am "Add epochs"
[main 6f98ac5] Add epochs
 1 file changed, 1 insertion(+)
$ git log --oneline
6f98ac5 Add epochs
f3841fd Add training config</div>
  <p>Read it line by line. <code>git status</code> says the file is <strong>untracked</strong>: Git sees it but is not saving it yet. After <code>add</code> and <code>commit</code>, Git prints <code>f3841fd</code>: the short ID (hash) of the new commit. <code>git diff</code> shows the change as lines starting with <code>+</code> (added) or <code>-</code> (removed). <code>git log --oneline</code> lists the two save points, newest on top. Notice we never renamed the file: one <code>train.py</code>, two versions safely stored.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Version control</strong>: a system that records changes to files over time so you can recall any version. Git is a <strong>distributed</strong> version control system: every clone has the full history, so you can commit, branch and view logs offline.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Running <code>git init</code> in your home folder by mistake turns your whole home into one giant repo, and every later <code>git status</code> lists thousands of files. Run it inside the project folder. If it happens, delete the stray <code>~/.git</code> folder.</p>
  </div>

  <h2 id="sg-model"><span class="num">02</span>How Git Stores History</h2>
  <p>Most beginners imagine Git stores "what changed" (a list of edits). It does not. It stores a <strong>snapshot</strong>: a picture of every file in the project at the moment of the commit. That sounds wasteful, but Git has a trick: it names every file content by its <strong>hash</strong>, a 40-character fingerprint computed from the content. Same content gives the same hash, so an unchanged file is stored once and every later snapshot just points to it.</p>
  <p>Three kinds of objects live inside <code>.git</code>. A <strong>blob</strong> is the content of one file. A <strong>tree</strong> is a folder listing: names pointing to blobs and sub-trees. A <strong>commit</strong> points to one tree (the whole project) plus author, time, message and its <strong>parent</strong> commit (the one before it).</p>
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
    <text x="300" y="160" text-anchor="middle" class="tm">each commit points back to its parent; branches are labels on commits</text>
  </svg><figcaption>History is a graph of snapshots. Arrows go backwards (child → parent). HEAD → main → D. A new commit on main moves only the main label.</figcaption></figure>
  <p>The arrows only point backwards, and you can never loop back to where you started. Such a graph is called a <strong>DAG</strong> (directed acyclic graph). A <strong>branch</strong> is just a label stuck on one commit, and <strong>HEAD</strong> is the label that says "you are here". Usually HEAD points to a branch name, and the branch points to a commit.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A family photo album. Each commit is a photo of the whole room, with a caption, stuck under the previous photo. If the sofa did not move between photos, the album says "same sofa as page 3" instead of printing it again. A branch is a sticky note saying "Asha's latest" on one page. HEAD is your finger on the page you are looking at.</p>
  </div>
  <p>Let us open the real objects. Below we add a third commit (a <code>src/prep.py</code> file), then ask Git to print (<code>cat-file -p</code>) the commit, its tree, and the previous commit's tree.</p>
  <div class="fx" data-lang="text">$ git cat-file -p HEAD
tree 752b6824e6abdcfd1bc5ca8a787069793ed3ba54
parent 6f98ac5cccccd855324004edb6b5c3cb252860ce
author Asha &lt;asha@example.com&gt; 1760000240 +0530
committer Asha &lt;asha@example.com&gt; 1760000240 +0530

Add prep
$ git cat-file -p HEAD^{tree}
040000 tree 5dcaaa2db3bd61f6188c32709a2b2903836edc6d	src
100644 blob ea53b8c8491e45d7f131df499bade220eafa9a62	train.py
$ git cat-file -p HEAD~1^{tree}
100644 blob ea53b8c8491e45d7f131df499bade220eafa9a62	train.py
$ cat .git/HEAD
ref: refs/heads/main
$ cat .git/refs/heads/main
19975585f3e7a2deef4c694cb036d279bb212ab3</div>
  <p>Point at three things. First, the commit is plain text: a <code>tree</code> line, a <code>parent</code> line (the commit <code>6f98ac5</code> from section 01), author, time and message. Second, <code>train.py</code> has the same blob hash <code>ea53b8c…</code> in both trees: it did not change, so it is stored once. Third, <code>.git/HEAD</code> just says "I am on main", and the <code>main</code> branch is a small file holding one commit hash. That is why making a branch is instant: Git writes a 41-byte file.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Commit hash</strong>: SHA-1 of the commit's contents (tree, parents, author, message). Change anything, even the message, and the hash changes. <code>HEAD~1</code> means "parent of HEAD"; <code>HEAD~2</code> the grandparent.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>"Git stores diffs" is a common wrong interview answer. Git stores snapshots; <code>git diff</code> computes the difference when you ask. (On disk Git later packs objects with delta compression, but that is a storage detail, not the model.)</p>
  </div>

  <h2 id="sg-areas"><span class="num">03</span>The Three Areas</h2>
  <p>Here is a real situation. You fixed a bug in <code>train.py</code> and, in the same file, also started a half-done experiment. You want to save the bug fix now but not the experiment. If "save" took every change in the folder, you could not do that. So Git has a middle step.</p>
  <p>Your files move through three places. The <strong>working tree</strong> is the normal folder you edit. The <strong>index</strong> (also called the <strong>staging area</strong>) is a draft of the next commit. The <strong>repository</strong> is the history inside <code>.git</code>. <code>git add</code> copies a file's current content into the draft. <code>git commit</code> turns the draft into a permanent snapshot.</p>
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
    <p>Packing a courier parcel. The room is the working tree: things lying everywhere. The open box on the table is the staging area: you put in only what should go. Sealing and handing the box to the courier is the commit. Things still lying in the room are not sent.</p>
  </div>
  <p>Worked example, state by state:</p>
  <table class="tbl">
    <tr><th>Step</th><th>Working tree has</th><th>Staging has</th><th>Last commit has</th></tr>
    <tr><td>start</td><td>LR, EPOCHS</td><td>LR, EPOCHS</td><td>LR, EPOCHS</td></tr>
    <tr><td>add BATCH_SIZE line, <code>git add</code></td><td>+ BATCH</td><td>+ BATCH</td><td>LR, EPOCHS</td></tr>
    <tr><td>add SEED line, no add</td><td>+ BATCH + SEED</td><td>+ BATCH</td><td>LR, EPOCHS</td></tr>
    <tr><td><code>git commit</code></td><td>+ BATCH + SEED</td><td>+ BATCH</td><td>+ BATCH (SEED not saved)</td></tr>
  </table>
  <p>The commands below play this out, plus a brand-new <code>notes.md</code>. Watch the two-letter codes from <code>git status --short</code> and the two different diffs.</p>
  <div class="fx" data-lang="text">$ echo "BATCH_SIZE = 32" &gt;&gt; train.py
$ git add train.py                           # staged
$ echo "SEED = 42" &gt;&gt; train.py                # edited again, NOT staged
$ echo "todo: try xgboost" &gt; notes.md        # brand-new file
$ git status --short
MM train.py
?? notes.md
$ git diff                                   # working tree vs staging
@@ -1,3 +1,4 @@
 LEARNING_RATE = 0.01
 EPOCHS = 10
 BATCH_SIZE = 32
+SEED = 42
$ git diff --staged                          # staging vs last commit
@@ -1,2 +1,3 @@
 LEARNING_RATE = 0.01
 EPOCHS = 10
+BATCH_SIZE = 32
$ git commit -m "Add batch size"
[main 7807b6e] Add batch size
 1 file changed, 1 insertion(+)
$ git status --short
 M train.py
?? notes.md</div>
  <p>(Diff headers trimmed.) The left letter compares staging with the last commit; the right letter compares the working tree with staging. <code>MM</code> = "modified and staged, then modified again". <code>??</code> = untracked. Plain <code>git diff</code> showed only <code>SEED</code>; <code>git diff --staged</code> showed only <code>BATCH_SIZE</code>, and that is exactly what the commit saved. Afterwards <code> M</code> (space, M) says SEED is still waiting in the working tree.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Index / staging area</strong>: a file in <code>.git</code> that holds the exact content of the next commit. <strong>Tracked file</strong>: a file that is in the last commit or staging. Untracked files are ignored by <code>commit -a</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>git add</code> takes a copy <em>at that moment</em>. Edit after adding and the commit holds the older version. Always look at <code>git diff --staged</code> before committing. Also: <code>git commit -am</code> skips new (untracked) files; you must <code>git add</code> them once.</p>
  </div>

  <h2 id="sg-commit"><span class="num">04</span>Commits &amp; Branches</h2>
  <p>Six months later a teammate runs <code>git log</code> to find why accuracy dropped. If every message says "fix" or "updates", the log is useless. A good message tells the story; a good commit holds one idea, so it can be read, reviewed and undone on its own.</p>
  <table class="tbl">
    <tr><th>Bad message</th><th>Good message</th></tr>
    <tr><td>fix</td><td>Fix NaN loss when batch has all-zero labels</td></tr>
    <tr><td>updates</td><td>Add stratified split to keep class ratio in val set</td></tr>
    <tr><td>wip stuff final v2</td><td>Cache tokenizer output to cut preprocessing 40%</td></tr>
  </table>
  <p>Rules: a subject line of about 50 characters in the imperative ("Add", not "Added"), as if finishing the sentence "this commit will…". Then a blank line, then a body explaining <em>why</em>. The code already shows <em>what</em>.</p>
  <p>Now branches. You want to try a lower learning rate without risking the working code on <code>main</code>. Without branches you would copy the folder. With Git you make a <strong>branch</strong>: a new label starting at the current commit. Commits you make move only that label. <code>main</code> stays where it was, and you can jump between the two in a second.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A cook trying a new biryani recipe. The tested recipe stays in the main book. She writes the experiment on a separate card. If guests love it, she copies it into the book (merge). If not, she throws the card away (delete the branch). The main book was never at risk.</p>
  </div>
  <div class="fx" data-lang="text">$ git switch -c feature/tune-lr              # create a branch and move onto it
Switched to a new branch 'feature/tune-lr'
$ git branch                                 # list branches; * = current
* feature/tune-lr
  main
$ sed -i "s/0.01/0.001/" train.py
$ git commit -qam "Lower learning rate to 0.001"
$ git log --oneline --graph --all
* bd4cf35 Lower learning rate to 0.001
* 7807b6e Add batch size
* 1f18462 Add training config
$ cat .git/refs/heads/feature/tune-lr
bd4cf358cd31b37ee3d98828b0e0ab8a3ee386bc
$ git switch main                            # jump back
Switched to branch 'main'
$ cat train.py
LEARNING_RATE = 0.01
EPOCHS = 10
BATCH_SIZE = 32</div>
  <p><code>git switch -c</code> created the label and moved HEAD to it. The new commit <code>bd4cf35</code> moved only <code>feature/tune-lr</code>. The branch file contains just that hash. After <code>git switch main</code>, Git rewrote <code>train.py</code> on disk to main's version: the learning rate is back to 0.01. Nothing was lost; the other version waits on its branch. When the work is merged, <code>git branch -d feature/tune-lr</code> deletes the label (not the commits that are now in main).</p>
  <p>One state confuses everyone: <strong>detached HEAD</strong>. If you check out a commit hash instead of a branch, HEAD points straight at a commit. You can look around and even commit, but no label follows the new commits.</p>
  <div class="fx" data-lang="text">$ git checkout HEAD~1
Note: switching to 'HEAD~1'.

You are in 'detached HEAD' state. You can look around, make experimental
changes and commit them, and you can discard any commits you make in this
state without impacting any branches by switching back to a branch.
...
HEAD is now at fa17982 A
$ # ... commit X here, then leave ...
$ git switch main
Warning: you are leaving 1 commit behind, not connected to
any of your branches:

  7ad0a5f X
...</div>
  <p>Git warns you, and names the orphan commit <code>7ad0a5f</code>. To keep it, run <code>git switch -c rescue</code> before leaving (or <code>git branch rescue 7ad0a5f</code> right after).</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Branch</strong>: a movable pointer to a commit, stored in <code>.git/refs/heads/</code>. <strong>Detached HEAD</strong>: HEAD points at a commit directly instead of at a branch. <code>git switch</code> (change branch) and <code>git restore</code> (restore files) are the newer, clearer halves of the old do-everything <code>git checkout</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Switching branches with uncommitted edits: Git carries them along if they do not clash, or refuses if they would be overwritten. Commit first, or park them with <code>git stash</code> and bring them back with <code>git stash pop</code>.</p>
  </div>

  <h2 id="sg-merge"><span class="num">05</span>Merge vs Rebase</h2>
  <p>The experiment worked. Now its commits must come back into <code>main</code>. While you worked, a teammate may also have added commits to <code>main</code>. Git has two ways to join the two lines: <strong>merge</strong> and <strong>rebase</strong>. Both end with the same files; they differ in what the history looks like.</p>
  <p><strong>Case 1: main did not move.</strong> Nothing new happened on main since you branched. Git does not need a new commit; it just slides the <code>main</code> label forward to your last commit. This is a <strong>fast-forward</strong>.</p>
  <div class="fx" data-lang="text">$ git log --oneline --graph --all --decorate
* e12569a (feature) C
* 61ae1ae (HEAD -&gt; main) B
* 67d71f5 A
$ git merge feature
Updating 61ae1ae..e12569a
Fast-forward
 C.txt | 1 +
$ git log --oneline --graph --all --decorate
* e12569a (HEAD -&gt; main, feature) C
* 61ae1ae B
* 67d71f5 A</div>
  <p><code>--decorate</code> prints the labels in brackets. Before: main at B, feature at C. After: both at C. No new commit was made.</p>
  <p><strong>Case 2: both moved.</strong> Feature has C and D, main got E. A label cannot "slide" to both. <strong>Merge</strong> creates a new commit M whose two parents are E and D. <strong>Rebase</strong> instead takes your commits C and D and replays them, one by one, on top of E, as new commits C′ and D′, giving a straight line.</p>
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
    <text x="520" y="160" text-anchor="middle" class="tm">new hashes, one line</text>
  </svg><figcaption>Merge keeps the true shape and adds M. Rebase replays C, D on top of E as new commits C', D'.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two friends write chapters of a group report in parallel. <strong>Merge</strong>: staple both stacks together with a cover note "joined here" (honest about the parallel work). <strong>Rebase</strong>: retype your chapters as if you had started after your friend finished (neat, but they are new pages, not the originals).</p>
  </div>
  <p>The merge, run for real:</p>
  <div class="fx" data-lang="text">$ git merge --no-edit feature
Merge made by the 'ort' strategy.
 C.txt | 1 +
 D.txt | 1 +
$ git log --oneline --graph --all --decorate
*   417ff0e (HEAD -&gt; main) Merge branch 'feature'
|&#92;
| * 3bfb6f6 (feature) D
| * 2d96b3c C
* | f8b8232 E
|/
* dd2af4c B
* ea9824c A
$ git cat-file -p HEAD
tree 1bfd30eae5765ed9ea8d9cf2b38535fc1cdf1bb5
parent f8b8232e7d1b2cc17a8f36463b1a0ba4d8f2b076
parent 3bfb6f6db303e45d3f4171909e0a3b600e586cf9
...</div>
  <p>The graph keeps both lines, and the merge commit really has two <code>parent</code> lines: E (<code>f8b8232</code>) and D (<code>3bfb6f6</code>). <code>ort</code> is the name of Git's default merge algorithm. Now the same starting shape, but rebased:</p>
  <div class="fx" data-lang="text">$ git log --oneline --graph --all --decorate      # before
* d44ee58 (HEAD -&gt; main) E
| * a45dc66 (feature) D
| * ef4814a C
|/
* b74aa94 B
* f723557 A
$ git switch feature
$ git rebase main
Successfully rebased and updated refs/heads/feature.
$ git log --oneline --graph --all --decorate      # after
* 1e4b44e (HEAD -&gt; feature) D
* 3708dbb C
* d44ee58 (main) E
* b74aa94 B
* f723557 A
$ git switch main &amp;&amp; git merge feature
Updating d44ee58..1e4b44e
Fast-forward</div>
  <p>C and D now sit after E, and their hashes changed (<code>ef4814a</code> → <code>3708dbb</code>, <code>a45dc66</code> → <code>1e4b44e</code>) because their parent changed, and the parent is part of what is hashed. The old commits still exist, but no branch points to them. Merging after a rebase is a fast-forward, so main stays one straight line.</p>
  <table class="tbl">
    <tr><th></th><th>Merge</th><th>Rebase</th></tr>
    <tr><td>History</td><td>True, branchy</td><td>Straight line, rewritten</td></tr>
    <tr><td>Commit hashes</td><td>Unchanged</td><td>New for replayed commits</td></tr>
    <tr><td>Safe on a shared branch?</td><td>Yes</td><td>No: others still have the old commits</td></tr>
    <tr><td>Use for</td><td>Bringing a finished feature into main</td><td>Tidying your own branch before a PR</td></tr>
  </table>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Fast-forward merge</strong>: the target branch is an ancestor of the source, so the label just moves. <strong>Three-way merge</strong>: Git compares both tips with their common ancestor (B here) and records a merge commit. <strong>Rebase</strong>: re-apply commits onto a new base, creating new commits.</p>
  </div>
  <div class="callout trap"><span class="label">Golden rule</span>
    <p>Never rebase commits that others have already pulled. Their copies still contain C and D; yours contain C′ and D′. The next pull brings both, and the history fills with duplicates. Rebase only your own unshared branch.</p>
  </div>

  <h2 id="sg-conflict"><span class="num">06</span>Resolving a Conflict</h2>
  <p>Usually Git merges on its own: if you changed line 3 and your teammate changed line 10, both changes go in. But if both of you changed the <strong>same line</strong> in different ways, Git cannot know which is right. It stops and asks you. That is a <strong>merge conflict</strong>. It is not an error and nothing is broken; it is a question.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Two family members edit the same shopping list. One changed "1 kg rice" to "2 kg rice", the other to "5 kg rice". Whoever collects the lists cannot guess; she writes both versions on the paper and asks the family to decide.</p>
  </div>
  <div class="flow"><span>Both branches edit the same line</span><span>merge stops</span><span>you edit the file</span><span>git add</span><span>git commit</span></div>
  <p>Setup: <code>main</code> changed the learning rate from 0.01 to 0.05. Branch <code>feature/tune-lr</code> changed the same line to 0.001. Now merge:</p>
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
  <p>Git wrote both versions into the file between <strong>conflict markers</strong>. The part between <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD</code> and <code>=======</code> is what your current branch (main) has. The part between <code>=======</code> and <code>&gt;&gt;&gt;&gt;&gt;&gt;&gt; feature/tune-lr</code> is what the incoming branch has. <code>EPOCHS = 10</code> was not in conflict, so it appears once. <code>UU</code> means "unmerged, both modified". Plain <code>git status</code> even prints the next steps: fix, then <code>git add</code>, or <code>git merge --abort</code>.</p>
  <p>Not ready to decide? <code>git merge --abort</code> puts everything back:</p>
  <div class="fx" data-lang="text">$ git merge --abort
$ git status --short
$ cat train.py
LEARNING_RATE = 0.05
EPOCHS = 10</div>
  <p>To resolve, merge again, then write the final file the way it should be. That may be one side, both, or something new. Delete all three marker lines. Then <code>git add</code> marks the file as resolved and <code>git commit</code> creates the merge commit.</p>
  <div class="fx" data-lang="text">$ printf 'LEARNING_RATE = 0.001&#92;nEPOCHS = 10&#92;n' &gt; train.py   # chosen result
$ git add train.py
$ git status --short
M  train.py
$ git commit -m "Merge feature/tune-lr: keep lr 0.001"
[main a97f58a] Merge feature/tune-lr: keep lr 0.001
$ git log --oneline --graph
*   a97f58a Merge feature/tune-lr: keep lr 0.001
|&#92;
| * 1d5c2c8 Lower learning rate to 0.001
* | 609a251 Raise learning rate to 0.05
|/
* 1f18462 Add training config</div>
  <p>After <code>git add</code>, <code>UU</code> became <code>M </code> (staged, ready). The graph shows both lines joined by the merge commit, whose message records the decision. In real projects, open the file in VS Code or PyCharm, which show "Accept current / incoming / both" buttons over the markers.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Merge conflict</strong>: Git cannot combine two changes automatically because they touch the same region of a file (or one side deleted a file the other edited). Conflicts also happen during <code>rebase</code>, <code>cherry-pick</code> and <code>pull</code>; the fix is the same, then <code>git rebase --continue</code> for a rebase.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Committing with leftover markers. Python sees <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code> as a syntax error and the build breaks. Search for <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code> and run the tests before committing. If the intent is unclear, ask the other author; do not guess on model parameters.</p>
  </div>

  <h2 id="sg-remote"><span class="num">07</span>Remotes: clone, push, fetch, pull</h2>
  <p>So far everything lived on one laptop. If it dies, the history dies with it, and your teammate cannot see your work. A <strong>remote</strong> is another copy of the repo, usually on GitHub, that everyone sends commits to and gets commits from. Because every copy is full, there is no "master copy" technically; the team simply agrees that GitHub's copy is the one to share.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A shared Google Drive folder for a class project, but manual. You work on your own copy offline. <strong>push</strong> uploads your new pages. <strong>fetch</strong> downloads what others added, but leaves it in a separate tray so it does not disturb your desk. <strong>pull</strong> downloads and immediately mixes it into your work.</p>
  </div>
  <table class="tbl">
    <tr><th>Command</th><th>What it does</th><th>Changes your files?</th></tr>
    <tr><td><code>git clone URL</code></td><td>Copy the whole repo and history; remote named <code>origin</code></td><td>Creates the folder</td></tr>
    <tr><td><code>git push</code></td><td>Upload your new commits to the remote branch</td><td>No</td></tr>
    <tr><td><code>git fetch</code></td><td>Download new commits; update <code>origin/main</code> only</td><td>No</td></tr>
    <tr><td><code>git pull</code></td><td><code>fetch</code> + merge (or rebase) into your branch</td><td>Yes</td></tr>
  </table>
  <p>We test this with a "server" repo in a local folder (so it runs offline); on GitHub only the URL changes. Asha and Ravi both clone. Asha pushes a branch. Ravi pushes a commit to main. Then Asha catches up.</p>
  <div class="fx" data-lang="text">$ git clone server/churn.git asha
Cloning into 'asha'...
done.
$ cd asha
$ git branch -a                              # -a: also remote-tracking branches
* main
  remotes/origin/HEAD -&gt; origin/main
  remotes/origin/main
$ git switch -c feat/stratified-split
$ echo 'SPLIT = "stratified"' &gt;&gt; train.py
$ git commit -qam "Add stratified split"
$ git push -u origin feat/stratified-split
To .../server/churn.git
 * [new branch]      feat/stratified-split -&gt; feat/stratified-split
branch 'feat/stratified-split' set up to track 'origin/feat/stratified-split'.
$ # ... meanwhile Ravi pushes "Add epochs" to main ...
$ git switch main
$ git fetch
From .../server/churn
   f3841fd..441b180  main       -&gt; origin/main
$ git status -sb
## main...origin/main [behind 1]
$ git log --oneline --all --graph --decorate
* 441b180 (origin/main, origin/HEAD) Add epochs
| * 0148ae8 (origin/feat/stratified-split, feat/stratified-split) Add stratified split
|/
* f3841fd (HEAD -&gt; main) Add training config
$ git pull
Updating f3841fd..441b180
Fast-forward
 train.py | 1 +</div>
  <p>(Long sandbox paths shortened to <code>...</code>.) <code>origin/main</code> is a <strong>remote-tracking branch</strong>: your laptop's memory of where main was on the server at the last fetch. <code>push -u</code> uploaded the branch and set its <strong>upstream</strong>, so later a plain <code>git push</code> knows where to go. <code>fetch</code> moved only <code>origin/main</code>; your <code>main</code> stayed at <code>f3841fd</code>, and <code>status -sb</code> reports <code>[behind 1]</code>. <code>pull</code> then fast-forwarded main.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Remote</strong>: a named URL of another copy (<code>git remote -v</code> lists them). <strong>origin</strong>: the default name for the one you cloned from. <strong>upstream branch</strong>: the remote branch your local branch pushes to and pulls from.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p><code>git push</code> is rejected with "Updates were rejected because the remote contains work that you do not have". Someone pushed first. Do <code>git pull</code> (or <code>git pull --rebase</code>), fix any conflict, then push. Never "fix" it with <code>git push --force</code> on a shared branch: that deletes their commits from the server.</p>
  </div>

  <h2 id="sg-pr"><span class="num">08</span>Pull Requests &amp; Code Review</h2>
  <p>On a team, nobody pushes straight to <code>main</code>. A bug there reaches production and everybody's work. Instead you push a branch and open a <strong>pull request</strong> (PR) on GitHub: a web page that says "please merge my branch into main", shows the diff, runs automatic tests, and lets teammates comment line by line before anything is merged.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>Submitting a college assignment through the class teacher instead of pasting it straight into the printed magazine. The teacher (reviewer) reads it, marks corrections in red, you fix them, and only the approved version is printed.</p>
  </div>
  <div class="flow"><span>branch from main</span><span>commit + push</span><span>open PR</span><span>CI runs tests</span><span>review + fix</span><span>merge (squash)</span><span>delete branch</span></div>
  <p>Step by step: (1) update main and branch off it. (2) Commit small, clear changes. (3) Push the branch. (4) Open the PR with a description. (5) <strong>CI</strong> (continuous integration, for example GitHub Actions) runs tests and linters on every push. (6) A reviewer comments; you push more commits to the same branch and the PR updates itself. (7) After approval, merge, and delete the branch.</p>
  <div class="fx" data-lang="text">git switch main &amp;&amp; git pull                  # 1. start from the latest main
git switch -c feat/stratified-split
git commit -am "Add stratified split"        # 2. small, clear commits
git push -u origin feat/stratified-split     # 3. upload the branch
gh pr create --fill                          # 4. open the PR (or click on GitHub)
git pull --rebase origin main                # keep the branch current while waiting
git push --force-with-lease                  # needed after that rebase (your own branch only)</div>
  <p>This block was not run here (no GitHub in the sandbox). Note the last two lines: rebasing your branch on new main rewrites your commits, so the next push must be forced. <code>--force-with-lease</code> is the safe version: it refuses if someone else pushed to your branch in the meantime.</p>
  <div class="cards">
    <div><b>Small PRs</b><p>Under ~400 lines gets a real review; 3,000 lines gets "LGTM" (looks good to me) without reading.</p></div>
    <div><b>Description</b><p>What, why, how it was tested; metrics before/after for a model change.</p></div>
    <div><b>Reviewer checks</b><p>Correctness, edge cases, tests, naming, data leakage, secrets, notebook junk.</p></div>
    <div><b>Merge styles</b><p>Merge commit (keeps all), squash (one commit), rebase-and-merge (line).</p></div>
  </div>
  <p>A <strong>fork</strong> is your own server-side copy of someone else's repo. For open source you cannot push to their repo, so you push to your fork and open the PR from there. <strong>Squash merge</strong> turns all PR commits ("fix typo", "address review") into one clean commit on main, which many teams use by default.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Pull request</strong> (GitLab: merge request): a request to merge one branch into another, with diff, discussion, CI status and approvals. <strong>Branch protection</strong>: a repo rule such as "main needs one approval and passing CI".</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>One giant PR with a refactor, a new feature and a dependency upgrade mixed together. It cannot be reviewed well and cannot be reverted in parts. Split by idea. In interviews, "how do you review code?" expects: understand the goal, run it, check tests and edge cases, comment kindly and specifically.</p>
  </div>

  <h2 id="sg-ignore"><span class="num">09</span>.gitignore, Tags &amp; Releases</h2>
  <p>A DS project folder is full of things that must <strong>not</strong> go into Git: a 3 GB CSV, trained <code>.pkl</code> models, <code>__pycache__</code> folders, Jupyter checkpoints, a virtual environment, and a <code>.env</code> file with your API key. Commit them and every clone gets slow forever, or worse, your key is public. A <code>.gitignore</code> file lists patterns Git should pretend not to see.</p>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A "do not pack" list stuck on your suitcase: wet towels, the hotel's hangers, your passport photocopies with notes. Whatever matches the list is never put in the bag, however many times you pack.</p>
  </div>
  <p>Worked example. We have <code>data/train.csv</code>, <code>models/rf.pkl</code>, and a <code>.env</code> that was <em>already committed</em> earlier by mistake. Watch what happens to each.</p>
  <div class="fx" data-lang="text">$ git status --short
?? data/
?? models/
$ printf 'data/&#92;nmodels/*.pkl&#92;n.env&#92;n__pycache__/&#92;n.ipynb_checkpoints/&#92;n' &gt; .gitignore
$ git status --short
?? .gitignore
$ git check-ignore -v data/train.csv models/rf.pkl .env
.gitignore:1:data/	data/train.csv
.gitignore:2:models/*.pkl	models/rf.pkl
$ echo "API_KEY=xyz999" &gt; .env
$ git status --short
 M .env
?? .gitignore
$ git rm --cached .env                       # untrack, keep the file on disk
rm '.env'
$ git check-ignore -v .env
.gitignore:3:.env	.env
$ git add .gitignore &amp;&amp; git commit -qm "Stop tracking .env, add .gitignore"
$ git show HEAD~1:.env                       # the old commit still has it!
API_KEY=abc123</div>
  <p>After writing <code>.gitignore</code>, <code>data/</code> and <code>models/</code> vanished from status. <code>check-ignore -v</code> names the file and line of the rule that hides each path. But <code>.env</code> was not listed and still showed as <code> M</code>: <strong>ignore rules do not apply to files Git already tracks</strong>. <code>git rm --cached</code> removed it from tracking without deleting it from disk; only then did the rule apply. The last command is the scary part: the old commit still holds the old key, and anyone with the repo can read it.</p>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Pushed a secret? Deleting it in a new commit is not enough. <strong>Rotate (revoke and replace) the key first</strong>, because bots scan GitHub within minutes. Then rewrite history with <code>git filter-repo</code> or BFG, force-push, and load secrets from environment variables.</p>
  </div>
  <p>Now <strong>tags</strong>. Your model goes to production and a month later someone asks "which code trained the model that is live?" A commit hash works, but nobody remembers <code>ae87726</code>. A tag is a human name fixed to one commit. Unlike a branch, it never moves.</p>
  <div class="fx" data-lang="text">$ git tag -a v1.0.0 -m "First release: churn model AUC 0.87"
$ git tag
v1.0.0
$ git describe
v1.0.0
$ # ... one more commit ...
$ git describe
v1.0.0-1-g29ce250
$ git push origin v1.0.0                     # tags are NOT pushed by plain git push</div>
  <p><code>-a</code> makes an <strong>annotated</strong> tag with author, date and message (preferred for releases). <code>git describe</code> names the current commit relative to the nearest tag: <code>v1.0.0-1-g29ce250</code> means "1 commit after v1.0.0, at hash 29ce250". The push line was not run (no server here). A GitHub <strong>Release</strong> is a tag plus release notes plus attached files, such as a model card or a wheel.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Semantic versioning</strong> MAJOR.MINOR.PATCH: bump MAJOR for breaking changes (API input changed), MINOR for new features that keep compatibility, PATCH for bug fixes.</p>
  </div>

  <h2 id="sg-undo"><span class="num">10</span>Undoing Things Safely</h2>
  <p>Everyone makes mistakes in Git: a typo in a message, a debug line committed, a bad commit pushed to production. Panic makes it worse; people delete the folder and re-clone, losing work. The calm way is to ask two questions. <strong>Where is the mistake</strong>: unstaged edit, staged file, or commit? <strong>Has it been pushed</strong>? Then pick the matching tool.</p>
  <table class="tbl">
    <tr><th>Situation</th><th>Command</th><th>Rewrites history?</th></tr>
    <tr><td>Throw away edits to a file</td><td><code>git restore file</code></td><td>No (but the edits are lost)</td></tr>
    <tr><td>Unstage a file, keep edits</td><td><code>git restore --staged file</code></td><td>No</td></tr>
    <tr><td>Fix the last commit (not pushed)</td><td><code>git commit --amend</code></td><td>Yes</td></tr>
    <tr><td>Undo a pushed commit</td><td><code>git revert &lt;hash&gt;</code></td><td>No: adds an opposite commit</td></tr>
    <tr><td>Throw away local commits</td><td><code>git reset --hard HEAD~2</code></td><td>Yes</td></tr>
    <tr><td>"I lost a commit"</td><td><code>git reflog</code>, then <code>git reset --hard HEAD@{n}</code></td><td>Recovery</td></tr>
  </table>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A newspaper. <strong>revert</strong> is a correction printed in tomorrow's edition: honest, safe after delivery. <strong>reset</strong> is pulping today's edition: fine before the trucks leave, chaos after readers have it. <strong>reflog</strong> is the press-room CCTV that shows every edition ever printed, so you can recover one you pulped.</p>
  </div>
  <p><strong>Step 1: edits and staging.</strong> A bad line, then a line added to staging by mistake:</p>
  <div class="fx" data-lang="text">$ echo "print(1/0)" &gt;&gt; train.py
$ git status --short
 M train.py
$ git restore train.py                       # file back to the last commit
$ git status --short
$ echo "DROPOUT = 0.2" &gt;&gt; train.py
$ git add train.py
$ git status --short
M  train.py
$ git restore --staged train.py              # unstage; the edit stays in the file
$ git status --short
 M train.py</div>
  <p>The M moved from the left column (staged) to the right column (not staged). The edit itself was kept.</p>
  <p><strong>Step 2: amend and revert.</strong> A typo in the message, then a bad commit that (we pretend) was already pushed:</p>
  <div class="fx" data-lang="text">$ git commit -qam "Add dropuot"
$ git commit --amend -qm "Add dropout"       # replaces the last commit
$ git log --oneline
0869bd0 Add dropout
6f98ac5 Add epochs
f3841fd Add training config
$ echo "BATCH_SIZE = 4096" &gt;&gt; train.py &amp;&amp; git commit -qam "Use huge batch"
$ git revert --no-edit HEAD                  # new commit that undoes HEAD
[main ae3db25] Revert "Use huge batch"
$ git log --oneline
ae3db25 Revert "Use huge batch"
1d5a298 Use huge batch
0869bd0 Add dropout
6f98ac5 Add epochs
f3841fd Add training config
$ cat train.py
LEARNING_RATE = 0.01
EPOCHS = 10
DROPOUT = 0.2</div>
  <p><code>--amend</code> made a new commit <code>0869bd0</code> in place of the typo one; the typo commit is gone from the log. <code>revert</code> did the opposite style: it kept the bad commit <code>1d5a298</code> and added <code>ae3db25</code> that removes its line. The file no longer has <code>BATCH_SIZE</code>, and nobody's copy of history was changed.</p>
  <p><strong>Step 3: the three resets.</strong> Each run below starts from the same state (HEAD at the revert commit) and moves the branch back one commit, to "Use huge batch". So the undone change is the revert itself (removing the BATCH_SIZE line). What differs is where that undone change ends up:</p>
  <div class="fx" data-lang="text">$ git reset --soft HEAD~1
$ git status --short
M  train.py                                  # change kept, still staged
$ git reset --mixed HEAD~1                   # (the default)
Unstaged changes after reset:
M	train.py                                 # change kept, not staged
$ git reset --hard HEAD~1
HEAD is now at 1d5a298 Use huge batch
$ git status --short                         # change deleted: clean
</div>
  <div class="cards">
    <div><b>reset --soft</b><p>Move branch; keep the changes staged. Use to squash the last few commits into one.</p></div>
    <div><b>reset --mixed</b><p>Default. Move branch; keep changes in files, unstaged.</p></div>
    <div><b>reset --hard</b><p>Move branch; delete the changes from files too. Dangerous.</p></div>
  </div>
  <p><strong>Step 4: recovery with reflog.</strong> You ran <code>reset --hard HEAD~2</code> and two commits vanished from the log. The <strong>reflog</strong> is a local diary of every place HEAD has been:</p>
  <div class="fx" data-lang="text">$ git reset --hard HEAD~2
HEAD is now at 49cb51e Add epochs
$ git reflog
49cb51e HEAD@{0}: reset: moving to HEAD~2
32a9357 HEAD@{1}: commit: Add early stopping
e56be8f HEAD@{2}: commit: Add dropout
49cb51e HEAD@{3}: commit: Add epochs
14c0383 HEAD@{4}: commit (initial): Add training config
$ git reset --hard HEAD@{1}
HEAD is now at 32a9357 Add early stopping
$ git log --oneline
32a9357 Add early stopping
e56be8f Add dropout
49cb51e Add epochs
14c0383 Add training config</div>
  <p><code>HEAD@{1}</code> means "where HEAD was one move ago", which was <code>32a9357</code> before the reset. Resetting back to it restores both commits. Commits are not deleted at once; Git keeps unreachable ones for about 90 days.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>revert</strong>: create a new commit that applies the inverse of an old one. <strong>reset</strong>: move the current branch to another commit, optionally changing staging and files. <strong>reflog</strong>: local log of HEAD movements; it is not pushed and not shared.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Reflog only knows <em>commits</em>. Edits that were never committed and then wiped by <code>reset --hard</code> or <code>restore</code> are gone for good. When unsure, commit (or <code>git stash</code>) first; you can always tidy commits later.</p>
  </div>

  <h2 id="sg-ds"><span class="num">11</span>Git for Data Science</h2>
  <p>Git was built for source code: many small text files. Data science adds large binary files (datasets, model weights, images) and Jupyter notebooks. Commit a 2 GB parquet file and every future clone downloads it, plus every old version of it, forever. GitHub blocks files over 100 MB. Yet you still need to know which data and which model belong to which code.</p>
  <p>The fix is the same idea in every tool: keep a tiny <strong>pointer</strong> file in Git (the file's hash and size), and store the big file somewhere built for big files. Git versions the pointer; the pointer tells the tool which exact big file to download.</p>
  <figure class="viz"><svg viewBox="0 0 600 130" width="600">
    <defs><marker id="sg-arr3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="30" width="170" height="70" rx="8" class="fb sb"/><text x="95" y="56" text-anchor="middle">Git repo</text><text x="95" y="78" text-anchor="middle" class="tm">code + pointer</text>
    <rect x="250" y="30" width="110" height="70" rx="8" class="fs"/><text x="305" y="60" text-anchor="middle">pointer</text><text x="305" y="80" text-anchor="middle" class="tm">hash + size</text>
    <rect x="430" y="30" width="160" height="70" rx="8" class="fg sg"/><text x="510" y="56" text-anchor="middle">Big-file storage</text><text x="510" y="78" text-anchor="middle" class="tm">LFS / S3 / GCS</text>
    <g stroke="currentColor" fill="none" stroke-width="1.5"><line x1="182" y1="65" x2="246" y2="65" marker-end="url(#sg-arr3)"/><line x1="362" y1="65" x2="426" y2="65" marker-end="url(#sg-arr3)"/></g>
  </svg><figcaption>Git versions a small pointer; the 2 GB file lives elsewhere and is fetched by its hash.</figcaption></figure>
  <div class="callout anlg"><span class="label">Analogy</span>
    <p>A cloakroom token at a wedding hall. You do not carry your heavy bag around the hall; you carry a small numbered token. The token is cheap to keep and copy, and it gets you exactly your bag back.</p>
  </div>
  <p><strong>Git LFS</strong> (Large File Storage) does this inside Git. Below, a 2 MB <code>model.onnx</code> is committed through LFS, and then we ask Git what it really stored:</p>
  <div class="fx" data-lang="text">$ git lfs track "*.onnx"
Tracking "*.onnx"
$ cat .gitattributes
*.onnx filter=lfs diff=lfs merge=lfs -text
$ git add .gitattributes model.onnx
$ git commit -qm "Add churn model via LFS"
$ git show HEAD:model.onnx
version https://git-lfs.github.com/spec/v1
oid sha256:6391c45fc7a2bbac0f8ded428a51577067ea408ebcf3af08acef9cea750bd3e0
size 2000000
$ ls -lh model.onnx | awk '{print $5, $9}'
2.0M model.onnx</div>
  <p><code>lfs track</code> wrote a rule into <code>.gitattributes</code> (commit that file too). The commit holds only three lines: the spec version, the SHA-256 of the content and its size. The real 2 MB file sits in your working folder and, after <code>git push</code>, on GitHub's LFS server.</p>
  <p><strong>DVC</strong> (Data Version Control) is the DS favourite. It keeps data in your own S3/GCS/Azure bucket and can also describe pipelines (which script turned which data into which model). Typical commands (not run here, DVC is not installed):</p>
  <div class="fx" data-lang="text">dvc add data/train.csv           # writes data/train.csv.dvc (pointer), adds the csv to .gitignore
git add data/train.csv.dvc data/.gitignore
git commit -m "Track training data v1"
dvc push                         # upload the data to remote storage
# a teammate later: git pull &amp;&amp; dvc pull</div>
  <p><strong>Notebooks</strong>: an <code>.ipynb</code> file is JSON that also stores outputs, images and execution counts. Re-running one cell changes dozens of lines, so diffs are unreadable and conflicts are common. Fixes: strip outputs before commit (<code>nbstripout</code> as a pre-commit hook), review with <code>nbdime</code>, or pair each notebook with a <code>.py</code> file using Jupytext. Move reusable code out of notebooks into modules.</p>
  <div class="callout def"><span class="label">Definition</span>
    <p><strong>Reproducibility</strong>: anyone can rebuild the same model from the same <strong>code commit</strong> + <strong>data version</strong> + <strong>parameters</strong> (+ environment, see <a class="xref" data-note="se_docker">Docker</a>). Git alone covers only the code.</p>
  </div>
  <div class="callout trap"><span class="label">Trap</span>
    <p>Adding LFS after a big file is already committed does not shrink the repo: the old commits still contain it. Set up LFS/DVC before the first big file, or migrate history with <code>git lfs migrate</code>.</p>
  </div>

  <h2 id="sg-traps"><span class="num">12</span>Common Mistakes</h2>
  <div class="callout trap"><span class="label">Trap: committing secrets and data</span>
    <p>Add a <code>.gitignore</code> on day one (<code>.env</code>, <code>data/</code>, <code>*.pkl</code>, <code>.venv/</code>). If a key gets pushed, rotate it first, then clean history.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: force-pushing a shared branch</span>
    <p><code>git push --force</code> on main overwrites teammates' commits on the server. Use <code>revert</code> on shared branches; use <code>--force-with-lease</code> only on your own branch.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: rebasing public history</span>
    <p>Rebase creates new commits. If others built on the old ones, everyone gets duplicates. Rebase only what you alone have.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: "commit everything" habit</span>
    <p><code>git add .</code> plus <code>git commit -m "updates"</code> mixes unrelated changes and stray files. Look at <code>git status</code> and <code>git diff --staged</code>, and write a message that says why.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: working on main</span>
    <p>Commits on your local main make the next <code>pull</code> messy and tempt you to push untested code. Always <code>git switch -c</code> a branch first.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: reset --hard with uncommitted work</span>
    <p>Reflog can bring back commits, not uncommitted edits. Commit or stash before any <code>--hard</code>.</p>
  </div>
  <div class="callout trap"><span class="label">Trap: forgetting to fetch</span>
    <p><code>origin/main</code> is only as fresh as your last fetch. "My branch is up to date" can be stale. Run <code>git fetch</code> before comparing with the remote.</p>
  </div>

  <h2 id="sg-qa"><span class="num">13</span>Questions &amp; Answers</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between Git and GitHub?</summary><div class="qa-body">Git is the version control program that runs on your machine and stores history in <code>.git</code>. GitHub is a hosting website for Git repos that adds collaboration: pull requests, reviews, issues, CI (Actions), permissions. GitLab and Bitbucket are alternatives.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does Git store diffs or snapshots?</summary><div class="qa-body">Snapshots: each commit points to a tree of the whole project. Unchanged files reuse the same blob hash, so they cost nothing extra. Diffs are computed on demand. (Packfiles use delta compression on disk, but that is a storage detail.)</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a branch, physically? Why is branching cheap?</summary><div class="qa-body">A file in <code>.git/refs/heads/</code> containing one 40-character commit hash. Creating a branch writes that small file; committing moves it forward. No files are copied.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is HEAD, and what is a detached HEAD?</summary><div class="qa-body">HEAD is "where you are": normally it points to a branch name, which points to a commit. Detached HEAD means HEAD points straight at a commit (after <code>git checkout &lt;hash&gt;</code>). New commits there belong to no branch; create one with <code>git switch -c name</code> to keep them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What's the output of <code>git status --short</code> after you stage a file, then edit it again? What does a commit save?</summary><div class="qa-body"><code>MM file</code>: modified in staging (vs last commit) and modified again in the working tree (vs staging). A commit saves only the staged version; the later edit stays uncommitted.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span><code>git diff</code> vs <code>git diff --staged</code>?</summary><div class="qa-body"><code>git diff</code> compares working tree with staging (what you have not added yet). <code>git diff --staged</code> compares staging with the last commit (what the next commit will contain).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Merge vs rebase: when do you use each?</summary><div class="qa-body">Rebase your own, unshared feature branch onto main to get a clean straight history before a PR. Merge (or squash-merge) to bring finished work into a shared branch. Never rebase commits others have, because rebase creates new hashes and causes duplicates.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When does Git do a fast-forward merge?</summary><div class="qa-body">When the branch you merge into has no commits that the other branch lacks (it is an ancestor). Git just moves the label forward; no merge commit. <code>--no-ff</code> forces a merge commit anyway, which some teams use to mark where a feature landed.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Walk me through resolving a merge conflict.</summary><div class="qa-body"><code>git status</code> lists <code>UU</code> files. Open each, decide the final content between <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code>, <code>=======</code>, <code>&gt;&gt;&gt;&gt;&gt;&gt;&gt;</code> (yours, theirs, both or new), delete the markers, run tests, <code>git add</code> the file, <code>git commit</code>. Ask the other author if the intent is unclear. <code>git merge --abort</code> backs out.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>fetch vs pull?</summary><div class="qa-body"><code>fetch</code> downloads remote commits and updates remote-tracking branches like <code>origin/main</code> without touching your branch or files. <code>pull</code> = fetch + merge (or rebase with <code>--rebase</code>) into your current branch.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your push is rejected: "remote contains work that you do not have". What now?</summary><div class="qa-body">Someone pushed first. <code>git pull --rebase</code> (or plain pull), resolve any conflicts, run tests, push again. Do not force-push a shared branch.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You pushed a commit that broke production. How do you undo it?</summary><div class="qa-body"><code>git revert &lt;hash&gt;</code> and push. It adds a new commit that inverts the bad one, so nobody's history is rewritten. Don't <code>reset</code> + force-push a shared branch.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>reset --soft vs --mixed vs --hard?</summary><div class="qa-body">All move the current branch to another commit. Soft keeps the undone changes staged; mixed (default) keeps them in the files, unstaged; hard discards them. Only hard loses work, and reflog can still find the commits (not uncommitted edits).</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You ran <code>git reset --hard</code> and lost 3 commits. Recover them.</summary><div class="qa-body"><code>git reflog</code> to find where HEAD was before the reset (e.g. <code>HEAD@{1}</code>), then <code>git reset --hard HEAD@{1}</code> or create a branch at that hash. Uncommitted changes, though, are gone.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You committed an AWS key last week and pushed. What do you do?</summary><div class="qa-body">Revoke/rotate the key immediately and assume it is compromised. Then remove it from history (<code>git filter-repo</code> or BFG), force-push with team coordination, add the file to .gitignore, and load secrets from env vars or a secret manager.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You added <code>.env</code> to .gitignore but Git still shows it as modified. Why?</summary><div class="qa-body">It is already tracked; ignore rules only affect untracked files. Run <code>git rm --cached .env</code> and commit. The old commits still contain it, so rotate any secret inside.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why not commit a 3 GB training CSV, and what instead?</summary><div class="qa-body">Every clone downloads every version forever, and GitHub rejects files over 100 MB. Use DVC (or Git LFS) so Git stores a small pointer (hash + size) and the data lives in S3/GCS, versioned by hash.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why are notebooks painful in Git and how do you fix it?</summary><div class="qa-body">An .ipynb is JSON containing outputs, images and execution counts, so tiny changes give huge diffs and conflicts. Strip outputs before commit (nbstripout / pre-commit hook), review with nbdime, or pair with a .py via Jupytext; move reusable code into modules.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What makes a good pull request?</summary><div class="qa-body">Small and focused (one idea, a few hundred lines), a description of what/why/how tested, passing CI, tests for new behaviour, metrics for model changes, no secrets or data files. Respond to every review comment.</div></details>
</main>
`
});
