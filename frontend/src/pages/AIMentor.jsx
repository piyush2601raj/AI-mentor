/*
 * =========================================================
 * AI MENTOR API ROUTE FIX
 * =========================================================
 * Existing UI and functionality intentionally preserved.
 * History endpoint uses the controller /api/ai base path.
 * Chat endpoint uses the controller /api/ai base path.
 * Existing mentor tools and AI functionality are preserved.
 * Recent Chat sessions are persisted in localStorage on the frontend.
 * Deleted/cleared local sessions are not restored from legacy backend history.
 * Recent Chats can be deleted individually or cleared together.
 * Full-viewport responsive layout overrides are scoped to this page.
 * Existing chat behavior and backend contracts remain unchanged.
 * =========================================================
 */

import React, {
    useEffect,
    useRef,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import api from "../services/api";

import "./AIMentor.css";
import "./AIMentorFormatting.css";


/* =========================================================
   AI MENTOR
   ========================================================= */

function AIMentor() {

    const navigate = useNavigate();

    const messagesEndRef = useRef(null);

    /* =====================================================
       STATE
       ===================================================== */

    const [studentId, setStudentId] =
        useState(null);

    const [messages, setMessages] =
        useState([]);

    const [input, setInput] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [sending, setSending] =
        useState(false);

    const [error, setError] =
        useState("");

    const [selectedTool, setSelectedTool] =
        useState(null);

    /* =====================================================
       RECENT CONVERSATIONS
       -----------------------------------------------------
       Recent chats are intentionally kept on the frontend so
       starting a New Chat never destroys the visible history.
       The backend chat API remains unchanged.
       ===================================================== */

    const [recentChats, setRecentChats] =
        useState([]);

    const [activeConversationId, setActiveConversationId] =
        useState(null);

    const [historyReady, setHistoryReady] =
        useState(false);

    /*
     * History management UI state.
     * These controls are intentionally frontend-safe: the existing
     * AI chat endpoints continue to work exactly as before.
     */
    const [deleteTarget, setDeleteTarget] =
        useState(null);

    const [showClearHistory, setShowClearHistory] =
        useState(false);

    const [historyActionLoading, setHistoryActionLoading] =
        useState(false);


    /* =====================================================
       GET STUDENT ID
       ===================================================== */

    const getStudentId = () => {

        return (
            localStorage.getItem("studentId") ||
            localStorage.getItem("userId") ||
            localStorage.getItem("id")
        );
    };


    /* =====================================================
       RECENT CHAT STORAGE HELPERS
       ===================================================== */

    const getRecentChatsStorageKey = (id) =>
        `aiMentorRecentChats:${id}`;


    const createConversationId = () => {

        if (typeof crypto !== "undefined" && crypto.randomUUID) {
            return crypto.randomUUID();
        }

        return `conversation-${Date.now()}-${Math.random()}`;
    };


    const readStoredRecentChats = (id) => {

        try {

            const raw = localStorage.getItem(
                getRecentChatsStorageKey(id)
            );

            if (!raw) {
                return [];
            }

            const parsed = JSON.parse(raw);

            return Array.isArray(parsed)
                ? parsed
                : [];

        } catch (storageError) {

            console.warn(
                "Unable to read AI Mentor recent chats:",
                storageError
            );

            return [];
        }
    };


    const persistRecentChats = (id, chats) => {

        try {

            localStorage.setItem(
                getRecentChatsStorageKey(id),
                JSON.stringify(chats.slice(0, 12))
            );

        } catch (storageError) {

            console.warn(
                "Unable to save AI Mentor recent chats:",
                storageError
            );
        }
    };


    const buildConversationPreview = (conversationMessages) => {

        const userMessages = conversationMessages.filter(
            message => message.role === "user"
        );

        const latestUserMessage =
            userMessages[userMessages.length - 1];

        const firstUserMessage =
            userMessages[0] || latestUserMessage;

        return {
            title: firstUserMessage?.content || "AI Mentor conversation",
            preview: latestUserMessage?.content || firstUserMessage?.content || "AI Mentor conversation",
            messageCount: conversationMessages.length,
            updatedAt:
                conversationMessages[conversationMessages.length - 1]?.createdAt ||
                new Date().toISOString()
        };
    };


    /* =====================================================
       SAVE ACTIVE CHAT AS A RECENT CONVERSATION
       ===================================================== */

    useEffect(() => {

        if (
            !historyReady ||
            !studentId ||
            !activeConversationId ||
            messages.length === 0
        ) {
            return;
        }

        const preview = buildConversationPreview(messages);

        const conversation = {
            id: activeConversationId,
            title: preview.title,
            preview: preview.preview,
            messageCount: preview.messageCount,
            updatedAt: preview.updatedAt,
            messages
        };

        setRecentChats(previous => {

            const withoutCurrent = previous.filter(
                chat => chat.id !== activeConversationId
            );

            const next = [
                conversation,
                ...withoutCurrent
            ].sort(
                (a, b) =>
                    new Date(b.updatedAt).getTime() -
                    new Date(a.updatedAt).getTime()
            ).slice(0, 12);

            persistRecentChats(
                studentId,
                next
            );

            return next;
        });

    }, [
        messages,
        studentId,
        activeConversationId,
        historyReady
    ]);


    /* =====================================================
       LOAD CHAT HISTORY
       ===================================================== */

    useEffect(() => {

        const loadHistory = async () => {

            try {

                setLoading(true);
                setError("");

                const id = getStudentId();

                if (!id) {

                    setError(
                        "Student information not found. Please login again."
                    );

                    return;
                }

                setStudentId(id);

                /*
                 * Restore frontend conversation sessions first.
                 * This is what keeps Recent Chats visible after
                 * clicking New Chat or refreshing the page.
                 */
                const storedRecentChats =
                    readStoredRecentChats(id);

                setRecentChats(storedRecentChats);

                /*
                 * A deleted/cleared local history must not be rebuilt
                 * from the backend's legacy full-history endpoint.
                 * That endpoint has no conversation/session ID and
                 * therefore cannot distinguish deleted UI sessions.
                 */
                const historyWasCleared =
                    localStorage.getItem(
                        `aiMentorHistoryCleared:${id}`
                    ) === "true";

                const response =
                    await api.get(
                        `/api/ai/chat/history/${id}`
                    );

                const history =
                    Array.isArray(response.data)
                        ? response.data
                        : [];

                /*
                 * Backend returns latest first.
                 * Chat UI needs oldest first.
                 */
                const formattedMessages = [];

                [...history]
                    .reverse()
                    .forEach((chat) => {

                        if (chat.userMessage) {
                            formattedMessages.push({
                                id: `user-${chat.id}`,
                                role: "user",
                                content: chat.userMessage,
                                createdAt: chat.createdAt
                            });
                        }

                        if (chat.aiResponse) {
                            formattedMessages.push({
                                id: `ai-${chat.id}`,
                                role: "assistant",
                                content: chat.aiResponse,
                                createdAt: chat.createdAt
                            });
                        }

                    });

                /*
                 * Prefer the saved local session over the backend's
                 * combined history. Otherwise old messages from
                 * deleted sessions appear inside the current chat.
                 */
                /*
                 * Import legacy backend history into Recent Chats when
                 * no local sessions exist. Do not load that history into
                 * the active chat: opening AI Mentor should start blank.
                 */
                if (
                    storedRecentChats.length === 0 &&
                    !historyWasCleared &&
                    formattedMessages.length > 0
                ) {
                    const legacyConversationId =
                        createConversationId();

                    const preview =
                        buildConversationPreview(
                            formattedMessages
                        );

                    const serverConversation = {
                        id: legacyConversationId,
                        title: preview.title,
                        preview: preview.preview,
                        messageCount: preview.messageCount,
                        updatedAt: preview.updatedAt,
                        messages: formattedMessages
                    };

                    setRecentChats([serverConversation]);

                    persistRecentChats(
                        id,
                        [serverConversation]
                    );
                }

                // Always start with a clean active conversation.
                setMessages([]);
                setInput("");
                setError("");
                setSelectedTool(null);
                setActiveConversationId(createConversationId());

                setHistoryReady(true);

            } catch (err) {

                console.error(
                    "AI Mentor history error:",
                    err
                );

                setError(
                    "Unable to load your previous conversations."
                );

            } finally {

                setLoading(false);

            }

        };

        loadHistory();

    }, []);


    /* =====================================================
       AUTO SCROLL
       ===================================================== */

    useEffect(() => {

        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });

    }, [messages, sending]);


    /* =====================================================
       SEND MESSAGE
       ===================================================== */

    const sendMessage = async (
        customMessage = null
    ) => {

        const message =
            (
                customMessage !== null
                    ? customMessage
                    : input
            ).trim();

        if (!message) {
            return;
        }

        if (!studentId) {

            setError(
                "Student ID not found. Please login again."
            );

            return;
        }

        if (sending) {
            return;
        }

        setError("");
        setSelectedTool(null);

        /*
         * Immediately display user message.
         */

        const temporaryUserMessage = {

            id:
                `temporary-user-${Date.now()}`,

            role: "user",

            content: message,

            createdAt:
                new Date().toISOString()

        };

        setMessages(
            previous => [
                ...previous,
                temporaryUserMessage
            ]
        );

        setInput("");

        try {

            setSending(true);

            const response =
                await api.post(
                    "/api/ai/chat",
                    {
                        studentId:
                            Number(studentId),

                        message:
                            message
                    }
                );

            const aiResponse =
                response?.data?.response;

            if (!aiResponse) {

                throw new Error(
                    "Empty AI response"
                );

            }

            const aiMessage = {

                id:
                    `temporary-ai-${Date.now()}`,

                role: "assistant",

                content:
                    aiResponse,

                createdAt:
                    new Date().toISOString()

            };

            setMessages(
                previous => [
                    ...previous,
                    aiMessage
                ]
            );

        } catch (err) {

            console.error(
                "AI Mentor chat error:",
                err
            );

            let messageText =
                "Unable to get a response from AI Mentor.";

            if (
                err?.response?.status === 401
            ) {

                messageText =
                    "AI service authentication failed. Please check the AI API configuration.";

            } else if (
                err?.response?.status === 429
            ) {

                messageText =
                    "AI service limit reached. Please try again later.";

            } else if (
                err?.response?.data?.message
            ) {

                messageText =
                    err.response.data.message;

            }

            setError(messageText);

        } finally {

            setSending(false);

        }

    };


    /* =====================================================
       ENTER KEY
       ===================================================== */

    const handleKeyDown = (event) => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();

        }

    };


    /* =====================================================
       NEW CHAT
       ===================================================== */

    const handleNewChat = () => {

        /*
         * Do NOT clear Recent Chats. The current conversation has
         * already been persisted by the messages effect. A new id
         * simply starts a fresh visible chat session.
         */
        setActiveConversationId(
            createConversationId()
        );

        setMessages([]);

        setInput("");

        setError("");

        setSelectedTool(null);

    };

    /*
     * Sidebar can dispatch this event when AI Mentor is clicked,
     * including when the user is already on the AI Mentor route.
     */
    useEffect(() => {
        const startFreshChat = () => {
            handleNewChat();
        };

        window.addEventListener(
            "ai-mentor-start-fresh-chat",
            startFreshChat
        );

        return () => {
            window.removeEventListener(
                "ai-mentor-start-fresh-chat",
                startFreshChat
            );
        };
    }, []);


    /* =====================================================
       OPEN A SAVED RECENT CHAT
       ===================================================== */

    const openRecentChat = (conversation) => {

        if (!conversation?.messages?.length) {
            return;
        }

        setActiveConversationId(
            conversation.id
        );

        setMessages(
            conversation.messages
        );

        setInput("");

        setError("");

        setSelectedTool(null);

    };


    /* =====================================================
       DELETE ONE RECENT CHAT
       -----------------------------------------------------
       This removes the selected conversation from the Recent
       Chats UI and local persistence. The existing backend does
       not expose a per-conversation DELETE endpoint because its
       history DTO has no conversation/session id.
       ===================================================== */

    const deleteRecentChat = (conversationId) => {

        if (!conversationId) {
            return;
        }

        setHistoryActionLoading(true);

        setRecentChats(previous => {

            const next = previous.filter(
                chat => chat.id !== conversationId
            );

            if (studentId) {
                persistRecentChats(
                    studentId,
                    next
                );

                /*
                 * If the last local conversation was deleted, remember
                 * that choice so the legacy backend history cannot
                 * recreate it when AI Mentor is reopened.
                 */
                if (next.length === 0) {
                    localStorage.setItem(
                        `aiMentorHistoryCleared:${studentId}`,
                        "true"
                    );
                }
            }

            return next;

        });

        if (
            activeConversationId ===
            conversationId
        ) {

            setActiveConversationId(
                createConversationId()
            );

            setMessages([]);

            setInput("");

            setError("");

            setSelectedTool(null);

        }

        setDeleteTarget(null);

        window.setTimeout(() => {
            setHistoryActionLoading(false);
        }, 180);

    };


    /* =====================================================
       CLEAR ALL RECENT CHATS
       -----------------------------------------------------
       The current backend has GET history only. Therefore the
       frontend clears the saved Recent Chat sessions without
       changing the existing AI API contract.
       ===================================================== */

    const clearAllRecentChats = async () => {

        if (!studentId) {
            return;
        }

        setHistoryActionLoading(true);

        try {

            /*
             * If you later add:
             * DELETE /api/ai/chat/history/{studentId}
             * this request will permanently remove DB history too.
             *
             * Until that endpoint exists, a 404/405 is safely ignored
             * and the frontend Recent Chats are still cleared.
             */
            try {

                await api.delete(
                    `/api/ai/chat/history/${studentId}`
                );

            } catch (backendDeleteError) {

                if (
                    backendDeleteError?.response?.status !== 404 &&
                    backendDeleteError?.response?.status !== 405
                ) {
                    console.warn(
                        "Backend history delete is not available:",
                        backendDeleteError
                    );
                }

            }

            localStorage.removeItem(
                getRecentChatsStorageKey(
                    studentId
                )
            );

            localStorage.setItem(
                `aiMentorHistoryCleared:${studentId}`,
                "true"
            );

            setRecentChats([]);

            setActiveConversationId(
                createConversationId()
            );

            setMessages([]);

            setInput("");

            setError("");

            setSelectedTool(null);

            setShowClearHistory(false);

        } finally {

            setHistoryActionLoading(false);

        }

    };


    /* =====================================================
       QUICK PROMPTS
       ===================================================== */

    const quickPrompts = [

        {
            icon: "✨",
            title: "Explain a concept",
            description:
                "Understand any topic simply",
            prompt:
                "Explain the most important concept I should understand from my current learning path in simple terms."
        },

        {
            icon: "💡",
            title: "Give me an example",
            description:
                "Learn through practical examples",
            prompt:
                "Give me a practical real-world example related to what I am currently learning."
        },

        {
            icon: "📝",
            title: "Generate a quiz",
            description:
                "Test your understanding",
            prompt:
                "Generate a short quiz based on my current learning topics. Ask one question at a time and evaluate my answers."
        },

        {
            icon: "🎯",
            title: "Interview preparation",
            description:
                "Prepare for technical interviews",
            prompt:
                "Start an interview preparation session based on my current skills and career goal. Ask me one technical question at a time and evaluate my answer."
        }

    ];


    /* =====================================================
       TOOL HANDLER
       ===================================================== */

    const handleTool = (
        tool
    ) => {

        setSelectedTool(
            tool.title
        );

        setInput(
            tool.prompt
        );

        /*
         * Automatically send
         * the tool request.
         */

        sendMessage(
            tool.prompt
        );

    };


    /* =====================================================
       RECOMMENDATION
       ===================================================== */

    const handleRecommendation = () => {

        const prompt =
            "Based on my current skills, roadmap progress, quiz performance and career goal, tell me exactly what I should study next. Give me a practical step-by-step recommendation.";

        setSelectedTool(
            "Personalized Recommendation"
        );

        sendMessage(prompt);

    };


    /* =====================================================
       RICH AI RESPONSE RENDERER
       -----------------------------------------------------
       Existing chat/API/UI behavior is preserved. This layer
       only converts AI markdown-like text into readable UI:
       headings, bullets, numbered steps, tables, code blocks,
       inline code, bold text, quotes and paragraphs.
       ===================================================== */

    const renderInlineText = (
        value,
        keyPrefix = "inline"
    ) => {
        if (value === null || value === undefined) {
            return null;
        }

        const text = String(value);

        /*
         * Split only on the inline constructs we support. React
         * renders the resulting strings safely; nothing is injected
         * as raw HTML.
         */
        const tokenRegex = /(\`[^\`]+\`|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_([^_]+)_)/g;
        const parts = [];
        let lastIndex = 0;
        let match;
        let tokenIndex = 0;

        while ((match = tokenRegex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                parts.push(
                    <React.Fragment key={`${keyPrefix}-text-${tokenIndex}`}>
                        {text.slice(lastIndex, match.index)}
                    </React.Fragment>
                );
                tokenIndex += 1;
            }

            const token = match[0];

            if (token.startsWith("`") && token.endsWith("`")) {
                parts.push(
                    <code
                        key={`${keyPrefix}-code-${tokenIndex}`}
                        className="ai-inline-code"
                    >
                        {token.slice(1, -1)}
                    </code>
                );
            } else if (
                (token.startsWith("**") && token.endsWith("**")) ||
                (token.startsWith("__") && token.endsWith("__"))
            ) {
                parts.push(
                    <strong
                        key={`${keyPrefix}-bold-${tokenIndex}`}
                        className="ai-inline-bold"
                    >
                        {token.slice(2, -2)}
                    </strong>
                );
            } else if (
                token.startsWith("*") &&
                token.endsWith("*")
            ) {
                parts.push(
                    <em
                        key={`${keyPrefix}-italic-${tokenIndex}`}
                        className="ai-inline-italic"
                    >
                        {token.slice(1, -1)}
                    </em>
                );
            } else if (
                token.startsWith("_") &&
                token.endsWith("_")
            ) {
                parts.push(
                    <em
                        key={`${keyPrefix}-italic-${tokenIndex}`}
                        className="ai-inline-italic"
                    >
                        {token.slice(1, -1)}
                    </em>
                );
            } else {
                parts.push(token);
            }

            lastIndex = match.index + token.length;
            tokenIndex += 1;
        }

        if (lastIndex < text.length) {
            parts.push(
                <React.Fragment key={`${keyPrefix}-tail`}>
                    {text.slice(lastIndex)}
                </React.Fragment>
            );
        }

        return parts.length > 0 ? parts : text;
    };


    /* =====================================================
       CODE BLOCK
       ===================================================== */

    const AICodeBlock = ({
        code,
        language = ""
    }) => {
        const [copied, setCopied] = useState(false);

        const copyCode = async () => {
            try {
                await navigator.clipboard.writeText(code);
                setCopied(true);
                window.setTimeout(
                    () => setCopied(false),
                    1600
                );
            } catch (copyError) {
                console.warn(
                    "Unable to copy code:",
                    copyError
                );
            }
        };

        return (
            <div className="ai-code-block">
                <div className="ai-code-header">
                    <span className="ai-code-language">
                        {language || "code"}
                    </span>

                    <button
                        type="button"
                        className="ai-code-copy-button"
                        onClick={copyCode}
                        aria-label="Copy code"
                    >
                        {copied ? "✓ Copied" : "Copy"}
                    </button>
                </div>

                <pre className="ai-code-pre">
                    <code>{code}</code>
                </pre>
            </div>
        );
    };


    /* =====================================================
       TABLE HELPERS
       ===================================================== */

    const isTableSeparator = (line) => {
        const value = line.trim();

        if (!value.includes("|")) {
            return false;
        }

        const cells = value
            .replace(/^\|/, "")
            .replace(/\|$/, "")
            .split("|")
            .map(cell => cell.trim());

        return (
            cells.length >= 2 &&
            cells.every(cell =>
                /^:?-{3,}:?$/.test(cell)
            )
        );
    };


    const splitTableRow = (line) => {
        let value = line.trim();

        if (value.startsWith("|")) {
            value = value.slice(1);
        }

        if (value.endsWith("|")) {
            value = value.slice(0, -1);
        }

        return value
            .split("|")
            .map(cell => cell.trim());
    };


    const renderTable = (
        rows,
        keyPrefix
    ) => {
        if (!rows || rows.length < 2) {
            return null;
        }

        const header = splitTableRow(rows[0]);
        const bodyRows = rows.slice(2);

        return (
            <div
                key={keyPrefix}
                className="ai-table-wrapper"
            >
                <table className="ai-response-table">
                    <thead>
                        <tr>
                            {header.map(
                                (cell, index) => (
                                    <th
                                        key={`${keyPrefix}-h-${index}`}
                                        scope="col"
                                    >
                                        {renderInlineText(
                                            cell,
                                            `${keyPrefix}-h-${index}`
                                        )}
                                    </th>
                                )
                            )}
                        </tr>
                    </thead>

                    <tbody>
                        {bodyRows.map(
                            (row, rowIndex) => {
                                const cells = splitTableRow(row);

                                return (
                                    <tr
                                        key={`${keyPrefix}-r-${rowIndex}`}
                                    >
                                        {header.map(
                                            (_, cellIndex) => (
                                                <td
                                                    key={`${keyPrefix}-r-${rowIndex}-c-${cellIndex}`}
                                                >
                                                    {renderInlineText(
                                                        cells[cellIndex] || "",
                                                        `${keyPrefix}-r-${rowIndex}-c-${cellIndex}`
                                                    )}
                                                </td>
                                            )
                                        )}
                                    </tr>
                                );
                            }
                        )}
                    </tbody>
                </table>
            </div>
        );
    };


    /* =====================================================
       FORMAT AI RESPONSE
       ===================================================== */

    const formatMessage = (
        text
    ) => {
        if (!text) {
            return null;
        }

        const lines = String(text)
            .replace(/\r\n/g, "\n")
            .replace(/\r/g, "\n")
            .split("\n");

        const blocks = [];
        let paragraph = [];
        let bullets = [];
        let ordered = [];
        let codeLines = null;
        let codeLanguage = "";
        let tableLines = [];

        const flushParagraph = () => {
            if (!paragraph.length) {
                return;
            }

            const content = paragraph
                .join(" ")
                .trim();

            if (content) {
                blocks.push(
                    <p
                        key={`paragraph-${blocks.length}`}
                        className="ai-response-paragraph"
                    >
                        {renderInlineText(
                            content,
                            `paragraph-${blocks.length}`
                        )}
                    </p>
                );
            }

            paragraph = [];
        };

        const flushBullets = () => {
            if (!bullets.length) {
                return;
            }

            blocks.push(
                <ul
                    key={`bullets-${blocks.length}`}
                    className="ai-response-bullet-list"
                >
                    {bullets.map(
                        (item, index) => (
                            <li
                                key={`bullet-${index}`}
                            >
                                {renderInlineText(
                                    item,
                                    `bullet-${index}`
                                )}
                            </li>
                        )
                    )}
                </ul>
            );

            bullets = [];
        };

        const flushOrdered = () => {
            if (!ordered.length) {
                return;
            }

            blocks.push(
                <ol
                    key={`ordered-${blocks.length}`}
                    className="ai-response-number-list"
                >
                    {ordered.map(
                        (item, index) => (
                            <li
                                key={`ordered-${index}`}
                            >
                                {renderInlineText(
                                    item,
                                    `ordered-${index}`
                                )}
                            </li>
                        )
                    )}
                </ol>
            );

            ordered = [];
        };

        const flushTable = () => {
            if (tableLines.length < 2) {
                tableLines = [];
                return;
            }

            const table = renderTable(
                tableLines,
                `table-${blocks.length}`
            );

            if (table) {
                blocks.push(table);
            }

            tableLines = [];
        };

        const flushLists = () => {
            flushBullets();
            flushOrdered();
        };

        const flushAllText = () => {
            flushParagraph();
            flushLists();
            flushTable();
        };

        lines.forEach((rawLine, index) => {
            const line = rawLine.replace(/\t/g, "    ");
            const trimmed = line.trim();

            /* -------------------------------------------------
               FENCED CODE BLOCKS
               ------------------------------------------------- */

            const fence = trimmed.match(/^```(.*)$/);

            if (fence) {
                if (codeLines !== null) {
                    blocks.push(
                        <AICodeBlock
                            key={`code-${blocks.length}`}
                            code={codeLines.join("\n")}
                            language={codeLanguage.trim()}
                        />
                    );

                    codeLines = null;
                    codeLanguage = "";
                } else {
                    flushAllText();
                    codeLines = [];
                    codeLanguage = fence[1] || "";
                }

                return;
            }

            if (codeLines !== null) {
                codeLines.push(line);
                return;
            }

            /* -------------------------------------------------
               TABLES
               ------------------------------------------------- */

            const nextLine =
                lines[index + 1]?.trim() || "";

            if (
                trimmed.includes("|") &&
                isTableSeparator(nextLine)
            ) {
                flushAllText();
                tableLines.push(trimmed);
                return;
            }

            if (
                tableLines.length > 0 &&
                trimmed.includes("|")
            ) {
                tableLines.push(trimmed);
                return;
            }

            if (tableLines.length > 0) {
                flushTable();
            }

            /* -------------------------------------------------
               EMPTY LINE
               ------------------------------------------------- */

            if (!trimmed) {
                flushParagraph();
                flushLists();
                return;
            }

            /* -------------------------------------------------
               HEADINGS: # through ######
               ------------------------------------------------- */

            const heading = trimmed.match(
                /^(#{1,6})\s+(.+)$/
            );

            if (heading) {
                flushParagraph();
                flushLists();

                const level = Math.min(
                    heading[1].length,
                    6
                );

                const HeadingTag =
                    level === 1
                        ? "h3"
                        : level === 2
                            ? "h4"
                            : level === 3
                                ? "h5"
                                : "h6";

                blocks.push(
                    <HeadingTag
                        key={`heading-${blocks.length}`}
                        className={`ai-response-heading ai-response-heading-${level}`}
                    >
                        {renderInlineText(
                            heading[2],
                            `heading-${blocks.length}`
                        )}
                    </HeadingTag>
                );

                return;
            }

            /* -------------------------------------------------
               HORIZONTAL RULE
               ------------------------------------------------- */

            if (/^(---+|\*\*\*+|___+)$/.test(trimmed)) {
                flushParagraph();
                flushLists();

                blocks.push(
                    <hr
                        key={`rule-${blocks.length}`}
                        className="ai-response-divider"
                    />
                );

                return;
            }

            /* -------------------------------------------------
               BLOCKQUOTE
               ------------------------------------------------- */

            if (trimmed.startsWith("> ") || trimmed === ">") {
                flushParagraph();
                flushLists();

                blocks.push(
                    <blockquote
                        key={`quote-${blocks.length}`}
                        className="ai-response-quote"
                    >
                        {renderInlineText(
                            trimmed.replace(/^>\s?/, ""),
                            `quote-${blocks.length}`
                        )}
                    </blockquote>
                );

                return;
            }

            /* -------------------------------------------------
               BULLETS: -, *, +, •
               ------------------------------------------------- */

            const bullet = trimmed.match(
                /^[-*+•]\s+(.+)$/
            );

            if (bullet) {
                flushParagraph();
                flushOrdered();
                bullets.push(bullet[1]);
                return;
            }

            /* -------------------------------------------------
               NUMBERED STEPS
               ------------------------------------------------- */

            const number = trimmed.match(
                /^(\d+)[.)]\s+(.+)$/
            );

            if (number) {
                flushParagraph();
                flushBullets();
                ordered.push(number[2]);
                return;
            }

            /* -------------------------------------------------
               COMMON AI LABELS WITHOUT MARKDOWN HEADINGS
               ------------------------------------------------- */

            const labelled = trimmed.match(
                /^(Key Concepts|Important Topics|Practical Learning|Coding\/Practice Guidance|Real-World Applications|Practice Task|Learning Tip|Next Step|Summary|Conclusion|Why it matters|How to practice)\s*:\s*(.*)$/i
            );

            if (labelled) {
                flushParagraph();
                flushLists();

                blocks.push(
                    <div
                        key={`topic-${blocks.length}`}
                        className="ai-response-topic-block"
                    >
                        <div className="ai-response-topic-title">
                            <span className="ai-response-topic-icon">
                                ✦
                            </span>
                            <span>
                                {labelled[1]}
                            </span>
                        </div>

                        {labelled[2] && (
                            <p className="ai-response-topic-text">
                                {renderInlineText(
                                    labelled[2],
                                    `topic-${blocks.length}`
                                )}
                            </p>
                        )}
                    </div>
                );

                return;
            }

            /* -------------------------------------------------
               NORMAL PARAGRAPH
               ------------------------------------------------- */

            paragraph.push(trimmed);
        });

        if (codeLines !== null) {
            blocks.push(
                <AICodeBlock
                    key={`code-${blocks.length}`}
                    code={codeLines.join("\n")}
                    language={codeLanguage.trim()}
                />
            );
        }

        flushParagraph();
        flushLists();
        flushTable();

        return blocks;
    };


    /* =====================================================
       LOADING SCREEN
       ===================================================== */

    if (loading) {

        return (

            <div className="ai-mentor-loading">

                <div className="ai-loading-orb">

                    <div className="ai-loading-orb-inner">
                        ✦
                    </div>

                </div>

                <h2>
                    Preparing your AI Mentor
                </h2>

                <p>
                    Loading your personalized learning context...
                </p>

                <div className="ai-loading-bar">
                    <span></span>
                </div>

            </div>

        );

    }


    /* =====================================================
       MAIN UI
       ===================================================== */

    return (

        <div className="ai-mentor-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <header className="ai-mentor-header">

                <div className="ai-header-title">

                    <div className="ai-header-icon">
                        ✦
                    </div>

                    <div>

                        <h1>
                            AI Mentor
                        </h1>

                        <p>
                            Your personalized learning companion
                        </p>

                    </div>

                </div>


                <div className="ai-header-actions">

                    <button
                        className="ai-new-chat-button"
                        onClick={handleNewChat}
                    >
                        <span>
                            ＋
                        </span>

                        New Chat
                    </button>

                </div>

            </header>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="ai-error-banner">

                    <span>
                        ⚠
                    </span>

                    <span>
                        {error}
                    </span>

                    <button
                        onClick={() =>
                            setError("")
                        }
                    >
                        ×
                    </button>

                </div>

            )}


            {/* =================================================
                MAIN GRID
            ================================================= */}

            <main className="ai-mentor-layout">


                {/* =================================================
                    RECENT CHATS
                ================================================= */}

                <aside className="ai-sidebar">

                    <div className="ai-sidebar-header">

                        <div>

                            <span className="ai-sidebar-label">
                                CONVERSATIONS
                            </span>

                            <h3>
                                Recent Chats
                            </h3>

                        </div>

                        <div className="ai-sidebar-header-actions">

                            <button
                                className="ai-sidebar-clear"
                                type="button"
                                onClick={() =>
                                    setShowClearHistory(true)
                                }
                                disabled={
                                    recentChats.length === 0 ||
                                    historyActionLoading
                                }
                                title="Delete all recent chats"
                            >
                                🗑
                            </button>

                            <button
                                className="ai-sidebar-add"
                                type="button"
                                onClick={
                                    handleNewChat
                                }
                                title="Start a new chat"
                            >
                                ＋
                            </button>

                        </div>

                    </div>


                    <div className="ai-history-list">

                        {recentChats.length === 0 ? (

                            <div className="ai-empty-history">

                                <div className="ai-empty-icon">
                                    💬
                                </div>

                                <strong>
                                    No conversations yet
                                </strong>

                                <p>
                                    Start a conversation with your AI Mentor.
                                </p>

                            </div>

                        ) : (

                            <div className="ai-recent-chat-stack">

                                {recentChats
                                    .slice(0, 12)
                                    .map(conversation => (

                                        <div
                                            key={conversation.id}
                                            className={
                                                conversation.id === activeConversationId
                                                    ? "ai-history-item-wrap active"
                                                    : "ai-history-item-wrap"
                                            }
                                        >

                                            <button
                                                type="button"
                                                className={
                                                    conversation.id === activeConversationId
                                                        ? "ai-history-item active"
                                                        : "ai-history-item"
                                                }
                                                onClick={() =>
                                                    openRecentChat(conversation)
                                                }
                                                title="Open conversation"
                                            >

                                                <div className="history-chat-icon">
                                                    💬
                                                </div>

                                                <div className="history-chat-content">

                                                    <strong>
                                                        {(conversation.title || "AI Mentor conversation").length > 48
                                                            ? (conversation.title || "AI Mentor conversation").substring(0, 48) + "..."
                                                            : conversation.title || "AI Mentor conversation"}
                                                    </strong>

                                                    <span>
                                                        {conversation.messageCount || 0} messages · AI Mentor
                                                    </span>

                                                </div>

                                            </button>

                                            <button
                                                type="button"
                                                className="ai-history-delete"
                                                title="Delete this conversation"
                                                aria-label="Delete this conversation"
                                                disabled={historyActionLoading}
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    setDeleteTarget(conversation);
                                                }}
                                            >
                                                🗑
                                            </button>

                                        </div>

                                    ))}

                            </div>

                        )}

                    </div>


                    <div className="ai-sidebar-footer">

                        <div className="ai-mentor-status">

                            <span className="status-dot"></span>

                            <div>

                                <strong>
                                    AI Mentor Online
                                </strong>

                                <small>
                                    Ready to help
                                </small>

                            </div>

                        </div>

                    </div>

                </aside>


                {/* =================================================
                    CHAT
                ================================================= */}

                <section className="ai-chat-section">


                    {/* CHAT TOP BAR */}

                    <div className="ai-chat-topbar">

                        <div className="ai-chat-identity">

                            <div className="ai-avatar-large">
                                ✦
                            </div>

                            <div>

                                <strong>
                                    AI Mentor
                                </strong>

                                <span>
                                    Personalized for your learning journey
                                </span>

                            </div>

                        </div>


                        <div className="ai-online-status">

                            <span></span>

                            Online

                        </div>

                    </div>


                    {/* CHAT MESSAGES */}

                    <div className="ai-messages">

                        {messages.length === 0 && (

                            <div className="ai-welcome">

                                <div className="ai-welcome-orb">
                                    ✦
                                </div>

                                <h2>
                                    How can I help you learn today?
                                </h2>

                                <p>
                                    Ask me anything about your roadmap,
                                    skills, coding concepts, projects,
                                    interviews or career preparation.
                                </p>


                                <div className="ai-quick-grid">

                                    {quickPrompts.map(
                                        tool => (

                                            <button
                                                key={
                                                    tool.title
                                                }
                                                className="ai-quick-card"
                                                onClick={() =>
                                                    handleTool(
                                                        tool
                                                    )
                                                }
                                            >

                                                <div className="quick-card-icon">
                                                    {tool.icon}
                                                </div>

                                                <div>

                                                    <strong>
                                                        {
                                                            tool.title
                                                        }
                                                    </strong>

                                                    <span>
                                                        {
                                                            tool.description
                                                        }
                                                    </span>

                                                </div>

                                                <span className="quick-arrow">
                                                    →
                                                </span>

                                            </button>

                                        )
                                    )}

                                </div>

                            </div>

                        )}


                        {messages.map(
                            message => (

                                <div
                                    key={message.id}
                                    id={message.id}
                                    className={
                                        message.role ===
                                        "user"
                                            ? "ai-message-row user-row"
                                            : "ai-message-row"
                                    }
                                >

                                    {message.role ===
                                        "assistant" && (

                                        <div className="ai-message-avatar">
                                            ✦
                                        </div>

                                    )}


                                    <div
                                        className={
                                            message.role ===
                                            "user"
                                                ? "ai-message user-message"
                                                : "ai-message assistant-message"
                                        }
                                    >

                                        {message.role ===
                                            "assistant"
                                            ? formatMessage(
                                                  message.content
                                              )
                                            : (
                                                <p>
                                                    {
                                                        message.content
                                                    }
                                                </p>
                                            )}

                                    </div>


                                    {message.role ===
                                        "user" && (

                                        <div className="user-message-avatar">
                                            U
                                        </div>

                                    )}

                                </div>

                            )
                        )}


                        {/* AI TYPING */}

                        {sending && (

                            <div className="ai-message-row">

                                <div className="ai-message-avatar">
                                    ✦
                                </div>

                                <div className="ai-message assistant-message ai-typing">

                                    <span></span>
                                    <span></span>
                                    <span></span>

                                    <em>
                                        AI Mentor is thinking...
                                    </em>

                                </div>

                            </div>

                        )}

                        <div
                            ref={messagesEndRef}
                        />

                    </div>


                    {/* INPUT */}

                    <div className="ai-input-area">

                        <div className="ai-input-wrapper">

                            <textarea
                                value={input}
                                onChange={
                                    event =>
                                        setInput(
                                            event.target.value
                                        )
                                }
                                onKeyDown={
                                    handleKeyDown
                                }
                                placeholder="Ask your AI Mentor anything..."
                                rows="1"
                                disabled={sending}
                            />

                            <button
                                className="ai-send-button"
                                onClick={() =>
                                    sendMessage()
                                }
                                disabled={
                                    sending ||
                                    !input.trim()
                                }
                            >
                                ➤
                            </button>

                        </div>

                        <div className="ai-input-hint">

                            <span>
                                Press Enter to send
                            </span>

                            <span>
                                AI responses are personalized to your learning context
                            </span>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    RIGHT PANEL
                ================================================= */}

                <aside className="ai-tools-panel">


                    {/* TOOLS */}

                    <div className="ai-panel-card">

                        <div className="ai-panel-heading">

                            <div>

                                <span>
                                    AI ASSISTANT
                                </span>

                                <h3>
                                    Mentor Tools
                                </h3>

                            </div>

                            <div className="panel-sparkle">
                                ✦
                            </div>

                        </div>


                        <div className="ai-tools-list">

                            {quickPrompts.map(
                                tool => (

                                    <button
                                        key={
                                            tool.title
                                        }
                                        className={
                                            selectedTool ===
                                            tool.title
                                                ? "ai-tool active"
                                                : "ai-tool"
                                        }
                                        onClick={() =>
                                            handleTool(
                                                tool
                                            )
                                        }
                                    >

                                        <div className="ai-tool-icon">
                                            {
                                                tool.icon
                                            }
                                        </div>

                                        <div className="ai-tool-text">

                                            <strong>
                                                {
                                                    tool.title
                                                }
                                            </strong>

                                            <span>
                                                {
                                                    tool.description
                                                }
                                            </span>

                                        </div>

                                        <span className="ai-tool-arrow">
                                            →
                                        </span>

                                    </button>

                                )
                            )}


                            <button
                                className={
                                    selectedTool ===
                                    "Personalized Recommendation"
                                        ? "ai-tool active"
                                        : "ai-tool"
                                }
                                onClick={
                                    handleRecommendation
                                }
                            >

                                <div className="ai-tool-icon">
                                    🚀
                                </div>

                                <div className="ai-tool-text">

                                    <strong>
                                        Personalized Recommendation
                                    </strong>

                                    <span>
                                        Know what to study next
                                    </span>

                                </div>

                                <span className="ai-tool-arrow">
                                    →
                                </span>

                            </button>

                        </div>

                    </div>


                    {/* LEARNING CONTEXT */}

                    <div className="ai-context-card">

                        <div className="ai-context-heading">

                            <div className="context-icon">
                                🧠
                            </div>

                            <div>

                                <span>
                                    PERSONALIZED
                                </span>

                                <h3>
                                    Learning Context
                                </h3>

                            </div>

                        </div>


                        <p>
                            Your AI Mentor automatically uses your
                            profile, skills, roadmap progress and
                            quiz performance to personalize responses.
                        </p>


                        <div className="context-item">

                            <span>
                                Current Profile
                            </span>

                            <strong>
                                Connected
                            </strong>

                        </div>

                        <div className="context-item">

                            <span>
                                Skills
                            </span>

                            <strong>
                                Personalized
                            </strong>

                        </div>

                        <div className="context-item">

                            <span>
                                Roadmap
                            </span>

                            <strong>
                                Synced
                            </strong>

                        </div>

                        <div className="context-item">

                            <span>
                                Quiz Performance
                            </span>

                            <strong>
                                Included
                            </strong>

                        </div>

                    </div>


                    {/* TIP */}

                    <div className="ai-tip-card">

                        <div className="tip-icon">
                            💡
                        </div>

                        <div>

                            <strong>
                                Mentor Tip
                            </strong>

                            <p>
                                Ask specific questions and include
                                your code or error when you need
                                technical help.
                            </p>

                        </div>

                    </div>

                </aside>

            </main>


            {/* =================================================
                DELETE HISTORY CONFIRMATION
                ================================================= */}

            {deleteTarget && (

                <div
                    className="ai-history-modal-backdrop"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            setDeleteTarget(null);
                        }
                    }}
                >

                    <div
                        className="ai-history-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-chat-title"
                    >

                        <div className="ai-history-modal-icon">
                            🗑
                        </div>

                        <div className="ai-history-modal-content">

                            <span className="ai-history-modal-eyebrow">
                                DELETE CONVERSATION
                            </span>

                            <h3 id="delete-chat-title">
                                Delete this chat?
                            </h3>

                            <p>
                                This conversation will be removed
                                from your Recent Chats.
                            </p>

                            <div className="ai-history-modal-preview">
                                {(
                                    deleteTarget.title ||
                                    "AI Mentor conversation"
                                ).length > 92
                                    ? (
                                        deleteTarget.title ||
                                        "AI Mentor conversation"
                                    ).substring(0, 92) + "..."
                                    : deleteTarget.title ||
                                      "AI Mentor conversation"}
                            </div>

                        </div>

                        <div className="ai-history-modal-actions">

                            <button
                                type="button"
                                className="ai-modal-cancel"
                                onClick={() =>
                                    setDeleteTarget(null)
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="ai-modal-delete"
                                onClick={() =>
                                    deleteRecentChat(
                                        deleteTarget.id
                                    )
                                }
                                disabled={
                                    historyActionLoading
                                }
                            >
                                {historyActionLoading
                                    ? "Deleting..."
                                    : "Delete Chat"}
                            </button>

                        </div>

                    </div>

                </div>

            )}


            {showClearHistory && (

                <div
                    className="ai-history-modal-backdrop"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            setShowClearHistory(false);
                        }
                    }}
                >

                    <div
                        className="ai-history-modal ai-history-modal-danger"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="clear-history-title"
                    >

                        <div className="ai-history-modal-icon danger">
                            ⚠
                        </div>

                        <div className="ai-history-modal-content">

                            <span className="ai-history-modal-eyebrow">
                                CLEAR RECENT CHATS
                            </span>

                            <h3 id="clear-history-title">
                                Delete all recent chats?
                            </h3>

                            <p>
                                This will clear all saved Recent Chats
                                from this browser. Your current AI
                                Mentor screen will also be reset.
                            </p>

                        </div>

                        <div className="ai-history-modal-actions">

                            <button
                                type="button"
                                className="ai-modal-cancel"
                                onClick={() =>
                                    setShowClearHistory(false)
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="ai-modal-delete"
                                onClick={
                                    clearAllRecentChats
                                }
                                disabled={
                                    historyActionLoading
                                }
                            >
                                {historyActionLoading
                                    ? "Clearing..."
                                    : "Clear All"}
                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* =================================================
                FULL-VIEW RESPONSIVE UI OVERRIDES
                -------------------------------------------------
                The existing AIMentor.css remains untouched.
                These scoped rules make the mentor use the full
                available laptop viewport and keep the three-panel
                workspace responsive.
                ================================================= */}

            <style>{`
                .ai-mentor-page {
                    width: 100% !important;
                    max-width: none !important;
                    min-width: 0 !important;
                    min-height: 100vh !important;
                    height: 100vh !important;
                    height: 100dvh !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    box-sizing: border-box !important;
                    overflow: hidden !important;
                    display: flex !important;
                    flex-direction: column !important;
                }

                .ai-mentor-page *,
                .ai-mentor-page *::before,
                .ai-mentor-page *::after {
                    box-sizing: border-box;
                }

                .ai-mentor-header {
                    width: 100% !important;
                    max-width: none !important;
                    flex: 0 0 auto !important;
                    min-height: 78px !important;
                    padding: 18px clamp(18px, 2.2vw, 34px) !important;
                }

                .ai-mentor-layout {
                    width: 100% !important;
                    max-width: none !important;
                    min-width: 0 !important;
                    flex: 1 1 auto !important;
                    min-height: 0 !important;
                    height: auto !important;
                    display: grid !important;
                    grid-template-columns:
                        minmax(240px, 280px)
                        minmax(0, 1fr)
                        minmax(260px, 320px) !important;
                    gap: clamp(10px, 1vw, 16px) !important;
                    padding: 0 clamp(12px, 1.5vw, 24px) clamp(12px, 1.2vw, 18px) !important;
                    overflow: hidden !important;
                }

                .ai-sidebar,
                .ai-chat-section,
                .ai-tools-panel {
                    min-width: 0 !important;
                    min-height: 0 !important;
                    height: 100% !important;
                    max-height: none !important;
                }

                .ai-sidebar {
                    display: flex !important;
                    flex-direction: column !important;
                    overflow: hidden !important;
                }

                .ai-history-list {
                    flex: 1 1 auto !important;
                    min-height: 0 !important;
                    overflow-y: auto !important;
                    overflow-x: hidden !important;
                    scrollbar-width: thin;
                }

                .ai-recent-chat-stack {
                    width: 100% !important;
                    display: flex !important;
                    flex-direction: column !important;
                    gap: 7px !important;
                }

                .ai-history-item-wrap {
                    position: relative !important;
                    display: grid !important;
                    grid-template-columns: minmax(0, 1fr) 34px !important;
                    align-items: stretch !important;
                    width: 100% !important;
                    min-width: 0 !important;
                    border-radius: 14px !important;
                    transition:
                        background .18s ease,
                        transform .18s ease,
                        box-shadow .18s ease !important;
                }

                .ai-history-item-wrap:hover {
                    background: rgba(91, 76, 255, .055) !important;
                }

                .ai-history-item-wrap.active {
                    background: rgba(91, 76, 255, .075) !important;
                }

                .ai-history-item {
                    width: 100% !important;
                    min-width: 0 !important;
                    overflow: hidden !important;
                }

                .ai-history-delete {
                    width: 30px !important;
                    height: 30px !important;
                    align-self: center !important;
                    justify-self: center !important;
                    border: 0 !important;
                    border-radius: 9px !important;
                    background: transparent !important;
                    color: #8b92a7 !important;
                    cursor: pointer !important;
                    opacity: 0 !important;
                    transform: translateX(3px) !important;
                    transition:
                        opacity .18s ease,
                        background .18s ease,
                        color .18s ease,
                        transform .18s ease !important;
                    z-index: 4 !important;
                }

                .ai-history-item-wrap:hover .ai-history-delete,
                .ai-history-item-wrap.active .ai-history-delete,
                .ai-history-delete:focus-visible {
                    opacity: 1 !important;
                    transform: translateX(0) !important;
                }

                .ai-history-delete:hover {
                    background: rgba(239, 68, 68, .11) !important;
                    color: #dc2626 !important;
                }

                .ai-history-delete:disabled {
                    cursor: not-allowed !important;
                    opacity: .45 !important;
                }

                .ai-sidebar-header {
                    flex: 0 0 auto !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: space-between !important;
                    gap: 10px !important;
                }

                .ai-sidebar-header-actions {
                    display: flex !important;
                    align-items: center !important;
                    gap: 7px !important;
                }

                .ai-sidebar-clear,
                .ai-sidebar-add {
                    flex: 0 0 auto !important;
                }

                .ai-sidebar-clear {
                    width: 34px !important;
                    height: 34px !important;
                    display: inline-flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    border: 1px solid rgba(31, 41, 55, .08) !important;
                    border-radius: 10px !important;
                    background: rgba(255, 255, 255, .8) !important;
                    color: #737b91 !important;
                    cursor: pointer !important;
                    transition:
                        background .18s ease,
                        color .18s ease,
                        border-color .18s ease,
                        transform .18s ease !important;
                }

                .ai-sidebar-clear:hover:not(:disabled) {
                    background: rgba(239, 68, 68, .08) !important;
                    color: #dc2626 !important;
                    border-color: rgba(239, 68, 68, .18) !important;
                    transform: translateY(-1px) !important;
                }

                .ai-sidebar-clear:disabled {
                    opacity: .38 !important;
                    cursor: not-allowed !important;
                }

                .ai-chat-section {
                    display: flex !important;
                    flex-direction: column !important;
                    overflow: hidden !important;
                    min-height: 0 !important;
                }

                .ai-chat-topbar {
                    flex: 0 0 auto !important;
                    min-width: 0 !important;
                }

                .ai-messages {
                    flex: 1 1 auto !important;
                    min-height: 0 !important;
                    height: auto !important;
                    overflow-y: auto !important;
                    overflow-x: hidden !important;
                    scroll-behavior: smooth !important;
                    padding: clamp(16px, 2vw, 30px) !important;
                    overscroll-behavior: contain !important;
                }

                .ai-message-row {
                    width: 100% !important;
                    min-width: 0 !important;
                }

                .ai-message,
                .assistant-message,
                .user-message {
                    min-width: 0 !important;
                    max-width: min(86%, 900px) !important;
                    overflow-wrap: anywhere !important;
                    word-break: break-word !important;
                }

                .ai-message pre,
                .ai-message code,
                .ai-response-code {
                    max-width: 100% !important;
                }

                .ai-input-area {
                    flex: 0 0 auto !important;
                    width: 100% !important;
                }

                .ai-input-wrapper {
                    width: 100% !important;
                    min-width: 0 !important;
                }

                .ai-input-wrapper textarea {
                    min-width: 0 !important;
                    resize: none !important;
                }

                .ai-tools-panel {
                    display: flex !important;
                    flex-direction: column !important;
                    gap: 12px !important;
                    overflow-y: auto !important;
                    overflow-x: hidden !important;
                    scrollbar-width: thin;
                }

                .ai-tools-panel > * {
                    flex: 0 0 auto !important;
                }

                .ai-history-modal-backdrop {
                    position: fixed !important;
                    inset: 0 !important;
                    z-index: 99999 !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    padding: 20px !important;
                    background: rgba(15, 23, 42, .44) !important;
                    backdrop-filter: blur(8px) !important;
                    -webkit-backdrop-filter: blur(8px) !important;
                }

                .ai-history-modal {
                    width: min(460px, 100%) !important;
                    border: 1px solid rgba(255,255,255,.72) !important;
                    border-radius: 22px !important;
                    padding: 25px !important;
                    background: rgba(255,255,255,.96) !important;
                    box-shadow:
                        0 30px 80px rgba(15,23,42,.22),
                        0 8px 24px rgba(15,23,42,.09) !important;
                    display: grid !important;
                    grid-template-columns: 52px minmax(0, 1fr) !important;
                    gap: 14px !important;
                    animation: aiHistoryModalIn .2s ease-out both !important;
                }

                .ai-history-modal-icon {
                    width: 52px !important;
                    height: 52px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    border-radius: 15px !important;
                    background: rgba(99, 102, 241, .11) !important;
                    font-size: 21px !important;
                }

                .ai-history-modal-icon.danger {
                    background: rgba(239, 68, 68, .10) !important;
                }

                .ai-history-modal-content {
                    min-width: 0 !important;
                }

                .ai-history-modal-eyebrow {
                    display: block !important;
                    margin-bottom: 5px !important;
                    font-size: 10px !important;
                    font-weight: 800 !important;
                    letter-spacing: .13em !important;
                    color: #8a91a5 !important;
                }

                .ai-history-modal-content h3 {
                    margin: 0 0 7px !important;
                    font-size: 20px !important;
                    line-height: 1.2 !important;
                    color: #1f2937 !important;
                }

                .ai-history-modal-content p {
                    margin: 0 !important;
                    font-size: 13px !important;
                    line-height: 1.55 !important;
                    color: #737b8f !important;
                }

                .ai-history-modal-preview {
                    margin-top: 12px !important;
                    padding: 11px 12px !important;
                    border-radius: 11px !important;
                    background: #f7f8fc !important;
                    color: #596174 !important;
                    font-size: 12px !important;
                    line-height: 1.45 !important;
                    overflow-wrap: anywhere !important;
                }

                .ai-history-modal-actions {
                    grid-column: 1 / -1 !important;
                    display: flex !important;
                    justify-content: flex-end !important;
                    gap: 9px !important;
                    margin-top: 4px !important;
                }

                .ai-modal-cancel,
                .ai-modal-delete {
                    min-height: 40px !important;
                    padding: 0 16px !important;
                    border-radius: 11px !important;
                    border: 1px solid rgba(31,41,55,.09) !important;
                    font-weight: 700 !important;
                    cursor: pointer !important;
                    transition:
                        transform .18s ease,
                        box-shadow .18s ease,
                        background .18s ease !important;
                }

                .ai-modal-cancel {
                    background: #fff !important;
                    color: #5f6678 !important;
                }

                .ai-modal-cancel:hover {
                    background: #f7f8fb !important;
                    transform: translateY(-1px) !important;
                }

                .ai-modal-delete {
                    border-color: transparent !important;
                    background: linear-gradient(135deg, #ef4444, #dc2626) !important;
                    color: #fff !important;
                    box-shadow: 0 8px 18px rgba(220,38,38,.18) !important;
                }

                .ai-modal-delete:hover:not(:disabled) {
                    transform: translateY(-1px) !important;
                    box-shadow: 0 11px 24px rgba(220,38,38,.25) !important;
                }

                .ai-modal-delete:disabled {
                    opacity: .6 !important;
                    cursor: wait !important;
                }

                @keyframes aiHistoryModalIn {
                    from {
                        opacity: 0;
                        transform: translateY(8px) scale(.98);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                @media (max-width: 1180px) {
                    .ai-mentor-layout {
                        grid-template-columns:
                            minmax(220px, 250px)
                            minmax(0, 1fr)
                            minmax(230px, 270px) !important;
                    }
                }

                @media (max-width: 980px) {
                    .ai-mentor-page {
                        height: auto !important;
                        min-height: 100dvh !important;
                        overflow: visible !important;
                    }

                    .ai-mentor-layout {
                        height: auto !important;
                        min-height: calc(100dvh - 78px) !important;
                        grid-template-columns:
                            minmax(210px, 240px)
                            minmax(0, 1fr) !important;
                        overflow: visible !important;
                    }

                    .ai-tools-panel {
                        display: none !important;
                    }

                    .ai-chat-section {
                        min-height: calc(100dvh - 100px) !important;
                        height: calc(100dvh - 100px) !important;
                    }
                }

                @media (max-width: 720px) {
                    .ai-mentor-header {
                        min-height: 68px !important;
                        padding: 12px 14px !important;
                    }

                    .ai-header-title p {
                        display: none !important;
                    }

                    .ai-mentor-layout {
                        display: block !important;
                        padding: 0 10px 10px !important;
                    }

                    .ai-sidebar {
                        display: none !important;
                    }

                    .ai-chat-section {
                        width: 100% !important;
                        min-height: calc(100dvh - 78px) !important;
                        height: calc(100dvh - 78px) !important;
                    }

                    .ai-message,
                    .assistant-message,
                    .user-message {
                        max-width: 92% !important;
                    }

                    .ai-history-modal {
                        padding: 20px !important;
                        border-radius: 18px !important;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .ai-history-modal {
                        animation: none !important;
                    }

                    .ai-history-delete,
                    .ai-sidebar-clear,
                    .ai-modal-cancel,
                    .ai-modal-delete {
                        transition: none !important;
                    }
                }
            `}</style>

        </div>

    );

}

export default AIMentor;