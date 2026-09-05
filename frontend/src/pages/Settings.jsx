import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Settings.css";

/*
 * AI Mentor — Settings
 * ------------------------------------------------------------
 * Professional, self-contained settings screen.
 *
 * Important:
 * 1. All Settings classes are scoped through .settings-page.
 * 2. The existing application sidebar is not modified.
 * 3. Appearance supports Light / Dark / System.
 * 4. A Dashboard button is available so the user can return
 *    to the main dashboard after changing settings.
 * 5. Preferences remain stored in localStorage.
 */

const DEFAULT_SETTINGS = {
  fullName: "",
  email: "",
  learningStyle: "Balanced",
  difficulty: "Adaptive",
  dailyGoal: 60,
  studyReminders: true,
  progressUpdates: true,
  weeklySummary: true,
  aiSuggestions: true,
  compactMode: false,
  theme: "System",
  mentorTone: "Professional",
  mentorDetail: "Detailed",
};

const THEME_OPTIONS = [
  {
    id: "Light",
    title: "Light",
    description: "Bright and clean workspace",
    icon: "☀",
  },
  {
    id: "Dark",
    title: "Dark",
    description: "Focused low-light workspace",
    icon: "☾",
  },
  {
    id: "System",
    title: "System",
    description: "Follow your device preference",
    icon: "◐",
  },
];

const settingIcons = {
  profile: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  learning: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
      <path d="M8 6h8M8 10h8M8 14h5" />
    </svg>
  ),
  notification: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  ),
  appearance: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  ),
  ai: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" />
      <path d="m19 14 .8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14Z" />
      <path d="M5 14v5M2.5 16.5h5" />
    </svg>
  ),
  security: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3 20 6v5c0 5.2-3.3 8.6-8 10-4.7-1.4-8-4.8-8-10V6l8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
};

function Icon({ type }) {
  return <span className="settings-icon">{settingIcons[type]}</span>;
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      className={`settings-toggle ${checked ? "is-on" : ""}`}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
    >
      <span className="settings-toggle-knob" />
    </button>
  );
}

function SettingRow({ title, description, children, last = false }) {
  return (
    <div className={`settings-row ${last ? "settings-row-last" : ""}`}>
      <div className="settings-row-copy">
        <div className="settings-row-title">{title}</div>
        {description && (
          <div className="settings-row-description">{description}</div>
        )}
      </div>
      <div className="settings-row-control">{children}</div>
    </div>
  );
}

