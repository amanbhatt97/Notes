// notes/softeng/se_git.js — Git & GitHub
Object.assign(TOPIC_CONTENT, {
  "se_git": `<main>
<h1>Git &amp; GitHub</h1>
  <div class="where"><span>Software Engineering</span><span>Git &amp; GitHub</span></div>
  <p class="lead">Git is a program that remembers every saved version of a project, so you can go back to any earlier state, try ideas on the side without risk, and combine work from several people line by line. GitHub is a website that keeps a shared copy of a Git project online and adds the tools a team needs around it, such as pull requests and code review. Almost every data, ML and software job uses both every day, and interviewers expect you to explain branching, merging, conflicts and how to undo a mistake calmly. To see why Git is built the way it is, we will follow one small project from chaos to a tagged release: a chai stall's <code>sales_report.py</code>, which reads Monday's order sheet (9 rows, 3 of them broken) and should print a total of ₹230. Two people, Meera and her cousin Ravi, work on it, and every command on this page was really run with git 2.43 in a scratch folder (shown as <code>/home/meera</code>), with its real output pasted underneath.</p>

  <h2 id="sg-map"><span class="num">★</span>Mind Map</h2>
  <div class="mindmap">
    <div class="mm-center">Git &amp; GitHub</div>
    <div class="mm-branches">
      <div class="mm-branch">
        <div class="mm-title">Saving versions</div>
        <ul>
          <li><b>Repository</b>: project folder + hidden <code>.git</code> history</li>
          <li><b>Commit</b>: a snapshot of every tracked file + message</li>
          <li>edit → <code>git add</code> (staging) → <code>git commit</code></li>
          <li>Objects (blob, tree, commit) named by content hash</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Branches</div>
        <ul>
          <li><b>Branch</b>: a movable label holding one commit hash</li>
          <li><b>HEAD</b>: which branch you are on</li>
          <li>Fast-forward vs three-way merge; conflicts need a human</li>
          <li>Rebase replays commits → straight line, new hashes</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Teamwork</div>
        <ul>
          <li><b>Remote</b> (origin): another full copy, e.g. on GitHub</li>
          <li><code>push</code> up · <code>fetch</code> down · <code>pull</code> = fetch + merge</li>
          <li><b>Pull request</b>: review + tests before merging into main</li>
          <li><b>Tag</b>: a fixed name for a release commit</li>
        </ul>
      </div>
      <div class="mm-branch">
        <div class="mm-title">Safety</div>
        <ul>
          <li><code>restore</code> edits · <code>revert</code> pushed commits · <code>reset</code> local commits</li>
          <li><code>reflog</code> finds lost commits (not uncommitted edits)</li>
          <li><code>.gitignore</code> for data, outputs, secrets</li>
          <li>Never force-push or rebase shared history</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="roadmap-wrap">
    <h2 class="roadmap-title">What we'll cover</h2>
    <div class="roadmap-grid">
      <div class="rm-item rm-done" data-target="sg-why"><span class="rm-num">01</span><div class="rm-text"><span class="rm-label">Why Version Control Exists</span><span class="rm-sub">four copies of a script, four different answers</span></div></div>
      <div class="rm-item rm-done" data-target="sg-first"><span class="rm-num">02</span><div class="rm-text"><span class="rm-label">Repositories and Commits</span><span class="rm-sub">saving the first versions</span></div></div>
      <div class="rm-item rm-done" data-target="sg-model"><span class="rm-num">03</span><div class="rm-text"><span class="rm-label">What a Commit Really Is</span><span class="rm-sub">blobs, trees, commits and hashes</span></div></div>
      <div class="rm-item rm-done" data-target="sg-areas"><span class="rm-num">04</span><div class="rm-text"><span class="rm-label">The Staging Area</span><span class="rm-sub">choosing exactly what goes into a commit</span></div></div>
      <div class="rm-item rm-done" data-target="sg-history"><span class="rm-num">05</span><div class="rm-text"><span class="rm-label">Reading History</span><span class="rm-sub">log, show, diff, blame, good messages</span></div></div>
      <div class="rm-item rm-done" data-target="sg-branch"><span class="rm-num">06</span><div class="rm-text"><span class="rm-label">Branches and HEAD</span><span class="rm-sub">working on the side, detached HEAD, stash</span></div></div>
      <div class="rm-item rm-done" data-target="sg-merge"><span class="rm-num">07</span><div class="rm-text"><span class="rm-label">Merging and Conflicts</span><span class="rm-sub">fast-forward, three-way, resolving a clash</span></div></div>
      <div class="rm-item rm-done" data-target="sg-rebase"><span class="rm-num">08</span><div class="rm-text"><span class="rm-label">Rebase</span><span class="rm-sub">the same work as a straight line</span></div></div>
      <div class="rm-item rm-done" data-target="sg-remote"><span class="rm-num">09</span><div class="rm-text"><span class="rm-label">Remotes: push, fetch, pull</span><span class="rm-sub">sharing one history between two laptops</span></div></div>
      <div class="rm-item rm-done" data-target="sg-undo"><span class="rm-num">10</span><div class="rm-text"><span class="rm-label">Undoing Mistakes</span><span class="rm-sub">restore, amend, revert, reset, reflog</span></div></div>
      <div class="rm-item rm-done" data-target="sg-ignore"><span class="rm-num">11</span><div class="rm-text"><span class="rm-label">What Stays Out of Git</span><span class="rm-sub">.gitignore, secrets, big data files</span></div></div>
      <div class="rm-item rm-done" data-target="sg-pr"><span class="rm-num">12</span><div class="rm-text"><span class="rm-label">Pull Requests and Releases</span><span class="rm-sub">review before main, then tag v1.0.0</span></div></div>
      <div class="rm-item rm-done" data-target="sg-traps"><span class="rm-num">13</span><div class="rm-text"><span class="rm-label">Common Mistakes</span><span class="rm-sub">force-push, leftover markers, secrets</span></div></div>
      <div class="rm-item rm-done" data-target="sg-rev"><span class="rm-num">R</span><div class="rm-text"><span class="rm-label">Revision Sheet</span><span class="rm-sub">definitions, commands, comparison tables</span></div></div>
      <div class="rm-item rm-done" data-target="sg-qa"><span class="rm-num">14</span><div class="rm-text"><span class="rm-label">Interview Questions</span><span class="rm-sub">the Git questions interviewers ask</span></div></div>
    </div>
  </div>

  <h2 id="sg-why"><span class="num">01</span>Why Version Control Exists</h2>
  <p>The chai stall has a small Python script that reads the day's order sheet, skips the rows a helper typed wrongly, and prints the day's takings. For three weeks Meera and Ravi have both been improving it. Every time one of them made a change worth keeping, they saved the file under a new name so the old version would not be lost, and they sent copies to each other over WhatsApp. Today the owner asks one simple question: "was Monday ₹230 or ₹210?" Let us look at Meera's folder and run every copy on Monday's sheet.</p>
  <div class="fx" data-lang="text">$ cd ~/chai-old
$ ls -1
orders_2026-10-19.csv
sales_report.py
sales_report_final.py
sales_report_final_v2_REAL.py
sales_report_ravi.py
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
  <p>Four copies give four answers. The oldest one crashes, because on one row the helper typed the word <code>two</code> instead of the number 2. <code>final</code> skips rows with bad numbers but still counts a refund of −1 cup, so it says ₹210. <code>final_v2_REAL</code> also skips quantities of zero or less and says ₹230. Ravi's copy agrees on the number but prints it differently, and nobody remembers whether he started from <code>final</code> or from <code>final_v2_REAL</code>. The <code>diff</code> command at the end compares two files and shows the lines that differ (<code>&lt;</code> is the first file, <code>&gt;</code> the second), so we can see <em>what</em> differs. But it cannot tell us <em>why</em> a line changed, <em>who</em> changed it, <em>when</em>, or which file is the one we should be using.</p>
  <p>The real problem is that "a new file name per version" stores versions without any of the information that makes them useful. File names say that a version exists, never what changed or why. Copies sent back and forth cannot be combined automatically either: if Meera fixed one line and Ravi fixed another, somebody has to paste the changes together by hand, and one wrong paste silently deletes the other person's work.</p>
  <p>Think of a video game with save points. Before a hard level you save, and if the level goes badly you load the save and try again. Now imagine every save point also carried a note saying what you did and who did it, that you could compare any two save points side by side, and that two players could play different parts of the game at the same time and have their progress joined together. That is what we want for the script: one <code>sales_report.py</code>, a list of saved moments each with a note, and a way to combine Meera's and Ravi's work.</p>
  <p>A tool that does this is called a <strong>version control system</strong>: software that records changes to a set of files over time so that you can recall any earlier version, see who changed what and why, and merge work done by several people. <strong>Git</strong> is the version control system almost everyone uses today. It is <strong>distributed</strong>, which means every person's copy of the project contains the complete history, so you can save versions, compare them and create branches with no internet connection. <strong>GitHub</strong> is something different: it is a website that hosts a shared copy of a Git project so a team can exchange work, and it adds features Git itself does not have, such as pull requests, code review, issue tracking and automatic tests. GitLab and Bitbucket are similar websites. Git is the tool on your laptop; GitHub is one place to keep the shared copy.</p>

  <h2 id="sg-first"><span class="num">02</span>Repositories and Commits</h2>
  <p>Meera decides that <code>final_v2_REAL</code> is the correct version and that from now on there will be only one file called <code>sales_report.py</code>, with Git keeping its history. Two words are needed before we start. A <strong>repository</strong> (or "repo") is a project folder whose history Git keeps; Git stores that history in a hidden sub-folder called <code>.git</code> (a folder whose name starts with a dot, which <code>ls</code> hides by default; folders and files are covered in <a class="xref" data-note="cf_storage">Storage: HDD, SSD &amp; File Systems</a>), and everything else in the folder is your normal files. A <strong>commit</strong> is one saved version of the project: a snapshot of the files at that moment, together with a message, an author and a time. If the repository is the photo album, each commit is one photo with a caption written under it, and you never paint over an old photo; you add a new one.</p>
  <p>Every commit records who made it, so the very first thing to do on a new laptop is tell Git your name and email. <code>git config --global</code> stores these settings once for all your projects (in a file in your home folder). We also ask that new repositories call their main line of work <code>main</code>. Then <code>git init</code> creates a repository, we copy in the correct script and Monday's sheet, and we ask Git what it sees:</p>
  <div class="fx" data-lang="text">$ cd ~
$ git config --global user.name "Meera"
$ git config --global user.email "meera@example.com"
$ git config --global init.defaultBranch main
$ git init chai-report
Initialized empty Git repository in /home/meera/chai-report/.git/
$ cd chai-report
$ cp ~/chai-old/sales_report_final_v2_REAL.py sales_report.py
$ cp ~/chai-old/orders_2026-10-19.csv sample_orders.csv
$ cat sales_report.py
import csv
import sys

total = 0
with open(sys.argv[1], newline="") as f:
    for row in csv.DictReader(f):
        try:
            qty, price = int(row["qty"]), int(row["price"])
        except ValueError:
            continue
        if qty &gt; 0:
            total += qty * price
print(f"total: ₹{total}")
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
[main (root-commit) b02099a] Add sales report: total of valid orders
 2 files changed, 23 insertions(+)
 create mode 100644 sales_report.py
 create mode 100644 sample_orders.csv</div>
  <p>Walk through what happened. <code>git init chai-report</code> created a folder with an empty <code>.git</code> inside; nothing else changed. <code>cat</code> shows the script we are versioning: it opens the CSV file named on the command line, tries to turn quantity and price into numbers, skips the row if that fails (<code>continue</code>), and adds up only rows with a positive quantity. <code>git status</code> is the command you will type most often; it reports the state of the folder. Here it says both files are <strong>untracked</strong>, which means Git can see them but has not been told to save them. <code>git add</code> tells Git "include these files in the next commit", and the short status now shows <code>A</code> (added) next to each. Finally <code>git commit -m "…"</code> saves the snapshot with the message after <code>-m</code>. Git answers with <code>b02099a</code>, the short form of the commit's ID (we will see in the next section where that ID comes from), and "root-commit" because this is the very first commit, with nothing before it.</p>
  <p>Now Meera improves the script so it also counts the rejected rows. After editing the file she checks what Git sees, looks at the exact change, and saves a second version:</p>
  <div class="fx" data-lang="text">$ git status --short
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
[main 0e5006a] Count rejected rows
 1 file changed, 5 insertions(+), 1 deletion(-)
$ python3 sales_report.py sample_orders.csv
total: ₹230, rejected: 3
$ git log --oneline
0e5006a Count rejected rows
b02099a Add sales report: total of valid orders</div>
  <p>The short status shows <code>&#160;M</code>: the file is tracked and has been modified since the last commit. <code>git diff</code> shows the change itself in a format you will see everywhere in software: lines starting with <code>+</code> were added, lines starting with <code>-</code> were removed, and unmarked lines are unchanged context so you can tell where the change sits. The <code>@@ -2,12 +2,16 @@</code> line says "this piece starts at line 2 and was 12 lines long, and is now 16 lines long". Then <code>git commit -am</code> commits; the <code>-a</code> means "first add every tracked file that changed", which saves typing <code>git add</code> again. (It never adds brand-new files; those always need one explicit <code>git add</code>.) The script now prints <code>total: ₹230, rejected: 3</code>, and <code>git log --oneline</code> lists the two save points, newest first, each with its ID and message.</p>
  <p>This loop of edit, <code>git add</code>, <code>git commit</code>, and looking at <code>git status</code>, <code>git diff</code> and <code>git log</code> is ninety percent of everyday Git. We already have what the folder of copies never had: one file name, two versions, and a note on each saying what changed. The next question is what Git actually wrote inside <code>.git</code> when we committed, because the answer explains almost everything else Git does.</p>

  <h2 id="sg-model"><span class="num">03</span>What a Commit Really Is</h2>
  <p>We said a commit is a snapshot of the whole project. If that were done naively, by copying every file each time, a project with ten thousand commits would be enormous and every commit would be slow. Yet Git repositories are small and commits are instant. Many people assume Git therefore stores only "what changed" in each commit, a list of edits. It does not. Understanding what it does store is the key to understanding branches, merges and rebases later, so it is worth opening <code>.git</code> and looking.</p>
  <p>Git stores everything as <strong>objects</strong>, and it names each object by a <strong>hash</strong> of its content. A hash is a fixed-length fingerprint calculated from data (Git uses an algorithm called SHA-1, which gives 40 hexadecimal characters). The same content always produces the same hash, and changing even one byte produces a completely different one. So in Git, an object's name <em>is</em> its content's fingerprint. This has a powerful consequence: if a file has not changed between two commits, its content is identical, so its hash is identical, so Git stores it only once and both snapshots simply refer to it.</p>
  <p>Three kinds of object are enough to describe a project. A <strong>blob</strong> holds the content of one file (just the bytes, without even the file's name). A <strong>tree</strong> is a folder listing: each line pairs a file name with the hash of its blob (or a sub-folder name with the hash of another tree). A <strong>commit</strong> points to one tree, the whole project at that moment, and also records the hash of its <strong>parent</strong> (the previous commit), the author, the time and the message. Think of a library that files every chapter by a fingerprint of its text. If two editions of a book share an unchanged chapter, the shelf holds that chapter once, and both editions' tables of contents point to it. The chapters are blobs, the tables of contents are trees, and the title page saying "this edition, previous edition was that one, edited by Meera" is the commit.</p>
  <p>The command <code>git cat-file</code> lets us read any object: <code>-t</code> prints its type and <code>-p</code> prints its content. <code>HEAD</code> means "the commit I am on now", <code>HEAD~1</code> means its parent, and <code>X^{tree}</code> means "the tree of commit X":</p>
  <div class="fx" data-lang="text">$ git cat-file -t HEAD
commit
$ git cat-file -p HEAD
tree 9b7e628924da5753f1732f1b2816ad118d059174
parent b02099ae7a052ac98a57d378bc3ee0e85b0798c8
author Meera &lt;meera@example.com&gt; 1792383600 +0530
committer Meera &lt;meera@example.com&gt; 1792383600 +0530

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
.git/objects/0e/5006a950fa50b9dc77dc47dc597b17de3d4524
.git/objects/33/e1c2a9e76661fb19dda121e2ec9e6503620f03
.git/objects/71/f1d8cd97899999a18af2023fa19561d0c9aaad
.git/objects/9b/7e628924da5753f1732f1b2816ad118d059174
.git/objects/af/a5696e723e762480ad6d7e34ea0a62f8b73625
.git/objects/b0/2099ae7a052ac98a57d378bc3ee0e85b0798c8
.git/objects/c4/75533070b4713949ca43c546d3f013c9a84e8c
$ cat .git/HEAD
ref: refs/heads/main
$ cat .git/refs/heads/main
0e5006a950fa50b9dc77dc47dc597b17de3d4524</div>
  <p>Read it top to bottom. The latest commit is just a few lines of text: a <code>tree</code> line, a <code>parent</code> line pointing at <code>b02099a…</code> (our first commit), the author and committer with a timestamp (seconds since 1970) and time zone, a blank line, and the message. Its tree lists two blobs. The tree of the first commit lists a <em>different</em> blob for <code>sales_report.py</code> (<code>71f1d8c</code> before the edit, <code>33e1c2a</code> after), but the <strong>same</strong> blob <code>c475533</code> for <code>sample_orders.csv</code>, because the sheet never changed. <code>git hash-object</code> recalculates the hash from the file on disk and gets <code>c475533…</code> again, which proves the name really is the fingerprint of the content. The <code>find</code> command lists exactly seven object files in <code>.git/objects</code> (stored in sub-folders named after the first two characters of the hash): three blobs, two trees and two commits.</p>
  <figure class="viz"><svg viewBox="0 0 640 230" width="640">
<defs><marker id="sg-a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="currentColor"/></marker></defs>
<rect x="20" y="20" width="150" height="40" rx="7" class="fb sb"/><text x="95" y="38" text-anchor="middle" font-size="11.5" font-weight="700">commit b02099a</text><text x="95" y="53" text-anchor="middle" class="tm" font-size="10">Add sales report…</text>
<rect x="400" y="20" width="170" height="40" rx="7" class="fb sb"/><text x="485" y="38" text-anchor="middle" font-size="11.5" font-weight="700">commit 0e5006a</text><text x="485" y="53" text-anchor="middle" class="tm" font-size="10">Count rejected rows</text>
<line x1="398" y1="40" x2="174" y2="40" stroke="currentColor" marker-end="url(#sg-a1)"/><text x="285" y="34" text-anchor="middle" class="tm" font-size="10">parent</text>
<rect x="45" y="95" width="100" height="34" rx="6" class="ft st"/><text x="95" y="116" text-anchor="middle" font-size="11">tree afa5696</text>
<rect x="435" y="95" width="100" height="34" rx="6" class="ft st"/><text x="485" y="116" text-anchor="middle" font-size="11">tree 9b7e628</text>
<line x1="95" y1="60" x2="95" y2="92" stroke="currentColor" marker-end="url(#sg-a1)"/><line x1="485" y1="60" x2="485" y2="92" stroke="currentColor" marker-end="url(#sg-a1)"/>
<rect x="20" y="170" width="150" height="40" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="95" y="188" text-anchor="middle" font-size="11">blob 71f1d8c</text><text x="95" y="202" text-anchor="middle" class="tm" font-size="10">sales_report.py v1</text>
<rect x="245" y="170" width="150" height="40" rx="6" class="fg sg"/><text x="320" y="188" text-anchor="middle" font-size="11">blob c475533</text><text x="320" y="202" text-anchor="middle" class="tm" font-size="10">sample_orders.csv (shared)</text>
<rect x="470" y="170" width="150" height="40" rx="6" class="fs" stroke="currentColor" stroke-opacity="0.5"/><text x="545" y="188" text-anchor="middle" font-size="11">blob 33e1c2a</text><text x="545" y="202" text-anchor="middle" class="tm" font-size="10">sales_report.py v2</text>
<line x1="85" y1="129" x2="85" y2="167" stroke="currentColor" marker-end="url(#sg-a1)"/><line x1="115" y1="129" x2="290" y2="167" stroke="currentColor" marker-end="url(#sg-a1)"/>
<line x1="465" y1="129" x2="350" y2="167" stroke="currentColor" marker-end="url(#sg-a1)"/><line x1="500" y1="129" x2="540" y2="167" stroke="currentColor" marker-end="url(#sg-a1)"/>
</svg><figcaption>Our repository after two commits: seven objects. Each commit points to a tree and to its parent; each tree points to blobs. The unchanged CSV is one blob used by both snapshots.</figcaption></figure>
  <p>The figure draws those seven objects. Start at the newer commit, <code>0e5006a</code>, on the right. It points left to its parent and down to its tree. That tree points to the new version of the script and to the shared CSV blob in the middle. The older commit on the left has its own tree, which points to the old script and to the <em>same</em> CSV blob. This is why commits are cheap: a new commit only adds objects for what actually changed (here one blob, one tree and one commit), and everything unchanged is reused by hash. Git does compute differences, but only when you ask for them with <code>git diff</code>; what it stores are snapshots built from shared objects. (On disk Git later compresses objects into "pack files" that store similar objects as deltas, but that is a storage trick, not how Git thinks.)</p>
  <p>Two more consequences follow. Because a commit's content includes its parent's hash, and its hash is computed from its content, a commit's ID depends on the entire history before it; nobody can quietly change an old commit without changing every ID after it, which makes history tamper-evident. And because arrows only point backwards from child to parent, history forms what computer scientists call a <strong>DAG</strong>, a directed acyclic graph: a set of points joined by one-way arrows that never loop back. Finally, look at the last two commands. <code>.git/HEAD</code> just says "I am on main", and <code>.git/refs/heads/main</code> is a tiny text file containing one commit hash. Keep that in mind; it is the entire secret of branches in section 06.</p>

  <h2 id="sg-areas"><span class="num">04</span>The Staging Area</h2>
  <p>So far every change we made went straight into a commit. Real work is messier. Meera now adds a counter of valid orders. While testing, she also puts a <code>print("DEBUG", row)</code> line into the same file to see each row, and she writes herself a note in <code>notes.txt</code>. The counter is finished and should be saved; the debug line and the note should not. If "commit" always saved everything in the folder, she would have to clean up first, or save junk into history.</p>
  <p>Git solves this with a middle step. Your files can be in three places. The <strong>working tree</strong> is the normal folder you edit. The <strong>staging area</strong>, also called the <strong>index</strong>, is a draft of the next commit. The <strong>repository</strong> is the history inside <code>.git</code>. <code>git add file</code> copies the file's current content into the draft (it actually writes a blob object and records its hash in the index). <code>git commit</code> takes whatever is in the draft, and only that, and turns it into a tree and a commit. Think of packing a courier parcel: the room is the working tree with things lying everywhere, the open box on the table is the staging area where you put only what should go, and sealing the box and handing it over is the commit. Whatever is still lying in the room is not sent.</p>
  <figure class="viz"><svg viewBox="0 0 600 150" width="600">
    <defs><marker id="sg-arr2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>
    <rect x="10" y="20" width="160" height="60" rx="8" class="fs"/><text x="90" y="46" text-anchor="middle">Working tree</text><text x="90" y="66" text-anchor="middle" class="tm">files you edit</text>
    <rect x="220" y="20" width="160" height="60" rx="8" class="fb sb"/><text x="300" y="46" text-anchor="middle">Index (staging)</text><text x="300" y="66" text-anchor="middle" class="tm">draft of next commit</text>
    <rect x="430" y="20" width="160" height="60" rx="8" class="fg sg"/><text x="510" y="46" text-anchor="middle">Repository</text><text x="510" y="66" text-anchor="middle" class="tm">.git (commits)</text>
    <g stroke="currentColor" fill="none" stroke-width="1.5">
      <line x1="172" y1="40" x2="216" y2="40" marker-end="url(#sg-arr2)"/>
      <line x1="382" y1="40" x2="426" y2="40" marker-end="url(#sg-arr2)"/>
      <path d="M510,82 C510,130 90,130 90,84" marker-end="url(#sg-arr2)"/>
    </g>
    <text x="194" y="32" text-anchor="middle" class="tb">add</text>
    <text x="404" y="32" text-anchor="middle" class="tb">commit</text>
    <text x="300" y="140" text-anchor="middle" class="tm">switch / restore copy committed versions back into files</text>
  </svg><figcaption>Content moves left to right: add copies it into the draft, commit saves the draft. Switching branches or restoring a file copies a saved version back into the folder.</figcaption></figure>
  <p>Here is Meera's situation played out. She finishes the counter and stages it with <code>git add</code>; then she adds the debug line <em>without</em> staging it and creates the note. <code>git ls-files --stage</code> prints what the index holds:</p>
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
[main 27d52a5] Count valid orders
 1 file changed, 3 insertions(+), 1 deletion(-)
$ git status --short
 M sales_report.py
?? notes.txt</div>
  <p>The index lists one blob hash per file: <code>b4a5abb</code> is the script with the counter, and <code>c475533</code> is the same CSV blob as before. The long <code>git status</code> now shows <code>sales_report.py</code> twice, once under "Changes to be committed" (the staged counter) and once under "Changes not staged" (the debug line added after staging), and the note under "Untracked". The short status packs the same information into two columns: the <strong>left</strong> letter compares the staging area with the last commit, and the <strong>right</strong> letter compares the working tree with the staging area. So <code>MM</code> means "modified and staged, then modified again", and <code>??</code> means untracked.</p>
  <p>The two diffs are the important part. Plain <code>git diff</code> compares the working tree with the staging area, so it shows only the debug line, the thing not yet added. <code>git diff --staged</code> compares the staging area with the last commit, so it shows only the counter: exactly what the commit is about to save. After the commit, the status still shows <code>&#160;M</code>, because the debug line is still sitting in the working tree, unsaved. Meera deletes that line in her editor and removes the note:</p>
  <div class="fx" data-lang="text">$ rm notes.txt
$ git status --short
$ python3 sales_report.py sample_orders.csv
total: ₹230 from 6 orders, rejected: 3</div>
  <p>The folder is clean (empty status) and the report reads ₹230 from 6 orders. History contains a commit with the counter and no trace of the debug line. Two habits follow from this section. First, <code>git add</code> takes a copy <em>at that moment</em>: if you edit a file after adding it, the commit holds the older version unless you add again, so always read <code>git diff --staged</code> before committing. Second, <code>git add .</code> stages everything in the folder, including notes and debug files; add files by name, or use <code>git add -p</code>, which walks through each changed piece of a file and asks whether to stage it.</p>

  <h2 id="sg-history"><span class="num">05</span>Reading History</h2>
  <p>Saving versions is only half the value of Git; the other half is reading them later. A month from now someone will ask "when did the report start counting rejected rows, and why?", or "this line looks wrong, who wrote it?". A handful of commands answer nearly every such question. <code>git log</code> lists commits, <code>git show</code> displays one commit, <code>git diff A B</code> compares any two snapshots, <code>git log -- file</code> lists only commits that touched a file, and <code>git blame</code> shows which commit last changed each line. Think of them as ways of reading a shop's daily ledger: the list of days, one day's page, two pages side by side, and the initials next to each entry.</p>
  <div class="fx" data-lang="text">$ git log
commit 27d52a5ab14dc81ab6faa8826d2c817d4f0851b0
Author: Meera &lt;meera@example.com&gt;
Date:   Mon Oct 19 10:32:00 2026 +0530

    Count valid orders

commit 0e5006a950fa50b9dc77dc47dc597b17de3d4524
Author: Meera &lt;meera@example.com&gt;
Date:   Mon Oct 19 09:50:00 2026 +0530

    Count rejected rows

commit b02099ae7a052ac98a57d378bc3ee0e85b0798c8
Author: Meera &lt;meera@example.com&gt;
Date:   Mon Oct 19 09:42:00 2026 +0530

    Add sales report: total of valid orders
$ git log --oneline --stat
27d52a5 Count valid orders
 sales_report.py | 4 +++-
 1 file changed, 3 insertions(+), 1 deletion(-)
0e5006a Count rejected rows
 sales_report.py | 6 +++++-
 1 file changed, 5 insertions(+), 1 deletion(-)
b02099a Add sales report: total of valid orders
 sales_report.py   | 13 +++++++++++++
 sample_orders.csv | 10 ++++++++++
 2 files changed, 23 insertions(+)
$ git show --stat HEAD~1
commit 0e5006a950fa50b9dc77dc47dc597b17de3d4524
Author: Meera &lt;meera@example.com&gt;
Date:   Mon Oct 19 09:50:00 2026 +0530

    Count rejected rows

 sales_report.py | 6 +++++-
 1 file changed, 5 insertions(+), 1 deletion(-)
$ git diff HEAD~2 HEAD --stat
 sales_report.py | 8 +++++++-
 1 file changed, 7 insertions(+), 1 deletion(-)
$ git log --oneline -- sample_orders.csv
b02099a Add sales report: total of valid orders
$ git blame -s sales_report.py
^b02099a  1) import csv
^b02099a  2) import sys
^b02099a  3) 
^b02099a  4) total = 0
27d52a5a  5) orders = 0
0e5006a9  6) rejected = 0
^b02099a  7) with open(sys.argv[1], newline="") as f:
^b02099a  8)     for row in csv.DictReader(f):
^b02099a  9)         try:
^b02099a 10)             qty, price = int(row["qty"]), int(row["price"])
^b02099a 11)         except ValueError:
0e5006a9 12)             rejected += 1
^b02099a 13)             continue
^b02099a 14)         if qty &gt; 0:
^b02099a 15)             total += qty * price
27d52a5a 16)             orders += 1
0e5006a9 17)         else:
0e5006a9 18)             rejected += 1
27d52a5a 19) print(f"total: ₹{total} from {orders} orders, rejected: {rejected}")</div>
  <p>The full <code>git log</code> shows each commit's 40-character ID, author, date and message, newest first. <code>--oneline --stat</code> squeezes each commit onto one line and adds which files changed and how many lines were added or removed. <code>git show --stat HEAD~1</code> displays one commit, "Count rejected rows"; without <code>--stat</code> it would also print that commit's full diff, which is the same diff we saw when we made it. <code>git diff HEAD~2 HEAD --stat</code> compares the first snapshot with the latest directly, skipping everything in between: in total 7 lines were added and 1 removed. <code>git log -- sample_orders.csv</code> proves the sheet was touched only once. In the <code>git blame</code> output (<code>-s</code> hides author names to keep lines short) each line carries the commit that last changed it: <code>orders = 0</code> came from <code>27d52a5</code>, <code>rejected = 0</code> from <code>0e5006a</code>, and a caret in front, as in <code>^b02099a</code>, marks lines unchanged since the very first commit. Anywhere a command expects a commit you can write a full or short ID, a branch name, <code>HEAD</code>, <code>HEAD~n</code> (n steps back) or a tag; together these are called <strong>revisions</strong>.</p>
  <p>All of this is only as useful as the commit messages. A history full of "fix", "updates" and "wip final v2" tells you nothing when you most need it, for example while hunting a bug at night. The widely used convention is a short subject line of about 50 characters written as a command ("Count rejected rows", not "Counted rejected rows"), as if completing the sentence "this commit will…", then a blank line and, when useful, a body explaining <em>why</em> the change was made. The diff already shows <em>what</em> changed; only the message can record the reason. Just as important is keeping one logical change per commit, so each commit can be read, reviewed and, if necessary, undone on its own. Note also that <code>git blame</code> answers "who touched this line last", not "whose fault is it": a commit that only reformatted the file takes over every line it touched.</p>

  <h2 id="sg-branch"><span class="num">06</span>Branches and HEAD</h2>
  <p>Every commit so far went onto one straight line. Now Meera wants to try a new feature, printing the best-selling item, but the owner runs the report every evening and it must keep working while she experiments. Without Git she would copy the folder to try the idea, which is exactly how the chaos of section 01 started. Git's answer is a <strong>branch</strong>: a separate line of development where you can commit freely without affecting the main line, and which you can later join back.</p>
  <p>Remember <code>.git/refs/heads/main</code> from section 03, a tiny file holding one commit hash. That file <em>is</em> the branch called <code>main</code>. A branch in Git is nothing more than a movable label that points at one commit. <strong>HEAD</strong> is a second label that says which branch you are currently on. When you commit, Git creates the new commit with the current commit as its parent and then moves the branch that HEAD points to forward to the new commit; other branches stay where they are. Picture sticky notes in the photo album: "main" is a sticky note on one page and "feature/top-item" is another. Adding a photo moves only the note you are holding. Moving a sticky note costs nothing, which is why creating a branch is instant even in a huge project: Git writes one 41-byte file and copies no project files at all.</p>
  <p><code>git switch -c NAME</code> creates a branch and switches to it (<code>git switch NAME</code> switches to an existing one). Let us watch the label files as Meera works:</p>
  <div class="fx" data-lang="text">$ git branch
* main
$ git switch -c feature/top-item
Switched to a new branch 'feature/top-item'
$ cat .git/HEAD
ref: refs/heads/feature/top-item
$ cat .git/refs/heads/main .git/refs/heads/feature/top-item
27d52a5ab14dc81ab6faa8826d2c817d4f0851b0
27d52a5ab14dc81ab6faa8826d2c817d4f0851b0
$ git commit -am "Show the best-selling item"
[feature/top-item 38edfa1] Show the best-selling item
 1 file changed, 5 insertions(+)
$ cat .git/refs/heads/main .git/refs/heads/feature/top-item
27d52a5ab14dc81ab6faa8826d2c817d4f0851b0
38edfa10f9bb05b639b69722308776e81ba7eb70
$ git log --oneline --graph --all --decorate
* 38edfa1 (HEAD -&gt; feature/top-item) Show the best-selling item
* 27d52a5 (main) Count valid orders
* 0e5006a Count rejected rows
* b02099a Add sales report: total of valid orders
$ python3 sales_report.py sample_orders.csv
total: ₹230 from 6 orders, rejected: 3
top item: masala chai (5 sold)
$ git switch main
Switched to branch 'main'
$ python3 sales_report.py sample_orders.csv
total: ₹230 from 6 orders, rejected: 3</div>
  <p>After <code>git switch -c feature/top-item</code>, <code>.git/HEAD</code> says <code>ref: refs/heads/feature/top-item</code>, and both branch files contain the same hash, <code>27d52a5…</code>: the new branch starts at the commit we were on. After the commit, only <code>feature/top-item</code> moved (to <code>38edfa1…</code>); <code>main</code> stayed put. <code>git log --oneline --graph --all --decorate</code> draws the history with each label in brackets, and <code>HEAD -&gt;</code> marks the current branch. On the branch the report prints the top item, masala chai with 5 cups. After <code>git switch main</code>, Git rewrote <code>sales_report.py</code> in the folder to main's version, so the top-item line is gone. Nothing was lost; the feature waits on its branch.</p>
  <p>One state confuses almost everyone the first time: <strong>detached HEAD</strong>. If you check out a specific commit instead of a branch, HEAD holds a commit hash directly instead of the name of a branch. You can look around, run old code, and even commit, but no branch label follows your new commits:</p>
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

HEAD is now at 0e5006a Count rejected rows
$ cat .git/HEAD
0e5006a950fa50b9dc77dc47dc597b17de3d4524
$ git commit -qam "Experiment: round totals"
$ git switch main
Warning: you are leaving 1 commit behind, not connected to
any of your branches:

  89d15ec Experiment: round totals

If you want to keep it by creating a new branch, this may be a good time
to do so with:

 git branch &lt;new-branch-name&gt; 89d15ec

Switched to branch 'main'</div>
  <p><code>.git/HEAD</code> now contains a raw hash rather than <code>ref: refs/heads/…</code>. We made a commit there, and when we switched back to main Git warned that commit <code>89d15ec</code> is "not connected to any of your branches" and printed the command to rescue it. Commits that no branch or tag points to are eventually deleted by Git's clean-up (after roughly 90 days by default), so if you want to keep work made on a detached HEAD, give it a name with <code>git switch -c rescue</code> before leaving, or <code>git branch rescue 89d15ec</code> right after. The same applies when you delete a branch: <code>git branch -d</code> removes the label, not the commits, but commits nobody points to will eventually disappear.</p>
  <p>Switching branches with unfinished edits raises a practical question. If your edits do not clash with the other branch, Git carries them along; if they would be overwritten, Git refuses to switch. The usual options are to commit, or to park the edits temporarily with <code>git stash</code>, which saves your uncommitted changes in a hidden commit and cleans the folder:</p>
  <div class="fx" data-lang="text">$ echo "# TODO: weekly totals" &gt;&gt; sales_report.py
$ git status --short
 M sales_report.py
$ git stash
Saved working directory and index state WIP on main: 27d52a5 Count valid orders
$ git status --short
$ git stash list
stash@{0}: WIP on main: 27d52a5 Count valid orders
$ git stash pop
On branch main
Changes not staged for commit:
  (use "git add &lt;file&gt;..." to update what will be committed)
  (use "git restore &lt;file&gt;..." to discard changes in working directory)
	modified:   sales_report.py

no changes added to commit (use "git add" and/or "git commit -a")
Dropped refs/stash@{0} (1836d6905d1a4997bd7ff74476f2e851c6cb64a4)</div>
  <p>After <code>git stash</code> the status is empty, <code>git stash list</code> shows the parked change as <code>stash@{0}</code>, and <code>git stash pop</code> puts it back into the file and removes it from the list. You can stash, switch branches, fix something urgent, come back and pop. Note that <code>git switch</code> (change branch) and <code>git restore</code> (restore files, section 10) are the modern, clearer halves of the older command <code>git checkout</code>, which did both jobs and which you will still see in older tutorials.</p>

  <h2 id="sg-merge"><span class="num">07</span>Merging and Conflicts</h2>
  <p>The top-item feature works on its branch, so it is time to bring it into main. Joining one line of work into another is called <strong>merging</strong>, and Git handles two very different situations under the same command, <code>git merge</code>. You run it while on the branch that should receive the work.</p>
  <p>In the first situation main has not moved since the branch was created. Main still points at <code>27d52a5</code>, which is the parent of the feature's commit, so all of main's history is already contained in the feature branch. Git does not need to combine anything: it simply slides the <code>main</code> label forward to the feature's commit. This is called a <strong>fast-forward</strong> merge:</p>
  <div class="fx" data-lang="text">$ git merge feature/top-item
Updating 27d52a5..38edfa1
Fast-forward
 sales_report.py | 5 +++++
 1 file changed, 5 insertions(+)
$ cat .git/refs/heads/main
38edfa10f9bb05b639b69722308776e81ba7eb70
$ git log --oneline --graph --all --decorate
* 38edfa1 (HEAD -&gt; main, feature/top-item) Show the best-selling item
* 27d52a5 Count valid orders
* 0e5006a Count rejected rows
* b02099a Add sales report: total of valid orders
$ git branch -d feature/top-item
Deleted branch feature/top-item (was 38edfa1).</div>
  <p>Git reports "Fast-forward", <code>.git/refs/heads/main</code> now holds <code>38edfa1…</code>, and both labels sit on the same commit. No new commit was created; one file was rewritten. The branch label is now redundant, so <code>git branch -d</code> deletes it (it refuses if the branch has commits not yet merged anywhere).</p>
  <p>The second situation is more interesting. Meera starts another branch, <code>feature/usage-check</code>, which makes the script print a usage message and exit with an error code when no file is given. Before merging it she also adds a README on main. Now both lines have new commits, and neither contains the other, so no label can simply slide forward. Git performs a <strong>three-way merge</strong>. It first finds the <strong>merge base</strong>, the most recent commit the two branches share. Then, for each file, it compares three versions: the base, "ours" (the branch we are on) and "theirs" (the branch being merged in). If only one side changed something compared with the base, Git takes that side's change; if neither changed it, it stays as it was. Think of two cooks starting from the same recipe card. One adds a garnish note at the bottom, the other changes the oven time. By comparing each version with the original card, a third person can apply both changes without asking anyone.</p>
  <div class="fx" data-lang="text">$ git switch -c feature/usage-check
Switched to a new branch 'feature/usage-check'
$ git commit -qam "Exit with a usage message when no file is given"
$ git switch main
Switched to branch 'main'
$ git add README.md
$ git commit -qm "Add README"
$ git log --oneline --graph --all --decorate
* 51f9329 (HEAD -&gt; main) Add README
| * 375bc2d (feature/usage-check) Exit with a usage message when no file is given
|/  
* 38edfa1 Show the best-selling item
* 27d52a5 Count valid orders
* 0e5006a Count rejected rows
* b02099a Add sales report: total of valid orders
$ git merge-base main feature/usage-check
38edfa10f9bb05b639b69722308776e81ba7eb70
$ git merge --no-edit feature/usage-check
Merge made by the 'ort' strategy.
 sales_report.py | 4 ++++
 1 file changed, 4 insertions(+)
$ git log --oneline --graph --decorate
*   c8704e1 (HEAD -&gt; main) Merge branch 'feature/usage-check'
|\\  
| * 375bc2d (feature/usage-check) Exit with a usage message when no file is given
* | 51f9329 Add README
|/  
* 38edfa1 Show the best-selling item
* 27d52a5 Count valid orders
* 0e5006a Count rejected rows
* b02099a Add sales report: total of valid orders
$ git cat-file -p HEAD
tree a002180109e494b67fef08eedb5446c8613cade0
parent 51f93291222609e6b63e364f009ccecb2f5c8108
parent 375bc2da97a5f8dee24c9d561d844c8e890aed70
author Meera &lt;meera@example.com&gt; 1792391880 +0530
committer Meera &lt;meera@example.com&gt; 1792391880 +0530

Merge branch 'feature/usage-check'
$ python3 sales_report.py; echo "exit code: $?"
usage: python3 sales_report.py ORDERS.csv
exit code: 2
$ git branch -d feature/usage-check
Deleted branch feature/usage-check (was 375bc2d).</div>
  <p>The graph before the merge shows the fork: <code>51f9329</code> (README) on main and <code>375bc2d</code> (usage check) on the branch, both growing from <code>38edfa1</code>, which <code>git merge-base</code> confirms is the merge base. Relative to it, only main touched <code>README.md</code> and only the branch touched <code>sales_report.py</code>, so Git takes each side's change. It records the result as a new <strong>merge commit</strong>, <code>c8704e1</code>, and <code>git cat-file -p HEAD</code> shows what makes it special: it has <em>two</em> <code>parent</code> lines, one for each side. A merge commit is just an ordinary commit with two parents. ("ort" in the output is the name of Git's default merge algorithm.) The merged script now prints the usage line and exits with code 2 when run without a file; exit codes are how a process reports success or failure to whoever started it (see <a class="xref" data-note="cf_os">Operating Systems</a>), and they come back in the <a class="xref" data-note="se_linux">Linux &amp; Terminal</a> note.</p>
  <p>The three-way rule has one case it cannot decide: both sides changed the <em>same</em> lines differently compared with the base. Then Git stops and asks you. This is a <strong>merge conflict</strong>. It is not an error and nothing is broken; it is a question that only a human can answer. Imagine two family members editing the same shopping list, one changing "1 kg rice" to "2 kg" and the other to "5 kg". Whoever combines the lists cannot guess, so she writes both versions on the paper and asks. Let us cause one: on a branch, Ravi rewords the summary line to say "valid orders", while on main Meera relabels the same line "Total sales":</p>
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
$ sed -n '/^&lt;&lt;&lt;&lt;&lt;&lt;&lt;/,/^&gt;&gt;&gt;&gt;&gt;&gt;&gt;/p' sales_report.py
&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD
print(f"Total sales: ₹{total} from {orders} orders, rejected: {rejected}")
=======
print(f"total: ₹{total} from {orders} valid orders, rejected: {rejected}")
&gt;&gt;&gt;&gt;&gt;&gt;&gt; fix/wording</div>
  <p>Git merged everything it could and stopped on the one clash. The status code <code>UU</code> means "unmerged, both modified". Inside the file Git wrote both versions between <strong>conflict markers</strong>: the lines between <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD</code> and <code>=======</code> are ours (main's "Total sales"), and the lines between <code>=======</code> and <code>&gt;&gt;&gt;&gt;&gt;&gt;&gt; fix/wording</code> are theirs ("valid orders"). Lines around the conflict merged normally and appear only once. Now there are two ways forward:</p>
  <div class="fx" data-lang="text">$ git merge --abort
$ git status --short
$ git merge fix/wording
Auto-merging sales_report.py
CONFLICT (content): Merge conflict in sales_report.py
Automatic merge failed; fix conflicts and then commit the result.
$ grep -n 'Total sales' sales_report.py
26:print(f"Total sales: ₹{total} from {orders} valid orders, rejected: {rejected}")
$ grep -c '&lt;&lt;&lt;&lt;&lt;&lt;&lt;' sales_report.py
0
$ python3 sales_report.py sample_orders.csv
Total sales: ₹230 from 6 valid orders, rejected: 3
top item: masala chai (5 sold)
$ git add sales_report.py
$ git status --short
M  sales_report.py
$ git commit --no-edit
[main 3469296] Merge branch 'fix/wording'
$ git log --oneline --graph --decorate -6
*   3469296 (HEAD -&gt; main) Merge branch 'fix/wording'
|\\  
| * cae7361 (fix/wording) Say 'valid orders' in the summary line
* | 7974871 Label the total as 'Total sales'
|/  
*   c8704e1 Merge branch 'feature/usage-check'
|\\  
| * 375bc2d Exit with a usage message when no file is given
* | 51f9329 Add README
|/  
$ git branch -d fix/wording
Deleted branch fix/wording (was cae7361).</div>
  <p>First we backed out: <code>git merge --abort</code> returned everything to the state before the merge, shown by the empty status. That is always available if you are not ready to resolve a conflict. Then we merged again and resolved it properly. Resolving means editing the file so it contains the final text you want and deleting the three marker lines. Here the right answer keeps <em>both</em> intentions: "Total sales: … valid orders". <code>grep -c</code> confirms no marker is left (0), and running the script confirms it works. <code>git add</code> tells Git the conflict is resolved, which turns <code>UU</code> into <code>M&#160;</code>, and <code>git commit --no-edit</code> records the merge commit <code>3469296</code> with its default message. Editors such as VS Code show buttons like "Accept current", "Accept incoming" and "Accept both" over the markers, but the decision is still yours, and if the other author's intent is unclear you should ask them rather than guess.</p>
  <p>One warning applies to every merge, conflict or not: Git merges <em>text</em>, not meaning. If one branch renames a variable and the other adds a new line that uses the old name somewhere else, both changes merge cleanly and the program breaks. "Merged without conflicts" does not mean "correct", so run the script or the tests after every merge.</p>

  <h2 id="sg-rebase"><span class="num">08</span>Rebase</h2>
  <p>Merging records history truthfully: work happened in parallel, and the merge commit shows where it was joined. The cost is that with many small branches, <code>git log --graph</code> turns into a tangle of forks and joins that is hard to read. Many teams prefer history that reads as a single straight line. <strong>Rebase</strong> is how you get one: it takes the commits on your branch and replays them, one by one, on top of the latest commit of another branch, as if you had started your work from there. Think of two friends writing chapters of a group report in parallel. Merging staples both stacks together with a note saying "joined here". Rebasing retypes your chapters as if you had started after your friend finished: neater, but they are new pages, not the originals.</p>
  <p>To compare the two fairly we build one situation and join it both ways. On branch <code>feature/by-item</code> Meera makes two commits (call them C, tracking revenue per item, and D, printing items sorted by revenue), while main gets commit E, a README update. We copy the whole repository to <code>~/try-merge</code> and merge there:</p>
  <div class="fx" data-lang="text">$ git switch -c feature/by-item
Switched to a new branch 'feature/by-item'
$ git commit -qam "Track revenue per item"
$ git commit -qam "Sort items by revenue"
$ git switch main
Switched to branch 'main'
$ git commit -qam "Document the output in README"
$ git log --oneline --graph --all --decorate -4
* d739e8c (HEAD -&gt; main) Document the output in README
| * 5c1aa20 (feature/by-item) Sort items by revenue
| * 0b6fdb3 Track revenue per item
|/  
*   3469296 Merge branch 'fix/wording'
|\\  
$ cp -r ~/chai-report ~/try-merge
$ cd ~/try-merge
$ git merge --no-edit feature/by-item
Merge made by the 'ort' strategy.
 sales_report.py | 4 ++++
 1 file changed, 4 insertions(+)
$ git log --oneline --graph --decorate -5
*   27abba6 (HEAD -&gt; main) Merge branch 'feature/by-item'
|\\  
| * 5c1aa20 (feature/by-item) Sort items by revenue
| * 0b6fdb3 Track revenue per item
* | d739e8c Document the output in README
|/  
*   3469296 Merge branch 'fix/wording'
|\\  </div>
  <p>This is the merge we already know: merge commit <code>27abba6</code> joins E (<code>d739e8c</code>) and D, and C and D keep their original IDs, <code>0b6fdb3</code> and <code>5c1aa20</code>. Now, back in the real repository, we rebase the branch onto main instead, and then merge it:</p>
  <div class="fx" data-lang="text">$ cd ~/chai-report
$ git switch feature/by-item
Switched to branch 'feature/by-item'
$ git rebase main
Successfully rebased and updated refs/heads/feature/by-item.
$ git log --oneline --graph --all --decorate -4
* e7215f1 (HEAD -&gt; feature/by-item) Sort items by revenue
* 49d6800 Track revenue per item
* d739e8c (main) Document the output in README
*   3469296 Merge branch 'fix/wording'
|\\  
$ git switch main
Switched to branch 'main'
$ git merge feature/by-item
Updating d739e8c..e7215f1
Fast-forward
 sales_report.py | 4 ++++
 1 file changed, 4 insertions(+)
$ git branch -d feature/by-item
Deleted branch feature/by-item (was e7215f1).
$ python3 sales_report.py sample_orders.csv
Total sales: ₹230 from 6 valid orders, rejected: 3
top item: masala chai (5 sold)
  masala chai  ₹100
  bun maska    ₹60
  samosa       ₹45
  ginger chai  ₹25</div>
  <p>After <code>git rebase main</code>, the same two changes sit on top of E as <code>49d6800</code> and <code>e7215f1</code>. They have <strong>new IDs</strong>, and section 03 tells us why: a commit's ID is a hash of its content, its content includes its parent's ID, and the parent of C changed from <code>3469296</code> to <code>d739e8c</code>. So rebase cannot move commits; it creates new copies, and the old ones are left behind with no label. Because the branch now starts at main's tip, merging it is a fast-forward and history is one straight line. The files are identical either way: the report now ends with revenue per item, masala chai ₹100, bun maska ₹60, samosa ₹45 and ginger chai ₹25, which add up to ₹230.</p>
  <figure class="viz"><svg viewBox="0 0 600 190" width="600">
    <text x="140" y="18" text-anchor="middle" class="tb">git merge feature (on main)</text>
    <text x="455" y="18" text-anchor="middle" class="tb">git rebase main (on feature)</text>
    <g stroke="currentColor" fill="none" stroke-width="1.5">
      <line x1="45" y1="120" x2="55" y2="120"/><line x1="85" y1="120" x2="195" y2="120"/><line x1="78" y1="107" x2="102" y2="73"/><line x1="125" y1="60" x2="155" y2="60"/><line x1="182" y1="70" x2="237" y2="108"/><line x1="225" y1="120" x2="233" y2="120"/>
      <line x1="345" y1="120" x2="365" y2="120"/><line x1="395" y1="120" x2="415" y2="120"/><line x1="445" y1="120" x2="475" y2="120"/><line x1="505" y1="120" x2="535" y2="120"/>
    </g>
    <line x1="300" y1="30" x2="300" y2="180" stroke="currentColor" stroke-dasharray="3 4"/>
    <circle cx="30" cy="120" r="15" style="fill:var(--bg)"/><circle cx="30" cy="120" r="15" class="fb sb"/><text x="30" y="125" text-anchor="middle" font-size="10">…</text>
    <circle cx="70" cy="120" r="15" style="fill:var(--bg)"/><circle cx="70" cy="120" r="15" class="fb sb"/><text x="70" y="125" text-anchor="middle" font-size="9">3469</text>
    <circle cx="110" cy="60" r="15" style="fill:var(--bg)"/><circle cx="110" cy="60" r="15" class="ft st"/><text x="110" y="65" text-anchor="middle">C</text>
    <circle cx="170" cy="60" r="15" style="fill:var(--bg)"/><circle cx="170" cy="60" r="15" class="ft st"/><text x="170" y="65" text-anchor="middle">D</text>
    <circle cx="210" cy="120" r="15" style="fill:var(--bg)"/><circle cx="210" cy="120" r="15" class="fb sb"/><text x="210" y="125" text-anchor="middle">E</text>
    <circle cx="250" cy="120" r="17" style="fill:var(--bg)"/><circle cx="250" cy="120" r="17" class="fg sg"/><text x="250" y="125" text-anchor="middle">M</text>
    <text x="280" y="160" text-anchor="end" class="tm">M = 27abba6, 2 parents</text>
    <circle cx="330" cy="120" r="15" style="fill:var(--bg)"/><circle cx="330" cy="120" r="15" class="fb sb"/><text x="330" y="125" text-anchor="middle" font-size="10">…</text>
    <circle cx="380" cy="120" r="15" style="fill:var(--bg)"/><circle cx="380" cy="120" r="15" class="fb sb"/><text x="380" y="125" text-anchor="middle" font-size="9">3469</text>
    <circle cx="430" cy="120" r="15" style="fill:var(--bg)"/><circle cx="430" cy="120" r="15" class="fb sb"/><text x="430" y="125" text-anchor="middle">E</text>
    <circle cx="490" cy="120" r="15" style="fill:var(--bg)"/><circle cx="490" cy="120" r="15" class="ft st"/><text x="490" y="125" text-anchor="middle">C'</text>
    <circle cx="550" cy="120" r="15" style="fill:var(--bg)"/><circle cx="550" cy="120" r="15" class="ft st"/><text x="550" y="125" text-anchor="middle">D'</text>
    <text x="520" y="160" text-anchor="middle" class="tm">C' = 49d6800, D' = e7215f1</text>
  </svg><figcaption>The same starting point joined two ways. Merge keeps C and D and adds M with two parents. Rebase replays C and D on top of E as new commits C′ and D′.</figcaption></figure>
  <p>On the left of the figure, C and D branch off <code>3469296</code> while E grows on main, and the merge commit M joins the two lines. On the right, C and D have been re-created as C′ and D′ after E, so there is no fork and no M. The table summarises the trade-off:</p>
  <table class="tbl">
    <tr><th></th><th>Merge</th><th>Rebase</th></tr>
    <tr><td>History shape</td><td>True, with forks and joins</td><td>Straight line, rewritten</td></tr>
    <tr><td>Your commits' IDs</td><td>Unchanged</td><td>New for every replayed commit</td></tr>
    <tr><td>Extra commit</td><td>A merge commit</td><td>None (main fast-forwards)</td></tr>
    <tr><td>Safe on a shared branch?</td><td>Yes</td><td>No</td></tr>
    <tr><td>Typical use</td><td>Bringing finished work into a shared branch</td><td>Updating or tidying your own branch before review</td></tr>
  </table>
  <p>The "No" in that table is the most important rule about rebase, often called the golden rule: <strong>never rebase commits that other people already have</strong>. If Ravi has already pulled C and D and you rebase them into C′ and D′, his copy and yours now contain the same changes under different IDs. The next time you exchange work, Git sees both versions as separate commits, history fills with duplicates, and the same changes conflict with themselves. Rebasing is safe only for commits that exist only on your machine (or only on your own branch that nobody else uses). A related tool is <code>git rebase -i</code> (interactive rebase), which opens a list of your recent commits and lets you reorder them, squash several into one or reword messages before you share them. The same golden rule applies to it.</p>

  <h2 id="sg-remote"><span class="num">09</span>Remotes: push, fetch, pull</h2>
  <p>All the history so far lives in one folder on Meera's laptop. If the laptop dies, the history dies with it, and Ravi cannot see or add to it. To share, the team needs a copy that both can reach. A <strong>remote</strong> is another copy of the same repository, usually on a server such as GitHub, that you send commits to and receive commits from. Because every copy holds the full history, there is technically no master copy; the team simply agrees that the GitHub copy is the one everybody exchanges work through.</p>
  <p>Think of a shared class register kept in the staff room while everyone works on their own copy at their desk. <strong>push</strong> carries your new pages to the register. <strong>fetch</strong> photocopies whatever others have added and puts it in a tray on your desk, without touching your own copy. <strong>pull</strong> photocopies and immediately files the new pages into your copy. In Git terms: <code>git clone URL</code> copies a whole repository, including its history, and remembers where it came from under the name <strong>origin</strong>; <code>git push</code> uploads your new commits; <code>git fetch</code> downloads new commits without changing your files or your branches; and <code>git pull</code> is a fetch followed by a merge (or a rebase, with <code>--rebase</code>) into your current branch.</p>
  <p>To run everything here without a network we create the "server" copy as a <strong>bare repository</strong> in <code>~/server</code>: a repository that has the <code>.git</code> history but no working files, which is exactly what GitHub stores. On GitHub only the address would change (something like <code>https://github.com/meera/chai-report.git</code> or <code>git@github.com:meera/chai-report.git</code>; the second form uses SSH keys, explained in <a class="xref" data-note="cf_networking">Networking</a>). Meera publishes her repository, Ravi clones it onto his laptop and pushes a README line:</p>
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
   e7215f1..10dba07  main -&gt; main</div>
  <p><code>git remote add origin PATH</code> gave the server copy the name origin, and <code>git remote -v</code> lists it (once for fetching, once for pushing). <code>git push -u origin main</code> uploaded main and set its <strong>upstream</strong>, meaning "this local branch normally pushes to and pulls from origin's main", so from now on a plain <code>git push</code> or <code>git pull</code> knows where to go. In Ravi's clone, <code>git branch -a</code> also shows <code>remotes/origin/main</code>. That is a <strong>remote-tracking branch</strong>: his laptop's memory of where main was on the server the last time it checked. Ravi commits and pushes, and the line <code>e7215f1..10dba07 main -&gt; main</code> says the server's main moved from Meera's last commit to his. Now back on Meera's laptop:</p>
  <div class="fx" data-lang="text">$ cd ~/chai-report
$ git status -sb
## main...origin/main
$ git fetch
From /home/meera/server/chai-report
   e7215f1..10dba07  main       -&gt; origin/main
$ git status -sb
## main...origin/main [behind 1]
$ git log --oneline --graph --all --decorate -3
* 10dba07 (origin/main) Explain rejected rows in README
* e7215f1 (HEAD -&gt; main) Sort items by revenue
* 49d6800 Track revenue per item
$ git pull
Updating e7215f1..10dba07
Fast-forward
 README.md | 2 ++
 1 file changed, 2 insertions(+)</div>
  <p>This shows a subtle point that trips people up. Straight after Ravi pushed, Meera's <code>git status -sb</code> did not say she was behind. Status compares her branch with <code>origin/main</code>, her laptop's memory of the server, and that memory only updates when she contacts the server. After <code>git fetch</code> downloaded Ravi's commit, status says <code>[behind 1]</code> and the graph shows <code>origin/main</code> one commit ahead of her <code>main</code>. Her files have not changed yet. <code>git pull</code> then brought the commit into her branch, here as a fast-forward because she had no new commits of her own. "Up to date" in Git always means "up to date with what I last fetched".</p>
  <p>The common real-world problem is two people committing at the same time. Ravi adds a contact line and pushes first; meanwhile Meera commits a CHANGELOG and tries to push:</p>
  <div class="fx" data-lang="text">$ cd ~/ravi-laptop
$ git commit -qam "Add contact line to README"
$ git push -q
$ cd ~/chai-report
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
   10dba07..9c7b03b  main       -&gt; origin/main
Successfully rebased and updated refs/heads/main.
$ git push
To /home/meera/server/chai-report.git
   9c7b03b..27fee63  main -&gt; main
$ git log --oneline --graph --decorate -4
* 27fee63 (HEAD -&gt; main, origin/main) Add CHANGELOG
* 9c7b03b Add contact line to README
* 10dba07 Explain rejected rows in README
* e7215f1 Sort items by revenue</div>
  <p>Meera's push was <strong>rejected</strong>: the server's main contains Ravi's new commit, which her branch does not have, so accepting her push would throw his commit away. Git only accepts a push that is a fast-forward of what the server has. The fix is to get his work first. <code>git pull --rebase</code> fetched Ravi's commit and replayed her CHANGELOG commit on top of it. This is a rebase, but it is safe because the commit being replayed existed only on her laptop. The second push succeeded and the final log is one straight line holding both people's work. What you must never do with a rejected push on a shared branch is "fix" it with <code>git push --force</code>, which tells the server to replace its branch with yours and would delete Ravi's commit there; section 13 shows that happening.</p>

  <h2 id="sg-undo"><span class="num">10</span>Undoing Mistakes</h2>
  <p>Everyone makes mistakes with Git, and Git offers a different tool for each kind. Choosing the right one depends on two questions. First, <em>where</em> is the mistake: an edit you have not staged, something you staged, or a commit? Second, <em>has it been pushed</em>, meaning other people may already have it? Tools that rewrite history are fine for things only you have, and dangerous for things others have. A newspaper is a good picture of the difference. Printing a correction in tomorrow's edition is honest and safe even after the paper has been delivered. Pulping today's edition is fine before the trucks leave and chaos after readers have it.</p>
  <p>The gentlest case is an edit you regret before staging it, or a file you staged by mistake. <code>git restore FILE</code> throws away the edits in a file by copying the last committed (or staged) version back over it. <code>git restore --staged FILE</code> takes a file out of the staging area but keeps your edits in it:</p>
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
  <p>After <code>git restore sales_report.py</code> the stray <code>print(1/0)</code> line is gone and the status is empty. For the README, <code>restore --staged</code> moved the <code>M</code> from the left column (staged) to the right column (not staged): the edit still exists, it just is no longer in the draft. The final <code>restore</code> threw it away. Be aware that <code>git restore FILE</code> really discards those edits; Git never saved them, so there is no way to get them back.</p>
  <p>Next, a commit with a typo in its message, not yet pushed. <code>git commit --amend</code> replaces the last commit with a corrected one:</p>
  <div class="fx" data-lang="text">$ git commit -qam "Updte changelog"
$ git log --oneline -2
6a50ffc Updte changelog
27fee63 Add CHANGELOG
$ git commit --amend -qm "Update changelog"
$ git log --oneline -2
4c1a317 Update changelog
27fee63 Add CHANGELOG</div>
  <p>The typo commit <code>6a50ffc</code> was replaced by <code>4c1a317</code>. It is a new ID because the message is part of the commit's content. Amending is rewriting history, which is fine here because nobody else has the old commit; after pushing, you should not amend.</p>
  <p>Now a serious mistake that <em>has</em> been pushed. Meera commits a change that shows amounts in paise but forgets to update the label, pushes it, and the owner's report suddenly says ₹23000. Others may already have pulled this commit, so we must not rewrite history. <code>git revert COMMIT</code> creates a new commit that applies the exact opposite of the bad one:</p>
  <div class="fx" data-lang="text">$ git commit -qam "Show amounts in paise"
$ git push -q
$ python3 sales_report.py sample_orders.csv | head -1
Total sales: ₹23000 from 6 valid orders, rejected: 3
$ git revert --no-edit HEAD
[main 57baf7f] Revert "Show amounts in paise"
 Date: Mon Oct 19 15:22:00 2026 +0530
 1 file changed, 1 insertion(+), 1 deletion(-)
$ python3 sales_report.py sample_orders.csv | head -1
Total sales: ₹230 from 6 valid orders, rejected: 3
$ git log --oneline -4
57baf7f Revert "Show amounts in paise"
52fb56c Show amounts in paise
4c1a317 Update changelog
27fee63 Add CHANGELOG
$ git push -q</div>
  <p>The bad commit <code>52fb56c</code> is still in the history, followed by <code>57baf7f</code>, "Revert …", which undoes its change. The report is back to ₹230, and since revert only <em>adds</em> a commit, everyone else can pull it as a normal update. This is the correct way to undo anything on a shared branch.</p>
  <p>For commits that exist only on your machine there is a more powerful tool, <code>git reset COMMIT</code>, which moves the current branch label back to an earlier commit, as if the later commits had never been made. Its three modes differ in what happens to the changes in the commits you step back over: <code>--soft</code> keeps them staged, <code>--mixed</code> (the default) keeps them in your files but unstaged, and <code>--hard</code> throws them away, overwriting your files. To compare the three from the same starting point, we make two small commits on a lab branch and copy the repository three times:</p>
  <div class="fx" data-lang="text">$ git switch -c reset-lab
Switched to a new branch 'reset-lab'
$ echo "line A" &gt; lab.txt
$ git add lab.txt
$ git commit -qm "Add line A"
$ echo "line B" &gt;&gt; lab.txt
$ git commit -qam "Add line B"
$ git log --oneline -2
f5f87eb Add line B
26566ef Add line A
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
HEAD is now at 26566ef Add line A
$ git status --short
$ cat lab.txt
line A</div>
  <p>All three moved the branch back from "Add line B" (<code>f5f87eb</code>) to "Add line A" (<code>26566ef</code>). With <code>--soft</code> the status shows <code>M&#160;</code>: the "line B" change is staged, ready to be committed again, which makes soft reset a handy way to squash your last few commits into one. With <code>--mixed</code> it shows <code>&#160;M</code>: the change is in the file but not staged. With <code>--hard</code> the status is empty and <code>lab.txt</code> contains only "line A"; the change has been wiped from the file. That is why <code>--hard</code> is the dangerous one.</p>
  <p>Is the "line B" commit gone for ever? Not quite. Git keeps a private diary called the <strong>reflog</strong>, a log of every position HEAD has been at in your repository:</p>
  <div class="fx" data-lang="text">$ git reflog -4
26566ef HEAD@{0}: reset: moving to HEAD~1
f5f87eb HEAD@{1}: commit: Add line B
26566ef HEAD@{2}: commit: Add line A
57baf7f HEAD@{3}: checkout: moving from main to reset-lab
$ git reset --hard HEAD@{1}
HEAD is now at f5f87eb Add line B
$ cat lab.txt
line A
line B
$ echo "line C, never committed" &gt;&gt; lab.txt
$ git reset --hard
HEAD is now at f5f87eb Add line B
$ cat lab.txt
line A
line B
$ cd ~/chai-report</div>
  <p>The reflog shows the reset at the top, and below it <code>HEAD@{1}</code>, meaning "where HEAD was one move ago", which is the commit <code>f5f87eb</code> we just threw away. Resetting to it brought "line B" back. The second half shows the limit: "line C" was never committed, so when <code>git reset --hard</code> erased it, no diary had a copy. Git can recover commits for a while (unreferenced commits are kept for about 90 days by default) but it cannot recover edits that were never committed. The reflog is also local to your machine and never shared. The safe habit follows directly: before any command that can discard work, commit or stash first; you can always tidy commits later.</p>
  <table class="tbl">
    <tr><th>Situation</th><th>Command</th><th>Rewrites history?</th></tr>
    <tr><td>Throw away edits to a file</td><td><code>git restore file</code></td><td>No, but the edits are lost</td></tr>
    <tr><td>Unstage a file, keep the edits</td><td><code>git restore --staged file</code></td><td>No</td></tr>
    <tr><td>Fix the last commit (not pushed)</td><td><code>git commit --amend</code></td><td>Yes</td></tr>
    <tr><td>Undo a pushed commit</td><td><code>git revert COMMIT</code></td><td>No: adds an opposite commit</td></tr>
    <tr><td>Remove local commits</td><td><code>git reset --soft / --mixed / --hard COMMIT</code></td><td>Yes; <code>--hard</code> also wipes file changes</td></tr>
    <tr><td>Recover a lost commit</td><td><code>git reflog</code>, then <code>git reset --hard HEAD@{n}</code></td><td>Recovery</td></tr>
  </table>

  <h2 id="sg-ignore"><span class="num">11</span>What Stays Out of Git</h2>
  <p>Some files should never enter history at all. The stall will produce a new order sheet and a report file every day; these are data and output, not code, and they would bloat the repository and leak customer names. The <a class="xref" data-note="se_docker">Docker</a> note will need a database password in a file called <code>.env</code>, and a password in history can be read by anyone who ever gets a copy. Python creates <code>__pycache__</code> folders, and a virtual environment folder (<code>.venv</code>) holds thousands of installed library files that each person can recreate (see <a class="xref" data-note="py_modules">Modules, Packages &amp; Environments</a>).</p>
  <p>A file called <strong>.gitignore</strong> lists patterns of paths that Git should pretend not to see. Think of a "do not pack" list stuck to a suitcase: whatever matches the list is never put in the bag, no matter how many times you pack. But a "do not pack" list does nothing about things that are <em>already</em> in the bag, and that turns out to matter. In this example we create today's data and output, and a <code>.env</code> file that someone commits by mistake before the ignore file exists:</p>
  <div class="fx" data-lang="text">$ mkdir -p data out
$ cp sample_orders.csv data/orders_2026-10-19.csv
$ python3 sales_report.py data/orders_2026-10-19.csv &gt; out/report_2026-10-19.txt
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
?? .gitignore</div>
  <p>Before the ignore file, status lists <code>data/</code> and <code>out/</code> as untracked. After writing <code>.gitignore</code> with one pattern per line (a trailing <code>/</code> means "a folder with this name"), both disappear from the status, and <code>git check-ignore -v</code> explains each decision by naming the file, line number and pattern that matched. But <code>.env</code> was not reported, and when we change it the status shows <code>&#160;M</code>: Git is still tracking it. <strong>Ignore rules only apply to files Git is not already tracking.</strong> To stop tracking a file you must remove it from the index:</p>
  <div class="fx" data-lang="text">$ git rm --cached .env
rm '.env'
$ git check-ignore -v .env
.gitignore:3:.env	.env
$ git add .gitignore
$ git commit -qm "Stop tracking .env; add .gitignore"
$ git status --short
$ git show HEAD~1:.env
DATABASE_URL=postgresql://chai:chai-secret@localhost:5432/stall</div>
  <p><code>git rm --cached</code> removes the file from tracking but leaves it on disk (without <code>--cached</code> it would delete the file too). Only now does rule 3 of <code>.gitignore</code> apply, and after committing the status is clean. The last command shows the uncomfortable truth: the earlier commit still contains the old password, and anyone with a copy of the repository can read it with one command. Deleting a secret in a new commit does not remove it from history. If a secret is ever pushed, the first step is to <strong>rotate</strong> it, meaning revoke the old password or key and issue a new one, because automated bots scan GitHub for leaked keys within minutes. Only then is it worth rewriting history with a tool such as <code>git filter-repo</code> and force-pushing with the team's agreement. The lasting fix is to keep secrets in environment variables or a secret manager rather than in files in the repository, and to write <code>.gitignore</code> on the first day.</p>
  <p>Data files raise a different problem. In data science you often <em>do</em> need to know exactly which data produced a result, yet Git is built for many small text files. A 2 GB file committed to Git is downloaded by every clone, and every version of it is kept for ever; GitHub refuses files larger than 100 MB. The standard solution reuses the idea from section 03: store a small <strong>pointer</strong> file in Git, containing the big file's hash and size, and keep the big file itself in storage built for big files. Git versions the pointer, and the pointer says exactly which big file to fetch, like a cloakroom token that is cheap to carry and gets you exactly your bag back. <strong>Git LFS</strong> (Large File Storage) does this inside Git:</p>
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
$ yes "1,08:05,Asha,masala chai,2,20," | head -c 2000000 &gt; orders_2026-10.parquet
$ git add .gitattributes orders_2026-10.parquet
$ git commit -qm "Archive October orders via LFS"
$ git show HEAD:orders_2026-10.parquet
version https://git-lfs.github.com/spec/v1
oid sha256:754d48de7fa0a5ff9693e46a493704a2fd556f65c64b3945057f4ca82546358e
size 2000000
$ ls -lh orders_2026-10.parquet | awk '{print $5, $9}'
2.0M orders_2026-10.parquet
$ cd ~/chai-report</div>
  <p><code>git lfs track</code> wrote a rule into <code>.gitattributes</code> saying that <code>*.parquet</code> files go through LFS (that file must be committed too). When we ask Git what the commit actually stores for the 2 MB file, it is three lines: the pointer format version, the SHA-256 hash of the content, and its size in bytes. The real file sits in the working folder and, after a push to GitHub, on GitHub's LFS server. <strong>DVC</strong> (Data Version Control) applies the same pointer idea and is popular in data science because the data can live in your own cloud storage bucket and DVC can also record pipelines (which script turned which data into which model). DVC is not installed here, so these typical commands are shown without output: <code>dvc add data/orders_2026-10.parquet</code> writes a small <code>.dvc</code> pointer file and adds the data file to <code>.gitignore</code>; you commit the pointer with Git; <code>dvc push</code> uploads the data to remote storage; and a teammate runs <code>git pull</code> followed by <code>dvc pull</code>. Either way, adding LFS or DVC after a big file was already committed does not shrink the repository, because old commits still contain the file, so set it up before the first big file.</p>
  <p>Jupyter notebooks are a related nuisance. An <code>.ipynb</code> file is JSON that stores outputs, images and execution counts alongside your code, so re-running a single cell changes dozens of lines, diffs become unreadable and conflicts are common. The usual fixes are to strip outputs automatically before committing (the <code>nbstripout</code> tool), to view notebook diffs with <code>nbdime</code>, or to pair each notebook with a plain <code>.py</code> file using Jupytext, and to move reusable code out of notebooks into modules such as <code>sales_report.py</code>.</p>

  <h2 id="sg-pr"><span class="num">12</span>Pull Requests and Releases</h2>
  <p>Right now anyone with access can push straight to main, including a change that turns ₹230 into ₹23000 on the owner's phone, as section 10 showed. Teams prevent this with a review step. Nobody pushes directly to main; instead you push a branch and open a <strong>pull request</strong> (PR) on GitHub, a web page that says "please merge my branch into main". (GitLab calls the same thing a merge request.) The page lists the branch's commits and the combined diff, shows the results of automatic tests, and lets teammates comment on individual lines. Only after approval is the branch merged. It is like submitting an article through an editor instead of pasting it straight into the printed magazine: the editor reads it, marks corrections, you fix them, and only the approved version is printed.</p>
  <p>The automatic tests are called <strong>CI</strong>, continuous integration: every push to a PR triggers a service (such as GitHub Actions) that installs the project and runs its tests, and the PR shows a green tick or a red cross. Setting this up is covered in <a class="xref" data-note="mlops_cicd">CI/CD for ML</a>. <strong>Branch protection</strong> rules on GitHub, such as "main requires one approval and passing CI", make the PR flow mandatory rather than optional. For open-source projects, where you are not allowed to push to someone else's repository at all, you first make a <strong>fork</strong>, your own server-side copy of their repository, push your branch to the fork, and open the PR from there.</p>
  <p>Meera's next change logs <em>why</em> each row was rejected, with its line number, to the error stream (the WARN lines the <a class="xref" data-note="se_linux">Linux &amp; Terminal</a> note will search through). The PR page itself needs GitHub, but everything it displays comes from Git commands we can run: <code>git log main..BRANCH</code> lists the commits on the branch that main does not have (the "Commits" tab), and <code>git diff main...BRANCH</code> with three dots shows the changes made on the branch since it split from main (the "Files changed" tab):</p>
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
be9b175 Log why each row was rejected
$ git diff --stat main...feat/log-rejections
 sales_report.py | 4 +++-
 1 file changed, 3 insertions(+), 1 deletion(-)</div>
  <p>The script now prints three WARN lines naming lines 8, 9 and 10 of the sheet (Esha's "two", Farid's missing price, Gita's refund) before the usual summary. <code>git push -u origin feat/log-rejections</code> put the branch on the server, which is when you would click "Compare &amp; pull request" on GitHub (or run <code>gh pr create --fill</code> with GitHub's command-line tool). The two-dot log shows the one commit the PR contains, and the three-dot diff stat shows what the reviewer will read: 3 lines added, 1 removed. While the PR waits, main may move on; to bring your branch up to date you can run <code>git pull --rebase origin main</code> on your branch, after which you must push with <code>git push --force-with-lease</code>, because rebasing rewrote your branch's commits. That is acceptable only because the branch is yours; <code>--force-with-lease</code> is the safe form of force, which refuses if someone else pushed to the branch in the meantime.</p>
  <p>Once the PR is approved, GitHub offers three merge buttons: a normal merge commit, "Squash and merge", which combines all the branch's commits into one commit on main, and "Rebase and merge", which replays them onto main. Here is what squash-and-merge and "Delete branch" do, run by hand:</p>
  <div class="fx" data-lang="text">$ git switch main
Switched to branch 'main'
Your branch is up to date with 'origin/main'.
$ git merge --squash feat/log-rejections
Updating 40ce215..be9b175
Fast-forward
Squash commit -- not updating HEAD
 sales_report.py | 4 +++-
 1 file changed, 3 insertions(+), 1 deletion(-)
$ git commit -qm "Log why each row was rejected (#1)"
$ git push
To /home/meera/server/chai-report.git
   40ce215..df4e1c8  main -&gt; main
$ git branch -D feat/log-rejections
Deleted branch feat/log-rejections (was be9b175).
$ git push origin --delete feat/log-rejections
To /home/meera/server/chai-report.git
 - [deleted]         feat/log-rejections
$ git log --oneline -3
df4e1c8 Log why each row was rejected (#1)
40ce215 Stop tracking .env; add .gitignore
b1cdccd Add local settings</div>
  <p><code>git merge --squash</code> staged the branch's combined change without committing, and one commit, <code>df4e1c8</code>, with the PR number in its message, landed on main and was pushed. The branch was then deleted on the laptop (<code>-D</code> forces deletion, needed because a squash leaves the original commit unmerged) and on the server with <code>git push origin --delete</code>. Good PRs are small, because a 300-line change gets a real review while a 3,000-line change gets "LGTM" ("looks good to me") without being read. They also have a description saying what changed, why, and how it was tested (here: the total stays ₹230, WARN lines are added). A reviewer checks correctness, edge cases such as an empty sheet, tests, naming, and that no secrets or data files slipped in, and writes comments that are specific and kind.</p>
  <p>The script is ready to go onto the server. A month from now someone will ask "which version of the code produced last Tuesday's report?". A commit ID answers that precisely, but nobody remembers <code>df4e1c8</code>. A <strong>tag</strong> is a human-readable name permanently attached to one commit; unlike a branch, it never moves. Version numbers usually follow <strong>semantic versioning</strong>, MAJOR.MINOR.PATCH: increase MAJOR when you make a change that breaks things for users (such as changing the output format), MINOR for new features that do not break anything, and PATCH for bug fixes.</p>
  <div class="fx" data-lang="text">$ git tag -a v1.0.0 -m "First release: daily report with item breakdown"
$ git tag
v1.0.0
$ git cat-file -p v1.0.0
object df4e1c882366d6d18464ecdd35d1f882bdf2a4ff
type commit
tag v1.0.0
tagger Meera &lt;meera@example.com&gt; 1792412760 +0530

First release: daily report with item breakdown
$ git describe
v1.0.0
$ git commit -qam "Note the release in CHANGELOG"
$ git describe
v1.0.0-1-g2b70eb5
$ git push -q
$ git push origin v1.0.0
To /home/meera/server/chai-report.git
 * [new tag]         v1.0.0 -&gt; v1.0.0
$ git ls-remote --tags origin
02509be3a24f3b54a8855d397d7ff173dbe015dc	refs/tags/v1.0.0
df4e1c882366d6d18464ecdd35d1f882bdf2a4ff	refs/tags/v1.0.0^{}</div>
  <p><code>git tag -a</code> creates an <strong>annotated tag</strong>, which is a fourth kind of object: <code>git cat-file -p</code> shows it points to commit <code>df4e1c8…</code> and records the tagger, date and message. (A tag without <code>-a</code> is a "lightweight" tag, just a name with no message.) <code>git describe</code> names the current commit relative to the nearest tag: right after tagging it is exactly <code>v1.0.0</code>, and one commit later it becomes <code>v1.0.0-1-g2b70eb5</code>, "one commit after v1.0.0, at commit 2b70eb5", which is handy to print in logs. Tags are <strong>not</strong> sent by a plain <code>git push</code>, so we pushed it by name, and <code>git ls-remote</code> confirms the server now has the tag object and, on the <code>^{}</code> line, the commit it points to. On GitHub, a <strong>Release</strong> is a tag plus release notes and optional downloadable files. Never move or reuse a tag that others have fetched; if v1.0.0 has a bug, release v1.0.1. The <a class="xref" data-note="se_linux">Linux &amp; Terminal</a> note picks up from here by cloning exactly this tag onto a server.</p>

  <h2 id="sg-traps"><span class="num">13</span>Common Mistakes</h2>
  <p>The most damaging mistake is force-pushing a shared branch. A rejected push is Git protecting someone else's work, and <code>git push --force</code> overrides that protection. In this experiment, on copies of the server and both laptops, Meera pushes a commit, and then Ravi, who has not fetched it, commits on his own and tries to push:</p>
  <div class="fx" data-lang="text">$ cd ~
$ git clone -q --bare server/chai-report.git lab-server.git
$ git clone -q lab-server.git lab-meera
$ git clone -q lab-server.git lab-ravi
$ (cd lab-meera &amp;&amp; echo "- weekly totals" &gt;&gt; CHANGELOG.md &amp;&amp; git commit -qam "Plan weekly totals" &amp;&amp; git push -q)
$ cd lab-ravi
$ echo "- monthly totals" &gt;&gt; CHANGELOG.md
$ git commit -qam "Plan monthly totals"
$ git push --force-with-lease
To /home/meera/lab-server.git
 ! [rejected]        main -&gt; main (stale info)
error: failed to push some refs to '/home/meera/lab-server.git'
$ git push --force
To /home/meera/lab-server.git
 + ecdefc0...e51093e main -&gt; main (forced update)
$ git log --oneline -2 origin/main
e51093e Plan monthly totals
2b70eb5 Note the release in CHANGELOG</div>
  <p><code>--force-with-lease</code> refused with "stale info": Ravi's laptop had not seen the server's latest commit, so the lease check stopped him. Plain <code>--force</code> did not check anything: the server's main jumped from Meera's commit <code>ecdefc0</code> to Ravi's <code>e51093e</code> ("forced update"), and the log of the server's main now goes straight from Ravi's commit to the release commit. Meera's "Plan weekly totals" is no longer on the server. The fix is to pull (or pull with rebase), resolve, test and push normally; on shared branches use <code>revert</code> rather than rewriting history, and keep force, always in its <code>--force-with-lease</code> form, for your own branches.</p>
  <p>The second classic is committing a file that still contains conflict markers. Git does not check the file's contents when you <code>git add</code> it, so a half-resolved conflict commits happily and breaks the program for everyone:</p>
  <div class="fx" data-lang="text">$ cd ~/chai-report
$ printf '&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD\\nprint("Total sales")\\n=======\\nprint("total")\\n&gt;&gt;&gt;&gt;&gt;&gt;&gt; fix/wording\\n' &gt;&gt; sales_report.py
$ python3 sales_report.py sample_orders.csv
  File "/home/meera/chai-report/sales_report.py", line 35
    &lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD
    ^^
SyntaxError: invalid syntax</div>
  <p>Python sees <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code> as invalid syntax and the nightly report would fail. Search for markers (<code>grep -n '&lt;&lt;&lt;&lt;&lt;&lt;&lt;'</code>) and run the code before committing a merge.</p>
  <p>Several other mistakes are habits rather than single commands. Committing secrets or data happens when <code>.gitignore</code> is written too late; write it on the first day, and if a key is pushed, rotate it before anything else. Rebasing commits that others already have creates duplicate commits for everyone; rebase only your own unshared work. Using <code>git add .</code> followed by <code>git commit -m "updates"</code> mixes unrelated changes and stray files into one commit that nobody can review or revert cleanly; look at <code>git status</code> and <code>git diff --staged</code> first, and write a message that says why. Committing directly on main makes the next pull messy and tempts you to push untested code; create a branch first. Running <code>git reset --hard</code> with uncommitted work destroys it for good, since the reflog only remembers commits. And trusting "your branch is up to date" without fetching compares you with a stale picture of the server; run <code>git fetch</code> before comparing.</p>

  <h2 id="sg-rev"><span class="num">R</span>Revision Sheet</h2>
  <h3>Core definitions</h3>
  <ul>
    <li><b>Version control</b>: records changes to files over time so you can recall versions, see who changed what and why, and merge work. Git is <b>distributed</b>: every copy has the full history.</li>
    <li><b>Git vs GitHub</b>: Git is the tool on your machine; GitHub is a website hosting a shared copy, plus PRs, review, issues and CI.</li>
    <li><b>Repository</b>: project folder + <code>.git</code> history. <b>Commit</b>: snapshot of tracked files + author, time, message, parent(s).</li>
    <li><b>Blob</b> = file content; <b>tree</b> = folder listing (name → blob/tree); <b>commit</b> = tree + parent(s) + metadata; <b>annotated tag</b> = name + message → commit. All named by the hash of their content; same content ⇒ stored once.</li>
    <li><b>Working tree</b> → <code>add</code> → <b>index / staging area</b> → <code>commit</code> → <b>repository</b>.</li>
    <li><b>Branch</b>: file in <code>.git/refs/heads/</code> holding one commit hash. <b>HEAD</b>: the current branch (<code>ref: refs/heads/main</code>), or a raw hash when <b>detached</b>.</li>
    <li><b>Merge base</b>: latest common commit of two branches. <b>Merge commit</b>: a commit with two parents.</li>
    <li><b>Remote</b>: another copy (<b>origin</b> = where you cloned from). <b>Remote-tracking branch</b> (<code>origin/main</code>): your last-fetched view of it. <b>Upstream</b>: the remote branch your branch pushes to and pulls from.</li>
    <li><b>Reflog</b>: local log of where HEAD has been; recovers commits, not uncommitted edits.</li>
  </ul>
  <h3>Comparisons</h3>
  <table class="tbl">
    <tr><th>Pair</th><th>Difference</th></tr>
    <tr><td><code>git diff</code> / <code>git diff --staged</code></td><td>working tree vs index / index vs last commit</td></tr>
    <tr><td>Fast-forward / three-way merge</td><td>target did not move → label slides, no new commit / both moved → merge commit with 2 parents</td></tr>
    <tr><td>Merge / rebase</td><td>true branchy history, IDs kept / straight line, replayed commits get new IDs; never rebase shared commits</td></tr>
    <tr><td><code>fetch</code> / <code>pull</code></td><td>download only, moves <code>origin/main</code> / fetch + merge (or rebase) into your branch</td></tr>
    <tr><td><code>revert</code> / <code>reset</code></td><td>new opposite commit, safe after push / move the branch back, rewrites history, local only</td></tr>
    <tr><td><code>reset --soft</code> / <code>--mixed</code> / <code>--hard</code></td><td>changes kept staged / kept unstaged (default) / wiped from files</td></tr>
    <tr><td>Branch / tag</td><td>moves with each commit / fixed for ever</td></tr>
    <tr><td><code>a..b</code> / <code>a...b</code> (in log / diff)</td><td>commits in b not in a / changes on b since it left a</td></tr>
  </table>
  <h3>Syntax</h3>
  <div class="fx" data-lang="text">git config --global user.name "Meera"     # once per machine
git init repo  |  git clone URL
git status  |  git status --short          # left col = staged, right = unstaged
git add file  |  git add -p                # stage all / pick pieces
git commit -m "Count rejected rows"        # -a: also stage tracked changes
git log --oneline --graph --all --decorate
git show HASH  |  git diff A B  |  git blame file
git switch -c feature/x  |  git switch main  |  git branch -d feature/x
git stash  |  git stash pop
git merge feature/x  |  git merge --abort
git rebase main                            # own branch only
git remote add origin URL  |  git push -u origin main
git fetch  |  git pull  |  git pull --rebase
git restore file  |  git restore --staged file
git commit --amend                         # last unpushed commit
git revert HASH                            # undo a pushed commit
git reset --soft|--mixed|--hard HASH       # local commits only
git reflog  |  git reset --hard HEAD@{1}
git rm --cached .env                       # stop tracking, keep file
git tag -a v1.0.0 -m "msg"  |  git push origin v1.0.0  |  git describe</div>
  <h3>Gotchas</h3>
  <ul>
    <li><code>git add</code> copies content at that moment; later edits need another add.</li>
    <li><code>.gitignore</code> ignores only untracked files → <code>git rm --cached</code>; old commits still hold the file.</li>
    <li>A pushed secret must be rotated first; deleting it in a new commit is not enough.</li>
    <li>Rebase and amend create new commit IDs; never on commits others have.</li>
    <li>Never <code>push --force</code> a shared branch; <code>--force-with-lease</code> on your own branch only.</li>
    <li>"Up to date" is only as fresh as your last <code>fetch</code>.</li>
    <li>A clean merge can still break the program; run the tests. Search for leftover conflict markers.</li>
    <li>Tags are not pushed by plain <code>git push</code>.</li>
    <li>Big files: set up LFS/DVC before the first commit; GitHub rejects files over 100 MB.</li>
  </ul>

  <h2 id="sg-qa"><span class="num">14</span>Interview Questions</h2>
  <div class="qa-head"><h3>Answer out loud before revealing</h3><button class="reveal-all" id="revealAll">Reveal all</button></div>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between Git and GitHub?</summary><div class="qa-body">Git is a version control program that runs on your machine and stores a project's history in the <code>.git</code> folder; it works fully offline. GitHub is a website that hosts Git repositories so a team can share them, and adds collaboration features Git does not have: pull requests, code review, issues, permissions and CI through GitHub Actions. GitLab and Bitbucket are alternatives to GitHub, not to Git.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What does "distributed" version control mean?</summary><div class="qa-body">Every clone contains the complete history, not just the latest files. You can commit, branch, view the log and diff without a network, and any copy can rebuild the server if it is lost. A central server like GitHub is a team convention, not a technical requirement, unlike older centralised systems such as SVN where history lived only on the server.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Does Git store diffs or snapshots?</summary><div class="qa-body">Snapshots. Each commit points to a tree describing the whole project. Unchanged files reuse the same blob, because objects are named by the hash of their content, so a snapshot costs only the objects that actually changed. Diffs are computed on demand; pack files use delta compression on disk, but that is a storage detail.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What are Git's object types?</summary><div class="qa-body">A blob holds a file's content. A tree is a folder listing that maps names to blobs and other trees. A commit holds a tree, its parent commit(s), author, committer and message. An annotated tag holds a name, tagger and message and points to a commit. Every object is named by the hash of its content.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the staging area and why does it exist?</summary><div class="qa-body">The staging area, or index, is a draft of the next commit. <code>git add</code> copies a file's current content into it and <code>git commit</code> saves exactly what it contains. It lets you commit only the finished part of your work, for example a feature without the debug print in the same file, so each commit is one clean logical change.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is a branch, physically, and why is branching cheap?</summary><div class="qa-body">A branch is a small file in <code>.git/refs/heads/</code> containing one commit hash. Creating it writes that file, and committing moves it to the new commit; no project files are copied. It is cheap because commits are immutable snapshots stored once, so a branch only has to remember which commit it is at.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is HEAD, and what is a detached HEAD?</summary><div class="qa-body">HEAD records where you are: normally it names a branch (<code>ref: refs/heads/main</code>), and that branch names a commit. Detached HEAD means HEAD holds a commit hash directly, for example after <code>git checkout HASH</code>. New commits made there belong to no branch and will eventually be cleaned up unless you create a branch for them with <code>git switch -c name</code>.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>When does Git do a fast-forward merge, and when a three-way merge?</summary><div class="qa-body">A fast-forward happens when the branch you are merging into has no commits the other branch lacks; Git just moves the label forward and creates no commit. When both branches have new commits, Git finds their merge base, compares base, ours and theirs file by file, and records a merge commit with two parents. <code>git merge --no-ff</code> forces a merge commit even when a fast-forward is possible.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What causes a merge conflict and how do you resolve one?</summary><div class="qa-body">A conflict happens when both branches changed the same lines differently relative to the merge base (or one deleted a file the other edited). Git marks the file <code>UU</code> and writes both versions between <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code>, <code>=======</code> and <code>&gt;&gt;&gt;&gt;&gt;&gt;&gt;</code>. You edit it to the final content, delete the markers, run the tests, <code>git add</code> the file and <code>git commit</code>. <code>git merge --abort</code> backs out entirely.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Merge vs rebase: what is the difference and when do you use each?</summary><div class="qa-body">Merge joins two lines of work with a merge commit and keeps the true, branchy history and existing commit IDs. Rebase replays your commits on top of another branch as new commits, giving a straight line. Use rebase to update or tidy your own unshared branch before a PR, and merge (or squash-merge) to bring finished work into a shared branch. Never rebase commits others already have.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Why does rebasing change commit hashes?</summary><div class="qa-body">A commit's hash is computed from its content, and that content includes the parent's hash. Rebase gives each replayed commit a new parent, so every replayed commit gets a new hash even if its file changes are identical. That is exactly why rebasing shared commits causes duplicates for everyone who has the old ones.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>git fetch</code> and <code>git pull</code>?</summary><div class="qa-body"><code>git fetch</code> downloads new commits from the remote and updates remote-tracking branches such as <code>origin/main</code>, without touching your branches or files. <code>git pull</code> is a fetch followed by a merge (or a rebase with <code>--rebase</code>) into your current branch. Fetching first lets you inspect incoming changes before combining them.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Your push is rejected with "the remote contains work that you do not have". What do you do?</summary><div class="qa-body">Someone pushed to that branch first. Run <code>git pull --rebase</code> (or a normal pull) to bring their commits in and replay yours on top, resolve any conflicts, run the tests, and push again. Do not force-push a shared branch, because that would delete their commits on the server.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What is the difference between <code>git reset</code> and <code>git revert</code>?</summary><div class="qa-body"><code>git revert</code> creates a new commit that applies the opposite of an earlier commit, so history only grows and it is safe on shared, pushed branches. <code>git reset</code> moves the current branch back to an earlier commit, removing later commits from the branch; it rewrites history and should only be used on commits that exist only locally. To undo a bad commit on main, revert it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>Explain <code>reset --soft</code>, <code>--mixed</code> and <code>--hard</code>.</summary><div class="qa-body">All three move the current branch to the given commit. <code>--soft</code> keeps the changes from the removed commits staged; <code>--mixed</code>, the default, keeps them in your files but unstaged; <code>--hard</code> also overwrites your files, discarding those changes and any uncommitted edits. Only <code>--hard</code> loses work, and the reflog can still recover the commits but not uncommitted edits.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You ran <code>git reset --hard</code> and lost three commits. How do you get them back?</summary><div class="qa-body">Run <code>git reflog</code> to see where HEAD was before the reset, for example <code>HEAD@{1}</code>, then <code>git reset --hard HEAD@{1}</code> or create a branch there with <code>git branch rescue HASH</code>. Unreferenced commits are kept for about 90 days by default. Uncommitted changes wiped by the reset cannot be recovered.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You added <code>.env</code> to <code>.gitignore</code> but Git still shows it as modified. Why?</summary><div class="qa-body">The file is already tracked, and ignore rules only apply to untracked files. Run <code>git rm --cached .env</code> to stop tracking it while keeping it on disk, and commit. Older commits still contain it, so any secret inside must be rotated.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>You pushed a commit containing an API key. What do you do?</summary><div class="qa-body">Revoke and replace the key immediately and treat it as compromised, because bots scan public repositories within minutes. Then remove it from history with <code>git filter-repo</code> or BFG and force-push in coordination with the team, add the file to <code>.gitignore</code>, and load secrets from environment variables or a secret manager in future. Deleting the key in a new commit alone does nothing, since history keeps it.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>How should a data science team version large datasets and models?</summary><div class="qa-body">Not directly in Git: every clone would download every version and GitHub rejects files over 100 MB. Use Git LFS or DVC, which store a small pointer file (hash and size) in Git and keep the actual data in separate storage such as S3 or GCS. Combined with the code commit, parameters and environment, the pointer makes a result reproducible.</div></details>
  <details class="qa"><summary><span class="qmark">Q</span>What makes a good pull request and a good code review?</summary><div class="qa-body">A good PR is small and focused on one idea, has a description of what changed, why and how it was tested, passes CI and includes tests for new behaviour, with no secrets or data files. A good review starts by understanding the goal, then checks correctness, edge cases, tests and readability, and gives specific, kind comments. Squash-merging keeps main's history to one commit per PR.</div></details>
</main>
`
});
