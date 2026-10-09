import { useEffect, useMemo, useState } from "react";
import "./Projects.css";

const API_BASE =
    import.meta.env.VITE_API_URL || "http://localhost:8080";

const EMPTY_FORM = {
    title: "",
    description: "",
    category: "",
    status: "PLANNED",
    priority: "MEDIUM",
    progress: 0,
    githubUrl: "",
    liveUrl: "",
    startDate: "",
    deadline: "",
};

function Icon({ name, size = 20 }) {
    const paths = {
        folder: (
            <>
                <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H9l2 2h7.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5z" />
            </>
        ),
        plus: (
            <>
                <path d="M12 5v14M5 12h14" />
            </>
        ),
        search: (
            <>
                <circle cx="11" cy="11" r="6.5" />
                <path d="m16 16 4 4" />
            </>
        ),
        filter: (
            <>
                <path d="M4 6h16M7 12h10M10 18h4" />
            </>
        ),
        calendar: (
            <>
                <rect x="3.5" y="5" width="17" height="15" rx="2" />
                <path d="M7 3v4M17 3v4M3.5 9h17" />
            </>
        ),
        github: (
            <>
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3.3-.4 6.7-1.6 6.7-7A5.5 5.5 0 0 0 19.2 4c.1-1-.3-2-1-2.7 0 0-1.2-.4-4 1.5a13.7 13.7 0 0 0-7.4 0C4 1 2.8 1.3 2.8 1.3A5.5 5.5 0 0 0 1.8 4a5.5 5.5 0 0 0-1.5 3.8c0 5.4 3.4 6.6 6.7 7A4.8 4.8 0 0 0 6 18v4" />
                <path d="M6 18c-1 .5-2.5 0-3-1" />
            </>
        ),
        external: (
            <>
                <path d="M14 4h6v6M20 4l-9 9" />
                <path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" />
            </>
        ),
        trash: (
            <>
                <path d="M4 7h16M10 11v5M14 11v5" />
                <path d="M6 7l1 13h10l1-13M9 7V4h6v3" />
            </>
        ),
        edit: (
            <>
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z" />
            </>
        ),
        chart: (
            <>
                <path d="M4 19V5M4 19h17" />
                <path d="m7 15 4-5 3 3 5-7" />
            </>
        ),
        check: (
            <>
                <path d="m5 12 4 4L19 6" />
            </>
        ),
        briefcase: (
            <>
                <rect x="3" y="7" width="18" height="13" rx="2" />
                <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" />
            </>
        ),
        close: (
            <>
                <path d="m6 6 12 12M18 6 6 18" />
            </>
        ),
        download: (
            <>
                <path d="M12 3v12M7 10l5 5 5-5M4 21h16" />
            </>
        ),
    };

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {paths[name]}
        </svg>
    );
}