function SectionHeading({ type, title, description }) {
  return (
    <div className="settings-panel-heading">
      <div className="settings-heading-icon">
        <Icon type={type} />
      </div>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}

function AppearanceThemeCard({ option, selected, onSelect }) {
  return (
    <button
      type="button"
      className={`settings-theme-card ${selected ? "selected" : ""}`}
      onClick={() => onSelect(option.id)}
      aria-pressed={selected}
    >
      <div className={`theme-preview theme-${option.id.toLowerCase()}`}>
        <span />
        <span />
        <span />
      </div>

      <div className="theme-card-content">
        <div className="theme-card-title-row">
          <span className="theme-card-icon" aria-hidden="true">
            {option.icon}
          </span>
          <strong>{option.title}</strong>
        </div>
        <small>{option.description}</small>
      </div>

      <div className={`theme-radio ${selected ? "checked" : ""}`}>
        {selected ? "✓" : ""}
      </div>
    </button>
  );
}

function Settings() {
  const navigate = useNavigate();

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [activeSection, setActiveSection] = useState("profile");
  const [saved, setSaved] = useState(false);
  const [user, setUser] = useState({ name: "", email: "" });
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  /*
   * Load saved settings and the current user.
   * Existing localStorage keys are intentionally retained for
   * compatibility with the rest of the AI Mentor application.
   */
  useEffect(() => {
    try {
      const storedSettings = JSON.parse(
        localStorage.getItem("aiMentorSettings") || "{}"
      );

      const storedUser =
        JSON.parse(localStorage.getItem("user") || "null") ||
        JSON.parse(localStorage.getItem("currentUser") || "null") ||
        {};

      const name =
        storedUser?.name ||
        storedUser?.fullName ||
        storedUser?.username ||
        localStorage.getItem("userName") ||
        "";

      const email =
        storedUser?.email ||
        localStorage.getItem("userEmail") ||
        "";

      setSettings({ ...DEFAULT_SETTINGS, ...storedSettings });
      setUser({ name, email });
    } catch {
      setSettings(DEFAULT_SETTINGS);
    }
  }, []);

  /*
   * Reflect the selected appearance on the Settings page.
   * The CSS is scoped to .settings-page, so this does not style
   * the existing navigation/sidebar accidentally.
   */
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const theme = settings.theme || "System";
    const normalizedTheme = theme.toLowerCase();

    root.classList.remove(
      "ai-mentor-light",
      "ai-mentor-dark",
      "ai-mentor-system"
    );

    body.classList.remove(
      "ai-mentor-light",
      "ai-mentor-dark",
      "ai-mentor-system"
    );

    root.dataset.theme = normalizedTheme;
    root.classList.add(`ai-mentor-${normalizedTheme}`);
    body.classList.add(`ai-mentor-${normalizedTheme}`);

    root.style.colorScheme =
      theme === "Dark"
        ? "dark"
        : theme === "Light"
          ? "light"
          : "light dark";

    return () => {
      root.classList.remove(
        "ai-mentor-light",
        "ai-mentor-dark",
        "ai-mentor-system"
      );

      body.classList.remove(
        "ai-mentor-light",
        "ai-mentor-dark",
        "ai-mentor-system"
      );

      delete root.dataset.theme;
      root.style.colorScheme = "";
    };
  }, [settings.theme]);

  const displayName = useMemo(
    () => settings.fullName || user.name || "Your Profile",
    [settings.fullName, user.name]
  );

  const initials = useMemo(() => {
    const parts = displayName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2);

    return parts.length
      ? parts.map((part) => part[0].toUpperCase()).join("")
      : "AI";
  }, [displayName]);

  const activeSectionLabel = useMemo(() => {
    const found = [
      { id: "profile", label: "Profile" },
      { id: "learning", label: "Learning" },
      { id: "notifications", label: "Notifications" },
      { id: "appearance", label: "Appearance" },
      { id: "ai", label: "AI Mentor" },
      { id: "security", label: "Security" },
    ].find((item) => item.id === activeSection);

    return found?.label || "Settings";
  }, [activeSection]);

  const update = (key, value) => {
    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }));
    setSaved(false);
  };

  const saveSettings = () => {
    try {
      localStorage.setItem("aiMentorSettings", JSON.stringify(settings));

      const existingUser =
        JSON.parse(localStorage.getItem("user") || "null") ||
        JSON.parse(localStorage.getItem("currentUser") || "null");

      if (settings.fullName && existingUser) {
        const updatedUser = {
          ...existingUser,
          name: settings.fullName,
          fullName: settings.fullName,
        };

        if (localStorage.getItem("user")) {
          localStorage.setItem("user", JSON.stringify(updatedUser));
        } else {
          localStorage.setItem(
            "currentUser",
            JSON.stringify(updatedUser)
          );
        }
      }

      setSaved(true);
      window.setTimeout(() => setSaved(false), 2400);
    } catch (error) {
      console.error("Unable to save AI Mentor settings:", error);
    }
  };

  const resetSettings = () => {
    setSettings({
      ...DEFAULT_SETTINGS,
      fullName: user.name || "",
      email: user.email || "",
    });
    setSaved(false);
    setShowResetConfirm(false);
  };

  const handleDashboard = () => {
    navigate("/dashboard");
  };

  const sections = [
    {
      id: "profile",
      label: "Profile",
      description: "Account information",
      icon: "profile",
    },
    {
      id: "learning",
      label: "Learning",
      description: "Goals & preferences",
      icon: "learning",
    },
    {
      id: "notifications",
      label: "Notifications",
      description: "Alerts & reminders",
      icon: "notification",
    },
    {
      id: "appearance",
      label: "Appearance",
      description: "Theme & layout",
      icon: "appearance",
    },
    {
      id: "ai",
      label: "AI Mentor",
      description: "Mentor behavior",
      icon: "ai",
    },
    {
      id: "security",
      label: "Security",
      description: "Privacy & account",
      icon: "security",
    },
  ];

  const renderProfile = () => (
    <section className="settings-panel">
      <SectionHeading
        type="profile"
        title="Profile & account"
        description="Manage the basic information associated with your AI Mentor account."
      />

      <div className="settings-profile-preview">
        <div className="settings-avatar-large">{initials}</div>

        <div className="settings-profile-preview-copy">
          <strong>{displayName}</strong>
          <span>
            {settings.email ||
              user.email ||
              "Add your email address"}
          </span>
        </div>

        <span className="settings-status-badge">
          <span />
          Active
        </span>
      </div>

      <div className="settings-form-grid">
        <label className="settings-field">
          <span>Full name</span>
          <input
            value={settings.fullName}
            placeholder={user.name || "Enter your name"}
            onChange={(e) => update("fullName", e.target.value)}
          />
        </label>

        <label className="settings-field">
          <span>Email address</span>
          <input
            type="email"
            value={settings.email}
            placeholder={user.email || "you@example.com"}
            onChange={(e) => update("email", e.target.value)}
          />
        </label>
      </div>

      <div className="settings-account-meta">
        <div>
          <span>Account type</span>
          <strong>AI Mentor Student</strong>
        </div>
        <div>
          <span>Personalization</span>
          <strong>Enabled</strong>
        </div>
        <div>
          <span>Preferences</span>
          <strong>Auto-saved locally</strong>
        </div>
      </div>
    </section>
  );

  const renderLearning = () => (
    <section className="settings-panel">
      <SectionHeading
        type="learning"
        title="Learning preferences"
        description="Configure how AI Mentor plans and adapts your learning journey."
      />

      <SettingRow
        title="Learning style"
        description="Choose how lessons and recommendations should be structured."
      >
        <select
          className="settings-select"
          value={settings.learningStyle}
          onChange={(e) => update("learningStyle", e.target.value)}
        >
          <option>Balanced</option>
          <option>Concept First</option>
          <option>Practice First</option>
          <option>Project Based</option>
        </select>
      </SettingRow>

      <SettingRow
        title="Difficulty mode"
        description="Adaptive mode changes difficulty according to your progress."
      >
        <select
          className="settings-select"
          value={settings.difficulty}
          onChange={(e) => update("difficulty", e.target.value)}
        >
          <option>Adaptive</option>
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>
      </SettingRow>

      <SettingRow
        title="Daily study goal"
        description="Your target study time used for progress and streak tracking."
        last
      >
        <div className="settings-number-control">
          <input
            type="number"
            min="15"
            max="480"
            step="15"
            value={settings.dailyGoal}
            onChange={(e) =>
              update(
                "dailyGoal",
                Math.max(15, Number(e.target.value) || 15)
              )
            }
          />
          <span>min/day</span>
        </div>
      </SettingRow>

      <div className="settings-info-box">
        <span className="settings-info-dot">i</span>
        <span>
          AI Mentor uses these preferences to personalize your
          roadmap, resources and recommendations.
        </span>
      </div>
    </section>
  );

  const renderNotifications = () => (
    <section className="settings-panel">
      <SectionHeading
        type="notification"
        title="Notifications"
        description="Stay updated without getting unnecessary interruptions."
      />

      <SettingRow
        title="Study reminders"
        description="Receive reminders when your daily learning goal is pending."
      >
        <Toggle
          checked={settings.studyReminders}
          onChange={(value) => update("studyReminders", value)}
          label="Study reminders"
        />
      </SettingRow>

      <SettingRow
        title="Progress updates"
        description="Get notified about milestones, completed modules and achievements."
      >
        <Toggle
          checked={settings.progressUpdates}
          onChange={(value) => update("progressUpdates", value)}
          label="Progress updates"
        />
      </SettingRow>

      <SettingRow
        title="Weekly learning summary"
        description="Receive a concise summary of your weekly learning activity."
        last
      >
        <Toggle
          checked={settings.weeklySummary}
          onChange={(value) => update("weeklySummary", value)}
          label="Weekly learning summary"
        />
      </SettingRow>

      <div className="settings-info-box settings-notification-info">
        <span className="settings-info-dot">✓</span>
        <span>
          Notifications are designed to keep your learning routine
          consistent without creating unnecessary distractions.
        </span>
      </div>
    </section>
  );

  const renderAppearance = () => (
    <section className="settings-panel settings-appearance-panel">
      <SectionHeading
        type="appearance"
        title="Appearance"
        description="Personalize the way your AI Mentor workspace looks."
      />

      <div className="settings-appearance-intro">
        <div>
          <span className="settings-section-kicker">
            WORKSPACE THEME
          </span>
          <h3>Choose your preferred visual environment</h3>
          <p>
            Your selection is applied immediately to this Settings
            workspace and is saved when you choose Save changes.
          </p>
        </div>

        <div className="settings-current-theme">
          <span>Current</span>
          <strong>{settings.theme}</strong>
        </div>
      </div>

      <div className="settings-theme-grid settings-theme-grid-professional">
        {THEME_OPTIONS.map((option) => (
          <AppearanceThemeCard
            key={option.id}
            option={option}
            selected={settings.theme === option.id}
            onSelect={(value) => update("theme", value)}
          />
        ))}
      </div>

      <div className="settings-divider" />

      <SettingRow
        title="Compact workspace"
        description="Use tighter spacing to display more learning information at once."
        last
      >
        <Toggle
          checked={settings.compactMode}
          onChange={(value) => update("compactMode", value)}
          label="Compact workspace"
        />
      </SettingRow>

      <div className="settings-appearance-status">
        <div className="settings-appearance-status-icon">✓</div>
        <div>
          <strong>
            {settings.theme} appearance selected
          </strong>
          <p>
            {settings.compactMode
              ? "Compact spacing is enabled for a denser workspace."
              : "Standard spacing is enabled for comfortable reading."}
          </p>
        </div>
      </div>
    </section>
  );

  const renderAI = () => (
    <section className="settings-panel">
      <SectionHeading
        type="ai"
        title="AI Mentor preferences"
        description="Control the tone and depth of your personalized AI guidance."
      />

      <SettingRow
        title="Mentor tone"
        description="Choose how your AI Mentor communicates with you."
      >
        <select
          className="settings-select"
          value={settings.mentorTone}
          onChange={(e) => update("mentorTone", e.target.value)}
        >
          <option>Professional</option>
          <option>Friendly</option>
          <option>Encouraging</option>
          <option>Concise</option>
        </select>
      </SettingRow>

      <SettingRow
        title="Answer detail"
        description="Controls the amount of explanation in AI Mentor responses."
      >
        <select
          className="settings-select"
          value={settings.mentorDetail}
          onChange={(e) => update("mentorDetail", e.target.value)}
        >
          <option>Detailed</option>
          <option>Balanced</option>
          <option>Concise</option>
        </select>
      </SettingRow>

      <SettingRow
        title="Smart recommendations"
        description="Allow AI Mentor to suggest resources and next steps from your activity."
        last
      >
        <Toggle
          checked={settings.aiSuggestions}
          onChange={(value) => update("aiSuggestions", value)}
          label="Smart recommendations"
        />
      </SettingRow>

      <div className="settings-ai-note">
        <div className="settings-ai-sparkle">✦</div>
        <div>
          <strong>Personalized by your progress</strong>
          <p>
            Recommendations can adapt as your skills, activity and
            roadmap progress change.
          </p>
        </div>
      </div>
    </section>
  );

  const renderSecurity = () => (
    <section className="settings-panel">
      <SectionHeading
        type="security"
        title="Security & privacy"
        description="Manage account security and privacy-related actions."
      />

      <div className="settings-security-card">
        <div className="security-card-icon">
          <Icon type="security" />
        </div>

        <div>
          <strong>Password</strong>
          <p>
            Keep your account secure with a strong password.
          </p>
        </div>

        <button
          type="button"
          className="settings-outline-button"
          onClick={() =>
            window.alert(
              "Connect this button to your password-change API."
            )
          }
        >
          Change password
        </button>
      </div>

      <SettingRow
        title="Active sessions"
        description="Review sessions where your AI Mentor account is currently signed in."
        last
      >
        <button
          type="button"
          className="settings-outline-button"
          onClick={() =>
            window.alert(
              "Session management can be connected to your backend."
            )
          }
        >
          Manage sessions
        </button>
      </SettingRow>

      <div className="settings-danger-zone">
        <div>
          <strong>Danger zone</strong>
          <p>
            Account deletion is permanent and should be connected to
            a protected backend endpoint.
          </p>
        </div>

        <button
          type="button"
          className="settings-danger-button"
          onClick={() =>
            window.alert(
              "Connect this action to your protected account-deletion API."
            )
          }
        >
          Delete account
        </button>
      </div>
    </section>
  );

  const renderSection = () => {
    switch (activeSection) {
      case "learning":
        return renderLearning();
      case "notifications":
        return renderNotifications();
      case "appearance":
        return renderAppearance();
      case "ai":
        return renderAI();
      case "security":
        return renderSecurity();
      case "profile":
      default:
        return renderProfile();
    }
  };

  return (
    <main className="settings-page">
      <div className="settings-page-inner">

        <header className="settings-header">
          <div className="settings-header-main">
            <div className="settings-eyebrow">
              ACCOUNT SETTINGS
            </div>

            <div className="settings-title-row">
              <div>
                <h1>Settings</h1>
                <p>
                  Manage your profile, learning preferences and AI
                  Mentor experience.
                </p>
              </div>

              <div className="settings-header-badge">
                <span />
                Workspace active
              </div>
            </div>
          </div>

          <div className="settings-header-actions">
            {saved && (
              <div
                className="settings-saved"
                role="status"
                aria-live="polite"
              >
                <span>✓</span>
                Changes saved
              </div>
            )}

            <button
              type="button"
              className="settings-dashboard-button"
              onClick={handleDashboard}
              title="Return to Dashboard"
            >
              <span className="settings-dashboard-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 13h6V4H4v9Zm0 7h6v-4H4v4Zm10 0h6v-9h-6v9Zm0-16v4h6V4h-6Z" />
                </svg>
              </span>
              Dashboard
            </button>

            <button
              type="button"
              className="settings-reset-button"
              onClick={() => setShowResetConfirm(true)}
            >
              Reset
            </button>

            <button
              type="button"
              className="settings-save-button"
              onClick={saveSettings}
            >
              <span>✓</span>
              Save changes
            </button>
          </div>
        </header>

        <div className="settings-breadcrumb">
          <button
            type="button"
            onClick={handleDashboard}
            className="settings-breadcrumb-link"
          >
            Dashboard
          </button>
          <span>›</span>
          <strong>{activeSectionLabel}</strong>
        </div>

        <div className="settings-layout">

          <aside className="settings-navigation">
            <div className="settings-nav-label">
              SETTINGS
            </div>

            {sections.map((section) => (
              <button
                type="button"
                key={section.id}
                className={`settings-nav-item ${
                  activeSection === section.id ? "active" : ""
                }`}
                onClick={() => setActiveSection(section.id)}
              >
                <Icon type={section.icon} />

                <span className="settings-nav-copy">
                  <strong>{section.label}</strong>
                  <small>{section.description}</small>
                </span>

                <span className="settings-nav-arrow">›</span>
              </button>
            ))}

            <div className="settings-navigation-divider" />

            <button
              type="button"
              className="settings-nav-dashboard"
              onClick={handleDashboard}
            >
              <span className="settings-nav-dashboard-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m4 11 8-7 8 7" />
                  <path d="M6 10v9h12v-9" />
                  <path d="M10 19v-5h4v5" />
                </svg>
              </span>

              <span>
                <strong>Back to Dashboard</strong>
                <small>Return to your learning home</small>
              </span>

              <span>→</span>
            </button>

            <div className="settings-security-tip">
              <div className="settings-tip-icon">✓</div>
              <div>
                <strong>Your settings are private</strong>
                <p>
                  Preferences are stored for your account experience.
                </p>
              </div>
            </div>
          </aside>

          <div className="settings-content">
            {renderSection()}
          </div>
        </div>

        <footer className="settings-footer">
          <div className="settings-footer-left">
            <span className="settings-footer-dot" />
            <span>AI Mentor Personalized Workspace</span>
          </div>

          <div className="settings-footer-right">
            <span>Preferences are saved locally</span>
            <button
              type="button"
              onClick={handleDashboard}
              className="settings-footer-dashboard"
            >
              Return to Dashboard →
            </button>
          </div>
        </footer>

      </div>

      {showResetConfirm && (
        <div
          className="settings-modal-backdrop"
          role="presentation"
          onMouseDown={() => setShowResetConfirm(false)}
        >
          <div
            className="settings-reset-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-reset-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="settings-modal-icon">↺</div>

            <div>
              <h2 id="settings-reset-title">
                Reset settings?
              </h2>
              <p>
                This will restore the default AI Mentor preferences.
                Your profile name and email will be preserved.
              </p>
            </div>

            <div className="settings-modal-actions">
              <button
                type="button"
                className="settings-outline-button"
                onClick={() => setShowResetConfirm(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="settings-danger-button"
                onClick={resetSettings}
              >
                Reset settings
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Settings;
