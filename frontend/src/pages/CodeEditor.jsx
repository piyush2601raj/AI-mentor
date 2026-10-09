import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import "./CodeEditor.css";

/* =====================================================
   DEFAULT CODE
===================================================== */

const DEFAULT_CODE = {
    Java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, AI Mentor!");
    }
}`,

    Python: `def main():
    print("Hello, AI Mentor!")

if __name__ == "__main__":
    main()`,

    JavaScript: `function main() {
    console.log("Hello, AI Mentor!");
}

main();`,

    "C++": `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, AI Mentor!" << endl;
    return 0;
}`,

    C: `#include <stdio.h>

int main() {
    printf("Hello, AI Mentor!\\n");
    return 0;
}`,

    SQL: `SELECT
    id,
    name,
    email
FROM students
ORDER BY name;`
};

/* =====================================================
   STORAGE
===================================================== */

const STORAGE_KEY = "aiMentorCodeWorkspace";

const getSavedWorkspace = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return {};
        }

        return JSON.parse(saved);
    } catch (error) {
        console.warn("Unable to load saved code workspace", error);
        return {};
    }
};

/* =====================================================
   HELPERS
===================================================== */

const getLineNumbers = (code) => {
    const count = Math.max(1, String(code || "").split("\n").length);

    return Array.from(
        { length: count },
        (_, index) => index + 1
    );
};

const formatTime = (date) => {
    return new Intl.DateTimeFormat("en-IN", {
        hour: "2-digit",
        minute: "2-digit"
    }).format(date);
};

/* =====================================================
   LANGUAGE META
===================================================== */

const LANGUAGE_META = {
    Java: {
        icon: "bi-cup-hot-fill",
        extension: "java",
        colorClass: "java"
    },

    Python: {
        icon: "bi-filetype-py",
        extension: "py",
        colorClass: "python"
    },

    JavaScript: {
        icon: "bi-filetype-js",
        extension: "js",
        colorClass: "javascript"
    },

    "C++": {
        icon: "bi-filetype-cpp",
        extension: "cpp",
        colorClass: "cpp"
    },

    C: {
        icon: "bi-filetype-c",
        extension: "c",
        colorClass: "c"
    },

    SQL: {
        icon: "bi-database-fill",
        extension: "sql",
        colorClass: "sql"
    }
};

/* =====================================================
   COMPONENT
===================================================== */

export default function CodeEditor() {

    const savedWorkspace = useMemo(
        () => getSavedWorkspace(),
        []
    );

    const [language, setLanguage] = useState(
        savedWorkspace.language || "Java"
    );

    const [code, setCode] = useState(
        savedWorkspace.code ||
        DEFAULT_CODE[savedWorkspace.language || "Java"]
    );

    const [output, setOutput] = useState(
        savedWorkspace.output || ""
    );

    const [status, setStatus] = useState(
        savedWorkspace.status || "Ready"
    );

    const [isRunning, setIsRunning] = useState(false);

    const [isSaved, setIsSaved] = useState(
        Boolean(savedWorkspace.saved)
    );

    const [activePanel, setActivePanel] = useState("output");

    const [cursorPosition, setCursorPosition] = useState({
        line: 1,
        column: 1
    });

    const [recentCodes, setRecentCodes] = useState(
        Array.isArray(savedWorkspace.recentCodes)
            ? savedWorkspace.recentCodes
            : []
    );

    const meta =
        LANGUAGE_META[language] ||
        LANGUAGE_META.Java;

    /* =====================================================
       SAVE WORKSPACE AUTOMATICALLY
    ===================================================== */

    useEffect(() => {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    language,
                    code,
                    output,
                    status,
                    saved: isSaved,
                    recentCodes
                })
            );
        } catch (error) {
            console.warn(
                "Unable to save code workspace",
                error
            );
        }
    }, [
        language,
        code,
        output,
        status,
        isSaved,
        recentCodes
    ]);

    /* =====================================================
       LANGUAGE CHANGE
    ===================================================== */

    const handleLanguageChange = (event) => {

        const nextLanguage = event.target.value;

        setLanguage(nextLanguage);

        setCode(
            DEFAULT_CODE[nextLanguage] ||
            ""
        );

        setOutput("");

        setStatus("Ready");

        setIsSaved(false);

        setCursorPosition({
            line: 1,
            column: 1
        });
    };

    /* =====================================================
       CODE CHANGE
    ===================================================== */

    const handleCodeChange = (event) => {

        setCode(event.target.value);

        setIsSaved(false);

        setStatus("Unsaved changes");

        updateCursor(
            event.target.value,
            event.target.selectionStart
        );
    };

    /* =====================================================
       CURSOR
    ===================================================== */

    const updateCursor = (
        value,
        position
    ) => {

        const beforeCursor =
            String(value || "").slice(
                0,
                position
            );

        const lines =
            beforeCursor.split("\n");

        const line =
            lines.length;

        const column =
            lines[lines.length - 1].length + 1;

        setCursorPosition({
            line,
            column
        });
    };

    const handleCursorChange = (event) => {

        updateCursor(
            event.target.value,
            event.target.selectionStart
        );
    };

    /* =====================================================
       RUN CODE
    ===================================================== */

    const handleRunCode = async () => {
        if (!code.trim()) {
            setOutput("Please write some code before running the program.");
            setStatus("No code");
            setActivePanel("output");
            return;
        }

        if (language === "SQL") {
            setOutput(
                "SQL execution is not available in this code runner yet. " +
                "A separate, safely configured SQL execution service is required."
            );
            setStatus("Unsupported language");
            setActivePanel("output");
            return;
        }

        const languageIdMap = {
            Java: 62,
            Python: 71,
            JavaScript: 63,
            "C++": 54,
            C: 50
        };

        const languageId = languageIdMap[language];

        if (!languageId) {
            setOutput(`Execution is not configured for ${language}.`);
            setStatus("Unsupported language");
            setActivePanel("output");
            return;
        }

        setIsRunning(true);
        setStatus("Submitting...");
        setActivePanel("output");
        setOutput(`Submitting ${language} program to the execution service...`);

        try {
            const submissionResponse = await api.post("/api/code/execute", {
                source_code: code,
                language_id: languageId,
                stdin: ""
            });

            const token = submissionResponse.data?.token;

            if (!token) {
                throw new Error(
                    submissionResponse.data?.message ||
                    "The backend did not return a submission token. Verify the execution endpoint."
                );
            }

            let result = null;
            const maxAttempts = 25;

            for (let attempt = 0; attempt < maxAttempts; attempt++) {
                setStatus("Running...");
                setOutput(`Running ${language} program...`);

                await new Promise(resolve => setTimeout(resolve, 1200));

                const resultResponse = await api.get(
                    `/api/code/result/${encodeURIComponent(token)}`
                );

                result = resultResponse.data;

                const statusId = result?.status?.id;

                if (statusId !== 1 && statusId !== 2) {
                    break;
                }
            }

            if (
                !result ||
                result.status?.id === 1 ||
                result.status?.id === 2
            ) {
                setStatus("Still processing");
                setOutput(
                    "The program is still processing. Please run it again shortly to check the result."
                );
                return;
            }

            const sections = [];

            if (result.stdout?.trim()) {
                sections.push(result.stdout.trim());
            }

            if (result.compile_output?.trim()) {
                sections.push(`Compilation output:\n${result.compile_output.trim()}`);
            }

            if (result.stderr?.trim()) {
                sections.push(`Error output:\n${result.stderr.trim()}`);
            }

            if (result.message?.trim()) {
                sections.push(result.message.trim());
            }

            const description =
                result.status?.description || "Execution finished";

            setOutput(
                sections.join("\n\n") ||
                (description === "Accepted"
                    ? "Program executed successfully with no output."
                    : `Execution finished: ${description}`)
            );

            setStatus(
                description === "Accepted"
                    ? "Executed successfully"
                    : description
            );
        } catch (error) {
            console.error("Code execution failed:", error);

            const message =
                error.response?.data?.details ||
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                "The execution service is unavailable.";

            setOutput(
                `Could not execute the program.\n\n${message}\n\n` +
                "Check the backend endpoint, Judge0 configuration, and server logs."
            );
            setStatus("Execution failed");
        } finally {
            setIsRunning(false);
        }
    };

    /* =====================================================
       SAVE CODE
    ===================================================== */

    const handleSaveCode = () => {

        const item = {
            id: Date.now(),
            language,
            code,
            title:
                `${language} Program`,
            savedAt:
                new Date().toISOString()
        };

        setRecentCodes((previous) => {

            const filtered =
                previous.filter(
                    (entry) =>
                        entry.code !== code ||
                        entry.language !== language
                );

            return [
                item,
                ...filtered
            ].slice(0, 5);
        });

        setIsSaved(true);

        setStatus("Saved");

        setOutput(
            `${language} code saved successfully.\n\n` +
            `Saved locally in your AI Mentor workspace.`
        );

        setActivePanel("output");
    };

    /* =====================================================
       CLEAR CODE
    ===================================================== */

    const handleClearCode = () => {

        setCode("");

        setOutput("");

        setStatus("Empty editor");

        setIsSaved(false);

        setCursorPosition({
            line: 1,
            column: 1
        });
    };

    /* =====================================================
       RESET CODE
    ===================================================== */

    const handleResetCode = () => {

        setCode(
            DEFAULT_CODE[language] || ""
        );

        setOutput("");

        setStatus("Ready");

        setIsSaved(false);

        setCursorPosition({
            line: 1,
            column: 1
        });
    };

    /* =====================================================
       CLEAR OUTPUT
    ===================================================== */

    const handleClearOutput = () => {

        setOutput("");

        setStatus("Ready");
    };

    /* =====================================================
       LOAD RECENT CODE
    ===================================================== */

    const loadRecentCode = (item) => {

        if (!item) {
            return;
        }

        setLanguage(item.language);

        setCode(item.code);

        setOutput("");

        setStatus("Loaded");

        setIsSaved(true);

        setActivePanel("output");

        setCursorPosition({
            line: 1,
            column: 1
        });
    };

    /* =====================================================
       KEYBOARD SHORTCUT
    ===================================================== */

    const handleEditorKeyDown = (event) => {

        if (
            (event.ctrlKey || event.metaKey) &&
            event.key.toLowerCase() === "s"
        ) {

            event.preventDefault();

            handleSaveCode();

            return;
        }

        if (
            (event.ctrlKey || event.metaKey) &&
            event.key === "Enter"
        ) {

            event.preventDefault();

            handleRunCode();
        }

        /*
         * Tab support
         */

        if (event.key === "Tab") {

            event.preventDefault();

            const textarea =
                event.currentTarget;

            const start =
                textarea.selectionStart;

            const end =
                textarea.selectionEnd;

            const nextValue =
                code.substring(0, start) +
                "    " +
                code.substring(end);

            setCode(nextValue);

            setTimeout(() => {

                textarea.selectionStart =
                    start + 4;

                textarea.selectionEnd =
                    start + 4;

            }, 0);

            setIsSaved(false);

            setStatus("Unsaved changes");
        }
    };

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <div className="code-editor-page">

            <div className="code-editor-container">

                {/* =================================================
                    PAGE HEADER
                ================================================= */}

                <header className="code-editor-header">

                    <div className="code-editor-heading">

                        <div className="code-editor-heading-icon">
                            <i className="bi bi-code-square"></i>
                        </div>

                        <div>

                            <span className="code-editor-eyebrow">
                                <i className="bi bi-stars"></i>
                                AI MENTOR WORKSPACE
                            </span>

                            <h1>
                                Code Editor
                            </h1>

                            <p>
                                Practice, write and refine code
                                in your personalized learning workspace.
                            </p>

                        </div>

                    </div>

                    <div className="code-editor-header-actions">

                        <div className="workspace-status">

                            <span
                                className={
                                    isRunning
                                        ? "status-dot running"
                                        : isSaved
                                            ? "status-dot saved"
                                            : "status-dot"
                                }
                            ></span>

                            <span>
                                {status}
                            </span>

                        </div>

                        <button
                            type="button"
                            className="workspace-icon-btn"
                            title="Reset editor"
                            onClick={handleResetCode}
                        >
                            <i className="bi bi-arrow-counterclockwise"></i>
                        </button>

                    </div>

                </header>


                {/* =================================================
                    WORKSPACE STATS
                ================================================= */}

                <section className="workspace-stats">

                    <div className="workspace-stat-card">

                        <div className="workspace-stat-icon">
                            <i className="bi bi-terminal-fill"></i>
                        </div>

                        <div>
                            <span>LANGUAGE</span>
                            <strong>{language}</strong>
                        </div>

                    </div>

                    <div className="workspace-stat-card">

                        <div className="workspace-stat-icon">
                            <i className="bi bi-file-earmark-code-fill"></i>
                        </div>

                        <div>
                            <span>LINES</span>
                            <strong>
                                {getLineNumbers(code).length}
                            </strong>
                        </div>

                    </div>

                    <div className="workspace-stat-card">

                        <div className="workspace-stat-icon">
                            <i className="bi bi-check2-circle"></i>
                        </div>

                        <div>
                            <span>STATUS</span>
                            <strong>
                                {isSaved
                                    ? "Saved"
                                    : "In Progress"}
                            </strong>
                        </div>

                    </div>

                    <div className="workspace-stat-card">

                        <div className="workspace-stat-icon">
                            <i className="bi bi-lightning-charge-fill"></i>
                        </div>

                        <div>
                            <span>SHORTCUT</span>
                            <strong>
                                Ctrl + Enter
                            </strong>
                        </div>

                    </div>

                </section>


                {/* =================================================
                    MAIN WORKSPACE
                ================================================= */}

                <section className="code-workspace-card">

                    {/* =================================================
                        TOOLBAR
                    ================================================= */}

                    <div className="code-workspace-toolbar">

                        <div className="toolbar-left">

                            <div className="workspace-file">

                                <div
                                    className={
                                        `file-language-icon ${meta.colorClass}`
                                    }
                                >
                                    <i
                                        className={
                                            `bi ${meta.icon}`
                                        }
                                    ></i>
                                </div>

                                <div>

                                    <strong>
                                        Main.{meta.extension}
                                    </strong>

                                    <span>
                                        AI Mentor Workspace
                                    </span>

                                </div>

                            </div>

                            <div className="toolbar-divider"></div>

                            <div className="language-selector">

                                <i className="bi bi-code-slash"></i>

                                <select
                                    value={language}
                                    onChange={
                                        handleLanguageChange
                                    }
                                    aria-label="Select programming language"
                                >

                                    {Object.keys(
                                        DEFAULT_CODE
                                    ).map((item) => (

                                        <option
                                            key={item}
                                            value={item}
                                        >
                                            {item}
                                        </option>

                                    ))}

                                </select>

                                <i className="bi bi-chevron-down"></i>

                            </div>

                        </div>


                        <div className="toolbar-actions">

                            <button
                                type="button"
                                className="toolbar-secondary-btn"
                                onClick={handleClearCode}
                                title="Clear editor"
                            >
                                <i className="bi bi-trash3"></i>
                                Clear
                            </button>

                            <button
                                type="button"
                                className="toolbar-secondary-btn"
                                onClick={handleSaveCode}
                            >
                                <i
                                    className={
                                        `bi ${
                                            isSaved
                                                ? "bi-check-lg"
                                                : "bi-save"
                                        }`
                                    }
                                ></i>

                                {isSaved
                                    ? "Saved"
                                    : "Save"}
                            </button>

                            <button
                                type="button"
                                className="run-code-btn"
                                onClick={handleRunCode}
                                disabled={isRunning}
                            >

                                {isRunning ? (
                                    <>
                                        <span className="run-spinner"></span>
                                        Running
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-play-fill"></i>
                                        Run Code
                                    </>
                                )}

                            </button>

                        </div>

                    </div>


                    {/* =================================================
                        EDITOR AREA
                    ================================================= */}

                    <div className="editor-area">

                        <div className="line-numbers">

                            {getLineNumbers(code).map(
                                (number) => (

                                    <span
                                        key={number}
                                    >
                                        {number}
                                    </span>

                                )
                            )}

                        </div>

                        <textarea
                            className="code-textarea"
                            value={code}
                            onChange={handleCodeChange}
                            onSelect={handleCursorChange}
                            onClick={handleCursorChange}
                            onKeyUp={handleCursorChange}
                            onKeyDown={handleEditorKeyDown}
                            spellCheck="false"
                            autoCapitalize="off"
                            autoCorrect="off"
                            aria-label="Code editor"
                        />

                    </div>


                    {/* =================================================
                        EDITOR FOOTER
                    ================================================= */}

                    <div className="editor-footer">

                        <div className="editor-footer-left">

                            <span>
                                <i className="bi bi-git"></i>
                                main
                            </span>

                            <span>
                                <i className="bi bi-check-circle"></i>
                                No issues detected
                            </span>

                            <span>
                                <i className="bi bi-cpu"></i>
                                {language}
                            </span>

                        </div>

                        <div className="editor-footer-right">

                            <span>
                                Ln {cursorPosition.line},
                                Col {cursorPosition.column}
                            </span>

                            <span>
                                Spaces: 4
                            </span>

                            <span>
                                UTF-8
                            </span>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    OUTPUT / CONSOLE
                ================================================= */}

                <section className="output-card">

                    <div className="output-header">

                        <div className="output-tabs">

                            <button
                                type="button"
                                className={
                                    activePanel === "output"
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    setActivePanel("output")
                                }
                            >
                                <i className="bi bi-terminal"></i>
                                Output
                            </button>

                            <button
                                type="button"
                                className={
                                    activePanel === "problems"
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    setActivePanel("problems")
                                }
                            >
                                <i className="bi bi-exclamation-circle"></i>
                                Problems
                            </button>

                        </div>

                        <div className="output-header-actions">

                            <span className="console-status">
                                <span></span>
                                Console
                            </span>

                            <button
                                type="button"
                                onClick={
                                    handleClearOutput
                                }
                                title="Clear output"
                            >
                                <i className="bi bi-x-circle"></i>
                                Clear
                            </button>

                        </div>

                    </div>


                    <div className="output-body">

                        {activePanel === "output" ? (

                            output ? (

                                <pre className="console-output">
                                    <span className="console-prompt">
                                        $
                                    </span>{" "}
                                    {output}
                                </pre>

                            ) : (

                                <div className="empty-console">

                                    <div className="empty-console-icon">
                                        <i className="bi bi-terminal"></i>
                                    </div>

                                    <strong>
                                        No output yet
                                    </strong>

                                    <p>
                                        Run your code to see the
                                        execution output here.
                                    </p>

                                    <span>
                                        Tip: Press
                                        <kbd>Ctrl</kbd>
                                        +
                                        <kbd>Enter</kbd>
                                        to run
                                    </span>

                                </div>

                            )

                        ) : (

                            <div className="empty-console">

                                <div className="empty-console-icon">
                                    <i className="bi bi-check2-circle"></i>
                                </div>

                                <strong>
                                    No problems detected
                                </strong>

                                <p>
                                    Your workspace currently has
                                    no reported editor problems.
                                </p>

                            </div>

                        )}

                    </div>

                </section>


                {/* =================================================
                    RECENT CODE
                ================================================= */}

                <section className="recent-code-card">

                    <div className="recent-code-header">

                        <div>

                            <span>
                                WORKSPACE HISTORY
                            </span>

                            <h2>
                                Recent Code
                            </h2>

                        </div>

                        <span className="history-count">
                            {recentCodes.length}
                            {recentCodes.length === 1
                                ? " file"
                                : " files"}
                        </span>

                    </div>

                    {recentCodes.length > 0 ? (

                        <div className="recent-code-list">

                            {recentCodes.map(
                                (item) => {

                                    const itemMeta =
                                        LANGUAGE_META[
                                            item.language
                                        ] ||
                                        LANGUAGE_META.Java;

                                    return (

                                        <button
                                            type="button"
                                            className="recent-code-item"
                                            key={item.id}
                                            onClick={() =>
                                                loadRecentCode(
                                                    item
                                                )
                                            }
                                        >

                                            <div
                                                className={
                                                    `recent-code-icon ${itemMeta.colorClass}`
                                                }
                                            >
                                                <i
                                                    className={
                                                        `bi ${itemMeta.icon}`
                                                    }
                                                ></i>
                                            </div>

                                            <div className="recent-code-info">

                                                <strong>
                                                    {item.title}
                                                </strong>

                                                <span>
                                                    {item.language}
                                                    {" • "}
                                                    {formatTime(
                                                        new Date(
                                                            item.savedAt
                                                        )
                                                    )}
                                                </span>

                                            </div>

                                            <i className="bi bi-chevron-right"></i>

                                        </button>

                                    );
                                }
                            )}

                        </div>

                    ) : (

                        <div className="recent-code-empty">

                            <i className="bi bi-clock-history"></i>

                            <div>
                                <strong>
                                    No saved programs yet
                                </strong>

                                <p>
                                    Save your code to access it
                                    quickly from your workspace.
                                </p>
                            </div>

                        </div>

                    )}

                </section>


                {/* =================================================
                    QUICK TIPS
                ================================================= */}

                <section className="editor-tips">

                    <div className="editor-tip">

                        <div className="tip-icon">
                            <i className="bi bi-lightbulb-fill"></i>
                        </div>

                        <div>
                            <strong>
                                Quick tip
                            </strong>

                            <p>
                                Use <kbd>Ctrl</kbd> +
                                <kbd>Enter</kbd> to quickly
                                run your code.
                            </p>
                        </div>

                    </div>

                    <div className="editor-tip">

                        <div className="tip-icon">
                            <i className="bi bi-save-fill"></i>
                        </div>

                        <div>
                            <strong>
                                Your work is saved locally
                            </strong>

                            <p>
                                Your current workspace is
                                preserved when you refresh.
                            </p>
                        </div>

                    </div>

                    <div className="editor-tip">

                        <div className="tip-icon">
                            <i className="bi bi-stars"></i>
                        </div>

                        <div>
                            <strong>
                                AI Mentor ready
                            </strong>

                            <p>
                                Connect this workspace with
                                your AI Mentor for code guidance.
                            </p>
                        </div>

                    </div>

                </section>

            </div>

        </div>
    );
}