function formatStatus(status) {
    if (!status) return "Unknown";

    return status
        .toLowerCase()
        .replaceAll("_", " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(date) {
    if (!date) return "No date";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return date;

    return parsed.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function Projects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [activeTab, setActiveTab] = useState("ALL");
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("ALL");
    const [priority, setPriority] = useState("ALL");
    const [sort, setSort] = useState("LATEST");
    const [view, setView] = useState("GRID");

    const [showModal, setShowModal] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);

    const token = localStorage.getItem("token");

    const request = async (url, options = {}) => {
        const headers = {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(
            `${API_BASE}${url}`,
            {
                ...options,
                headers,
            }
        );

        if (response.status === 401) {
            throw new Error(
                "Your session has expired. Please login again."
            );
        }

        if (!response.ok) {
            let message = "Something went wrong.";

            try {
                const data = await response.json();
                message =
                    data.message ||
                    data.error ||
                    message;
            } catch {
                // ignore invalid JSON
            }

            throw new Error(message);
        }

        if (response.status === 204) {
            return null;
        }

        return response.json();
    };

    const loadProjects = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await request("/api/projects/me");

            setProjects(
                Array.isArray(data)
                    ? data
                    : []
            );
        } catch (err) {
            console.error("Projects loading error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProjects();
    }, []);

    /* =========================
       DYNAMIC STATS
    ========================= */

    const stats = useMemo(() => {
        const total = projects.length;

        const active = projects.filter(
            (project) =>
                project.status === "IN_PROGRESS"
        ).length;

        const completed = projects.filter(
            (project) =>
                project.status === "COMPLETED"
        ).length;

        const average =
            total === 0
                ? 0
                : Math.round(
                      projects.reduce(
                          (sum, project) =>
                              sum +
                              Number(
                                  project.progress || 0
                              ),
                          0
                      ) / total
                  );

        return {
            total,
            active,
            completed,
            average,
        };
    }, [projects]);

    /* =========================
       DYNAMIC FILTER OPTIONS
    ========================= */

    const categories = useMemo(() => {
        return [
            ...new Set(
                projects
                    .map((project) => project.category)
                    .filter(Boolean)
            ),
        ].sort();
    }, [projects]);

    const priorities = useMemo(() => {
        return [
            ...new Set(
                projects
                    .map((project) => project.priority)
                    .filter(Boolean)
            ),
        ];
    }, [projects]);

    /* =========================
       FILTER + SEARCH + SORT
    ========================= */

    const filteredProjects = useMemo(() => {
        let result = [...projects];

        if (activeTab !== "ALL") {
            result = result.filter(
                (project) =>
                    project.status === activeTab
            );
        }

        if (category !== "ALL") {
            result = result.filter(
                (project) =>
                    project.category === category
            );
        }

        if (priority !== "ALL") {
            result = result.filter(
                (project) =>
                    project.priority === priority
            );
        }

        if (search.trim()) {
            const query =
                search.toLowerCase();

            result = result.filter(
                (project) =>
                    project.title
                        ?.toLowerCase()
                        .includes(query) ||
                    project.description
                        ?.toLowerCase()
                        .includes(query) ||
                    project.category
                        ?.toLowerCase()
                        .includes(query)
            );
        }

        if (sort === "LATEST") {
            result.sort(
                (a, b) =>
                    new Date(
                        b.createdAt || 0
                    ) -
                    new Date(
                        a.createdAt || 0
                    )
            );
        }

        if (sort === "OLDEST") {
            result.sort(
                (a, b) =>
                    new Date(
                        a.createdAt || 0
                    ) -
                    new Date(
                        b.createdAt || 0
                    )
            );
        }

        if (sort === "PROGRESS_HIGH") {
            result.sort(
                (a, b) =>
                    Number(b.progress || 0) -
                    Number(a.progress || 0)
            );
        }

        if (sort === "PROGRESS_LOW") {
            result.sort(
                (a, b) =>
                    Number(a.progress || 0) -
                    Number(b.progress || 0)
            );
        }

        return result;
    }, [
        projects,
        activeTab,
        category,
        priority,
        search,
        sort,
    ]);

    /* =========================
       MODAL
    ========================= */

    const openCreateModal = () => {
        setEditingProject(null);

        setForm({
            ...EMPTY_FORM,
            category:
                categories.length > 0
                    ? categories[0]
                    : "",
        });

        setShowModal(true);
    };

    const openEditModal = (project) => {
        setEditingProject(project);

        setForm({
            title: project.title || "",
            description:
                project.description || "",
            category:
                project.category || "",
            status:
                project.status || "PLANNED",
            priority:
                project.priority || "MEDIUM",
            progress:
                project.progress ?? 0,
            githubUrl:
                project.githubUrl || "",
            liveUrl:
                project.liveUrl || "",
            startDate:
                project.startDate || "",
            deadline:
                project.deadline || "",
        });

        setShowModal(true);
    };

    const closeModal = () => {
        if (saving) return;

        setShowModal(false);
        setEditingProject(null);
        setForm(EMPTY_FORM);
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]:
                name === "progress"
                    ? Number(value)
                    : value,
        }));
    };

    /* =========================
       CREATE / UPDATE
    ========================= */

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!form.title.trim()) {
            setError("Project title is required.");
            return;
        }

        if (!form.category || !form.category.trim()) {
            setError("Project category is required. Please enter a category such as Web Development.");
            return;
        }

        try {
            setSaving(true);
            setError("");

            const payload = {
                ...form,
                title: form.title.trim(),
                description: form.description.trim(),
                category: form.category.trim(),
                progress: Number(form.progress || 0),
            };

            if (editingProject) {
                const updated =
                    await request(
                        `/api/projects/${editingProject.id}`,
                        {
                            method: "PUT",
                            body: JSON.stringify(
                                payload
                            ),
                        }
                    );

                setProjects((previous) =>
                    previous.map((project) =>
                        project.id ===
                        editingProject.id
                            ? updated
                            : project
                    )
                );
            } else {
                const created =
                    await request(
                        "/api/projects",
                        {
                            method: "POST",
                            body: JSON.stringify(
                                payload
                            ),
                        }
                    );

                setProjects((previous) => [
                    created,
                    ...previous,
                ]);
            }

            closeModal();
        } catch (err) {
            console.error(
                "Project save error:",
                err
            );
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    /* =========================
       DELETE
    ========================= */

    const handleDelete = async (project) => {
        const confirmed = window.confirm(
            `Delete "${project.title}"?`
        );

        if (!confirmed) return;

        try {
            setError("");

            await request(
                `/api/projects/${project.id}`,
                {
                    method: "DELETE",
                }
            );

            setProjects((previous) =>
                previous.filter(
                    (item) =>
                        item.id !== project.id
                )
            );
        } catch (err) {
            console.error(
                "Project delete error:",
                err
            );
            setError(err.message);
        }
    };

    /* =========================
       PROGRESS UPDATE
    ========================= */

    const updateProgress = async (
        project,
        progress
    ) => {
        try {
            const updated =
                await request(
                    `/api/projects/${project.id}/progress?progress=${progress}`,
                    {
                        method: "PATCH",
                    }
                );

            setProjects((previous) =>
                previous.map((item) =>
                    item.id === project.id
                        ? updated
                        : item
                )
            );
        } catch (err) {
            console.error(
                "Progress update error:",
                err
            );
            setError(err.message);
        }
    };

    /* =========================
       EXPORT
    ========================= */

    const exportProjects = () => {
        if (!projects.length) {
            setError(
                "There are no projects to export."
            );
            return;
        }

        const headers = [
            "Title",
            "Description",
            "Category",
            "Status",
            "Priority",
            "Progress",
            "Start Date",
            "Deadline",
            "GitHub",
            "Live URL",
        ];

        const rows = projects.map(
            (project) => [
                project.title,
                project.description,
                project.category,
                project.status,
                project.priority,
                `${project.progress || 0}%`,
                project.startDate || "",
                project.deadline || "",
                project.githubUrl || "",
                project.liveUrl || "",
            ]
        );

        const csv = [
            headers,
            ...rows,
        ]
            .map((row) =>
                row
                    .map((value) =>
                        `"${String(value ?? "").replaceAll(
                            '"',
                            '""'
                        )}"`
                    )
                    .join(",")
            )
            .join("\n");

        const blob = new Blob(
            [csv],
            {
                type: "text/csv;charset=utf-8;",
            }
        );

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;
        link.download =
            "my-projects.csv";

        link.click();

        URL.revokeObjectURL(url);
    };

    return (
        <div className="projects-page">

            {/* ================= HEADER ================= */}

            <div className="projects-header">

                <div className="projects-heading">

                    <span className="section-eyebrow">
                        WORKSPACE
                    </span>

                    <h1>Projects</h1>

                    <p>
                        Plan, build and track your
                        real-world projects in one place.
                    </p>

                </div>

                <div className="header-actions">

                    <button
                        className="secondary-action"
                        onClick={exportProjects}
                    >
                        <Icon
                            name="download"
                            size={17}
                        />
                        Export
                    </button>

                    <button
                        className="primary-action"
                        onClick={
                            openCreateModal
                        }
                    >
                        <Icon
                            name="plus"
                            size={18}
                        />
                        New Project
                    </button>

                </div>

            </div>

            {/* ================= ERROR ================= */}

            {error && (
                <div className="project-error">
                    <span>{error}</span>

                    <button
                        onClick={() =>
                            setError("")
                        }
                    >
                        <Icon
                            name="close"
                            size={16}
                        />
                    </button>
                </div>
            )}

            {/* ================= STATS ================= */}

            <div className="project-stats">

                <StatCard
                    icon="briefcase"
                    title="Total Projects"
                    value={stats.total}
                    subtitle="All projects"
                    type="purple"
                />

                <StatCard
                    icon="chart"
                    title="In Progress"
                    value={stats.active}
                    subtitle="Active work"
                    type="blue"
                />

                <StatCard
                    icon="check"
                    title="Completed"
                    value={stats.completed}
                    subtitle="Finished projects"
                    type="green"
                />

                <StatCard
                    icon="chart"
                    title="Average Progress"
                    value={`${stats.average}%`}
                    subtitle="Across all projects"
                    type="orange"
                />

            </div>

            {/* ================= TABS ================= */}

            <div className="project-tabs">

                <StatusTab
                    active={
                        activeTab === "ALL"
                    }
                    onClick={() =>
                        setActiveTab("ALL")
                    }
                    label="All Projects"
                    count={projects.length}
                />

                <StatusTab
                    active={
                        activeTab === "PLANNED"
                    }
                    onClick={() =>
                        setActiveTab("PLANNED")
                    }
                    label="Planning"
                    count={
                        projects.filter(
                            (p) =>
                                p.status ===
                                "PLANNED"
                        ).length
                    }
                />

                <StatusTab
                    active={
                        activeTab ===
                        "IN_PROGRESS"
                    }
                    onClick={() =>
                        setActiveTab(
                            "IN_PROGRESS"
                        )
                    }
                    label="In Progress"
                    count={stats.active}
                />

                <StatusTab
                    active={
                        activeTab ===
                        "COMPLETED"
                    }
                    onClick={() =>
                        setActiveTab(
                            "COMPLETED"
                        )
                    }
                    label="Completed"
                    count={stats.completed}
                />

                <StatusTab
                    active={
                        activeTab ===
                        "ON_HOLD"
                    }
                    onClick={() =>
                        setActiveTab("ON_HOLD")
                    }
                    label="On Hold"
                    count={
                        projects.filter(
                            (p) =>
                                p.status ===
                                "ON_HOLD"
                        ).length
                    }
                />

                <StatusTab
                    active={
                        activeTab ===
                        "CANCELLED"
                    }
                    onClick={() =>
                        setActiveTab(
                            "CANCELLED"
                        )
                    }
                    label="Cancelled"
                    count={
                        projects.filter(
                            (p) =>
                                p.status ===
                                "CANCELLED"
                        ).length
                    }
                />

            </div>

            {/* ================= FILTER BAR ================= */}

            <div className="project-toolbar">

                <div className="project-search">

                    <Icon
                        name="search"
                        size={18}
                    />

                    <input
                        type="text"
                        placeholder="Search projects..."
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />

                </div>

                <div className="toolbar-select">

                    <Icon
                        name="filter"
                        size={16}
                    />

                    <select
                        value={category}
                        onChange={(event) =>
                            setCategory(
                                event.target.value
                            )
                        }
                    >
                        <option value="ALL">
                            All Categories
                        </option>

                        {categories.map(
                            (item) => (
                                <option
                                    key={item}
                                    value={item}
                                >
                                    {item}
                                </option>
                            )
                        )}

                    </select>

                </div>

                <div className="toolbar-select">

                    <select
                        value={priority}
                        onChange={(event) =>
                            setPriority(
                                event.target.value
                            )
                        }
                    >
                        <option value="ALL">
                            All Priorities
                        </option>

                        {priorities.map(
                            (item) => (
                                <option
                                    key={item}
                                    value={item}
                                >
                                    {item}
                                </option>
                            )
                        )}

                    </select>

                </div>

                <div className="toolbar-select">

                    <select
                        value={sort}
                        onChange={(event) =>
                            setSort(
                                event.target.value
                            )
                        }
                    >
                        <option value="LATEST">
                            Sort: Latest
                        </option>

                        <option value="OLDEST">
                            Sort: Oldest
                        </option>

                        <option value="PROGRESS_HIGH">
                            Progress: High
                        </option>

                        <option value="PROGRESS_LOW">
                            Progress: Low
                        </option>

                    </select>

                </div>

                <div className="view-toggle">

                    <button
                        className={
                            view === "GRID"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setView("GRID")
                        }
                    >
                        ▦
                    </button>

                    <button
                        className={
                            view === "LIST"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setView("LIST")
                        }
                    >
                        ☷
                    </button>

                </div>

            </div>

            {/* ================= CONTENT ================= */}

            {loading ? (
                <LoadingState />
            ) : filteredProjects.length ===
              0 ? (
                <EmptyState
                    hasProjects={
                        projects.length > 0
                    }
                    onCreate={
                        openCreateModal
                    }
                />
            ) : (
                <div
                    className={
                        view === "GRID"
                            ? "project-grid"
                            : "project-list"
                    }
                >

                    {filteredProjects.map(
                        (project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                onEdit={
                                    openEditModal
                                }
                                onDelete={
                                    handleDelete
                                }
                                onProgress={
                                    updateProgress
                                }
                            />
                        )
                    )}

                </div>
            )}

            {/* ================= MODAL ================= */}

            {showModal && (
                <ProjectModal
                    form={form}
                    editingProject={
                        editingProject
                    }
                    saving={saving}
                    onChange={handleChange}
                    onClose={closeModal}
                    onSubmit={handleSubmit}
                />
            )}

        </div>
    );
}

