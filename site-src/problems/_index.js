// problems/_index.js — DSA Problem Tracker data. Each problems/<topic>.js pushes its ladder into PROBLEMS.
// Levels are judged by what a problem asks of a beginner who just read the note, not by LeetCode's label.
const PROBLEMS = [];
const PROBLEM_LEVELS = [
  { n: 1, name: 'Very Easy',     desc: 'Apply the pattern you just read, directly' },
  { n: 2, name: 'Easy',          desc: 'Same pattern with one small twist' },
  { n: 3, name: 'Moderate',      desc: 'Pattern plus one extra insight' },
  { n: 4, name: 'High-Moderate', desc: 'Two patterns combined, or tricky state' },
  { n: 5, name: 'Difficult',     desc: 'A non-obvious insight' },
  { n: 6, name: 'Very Difficult', desc: 'Rare insight or heavy implementation' }
];
// Topic order follows the DSA notes, so the path builds on what was just learned.
const PROBLEM_TOPICS = [
  { key: 'arrays',     label: 'Arrays, Strings & Two Pointers', note: 'dsa_arrays' },
  { key: 'hashing',    label: 'Hashing',                        note: 'dsa_hashing' },
  { key: 'sorting',    label: 'Sorting',                        note: 'dsa_sorting' },
  { key: 'binsearch',  label: 'Binary Search',                  note: 'dsa_binsearch' },
  { key: 'linkedlist', label: 'Linked Lists',                   note: 'dsa_linkedlist' },
  { key: 'stacks',     label: 'Stacks & Queues',                note: 'dsa_stacks' },
  { key: 'trees',      label: 'Trees',                          note: 'dsa_trees' },
  { key: 'heaps',      label: 'Heaps & Priority Queue',         note: 'dsa_heaps' },
  { key: 'tries',      label: 'Tries',                          note: 'dsa_tries' },
  { key: 'graphs',     label: 'Graphs',                         note: 'dsa_graphs' },
  { key: 'backtrack',  label: 'Recursion & Backtracking',       note: 'dsa_backtrack' },
  { key: 'greedy',     label: 'Intervals & Greedy',             note: 'dsa_greedy' },
  { key: 'dp',         label: 'Dynamic Programming',            note: 'dsa_dp' },
  { key: 'bits',       label: 'Bit Manipulation',               note: 'dsa_bits' },
  { key: 'math',       label: 'Math & Number Theory',           note: 'dsa_math' },
  { key: 'advanced',   label: 'Advanced Data Structures',       note: 'dsa_advanced' }
];
