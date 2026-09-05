import React, { useEffect, useMemo, useState } from "react";
import "./DSAPractice.css";

/*
 * DSA Practice
 * ------------------------------------------------------------
 * Frontend-first practice workspace.
 * Existing project/backend APIs are not changed here.
 * Progress is persisted locally per logged-in user.
 */

const TOPICS = [
    { id: "all", label: "All Topics", icon: "▦" },
    { id: "arrays", label: "Arrays", icon: "▤" },
    { id: "strings", label: "Strings", icon: "Aa" },
    { id: "linked-list", label: "Linked List", icon: "⛓" },
    { id: "stack", label: "Stack", icon: "▥" },
    { id: "queue", label: "Queue", icon: "⇥" },
    { id: "recursion", label: "Recursion", icon: "↻" },
    { id: "sorting", label: "Sorting", icon: "↕" },
    { id: "binary-search", label: "Binary Search", icon: "⌕" },
    { id: "trees", label: "Trees", icon: "⌁" },
    { id: "graphs", label: "Graphs", icon: "◎" },
    { id: "dynamic-programming", label: "Dynamic Programming", icon: "DP" }
];

const PROBLEMS = [
    {
        id: 1,
        title: "Two Sum",
        topic: "arrays",
        difficulty: "Easy",
        acceptance: "49.1%",
        tags: ["Array", "Hash Map"],
        description:
            "Given an array of integers and a target, return the indices of the two numbers whose sum equals the target.",
        examples: [
            ["Input", "nums = [2,7,11,15], target = 9"],
            ["Output", "[0,1]"],
            ["Explanation", "nums[0] + nums[1] = 9."]
        ],
        starter: `function twoSum(nums, target) {
    // Write your solution here
}`,
        hint: "Think about storing numbers you have already seen and checking the required complement.",
        explanation:
            "A hash map can store each value and its index. For every number x, look for target - x before storing x."
    },
    {
        id: 2,
        title: "Best Time to Buy and Sell Stock",
        topic: "arrays",
        difficulty: "Easy",
        acceptance: "45.7%",
        tags: ["Array", "Greedy"],
        description:
            "Find the maximum profit from one buy and one later sell.",
        examples: [
            ["Input", "prices = [7,1,5,3,6,4]"],
            ["Output", "5"],
            ["Explanation", "Buy at 1 and sell at 6."]
        ],
        starter: `function maxProfit(prices) {
    // Write your solution here
}`,
        hint: "Maintain the cheapest price seen so far and the best profit.",
        explanation:
            "Scan once. Track the minimum price and update the maximum difference for every later price."
    },
    {
        id: 3,
        title: "Valid Anagram",
        topic: "strings",
        difficulty: "Easy",
        acceptance: "65.4%",
        tags: ["String", "Hash Map"],
        description:
            "Determine whether two strings contain the same characters with the same frequencies.",
        examples: [
            ["Input", 's = "anagram", t = "nagaram"'],
            ["Output", "true"],
            ["Explanation", "Both strings have identical character frequencies."]
        ],
        starter: `function isAnagram(s, t) {
    // Write your solution here
}`,
        hint: "Compare character frequencies.",
        explanation:
            "Count each character in one string and decrement those counts while scanning the second string."
    },
    {
        id: 4,
        title: "Valid Parentheses",
        topic: "stack",
        difficulty: "Easy",
        acceptance: "41.8%",
        tags: ["Stack", "String"],
        description:
            "Check whether every opening bracket is closed by the correct bracket in the correct order.",
        examples: [
            ["Input", 's = "()[]{}"'],
            ["Output", "true"],
            ["Explanation", "Every opening bracket is correctly matched."]
        ],
        starter: `function isValid(s) {
    // Write your solution here
}`,
        hint: "The most recent opening bracket must be closed first.",
        explanation:
            "Use a stack. Push opening brackets and verify each closing bracket against the stack top."
    },
    {
        id: 5,
        title: "Binary Search",
        topic: "binary-search",
        difficulty: "Easy",
        acceptance: "58.3%",
        tags: ["Array", "Binary Search"],
        description:
            "Find a target value in a sorted array and return its index, or -1 if it is absent.",
        examples: [
            ["Input", "nums = [-1,0,3,5,9,12], target = 9"],
            ["Output", "4"],
            ["Explanation", "The target 9 is at index 4."]
        ],
        starter: `function search(nums, target) {
    // Write your solution here
}`,
        hint: "Discard half of the search space after every comparison.",
        explanation:
            "Maintain left and right boundaries and compare the target with the middle element."
    },
    {
        id: 6,
        title: "Reverse Linked List",
        topic: "linked-list",
        difficulty: "Easy",
        acceptance: "76.2%",
        tags: ["Linked List", "Pointers"],
        description:
            "Reverse a singly linked list and return its new head.",
        examples: [
            ["Input", "1 → 2 → 3 → null"],
            ["Output", "3 → 2 → 1 → null"],
            ["Explanation", "Reverse every next pointer."]
        ],
        starter: `function reverseList(head) {
    // Write your solution here
}`,
        hint: "You need a previous pointer while walking through the list.",
        explanation:
            "Keep prev and current pointers. Save current.next, reverse the link, then advance both pointers."
    },
    {
        id: 7,
        title: "Maximum Depth of Binary Tree",
        topic: "trees",
        difficulty: "Easy",
        acceptance: "74.9%",
        tags: ["Tree", "DFS", "Recursion"],
        description:
            "Return the maximum depth of a binary tree.",
        examples: [
            ["Input", "root = [3,9,20,null,null,15,7]"],
            ["Output", "3"],
            ["Explanation", "The longest root-to-leaf path contains 3 nodes."]
        ],
        starter: `function maxDepth(root) {
    // Write your solution here
}`,
        hint: "The depth of a node depends on the deeper child.",
        explanation:
            "Recursively compute left and right depths and return 1 + max(left, right)."
    },
    {
        id: 8,
        title: "Climbing Stairs",
        topic: "dynamic-programming",
        difficulty: "Easy",
        acceptance: "52.8%",
        tags: ["DP", "Math"],
        description:
            "You can climb one or two steps at a time. Find the number of distinct ways to reach step n.",
        examples: [
            ["Input", "n = 5"],
            ["Output", "8"],
            ["Explanation", "The answer follows the Fibonacci recurrence."]
        ],
        starter: `function climbStairs(n) {
    // Write your solution here
}`,
        hint: "The ways to reach step n depend on the ways to reach n-1 and n-2.",
        explanation:
            "Use two variables for the previous two states, giving O(n) time and O(1) extra space."
    },
    {
        id: 9,
        title: "Merge Sort",
        topic: "sorting",
        difficulty: "Medium",
        acceptance: "61.2%",
        tags: ["Sorting", "Divide & Conquer"],
        description:
            "Sort an array using the merge-sort divide-and-conquer strategy.",
        examples: [
            ["Input", "[5,2,3,1]"],
            ["Output", "[1,2,3,5]"],
            ["Explanation", "Split, recursively sort, then merge."]
        ],
        starter: `function mergeSort(arr) {
    // Write your solution here
}`,
        hint: "Split the array until subarrays contain one element.",
        explanation:
            "Merge sort recursively divides the input and merges sorted halves. Average and worst-case time are O(n log n)."
    },
    {
        id: 10,
        title: "Number of Islands",
        topic: "graphs",
        difficulty: "Medium",
        acceptance: "59.7%",
        tags: ["Graph", "DFS", "BFS"],
        description:
            "Count connected groups of land cells in a binary grid.",
        examples: [
            ["Input", 'grid = [["1","1","0"],["0","1","0"],["0","0","1"]]'],
            ["Output", "2"],
            ["Explanation", "There are two connected components of land."]
        ],
        starter: `function numIslands(grid) {
    // Write your solution here
}`,
        hint: "Whenever you find unvisited land, traverse its entire connected component.",
        explanation:
            "Run DFS or BFS from each unvisited land cell and mark the component as visited."
    },
    {
        id: 11,
        title: "Queue Using Two Stacks",
        topic: "queue",
        difficulty: "Medium",
        acceptance: "68.4%",
        tags: ["Queue", "Stack", "Design"],
        description:
            "Implement FIFO queue operations using two stacks.",
        examples: [
            ["Operation", "push(1), push(2), pop()"],
            ["Output", "1"],
            ["Explanation", "The oldest element is removed first."]
        ],
        starter: `class MyQueue {
    // Implement queue operations
}`,
        hint: "One stack can receive new items and another can expose the oldest item.",
        explanation:
            "Transfer items to the output stack only when it is empty, giving amortized O(1) queue operations."
    },
    {
        id: 12,
        title: "Fibonacci with Memoization",
        topic: "recursion",
        difficulty: "Medium",
        acceptance: "70.2%",
        tags: ["Recursion", "Memoization", "DP"],
        description:
            "Compute the nth Fibonacci number efficiently by avoiding repeated recursive work.",
        examples: [
            ["Input", "n = 6"],
            ["Output", "8"],
            ["Explanation", "Memoization stores previously computed values."]
        ],
        starter: `function fib(n, memo = {}) {
    // Write your solution here
}`,
        hint: "Cache the result for every n that you calculate.",
        explanation:
            "Memoization reduces the repeated work of naive recursion and gives O(n) time."
    }
];