/* =====================================================
   STAT CARD
===================================================== */

function StatCard({
    icon,
    title,
    value,
    subtitle,
    type,
}) {
    return (
        <div className="stat-card">

            <div
                className={`stat-icon ${type}`}
            >
                <Icon
                    name={icon}
                    size={21}
                />
            </div>

            <div className="stat-content">

                <span>{title}</span>

                <strong>{value}</strong>

                <small>{subtitle}</small>

            </div>

            <div className="stat-decoration" />

        </div>
    );
}

/* =====================================================
   STATUS TAB
===================================================== */

function StatusTab({
    active,
    onClick,
    label,
    count,
}) {
    return (
        <button
            className={
                active
                    ? "status-tab active"
                    : "status-tab"
            }
            onClick={onClick}
        >
            {label}

            <span>{count}</span>
        </button>
    );
}

/* =====================================================
   PROJECT CARD
===================================================== */

function ProjectCard({
    project,
    onEdit,
    onDelete,
    onProgress,
}) {
    const progress = Math.min(
        100,
        Math.max(
            0,
            Number(project.progress || 0)
        )
    );

    const statusClass =
        project.status
            ?.toLowerCase()
            .replaceAll("_", "-");

    const priorityClass =
        project.priority?.toLowerCase();

    return (
        <article className="project-card">

            <div className="project-card-head">

                <span
                    className={`project-status ${statusClass}`}
                >
                    {formatStatus(
                        project.status
                    )}
                </span>

                <div className="card-actions">

                    <button
                        title="Edit"
                        onClick={() =>
                            onEdit(project)
                        }
                    >
                        <Icon
                            name="edit"
                            size={16}
                        />
                    </button>

                    <button
                        title="Delete"
                        onClick={() =>
                            onDelete(project)
                        }
                    >
                        <Icon
                            name="trash"
                            size={16}
                        />
                    </button>

                </div>

            </div>

            <div className="project-icon-box">
                <Icon
                    name="folder"
                    size={23}
                />
            </div>

            <h3>{project.title}</h3>

            <p className="project-description">
                {project.description ||
                    "No project description added."}
            </p>

            {project.category && (
                <div className="project-category">
                    {project.category}
                </div>
            )}

            <div className="project-progress">

                <div className="progress-label">

                    <span>Progress</span>

                    <strong>
                        {progress}%
                    </strong>

                </div>

                <div className="progress-track">

                    <div
                        className="progress-fill"
                        style={{
                            width: `${progress}%`,
                        }}
                    />

                </div>

                <input
                    className="progress-range"
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={(event) =>
                        onProgress(
                            project,
                            Number(
                                event.target.value
                            )
                        )
                    }
                    aria-label="Project progress"
                />

            </div>

            <div className="project-meta">

                <span>

                    <Icon
                        name="calendar"
                        size={14}
                    />

                    {project.deadline
                        ? formatDate(
                              project.deadline
                          )
                        : "No deadline"}

                </span>

                <span
                    className={`priority ${priorityClass}`}
                >
                    <i />
                    {formatStatus(
                        project.priority
                    )}
                </span>

            </div>

            {(project.githubUrl ||
                project.liveUrl) && (
                <div className="project-links">

                    {project.githubUrl && (
                        <a
                            href={
                                project.githubUrl
                            }
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Icon
                                name="github"
                                size={15}
                            />
                            GitHub
                        </a>
                    )}

                    {project.liveUrl && (
                        <a
                            href={
                                project.liveUrl
                            }
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Icon
                                name="external"
                                size={15}
                            />
                            Live Demo
                        </a>
                    )}

                </div>
            )}

            <div className="project-card-footer">

                <span>
                    Started{" "}
                    {project.startDate
                        ? formatDate(
                              project.startDate
                          )
                        : "not set"}
                </span>

                <button
                    onClick={() =>
                        onEdit(project)
                    }
                >
                    Manage
                    <span>→</span>
                </button>

            </div>

        </article>
    );
}

