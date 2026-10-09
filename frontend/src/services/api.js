import axios from "axios";

// =====================================================
// API BASE URL CONFIGURATION
// =====================================================

const configuredBaseURL =
    import.meta.env.VITE_API_URL ||
    "https://ai-mentor-production-debb.up.railway.app";

const normalizedBaseURL = configuredBaseURL
    .trim()
    .replace(/\/+$/, "");

const apiBaseURL = normalizedBaseURL.endsWith("/api")
    ? normalizedBaseURL
    : `${normalizedBaseURL}/api`;

// =====================================================
// AXIOS INSTANCE
// =====================================================

const api = axios.create({
    baseURL: apiBaseURL,
    headers: {
        "Content-Type": "application/json",
    },
});

console.log("🌐 API Base URL:", apiBaseURL);

// =====================================================
// NORMALIZE API PATH
// Removes duplicate /api prefix from request paths.
// Example: /api/skills -> /skills
// =====================================================

api.interceptors.request.use(
    (config) => {
        let url = config.url || "";

        // Keep absolute URLs unchanged.
        if (/^https?:\/\//i.test(url)) {
            return config;
        }

        // Remove duplicate /api prefixes from relative paths.
        url = url.replace(/^(?:\/api)+(?=\/|$)/, "");

        // Ensure the URL starts with a slash.
        if (url && !url.startsWith("/")) {
            url = `/${url}`;
        }

        config.url = url;

        // =================================================
        // PUBLIC AUTH ENDPOINTS
        // =================================================

        const PUBLIC_AUTH_ENDPOINTS = [
            "/auth/login",
            "/auth/register",
            "/auth/reset-password",
        ];

        const cleanUrl = url.split("?")[0];

        const isPublicAuthEndpoint =
            PUBLIC_AUTH_ENDPOINTS.some((endpoint) =>
                cleanUrl.endsWith(endpoint)
            );

        if (isPublicAuthEndpoint) {
            if (config.headers?.Authorization) {
                delete config.headers.Authorization;
            }

            console.log("🔓 Public auth request:", url);

            return config;
        }

        // =================================================
        // ATTACH JWT TOKEN
        // =================================================

        let token =
            localStorage.getItem("token") ||
            localStorage.getItem("jwtToken") ||
            localStorage.getItem("accessToken");

        if (!token) {
            console.warn("⚠️ No JWT token found for:", url);
            return config;
        }

        // Support plain JWT strings and JSON-stored tokens.
        try {
            const parsedToken = JSON.parse(token);

            if (typeof parsedToken === "string") {
                token = parsedToken;
            } else if (parsedToken?.token) {
                token = parsedToken.token;
            } else if (parsedToken?.jwt) {
                token = parsedToken.jwt;
            } else if (parsedToken?.accessToken) {
                token = parsedToken.accessToken;
            }
        } catch {
            // Token is already a normal JWT string.
        }

        // Avoid duplicate Bearer prefixes.
        token = token
            .toString()
            .trim()
            .replace(/^Bearer\s+/i, "");

        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;

            console.log("🔐 JWT attached:", url);
        }

        console.log(
            "🌐 Final API request:",
            `${config.baseURL}${url}`
        );

        return config;
    },
    (error) => Promise.reject(error)
);

// =====================================================
// RESPONSE INTERCEPTOR
// =====================================================

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const url = error.config?.url;

        if (status === 401) {
            console.error(
                "❌ 401 UNAUTHORIZED:",
                url
            );

            console.error(
                "JWT may be missing, expired or invalid."
            );
        }

        if (status === 403) {
            console.error(
                "❌ 403 FORBIDDEN:",
                url
            );
        }

        if (status === 404) {
            console.error(
                "❌ 404 ENDPOINT NOT FOUND:",
                error.config?.baseURL
                    ? `${error.config.baseURL}${url || ""}`
                    : url
            );

            console.error(
                "Check the backend controller mapping."
            );
        }

        return Promise.reject(error);
    }
);

// =====================================================
// EXPORT API INSTANCE
// =====================================================

export default api;