const STORAGE_PREFIX = "ai-mentor-dsa-practice";

function getStorageKey() {
    const studentId =
        localStorage.getItem("studentId") ||
        localStorage.getItem("userId") ||
        localStorage.getItem("id") ||
        "guest";
    return `${STORAGE_PREFIX}-${studentId}`;
}

function loadProgress() {
    try {
        const raw = localStorage.getItem(getStorageKey());
        return raw ? JSON.parse(raw) : {
            solved: [],
            bookmarks: [],
            submissions: {},
            streak: 0,
            lastPracticeDate: null
        };
    } catch {
        return {
            solved: [],
            bookmarks: [],
            submissions: {},
            streak: 0,
            lastPracticeDate: null
        };
    }
}

function saveProgress(progress) {
    localStorage.setItem(getStorageKey(), JSON.stringify(progress));
}


/* =========================================================
   DSA PRACTICE — ROBUST FRONTEND STATE HELPERS
   =========================================================
   The helpers below intentionally keep this page frontend-only.
   They do not require a backend endpoint and therefore do not
   interfere with the existing authentication, dashboard, or
   roadmap APIs.

   Goals:
   1. Keep progress isolated per student.
   2. Preserve code drafts for every problem.
   3. Make old localStorage data safe to read.
   4. Provide small reusable UI helpers.
   5. Keep the page usable even if browser storage is unavailable.
   ========================================================= */

const DEFAULT_DSA_PROGRESS = {
    solved: [],
    bookmarks: [],
    submissions: {},
    streak: 0,
    lastPracticeDate: null,
    drafts: {},
    lastOpenedProblem: 1,
    lastLanguage: "JavaScript",
    lastTopic: "all",
    lastDifficulty: "All"
};

function createEmptyProgress() {
    return {
        ...DEFAULT_DSA_PROGRESS,
        solved: [],
        bookmarks: [],
        submissions: {},
        drafts: {}
    };
}

function normaliseProgress(value) {
    const source =
        value && typeof value === "object"
            ? value
            : createEmptyProgress();

    return {
        ...DEFAULT_DSA_PROGRESS,
        ...source,
        solved: Array.isArray(source.solved)
            ? [...new Set(source.solved)]
            : [],
        bookmarks: Array.isArray(source.bookmarks)
            ? [...new Set(source.bookmarks)]
            : [],
        submissions:
            source.submissions &&
            typeof source.submissions === "object"
                ? source.submissions
                : {},
        drafts:
            source.drafts &&
            typeof source.drafts === "object"
                ? source.drafts
                : {},
        streak:
            Number.isFinite(Number(source.streak))
                ? Number(source.streak)
                : 0
    };
}

function safeLoadProgress() {
    try {
        const raw = localStorage.getItem(getStorageKey());

        if (!raw) {
            return createEmptyProgress();
        }

        return normaliseProgress(JSON.parse(raw));
    } catch {
        return createEmptyProgress();
    }
}

function safeSaveProgress(progress) {
    try {
        localStorage.setItem(
            getStorageKey(),
            JSON.stringify(normaliseProgress(progress))
        );
        return true;
    } catch {
        return false;
    }
}

function getTodayKey() {
    return new Date().toISOString().slice(0, 10);
}

function getDateDifference(firstDate, secondDate) {
    if (!firstDate || !secondDate) {
        return null;
    }

    const first = new Date(`${firstDate}T00:00:00`);
    const second = new Date(`${secondDate}T00:00:00`);

    if (
        Number.isNaN(first.getTime()) ||
        Number.isNaN(second.getTime())
    ) {
        return null;
    }

    return Math.round(
        (second - first) / (1000 * 60 * 60 * 24)
    );
}

function getTopicLabel(topicId) {
    const item = TOPICS.find((topic) => topic.id === topicId);

    return item ? item.label : "All Topics";
}