/* =====================================================
   EMPTY STATE
===================================================== */

function EmptyState({
    hasProjects,
    onCreate,
}) {
    return (
        <div className="empty-projects">

            <div className="empty-icon">
                <Icon
                    name="folder"
                    size={30}
                />
            </div>

            <h2>
                {hasProjects
                    ? "No projects found"
                    : "Start your first project"}
            </h2>

            <p>
                {hasProjects
                    ? "Try changing your search or filters."
                    : "Create a project to start tracking your practical learning journey."}
            </p>

            {!hasProjects && (
                <button
                    className="primary-action"
                    onClick={onCreate}
                >
                    <Icon
                        name="plus"
                        size={17}
                    />
                    Create Project
                </button>
            )}

        </div>
    );
}

/* =====================================================
   LOADING
===================================================== */

function LoadingState() {
    return (
        <div className="project-grid">

            {[1, 2, 3, 4].map(
                (item) => (
                    <div
                        className="skeleton-card"
                        key={item}
                    >
                        <div className="skeleton line-small" />
                        <div className="skeleton icon-skeleton" />
                        <div className="skeleton line-title" />
                        <div className="skeleton line" />
                        <div className="skeleton line" />
                        <div className="skeleton progress-skeleton" />
                    </div>
                )
            )}

        </div>
    );
}

