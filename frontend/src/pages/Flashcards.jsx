import React, { useCallback, useEffect, useMemo, useState } from "react";
import api from "../services/api";
import "./Flashcards.css";

const Flashcards = () => {
    const [topics, setTopics] = useState([]);
    const [cards, setCards] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState("ALL");
    const [difficulty, setDifficulty] = useState("ALL");
    const [search, setSearch] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [revealed, setRevealed] = useState(false);
    const [progress, setProgress] = useState({});
    const [loadingTopics, setLoadingTopics] = useState(true);
    const [loadingCards, setLoadingCards] = useState(false);
    const [error, setError] = useState("");
    const [shuffle, setShuffle] = useState(false);
    const [shuffleSeed, setShuffleSeed] = useState(0);

    // AI flashcard generator state
    const [generating, setGenerating] = useState(false);
    const [generationTopic, setGenerationTopic] = useState("Java");
    const [generationDifficulty, setGenerationDifficulty] = useState("MEDIUM");
    const [generationCount, setGenerationCount] = useState(10);
    const [generationMessage, setGenerationMessage] = useState("");
    const [generationError, setGenerationError] = useState("");

    const loadProgress = useCallback(async () => {
        try {
            const response = await api.get("/flashcards/progress");
            setProgress(response.data || {});
        } catch (err) {
            console.warn("Flashcard progress could not be loaded.", err);
        }
    }, []);

    const loadTopics = useCallback(async () => {
        setLoadingTopics(true);
        try {
            const response = await api.get("/flashcards/topics");
            setTopics(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error("Unable to load flashcard topics:", err);
            setError("Unable to load topics. Check your backend connection.");
        } finally {
            setLoadingTopics(false);
        }
    }, []);

    const loadCards = useCallback(async () => {
        setLoadingCards(true);
        setError("");
        setCurrentIndex(0);
        setRevealed(false);

        try {
            const params = {};
            if (selectedTopic !== "ALL") params.topic = selectedTopic;
            if (difficulty !== "ALL") params.difficulty = difficulty;
            if (search.trim()) params.search = search.trim();

            const response = await api.get("/flashcards", { params });
            setCards(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error("Unable to load flashcards:", err);
            setCards([]);
            setError("Unable to load flashcards. Please try again.");
        } finally {
            setLoadingCards(false);
        }
    }, [selectedTopic, difficulty, search]);

    useEffect(() => {
        loadTopics();
        loadProgress();
    }, [loadTopics, loadProgress]);

    useEffect(() => {
        const timer = window.setTimeout(loadCards, 250);
        return () => window.clearTimeout(timer);
    }, [loadCards]);

    const masteredCount = Object.values(progress).filter(
        value => value === "GOT_IT"
    ).length;

    const revisionCount = Object.values(progress).filter(
        value => value === "NEED_REVISION" || value === "DIFFICULT"
    ).length;

    const filteredTopics = useMemo(
        () => topics.filter(topic =>
            typeof topic === "string" || (topic && (topic.name || topic.topic))
        ),
        [topics]
    );

    const getTopicName = topic =>
        typeof topic === "string" ? topic : topic.name || topic.topic;

    const goToCard = index => {
        if (!displayedCards.length) return;
        const nextIndex = (index + displayedCards.length) % displayedCards.length;
        setCurrentIndex(nextIndex);
        setRevealed(false);
    };

    const handleGenerateFlashcards = async event => {
        event.preventDefault();
        const topic = generationTopic.trim();

        if (!topic) {
            setGenerationError("Please enter a topic.");
            setGenerationMessage("");
            return;
        }

        setGenerating(true);
        setGenerationError("");
        setGenerationMessage("");

        try {
            const response = await api.post("/flashcards/generate", {
                topic,
                difficulty: generationDifficulty,
                count: Number(generationCount)
            });

            const generatedCards = Array.isArray(response.data) ? response.data : [];
            if (!generatedCards.length) {
                setGenerationError("The AI did not return any flashcards. Please try again.");
                return;
            }

            // Display the generated cards immediately; they are also saved by the backend.
            setCards(generatedCards);
            setSelectedTopic("ALL");
            setDifficulty("ALL");
            setSearch("");
            setCurrentIndex(0);
            setRevealed(false);
            setShuffle(false);
            setGenerationMessage(`${generatedCards.length} flashcards generated and saved successfully.`);

            await Promise.all([loadTopics(), loadProgress()]);
        } catch (err) {
            console.error("Flashcard generation failed:", err);
            setGenerationError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Unable to generate flashcards. Check your login, backend, and Gemini configuration."
            );
        } finally {
            setGenerating(false);
        }
    };

    const handleRating = async rating => {
        const activeCard = displayedCards[currentIndex];
        if (!activeCard) return;

        const cardId = activeCard.id;
        try {
            await api.post(`/flashcards/${cardId}/progress`, { status: rating });
            setProgress(previous => ({ ...previous, [cardId]: rating }));
        } catch (err) {
            console.error("Unable to save flashcard progress:", err);
            setError("Your revision status could not be saved.");
        }
    };

    const handleShuffle = () => {
        setShuffle(previous => !previous);
        setShuffleSeed(previous => previous + 1);
        setCurrentIndex(0);
        setRevealed(false);
    };

    const displayedCards = useMemo(() => {
        if (!shuffle) return cards;
        const result = [...cards];
        result.sort((a, b) => {
            const aValue = (Number(a.id) * 17 + shuffleSeed * 31) % 101;
            const bValue = (Number(b.id) * 17 + shuffleSeed * 31) % 101;
            return aValue - bValue;
        });
        return result;
    }, [cards, shuffle, shuffleSeed]);

    const activeCard = displayedCards[currentIndex];

    return (
        <main className="flashcards-page">
            <div className="flashcards-container">
                <header className="flashcards-header">
                    <div>
                        <span className="flashcards-eyebrow">AI MENTOR WORKSPACE</span>
                        <h1>Flashcards<span className="flashcards-title-sparkle">✦</span></h1>
                        <p>Revise concepts, strengthen your understanding, and track your learning progress.</p>
                    </div>
                    <button className="flashcards-secondary-btn" type="button" onClick={handleShuffle} disabled={!cards.length}>
                        <span>⤨</span>{shuffle ? "Shuffle enabled" : "Shuffle cards"}
                    </button>
                </header>

                <section className="flashcards-hero">
                    <div className="flashcards-hero-content">
                        <span className="flashcards-hero-label">YOUR PERSONAL REVISION SPACE</span>
                        <h2>Learn actively.<br />Remember better.</h2>
                        <p>Choose a topic, test your understanding, reveal answers, and review difficult concepts.</p>
                        <button type="button" onClick={() => document.getElementById("flashcard-study-area")?.scrollIntoView({ behavior: "smooth", block: "start" })}>
                            Start revising <span>→</span>
                        </button>
                    </div>
                    <div className="flashcards-hero-visual" aria-hidden="true">
                        <div className="flashcards-visual-orbit" />
                        <div className="flashcards-visual-card back"><span>?</span></div>
                        <div className="flashcards-visual-card front">
                            <span className="visual-sparkle">✦</span>
                            <strong>Recall</strong>
                            <small>Understand · Practice · Improve</small>
                        </div>
                    </div>
                </section>

                <section className="flashcards-stats">
                    <article className="flashcards-stat-card"><span className="flashcards-stat-icon purple">▤</span><div><span>Total Cards</span><strong>{cards.length}</strong><small>Current selection</small></div></article>
                    <article className="flashcards-stat-card"><span className="flashcards-stat-icon green">✓</span><div><span>Mastered</span><strong>{masteredCount}</strong><small>Marked as known</small></div></article>
                    <article className="flashcards-stat-card"><span className="flashcards-stat-icon orange">↻</span><div><span>Need Revision</span><strong>{revisionCount}</strong><small>Review these again</small></div></article>
                    <article className="flashcards-stat-card"><span className="flashcards-stat-icon blue">◷</span><div><span>Current Progress</span><strong>{displayedCards.length ? Math.round(((currentIndex + 1) / displayedCards.length) * 100) : 0}%</strong><small>Cards navigated</small></div></article>
                </section>

                <section className="flashcards-workspace" id="flashcard-study-area">
                    <div className="flashcards-section-heading">
                        <div>
                            <span className="flashcards-eyebrow">ACTIVE LEARNING</span>
                            <h2>Study your flashcards</h2>
                            <p>Select a topic, generate cards with AI, and begin your revision session.</p>
                        </div>
                    </div>

                    {/* AI FLASHCARD GENERATOR */}
                    <form className="flashcards-generator" onSubmit={handleGenerateFlashcards}>
                        <div className="flashcards-generator-heading">
                            <div>
                                <span className="flashcards-eyebrow">AI POWERED LEARNING</span>
                                <h3>Generate Flashcards</h3>
                                <p>Create personalized revision cards for any topic.</p>
                            </div>
                            <span className="flashcards-generator-icon" aria-hidden="true">✦</span>
                        </div>

                        <div className="flashcards-generator-controls">
                            <label className="flashcards-generator-topic">
                                Topic
                                <input
                                    type="text"
                                    value={generationTopic}
                                    onChange={event => setGenerationTopic(event.target.value)}
                                    placeholder="e.g. Java, Spring Boot, DBMS"
                                    maxLength={150}
                                    disabled={generating}
                                    required
                                />
                            </label>

                            <label>
                                Difficulty
                                <select value={generationDifficulty} onChange={event => setGenerationDifficulty(event.target.value)} disabled={generating}>
                                    <option value="EASY">Easy</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HARD">Hard</option>
                                </select>
                            </label>

                            <label>
                                Number of cards
                                <select value={generationCount} onChange={event => setGenerationCount(Number(event.target.value))} disabled={generating}>
                                    <option value={5}>5 Cards</option>
                                    <option value={10}>10 Cards</option>
                                    <option value={15}>15 Cards</option>
                                    <option value={20}>20 Cards</option>
                                    <option value={30}>30 Cards</option>
                                </select>
                            </label>

                            <button type="submit" disabled={generating || !generationTopic.trim()}>
                                {generating ? <><span className="flashcards-button-spinner" />Generating...</> : "✦ Generate Cards"}
                            </button>
                        </div>

                        {generating && <div className="flashcards-generation-progress"><span />AI is preparing your questions and answers. This may take a little while.</div>}
                        {generationMessage && <p className="flashcards-generation-message success" role="status">{generationMessage}</p>}
                        {generationError && <p className="flashcards-generation-message error" role="alert">{generationError}</p>}
                    </form>

                    <div className="flashcards-filters">
                        <div className="flashcards-topic-tabs">
                            <button type="button" className={selectedTopic === "ALL" ? "active" : ""} onClick={() => setSelectedTopic("ALL")}>All Topics</button>
                            {filteredTopics.map(topic => {
                                const name = getTopicName(topic);
                                return <button type="button" key={name} className={selectedTopic === name ? "active" : ""} onClick={() => setSelectedTopic(name)}>{name}</button>;
                            })}
                        </div>
                        <div className="flashcards-filter-controls">
                            <label className="flashcards-search"><span>⌕</span><input type="search" value={search} placeholder="Search flashcards..." onChange={event => setSearch(event.target.value)} /></label>
                            <select value={difficulty} onChange={event => setDifficulty(event.target.value)} aria-label="Filter by difficulty">
                                <option value="ALL">All Levels</option><option value="EASY">Easy</option><option value="MEDIUM">Medium</option><option value="HARD">Hard</option>
                            </select>
                        </div>
                    </div>

                    {loadingTopics || loadingCards ? (
                        <div className="flashcards-state"><div className="flashcards-loader" /><h3>Preparing your study session</h3><p>Loading topics and flashcards from your learning database.</p></div>
                    ) : error ? (
                        <div className="flashcards-state"><span className="flashcards-state-icon">!</span><h3>Unable to load flashcards</h3><p>{error}</p><button type="button" onClick={() => { loadTopics(); loadCards(); loadProgress(); }}>Try again</button></div>
                    ) : !activeCard ? (
                        <div className="flashcards-state"><span className="flashcards-state-icon">⌕</span><h3>No flashcards available</h3><p>No cards match the selected filters. Generate cards above, or try another topic or search term.</p><button type="button" onClick={() => { setSelectedTopic("ALL"); setDifficulty("ALL"); setSearch(""); }}>Clear filters</button></div>
                    ) : (
                        <div className="flashcards-study-layout">
                            <div className="flashcards-study-main">
                                <div className="flashcards-card-meta">
                                    <span>CARD {currentIndex + 1}<small> / {displayedCards.length}</small></span>
                                    <div>
                                        <span className="flashcards-topic-badge">{activeCard.topicName || activeCard.topic || selectedTopic}</span>
                                        {activeCard.difficulty && <span className={`flashcards-level ${activeCard.difficulty.toLowerCase()}`}>{activeCard.difficulty}</span>}
                                    </div>
                                </div>

                                <article className={`flashcards-question-card ${revealed ? "revealed" : ""}`}>
                                    <div className="flashcards-question-content">
                                        <span>{revealed ? "ANSWER" : "QUESTION"}</span>
                                        <h3>{revealed ? activeCard.answer : activeCard.question}</h3>
                                        {!revealed && <p>Think about your answer before revealing the solution.</p>}
                                    </div>
                                    <div className="flashcards-card-footer"><span><i />Active recall</span><span>{revealed ? "Answer revealed" : "Try to answer first"}</span></div>
                                </article>

                                <button type="button" className="flashcards-reveal-btn" onClick={() => setRevealed(value => !value)}><span>{revealed ? "↶" : "✧"}</span>{revealed ? "Show Question" : "Reveal Answer"}</button>

                                {revealed && <div className="flashcards-rating">
                                    <p>How well did you know this?</p>
                                    <div>
                                        <button type="button" onClick={() => handleRating("NEED_REVISION")}>↻ Need Revision</button>
                                        <button type="button" onClick={() => handleRating("DIFFICULT")}>◐ Difficult</button>
                                        <button type="button" onClick={() => handleRating("GOT_IT")}>✓ Got It</button>
                                    </div>
                                </div>}

                                <div className="flashcards-navigation">
                                    <button type="button" onClick={() => goToCard(currentIndex - 1)}>← Previous</button>
                                    <span>{currentIndex + 1} of {displayedCards.length}</span>
                                    <button type="button" className="next" onClick={() => goToCard(currentIndex + 1)}>Next Card →</button>
                                </div>
                            </div>

                            <aside className="flashcards-side-panel">
                                <div className="flashcards-side-heading"><span>✦</span><div><strong>Study Session</strong><small>Your revision overview</small></div></div>
                                <div className="flashcards-session-progress">
                                    <div><span>Session progress</span><strong>{Math.round(((currentIndex + 1) / displayedCards.length) * 100)}%</strong></div>
                                    <div className="flashcards-progress-track"><span style={{ width: `${((currentIndex + 1) / displayedCards.length) * 100}%` }} /></div>
                                </div>
                                <div className="flashcards-side-divider" />
                                <h3>Revision guide</h3>
                                <div className="flashcards-guide-item"><span className="green">✓</span><div><strong>Got It</strong><small>You understand the concept.</small></div></div>
                                <div className="flashcards-guide-item"><span className="orange">↻</span><div><strong>Need Revision</strong><small>Revisit this concept later.</small></div></div>
                                <div className="flashcards-guide-item"><span className="purple">◐</span><div><strong>Difficult</strong><small>Spend more time learning it.</small></div></div>
                                <div className="flashcards-tip"><span>💡</span><p><strong>Learning tip</strong><br />Try recalling the answer before revealing it. This helps you test your understanding.</p></div>
                            </aside>
                        </div>
                    )}
                </section>

                <footer className="flashcards-footer"><span>✦ AI Mentor · Flashcards</span><span>Learn consistently. Improve continuously.</span></footer>
            </div>
        </main>
    );
};

export default Flashcards;