function getDifficultyClass(difficulty) {
    return String(difficulty || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-");
}

function getDifficultyCount(difficulty) {
    return PROBLEMS.filter(
        (problem) => problem.difficulty === difficulty
    ).length;
}

function getSolvedDifficultyCount(progress, difficulty) {
    return PROBLEMS.filter(
        (problem) =>
            problem.difficulty === difficulty &&
            progress.solved.includes(problem.id)
    ).length;
}

function getTopicProblemCount(topicId) {
    if (topicId === "all") {
        return PROBLEMS.length;
    }

    return PROBLEMS.filter(
        (problem) => problem.topic === topicId
    ).length;
}

function getTopicSolvedCount(progress, topicId) {
    if (topicId === "all") {
        return progress.solved.length;
    }

    return PROBLEMS.filter(
        (problem) =>
            problem.topic === topicId &&
            progress.solved.includes(problem.id)
    ).length;
}

function getCompletionMessage(percent) {
    if (percent >= 100) {
        return "Excellent — your current DSA library is complete.";
    }

    if (percent >= 75) {
        return "Great progress — keep the momentum going.";
    }

    if (percent >= 50) {
        return "You're halfway there. Keep solving consistently.";
    }

    if (percent >= 25) {
        return "Good start. A little daily practice adds up quickly.";
    }

    return "Start with one problem today and build the habit.";
}

function getNextUnsolvedProblem(progress) {
    return (
        PROBLEMS.find(
            (problem) =>
                !progress.solved.includes(problem.id)
        ) || PROBLEMS[0]
    );
}

function getPreviousProblem(problemId) {
    const index = PROBLEMS.findIndex(
        (problem) => problem.id === problemId
    );

    if (index <= 0) {
        return PROBLEMS[PROBLEMS.length - 1];
    }

    return PROBLEMS[index - 1];
}

function getNextProblem(problemId) {
    const index = PROBLEMS.findIndex(
        (problem) => problem.id === problemId
    );

    if (index < 0 || index >= PROBLEMS.length - 1) {
        return PROBLEMS[0];
    }

    return PROBLEMS[index + 1];
}

function copyTextToClipboard(value) {
    const text = String(value ?? "");

    if (!text) {
        return Promise.resolve(false);
    }

    if (
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === "function"
    ) {
        return navigator.clipboard
            .writeText(text)
            .then(() => true)
            .catch(() => false);
    }

    try {
        const textarea = document.createElement("textarea");

        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();

        const copied = document.execCommand("copy");

        document.body.removeChild(textarea);

        return Promise.resolve(copied);
    } catch {
        return Promise.resolve(false);
    }
}

function getDraftForProblem(progress, problem) {
    if (!problem) {
        return "";
    }

    const storedDraft =
        progress.drafts &&
        progress.drafts[problem.id];

    if (typeof storedDraft === "string") {
        return storedDraft;
    }

    return problem.starter;
}

function buildSubmissionRecord(previous, status) {
    return {
        ...(previous || {}),
        status,
        lastSubmittedAt: new Date().toISOString()
    };
}

/* =========================================================
   SMALL PRESENTATIONAL COMPONENTS
   ========================================================= */

function DSAStatCard({
    icon,
    label,
    value,
    helper,
    iconClass = ""
}) {
    return (
        <div className="dsa-overview-card">
            <span
                className={`overview-icon ${iconClass}`.trim()}
                aria-hidden="true"
            >
                {icon}
            </span>

            <div>
                <small>{label}</small>

                <strong>{value}</strong>

                {helper && (
                    <span
                        style={{
                            display: "block",
                            marginTop: "2px",
                            color: "#8a94a8",
                            fontSize: "10px"
                        }}
                    >
                        {helper}
                    </span>
                )}
            </div>
        </div>
    );
}

function DSAJourneyMessage({ progressPercent }) {
    return (
        <div
            style={{
                marginBottom: "18px",
                padding: "14px 16px",
                borderRadius: "14px",
                border: "1px solid #e5e9f1",
                background:
                    "linear-gradient(135deg, rgba(79,70,229,.07), rgba(255,255,255,.94))",
                color: "#5f6b80",
                fontSize: "12px",
                lineHeight: 1.6
            }}
        >
            <strong
                style={{
                    display: "block",
                    color: "#263248",
                    marginBottom: "3px"
                }}
            >
                {getCompletionMessage(progressPercent)}
            </strong>

            <span>
                {progressPercent}% of your current practice library is
                complete.
            </span>
        </div>
    );
}

function DSAKeyboardGuide() {
    return (
        <div
            style={{
                marginTop: "12px",
                padding: "10px 12px",
                borderRadius: "10px",
                background: "#f8f9fc",
                border: "1px solid #e8ebf2",
                color: "#7b8497",
                fontSize: "10px",
                lineHeight: 1.65
            }}
        >
            <strong
                style={{
                    color: "#4f5a70",
                    marginRight: "5px"
                }}
            >
                Keyboard:
            </strong>

            <span>
                ← previous · → next · Ctrl/Cmd + Enter submit · Esc close
                mobile topics
            </span>
        </div>
    );
}

function DSAEmptyProblemState({ onReset }) {
    return (
        <div className="dsa-empty">
            <div>⌕</div>

            <h3>No problems found</h3>

            <p>
                Try another topic, difficulty, search term, or bookmark
                filter.
            </p>

            <button
                type="button"
                className="next-button"
                onClick={onReset}
                style={{
                    marginTop: "8px"
                }}
            >
                Reset filters
            </button>
        </div>
    );
}

/* =========================================================
   END OF ROBUST FRONTEND HELPERS
   ========================================================= */

function DSAPractice() {
    const [progress, setProgress] = useState(safeLoadProgress);
    const [topic, setTopic] = useState("all");
    const [difficulty, setDifficulty] = useState("All");
    const [search, setSearch] = useState("");
    const [activeProblemId, setActiveProblemId] = useState(1);
    const [code, setCode] = useState(PROBLEMS[0].starter);
    const [language, setLanguage] = useState("JavaScript");
    const [activeTab, setActiveTab] = useState("problem");
    const [showHint, setShowHint] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);
    const [testOutput, setTestOutput] = useState("");
    const [running, setRunning] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [bookmarkedOnly, setBookmarkedOnly] = useState(false);

    /*
     * UI state added without changing the existing DSA data model.
     * These values make the page easier to use on desktop and mobile.
     */
    const [copyState, setCopyState] = useState("Copy");
    const [progressNotice, setProgressNotice] = useState("");
    const [showProgressDetails, setShowProgressDetails] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [lastSavedAt, setLastSavedAt] = useState(null);

    const activeProblem =
        PROBLEMS.find((problem) => problem.id === activeProblemId) ||
        PROBLEMS[0];

    const filteredProblems = useMemo(() => {
        const query = search.trim().toLowerCase();

        return PROBLEMS.filter((problem) => {
            const matchesTopic =
                topic === "all" || problem.topic === topic;

            const matchesDifficulty =
                difficulty === "All" ||
                problem.difficulty === difficulty;

            const matchesSearch =
                !query ||
                problem.title.toLowerCase().includes(query) ||
                problem.tags.some((tag) =>
                    tag.toLowerCase().includes(query)
                );

            const matchesBookmark =
                !bookmarkedOnly ||
                progress.bookmarks.includes(problem.id);

            return (
                matchesTopic &&
                matchesDifficulty &&
                matchesSearch &&
                matchesBookmark
            );
        });
    }, [
        topic,
        difficulty,
        search,
        bookmarkedOnly,
        progress.bookmarks
    ]);

    const solvedCount = progress.solved.length;
    const totalCount = PROBLEMS.length;
    const progressPercent = Math.round(
        (solvedCount / totalCount) * 100
    );

    const easySolved = PROBLEMS.filter(
        (p) =>
            p.difficulty === "Easy" &&
            progress.solved.includes(p.id)
    ).length;

    const mediumSolved = PROBLEMS.filter(
        (p) =>
            p.difficulty === "Medium" &&
            progress.solved.includes(p.id)
    ).length;

    const hardSolved = PROBLEMS.filter(
        (p) =>
            p.difficulty === "Hard" &&
            progress.solved.includes(p.id)
    ).length;

    const activeProblemIndex =
        PROBLEMS.findIndex(
            (problem) => problem.id === activeProblem.id
        ) + 1;

    const activeProblemSolved =
        progress.solved.includes(activeProblem.id);

    const activeProblemBookmarked =
        progress.bookmarks.includes(activeProblem.id);

    const activeTopicSolved =
        getTopicSolvedCount(progress, activeProblem.topic);

    const activeTopicTotal =
        getTopicProblemCount(activeProblem.topic);

    const activeTopicPercent =
        activeTopicTotal > 0
            ? Math.round(
                  (activeTopicSolved / activeTopicTotal) * 100
              )
            : 0;

    const remainingCount =
        Math.max(totalCount - solvedCount, 0);

    const bookmarkCount =
        progress.bookmarks.length;

    const attemptedCount =
        Object.keys(progress.submissions || {}).length;

    /*
     * Restore the last selected problem after a refresh.
     * We deliberately run once on mount so the normal first problem
     * remains the fallback for new students.
     */
    useEffect(() => {
        const stored = safeLoadProgress();

        const storedProblem =
            PROBLEMS.find(
                (problem) =>
                    problem.id ===
                    Number(stored.lastOpenedProblem)
            ) || PROBLEMS[0];

        setActiveProblemId(storedProblem.id);
        setCode(
            getDraftForProblem(
                stored,
                storedProblem
            )
        );

        if (stored.lastLanguage) {
            setLanguage(stored.lastLanguage);
        }

        if (stored.lastTopic) {
            setTopic(stored.lastTopic);
        }

        if (stored.lastDifficulty) {
            setDifficulty(stored.lastDifficulty);
        }
    }, []);

    /*
     * Auto-save the current code draft for the active problem.
     * This prevents accidental loss when a learner changes problems.
     */
    useEffect(() => {
        const timer = window.setTimeout(() => {
            setProgress((current) => {
                const next = normaliseProgress({
                    ...current,
                    drafts: {
                        ...(current.drafts || {}),
                        [activeProblem.id]: code
                    },
                    lastOpenedProblem: activeProblem.id,
                    lastLanguage: language,
                    lastTopic: topic,
                    lastDifficulty: difficulty
                });

                safeSaveProgress(next);
                setLastSavedAt(new Date());

                return next;
            });
        }, 250);

        return () => {
            window.clearTimeout(timer);
        };
    }, [
        code,
        activeProblem.id,
        language,
        topic,
        difficulty
    ]);

    /*
     * Keyboard navigation:
     * - ArrowLeft  -> previous problem
     * - ArrowRight -> next problem
     * - Ctrl/Cmd+Enter -> submit
     * - Escape -> close mobile topic drawer
     *
     * Inputs and textareas are excluded from arrow-key navigation so
     * normal text editing remains natural.
     */
    useEffect(() => {
        const handleKeyDown = (event) => {
            const target = event.target;
            const tagName =
                target?.tagName?.toLowerCase();

            const isTyping =
                tagName === "input" ||
                tagName === "textarea" ||
                tagName === "select" ||
                target?.isContentEditable;

            if (event.key === "Escape") {
                setSidebarOpen(false);
                return;
            }

            if (isTyping) {
                if (
                    (event.ctrlKey || event.metaKey) &&
                    event.key === "Enter"
                ) {
                    event.preventDefault();
                    submitSolution();
                }

                return;
            }

            if (event.key === "ArrowLeft") {
                event.preventDefault();
                openPreviousProblem();
            }

            if (event.key === "ArrowRight") {
                event.preventDefault();
                openNextProblem();
            }

            if (
                (event.ctrlKey || event.metaKey) &&
                event.key === "Enter"
            ) {
                event.preventDefault();
                submitSolution();
            }
        };

        window.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, [
        activeProblem.id,
        code,
        running,
        progress,
        topic,
        difficulty,
        language
    ]);

    function updateProgress(nextProgress) {
        const normalised = normaliseProgress(nextProgress);

        setProgress(normalised);
        safeSaveProgress(normalised);
        setLastSavedAt(new Date());
    }

    function resetFilters() {
        setTopic("all");
        setDifficulty("All");
        setSearch("");
        setBookmarkedOnly(false);
        setProgressNotice("Filters reset.");
    }

    function resetAllProgress() {
        const empty = createEmptyProgress();

        updateProgress(empty);
        setActiveProblemId(1);
        setCode(PROBLEMS[0].starter);
        setLanguage("JavaScript");
        setActiveTab("problem");
        setShowHint(false);
        setShowExplanation(false);
        setTestOutput("");
        setProgressNotice(
            "All DSA progress was reset on this device."
        );
        setShowResetConfirm(false);
    }

    function continueNextUnsolved() {
        const nextUnsolved =
            getNextUnsolvedProblem(progress);

        openProblem(nextUnsolved);

        setProgressNotice(
            `Opened ${nextUnsolved.title}.`
        );
    }

    function openPreviousProblem() {
        const previous =
            getPreviousProblem(activeProblem.id);

        openProblem(previous);
    }

    function openNextProblem() {
        const next =
            getNextProblem(activeProblem.id);

        openProblem(next);
    }


    function openProblem(problem) {
        if (!problem) {
            return;
        }

        setActiveProblemId(problem.id);
        setCode(
            getDraftForProblem(
                progress,
                problem
            )
        );
        setActiveTab("problem");
        setShowHint(false);
        setShowExplanation(false);
        setTestOutput("");
        setCopyState("Copy");
        setSidebarOpen(false);

        /*
         * Remember the last opened problem so a refresh can return the
         * learner to the same place. The existing local progress object
         * remains the single source of truth.
         */
        updateProgress({
            ...progress,
            lastOpenedProblem: problem.id,
            lastTopic: topic,
            lastDifficulty: difficulty
        });
    }

    function toggleBookmark(problemId) {
        const exists = progress.bookmarks.includes(problemId);

        updateProgress({
            ...progress,
            bookmarks: exists
                ? progress.bookmarks.filter((id) => id !== problemId)
                : [...progress.bookmarks, problemId]
        });

        setProgressNotice(
            exists
                ? "Removed from bookmarks."
                : "Added to bookmarks."
        );
    }

    function markSolved(problemId) {
        if (progress.solved.includes(problemId)) {
            setTestOutput(
                "Already solved ✓  You can revisit this problem anytime."
            );
            return;
        }

        const today = new Date().toISOString().slice(0, 10);
        const previous = progress.lastPracticeDate;

        let streak = progress.streak || 0;

        if (!previous) {
            streak = 1;
        } else {
            const previousDate = new Date(`${previous}T00:00:00`);
            const currentDate = new Date(`${today}T00:00:00`);
            const difference =
                Math.round(
                    (currentDate - previousDate) /
                    (1000 * 60 * 60 * 24)
                );

            if (difference === 1) {
                streak += 1;
            } else if (difference > 1) {
                streak = 1;
            }
        }

        updateProgress({
            ...progress,
            solved: [...progress.solved, problemId],
            streak,
            lastPracticeDate: today,
            submissions: {
                ...progress.submissions,
                [problemId]: {
                    ...(progress.submissions[problemId] || {}),
                    status: "Solved",
                    lastSubmittedAt: new Date().toISOString()
                }
            }
        });

        setTestOutput(
            "Accepted ✓  Problem marked as solved."
        );
    }

    function submitSolution() {
        setRunning(true);
        setTestOutput("");

        window.setTimeout(() => {
            setRunning(false);

            if (!code.trim() || code.includes("Write your solution here")) {
                setTestOutput(
                    "Please write your solution before submitting."
                );
                return;
            }

            markSolved(activeProblem.id);
        }, 700);
    }

    function runCode() {
        setRunning(true);
        setTestOutput("");

        window.setTimeout(() => {
            setRunning(false);
            setTestOutput(
                "Test run completed. Review the sample cases and submit when you are ready."
            );
        }, 600);
    }

    function resetCode() {
        setCode(activeProblem.starter);
        setTestOutput("");
    }

    function goToNextProblem() {
        const index = PROBLEMS.findIndex(
            (p) => p.id === activeProblem.id
        );
        const next =
            PROBLEMS[index + 1] ||
            PROBLEMS[0];

        openProblem(next);
    }

    function copyStarter() {
        copyTextToClipboard(code).then((copied) => {
            if (copied) {
                setCopyState("Copied ✓");
                setProgressNotice(
                    "Current code copied to clipboard."
                );

                window.setTimeout(() => {
                    setCopyState("Copy");
                }, 1400);
            } else {
                setCopyState("Copy");
                setProgressNotice(
                    "Clipboard permission was unavailable."
                );
            }
        });
    }

    return (
        <div className="dsa-page">
            <div className="dsa-shell">

                <header className="dsa-topbar">
                    <div className="dsa-title-wrap">
                        <button
                            className="dsa-mobile-menu"
                            onClick={() =>
                                setSidebarOpen(!sidebarOpen)
                            }
                            aria-label="Open DSA topics"
                        >
                            ☰
                        </button>

                        <div className="dsa-brand-icon">
                            &lt;/&gt;
                        </div>

                        <div>
                            <div className="dsa-eyebrow">
                                PRACTICE ARENA
                            </div>
                            <h1>DSA Practice</h1>
                            <p>
                                Build problem-solving skills one problem at a time.
                            </p>
                        </div>
                    </div>

                    <div className="dsa-top-actions">
                        <div className="dsa-stat-pill">
                            <span>🔥</span>
                            <strong>{progress.streak}</strong>
                            <small>day streak</small>
                        </div>

                        <div className="dsa-stat-pill">
                            <span>✓</span>
                            <strong>{solvedCount}/{totalCount}</strong>
                            <small>solved</small>
                        </div>
                    </div>
                </header>

                <section className="dsa-progress-banner">
                    <div>
                        <span className="dsa-banner-label">
                            YOUR DSA JOURNEY
                        </span>
                        <strong>
                            {progressPercent}% complete
                        </strong>
                    </div>

                    <div className="dsa-progress-track">
                        <span
                            style={{
                                width: `${progressPercent}%`
                            }}
                        />
                    </div>

                    <div className="dsa-progress-caption">
                        {solvedCount} of {totalCount} practice problems solved
                    </div>
                </section>

                <div
                    className={`dsa-workspace ${
                        sidebarOpen ? "sidebar-visible" : ""
                    }`}
                >
                    <aside className="dsa-sidebar">

                        <div className="dsa-sidebar-heading">
                            <div>
                                <span>LEARNING PATH</span>
                                <h2>Topics</h2>
                            </div>

                            <button
                                className="dsa-close-sidebar"
                                onClick={() => setSidebarOpen(false)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="dsa-topic-list">
                            {TOPICS.map((item) => (
                                <button
                                    key={item.id}
                                    className={`dsa-topic ${
                                        topic === item.id
                                            ? "active"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        setTopic(item.id)
                                    }
                                >
                                    <span className="dsa-topic-icon">
                                        {item.icon}
                                    </span>
                                    <span>{item.label}</span>
                                    {item.id !== "all" && (
                                        <small>
                                            {
                                                PROBLEMS.filter(
                                                    (p) =>
                                                        p.topic ===
                                                        item.id
                                                ).length
                                            }
                                        </small>
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="dsa-sidebar-card">
                            <span className="dsa-card-kicker">
                                QUICK TARGET
                            </span>
                            <strong>
                                Solve 2 problems today
                            </strong>
                            <p>
                                Consistency matters more than speed.
                            </p>
                            <div className="dsa-mini-progress">
                                <span
                                    style={{
                                        width: `${Math.min(
                                            progressPercent,
                                            100
                                        )}%`
                                    }}
                                />
                            </div>

                            <button
                                type="button"
                                className="learning-actions"
                                style={{
                                    width: "100%",
                                    justifyContent: "flex-start",
                                    border: 0,
                                    padding: 0,
                                    background: "transparent",
                                    marginTop: "10px"
                                }}
                                onClick={continueNextUnsolved}
                            >
                                <span
                                    style={{
                                        border: "1px solid #e2e6ed",
                                        borderRadius: "8px",
                                        padding: "8px 10px",
                                        background: "#fff",
                                        color: "#59657b",
                                        fontSize: "10px",
                                        fontWeight: 700
                                    }}
                                >
                                    Continue next unsolved →
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowProgressDetails(
                                        !showProgressDetails
                                    )
                                }
                                style={{
                                    width: "100%",
                                    marginTop: "7px",
                                    border: "0",
                                    background: "transparent",
                                    color: "#7a8498",
                                    cursor: "pointer",
                                    fontSize: "10px",
                                    textAlign: "left"
                                }}
                            >
                                {showProgressDetails
                                    ? "Hide progress details"
                                    : "View progress details"}
                            </button>

                            {showProgressDetails && (
                                <div
                                    style={{
                                        marginTop: "9px",
                                        paddingTop: "9px",
                                        borderTop:
                                            "1px solid #edf0f5",
                                        color: "#7b8497",
                                        fontSize: "10px",
                                        lineHeight: 1.8
                                    }}
                                >
                                    <div>
                                        Current topic:{" "}
                                        <strong>
                                            {getTopicLabel(
                                                topic
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        Topic progress:{" "}
                                        <strong>
                                            {activeTopicSolved}/
                                            {activeTopicTotal}
                                        </strong>
                                    </div>

                                    <div>
                                        Bookmarks:{" "}
                                        <strong>
                                            {bookmarkCount}
                                        </strong>
                                    </div>

                                    <div>
                                        Attempted:{" "}
                                        <strong>
                                            {attemptedCount}
                                        </strong>
                                    </div>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() =>
                                    setShowResetConfirm(
                                        true
                                    )
                                }
                                style={{
                                    width: "100%",
                                    marginTop: "10px",
                                    border: "1px solid #f0d6d6",
                                    borderRadius: "8px",
                                    padding: "8px 10px",
                                    background: "#fff8f8",
                                    color: "#b24a4a",
                                    cursor: "pointer",
                                    fontSize: "10px",
                                    fontWeight: 700
                                }}
                            >
                                Reset DSA progress
                            </button>
                        </div>
                    </aside>

                    <main className="dsa-main">

                        <section className="dsa-overview-grid">
                            <DSAStatCard
                                icon="✓"
                                label="PROBLEMS SOLVED"
                                value={solvedCount}
                                helper={`${remainingCount} remaining`}
                            />

                            <DSAStatCard
                                icon="%"
                                label="PROGRESS"
                                value={`${progressPercent}%`}
                                helper={getCompletionMessage(
                                    progressPercent
                                )}
                                iconClass="purple"
                            />

                            <DSAStatCard
                                icon="E"
                                label="EASY"
                                value={`${easySolved}/${getDifficultyCount("Easy")}`}
                                helper={`${getSolvedDifficultyCount(
                                    progress,
                                    "Easy"
                                )} completed`}
                                iconClass="orange"
                            />

                            <DSAStatCard
                                icon="M"
                                label="MEDIUM"
                                value={`${mediumSolved}/${getDifficultyCount("Medium")}`}
                                helper={`${getSolvedDifficultyCount(
                                    progress,
                                    "Medium"
                                )} completed`}
                                iconClass="blue"
                            />
                        </section>

                        <DSAJourneyMessage
                            progressPercent={progressPercent}
                        />

                        {progressNotice && (
                            <div
                                role="status"
                                style={{
                                    marginBottom: "12px",
                                    padding: "9px 12px",
                                    borderRadius: "9px",
                                    background: "#f2f6ff",
                                    border: "1px solid #dfe7ff",
                                    color: "#58647b",
                                    fontSize: "10px",
                                    fontWeight: 700
                                }}
                            >
                                {progressNotice}
                            </div>
                        )}

                        <DSAKeyboardGuide />

                        <section className="dsa-problem-section">
                            <div className="dsa-section-header">
                                <div>
                                    <span className="dsa-section-kicker">
                                        PRACTICE LIBRARY
                                    </span>
                                    <h2>Problems</h2>
                                    <p>
                                        Choose a problem and practice your
                                        approach before checking the explanation.
                                    </p>
                                </div>

                                <button
                                    className={`dsa-bookmark-filter ${
                                        bookmarkedOnly
                                            ? "active"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        setBookmarkedOnly(
                                            !bookmarkedOnly
                                        )
                                    }
                                >
                                    ★ Bookmarked
                                </button>
                            </div>

                            <div className="dsa-filters">
                                <div className="dsa-search">
                                    <span>⌕</span>
                                    <input
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Search problems or tags..."
                                    />
                                </div>

                                <select
                                    value={difficulty}
                                    onChange={(event) =>
                                        setDifficulty(
                                            event.target.value
                                        )
                                    }
                                >
                                    <option>All</option>
                                    <option>Easy</option>
                                    <option>Medium</option>
                                    <option>Hard</option>
                                </select>
                            </div>

                            <div className="dsa-content-grid">

                                <div className="dsa-problem-list">
                                    {filteredProblems.length === 0 ? (
                                        <DSAEmptyProblemState
                                            onReset={resetFilters}
                                        />
                                    ) : (
                                        filteredProblems.map(
                                            (problem) => (
                                                <button
                                                    key={problem.id}
                                                    className={`dsa-problem-card ${
                                                        activeProblem.id ===
                                                        problem.id
                                                            ? "selected"
                                                            : ""
                                                    }`}
                                                    onClick={() =>
                                                        openProblem(
                                                            problem
                                                        )
                                                    }
                                                >
                                                    <div className="problem-card-main">
                                                        <div className="problem-number">
                                                            {String(
                                                                problem.id
                                                            ).padStart(
                                                                2,
                                                                "0"
                                                            )}
                                                        </div>

                                                        <div className="problem-info">
                                                            <div className="problem-title-row">
                                                                <h3>
                                                                    {
                                                                        problem.title
                                                                    }
                                                                </h3>

                                                                {progress.solved.includes(
                                                                    problem.id
                                                                ) && (
                                                                    <span className="solved-badge">
                                                                        ✓ Solved
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <div className="problem-tags">
                                                                {problem.tags.map(
                                                                    (
                                                                        tag
                                                                    ) => (
                                                                        <span
                                                                            key={
                                                                                tag
                                                                            }
                                                                        >
                                                                            {
                                                                                tag
                                                                            }
                                                                        </span>
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="problem-card-meta">
                                                        <span
                                                            className={`difficulty ${problem.difficulty.toLowerCase()}`}
                                                        >
                                                            {
                                                                problem.difficulty
                                                            }
                                                        </span>
                                                        <span>
                                                            {
                                                                problem.acceptance
                                                            }
                                                        </span>
                                                        <span
                                                            className={
                                                                progress.bookmarks.includes(
                                                                    problem.id
                                                                )
                                                                    ? "bookmark-on"
                                                                    : ""
                                                            }
                                                        >
                                                            ★
                                                        </span>
                                                    </div>
                                                </button>
                                            )
                                        )
                                    )}
                                </div>

                                <article className="dsa-editor-panel">

                                    <div className="editor-header">
                                        <div>
                                            <div className="editor-title-row">
                                                <h2>
                                                    {
                                                        activeProblem.title
                                                    }
                                                </h2>

                                                <span
                                                    className={`difficulty ${activeProblem.difficulty.toLowerCase()}`}
                                                >
                                                    {
                                                        activeProblem.difficulty
                                                    }
                                                </span>
                                            </div>

                                            <div
                                                style={{
                                                    marginBottom: "8px",
                                                    color: "#8a94a8",
                                                    fontSize: "10px",
                                                    fontWeight: 700
                                                }}
                                            >
                                                Problem{" "}
                                                {activeProblemIndex}{" "}
                                                of {totalCount}
                                                {" · "}
                                                {activeProblemSolved
                                                    ? "Solved"
                                                    : "Not solved"}
                                                {" · "}
                                                {activeProblemBookmarked
                                                    ? "Bookmarked"
                                                    : "Not bookmarked"}
                                            </div>

                                            <div className="problem-tags">
                                                {activeProblem.tags.map(
                                                    (tag) => (
                                                        <span
                                                            key={tag}
                                                        >
                                                            {tag}
                                                        </span>
                                                    )
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            className={`icon-button ${
                                                progress.bookmarks.includes(
                                                    activeProblem.id
                                                )
                                                    ? "active"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                toggleBookmark(
                                                    activeProblem.id
                                                )
                                            }
                                            title="Bookmark problem"
                                        >
                                            ★
                                        </button>
                                    </div>

                                    <div className="editor-tabs">
                                        <button
                                            className={
                                                activeTab ===
                                                "problem"
                                                    ? "active"
                                                    : ""
                                            }
                                            onClick={() =>
                                                setActiveTab(
                                                    "problem"
                                                )
                                            }
                                        >
                                            Problem
                                        </button>

                                        <button
                                            className={
                                                activeTab ===
                                                "solution"
                                                    ? "active"
                                                    : ""
                                            }
                                            onClick={() =>
                                                setActiveTab(
                                                    "solution"
                                                )
                                            }
                                        >
                                            Approach
                                        </button>
                                    </div>

                                    <div
                                        style={{
                                            padding: "9px 13px",
                                            borderBottom:
                                                "1px solid #edf0f4",
                                            background: "#fbfcfe",
                                            color: "#7d8799",
                                            fontSize: "10px"
                                        }}
                                    >
                                        <strong
                                            style={{
                                                color: "#566176"
                                            }}
                                        >
                                            {getTopicLabel(
                                                activeProblem.topic
                                            )}
                                        </strong>
                                        {" · "}
                                        {activeTopicSolved}/
                                        {activeTopicTotal} solved
                                        {" · "}
                                        {activeTopicPercent}% topic progress
                                    </div>

                                    <div className="editor-body">

                                        {activeTab === "problem" ? (
                                            <>
                                                <p className="problem-description">
                                                    {
                                                        activeProblem.description
                                                    }
                                                </p>

                                                <div className="example-list">
                                                    {activeProblem.examples.map(
                                                        (
                                                            example,
                                                            index
                                                        ) => (
                                                            <div
                                                                className="example"
                                                                key={
                                                                    index
                                                                }
                                                            >
                                                                <strong>
                                                                    {
                                                                        example[0]
                                                                    }
                                                                </strong>
                                                                <code>
                                                                    {
                                                                        example[1]
                                                                    }
                                                                </code>
                                                            </div>
                                                        )
                                                    )}
                                                </div>

                                                <div className="practice-tip">
                                                    <span>💡</span>
                                                    <div>
                                                        <strong>
                                                            Practice first
                                                        </strong>
                                                        <p>
                                                            Try to derive the
                                                            approach yourself
                                                            before opening the
                                                            hint.
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="editor-toolbar">
                                                    <select
                                                        value={
                                                            language
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            setLanguage(
                                                                event
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                    >
                                                        <option>
                                                            JavaScript
                                                        </option>
                                                        <option>
                                                            Java
                                                        </option>
                                                        <option>
                                                            Python
                                                        </option>
                                                        <option>
                                                            C++
                                                        </option>
                                                    </select>

                                                    <button
                                                        onClick={
                                                            resetCode
                                                        }
                                                    >
                                                        Reset
                                                    </button>

                                                    <button
                                                        onClick={
                                                            copyStarter
                                                        }
                                                    >
                                                        {copyState}
                                                    </button>
                                                </div>

                                                <div className="code-editor">
                                                    <div className="code-editor-top">
                                                        <span>
                                                            {language}
                                                        </span>
                                                        <div className="window-dots">
                                                            <i />
                                                            <i />
                                                            <i />
                                                        </div>
                                                    </div>

                                                    <textarea
                                                        value={code}
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            setCode(
                                                                event
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                        spellCheck="false"
                                                        aria-label="Code editor"
                                                    />
                                                </div>

                                                <div
                                                    className="editor-actions"
                                                    style={{
                                                        flexWrap: "wrap"
                                                    }}
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={
                                                            openPreviousProblem
                                                        }
                                                        style={{
                                                            border:
                                                                "1px solid #e2e6ed",
                                                            borderRadius:
                                                                "8px",
                                                            padding:
                                                                "8px 11px",
                                                            background:
                                                                "#fff",
                                                            color:
                                                                "#667187",
                                                            cursor:
                                                                "pointer",
                                                            fontSize:
                                                                "10px",
                                                            fontWeight:
                                                                700
                                                        }}
                                                        title="Previous problem"
                                                    >
                                                        ← Previous
                                                    </button>

                                                    <button
                                                        className="run-button"
                                                        onClick={
                                                            runCode
                                                        }
                                                        disabled={
                                                            running
                                                        }
                                                    >
                                                        {running
                                                            ? "Running..."
                                                            : "▶ Run Code"}
                                                    </button>

                                                    <button
                                                        className="submit-button"
                                                        onClick={
                                                            submitSolution
                                                        }
                                                        disabled={
                                                            running
                                                        }
                                                    >
                                                        {running
                                                            ? "Checking..."
                                                            : "✓ Submit"}
                                                    </button>

                                                    <button
                                                        className="next-button"
                                                        onClick={
                                                            goToNextProblem
                                                        }
                                                    >
                                                        Next →
                                                    </button>
                                                </div>

                                                {testOutput && (
                                                    <div
                                                        className={`test-output ${
                                                            testOutput.startsWith(
                                                                "Accepted"
                                                            )
                                                                ? "success"
                                                                : ""
                                                        }`}
                                                    >
                                                        {testOutput}
                                                    </div>
                                                )}

                                                <div className="learning-actions">
                                                    <button
                                                        onClick={() =>
                                                            setShowHint(
                                                                !showHint
                                                            )
                                                        }
                                                    >
                                                        💡{" "}
                                                        {showHint
                                                            ? "Hide Hint"
                                                            : "Show Hint"}
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            setShowExplanation(
                                                                !showExplanation
                                                            )
                                                        }
                                                    >
                                                        📖{" "}
                                                        {showExplanation
                                                            ? "Hide Explanation"
                                                            : "View Explanation"}
                                                    </button>
                                                </div>

                                                {showHint && (
                                                    <div className="resource-box hint">
                                                        <strong>
                                                            Hint
                                                        </strong>
                                                        <p>
                                                            {
                                                                activeProblem.hint
                                                            }
                                                        </p>
                                                    </div>
                                                )}

                                                {showExplanation && (
                                                    <div className="resource-box">
                                                        <strong>
                                                            Approach
                                                        </strong>
                                                        <p>
                                                            {
                                                                activeProblem.explanation
                                                            }
                                                        </p>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="approach-panel">
                                                <span className="dsa-section-kicker">
                                                    RECOMMENDED APPROACH
                                                </span>
                                                <h3>
                                                    Think before you code
                                                </h3>
                                                <p>
                                                    Start by identifying the
                                                    input constraints, the
                                                    expected output, and the
                                                    data structure that gives
                                                    you the required operations.
                                                </p>

                                                <div className="approach-steps">
                                                    <div>
                                                        <span>01</span>
                                                        <div>
                                                            <strong>
                                                                Understand
                                                            </strong>
                                                            <p>
                                                                Restate the
                                                                problem in your
                                                                own words.
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <span>02</span>
                                                        <div>
                                                            <strong>
                                                                Choose
                                                                a pattern
                                                            </strong>
                                                            <p>
                                                                Look for common
                                                                DSA patterns
                                                                before coding.
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <span>03</span>
                                                        <div>
                                                            <strong>
                                                                Analyze
                                                            </strong>
                                                            <p>
                                                                Check time and
                                                                space complexity.
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <span>04</span>
                                                        <div>
                                                            <strong>
                                                                Test
                                                            </strong>
                                                            <p>
                                                                Validate edge
                                                                cases before
                                                                submitting.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="resource-box">
                                                    <strong>
                                                        Problem-specific
                                                        explanation
                                                    </strong>
                                                    <p>
                                                        {
                                                            activeProblem.explanation
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </article>
                            </div>
                        </section>
                    </main>
                </div>

                {showResetConfirm && (
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-label="Reset DSA progress"
                        style={{
                            position: "fixed",
                            inset: 0,
                            zIndex: 9999,
                            display: "grid",
                            placeItems: "center",
                            padding: "20px",
                            background: "rgba(15,23,42,.35)"
                        }}
                    >
                        <div
                            style={{
                                width: "min(430px, 100%)",
                                padding: "22px",
                                borderRadius: "16px",
                                background: "#fff",
                                border: "1px solid #e4e8f0",
                                boxShadow:
                                    "0 25px 70px rgba(15,23,42,.18)"
                            }}
                        >
                            <span
                                style={{
                                    display: "block",
                                    color: "#8a94a8",
                                    fontSize: "9px",
                                    fontWeight: 800,
                                    letterSpacing: ".12em"
                                }}
                            >
                                DSA SETTINGS
                            </span>

                            <h3
                                style={{
                                    margin: "6px 0 7px",
                                    color: "#202b3e",
                                    fontSize: "18px"
                                }}
                            >
                                Reset your DSA progress?
                            </h3>

                            <p
                                style={{
                                    margin: 0,
                                    color: "#707b90",
                                    fontSize: "12px",
                                    lineHeight: 1.6
                                }}
                            >
                                This removes solved status, bookmarks,
                                submission history, streak data, and saved
                                code drafts from this browser for the current
                                student.
                            </p>

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    gap: "8px",
                                    marginTop: "16px",
                                    flexWrap: "wrap"
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowResetConfirm(
                                            false
                                        )
                                    }
                                    style={{
                                        border:
                                            "1px solid #e1e5ec",
                                        borderRadius: "8px",
                                        padding: "9px 12px",
                                        background: "#fff",
                                        color: "#69758b",
                                        cursor: "pointer",
                                        fontWeight: 700,
                                        fontSize: "10px"
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={
                                        resetAllProgress
                                    }
                                    style={{
                                        border:
                                            "1px solid #e6bcbc",
                                        borderRadius: "8px",
                                        padding: "9px 12px",
                                        background: "#fff5f5",
                                        color: "#b24a4a",
                                        cursor: "pointer",
                                        fontWeight: 800,
                                        fontSize: "10px"
                                    }}
                                >
                                    Yes, reset progress
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {sidebarOpen && (
                    <button
                        className="dsa-mobile-overlay"
                        onClick={() =>
                            setSidebarOpen(false)
                        }
                        aria-label="Close topics"
                    />
                )}

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "12px",
                        marginTop: "14px",
                        padding: "9px 2px",
                        color: "#8a94a8",
                        fontSize: "9px",
                        flexWrap: "wrap"
                    }}
                >
                    <span>
                        DSA Practice · {totalCount} problems ·
                        {" "}
                        {solvedCount} solved · {bookmarkCount} bookmarked
                    </span>

                    <span>
                        {lastSavedAt
                            ? `Saved ${lastSavedAt.toLocaleTimeString(
                                  [],
                                  {
                                      hour: "2-digit",
                                      minute: "2-digit"
                                  }
                              )}`
                            : "Autosave ready"}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default DSAPractice;