/* =====================================================
   MODAL
===================================================== */

function ProjectModal({
    form,
    editingProject,
    saving,
    onChange,
    onClose,
    onSubmit,
}) {
    return (
        <div
            className="modal-backdrop"
            onMouseDown={(event) => {
                if (
                    event.target ===
                    event.currentTarget
                ) {
                    onClose();
                }
            }}
        >

            <div className="project-modal">

                <div className="modal-header">

                    <div>
                        <span>
                            PROJECT WORKSPACE
                        </span>

                        <h2>
                            {editingProject
                                ? "Edit Project"
                                : "Create New Project"}
                        </h2>

                        <p>
                            Keep your project details
                            organized and track progress.
                        </p>
                    </div>

                    <button
                        className="modal-close"
                        onClick={onClose}
                        type="button"
                    >
                        <Icon
                            name="close"
                            size={19}
                        />
                    </button>

                </div>

                <form
                    onSubmit={onSubmit}
                    className="project-form"
                >

                    <div className="form-group full">

                        <label>
                            Project Title
                        </label>

                        <input
                            name="title"
                            value={form.title}
                            onChange={onChange}
                            placeholder="e.g. AI Resume Analyzer"
                            required
                        />

                    </div>

                    <div className="form-group full">

                        <label>
                            Description
                        </label>

                        <textarea
                            name="description"
                            value={
                                form.description
                            }
                            onChange={onChange}
                            placeholder="Describe what you are building..."
                            rows="4"
                        />

                    </div>

                    <div className="form-group">

                        <label>
                            Category
                        </label>

                        <input
                            name="category"
                            value={form.category}
                            onChange={onChange}
                            placeholder="e.g. Web Development"
                            required
                            maxLength={80}
                        />

                    </div>

                    <div className="form-group">

                        <label>
                            Status
                        </label>

                        <select
                            name="status"
                            value={form.status}
                            onChange={onChange}
                        >
                            <option value="PLANNED">
                                Planned
                            </option>

                            <option value="IN_PROGRESS">
                                In Progress
                            </option>

                            <option value="COMPLETED">
                                Completed
                            </option>

                            <option value="ON_HOLD">
                                On Hold
                            </option>

                            <option value="CANCELLED">
                                Cancelled
                            </option>

                        </select>

                    </div>

                    <div className="form-group">

                        <label>
                            Priority
                        </label>

                        <select
                            name="priority"
                            value={
                                form.priority
                            }
                            onChange={onChange}
                        >
                            <option value="LOW">
                                Low
                            </option>

                            <option value="MEDIUM">
                                Medium
                            </option>

                            <option value="HIGH">
                                High
                            </option>

                        </select>

                    </div>

                    <div className="form-group">

                        <label>
                            Progress
                        </label>

                        <div className="progress-input-wrap">

                            <input
                                type="range"
                                name="progress"
                                min="0"
                                max="100"
                                value={
                                    form.progress
                                }
                                onChange={
                                    onChange
                                }
                            />

                            <strong>
                                {
                                    form.progress
                                }
                                %
                            </strong>

                        </div>

                    </div>

                    <div className="form-group">

                        <label>
                            Start Date
                        </label>

                        <input
                            type="date"
                            name="startDate"
                            value={
                                form.startDate
                            }
                            onChange={onChange}
                        />

                    </div>

                    <div className="form-group">

                        <label>
                            Deadline
                        </label>

                        <input
                            type="date"
                            name="deadline"
                            value={
                                form.deadline
                            }
                            onChange={onChange}
                        />

                    </div>

                    <div className="form-group">

                        <label>
                            GitHub URL
                        </label>

                        <input
                            type="url"
                            name="githubUrl"
                            value={
                                form.githubUrl
                            }
                            onChange={onChange}
                            placeholder="https://github.com/..."
                        />

                    </div>

                    <div className="form-group">

                        <label>
                            Live URL
                        </label>

                        <input
                            type="url"
                            name="liveUrl"
                            value={
                                form.liveUrl
                            }
                            onChange={onChange}
                            placeholder="https://..."
                        />

                    </div>

                    <div className="modal-footer">

                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="primary-action"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : editingProject
                                ? "Save Changes"
                                : "Create Project"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default Projects;