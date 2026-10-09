import axios from "axios";

// =====================================================
// API BASE URL CONFIGURATION
// =====================================================

const configuredBaseURL =
    import.meta.env.VITE_API_URL ||
    "https://ai-mentor-production-debb.up.railway.app";

const normalizedBaseURL = configuredBaseURL.replace(/\/+$/, "");

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
// PUBLIC AUTH ENDPOINTS
// =====================================================

const PUBLIC_AUTH_ENDPOINTS = [
    "/auth/login",
    "/auth/register",
    "/auth/reset-password",
];

const isPublicAuthEndpoint = (url = "") => {
    const cleanUrl = url.split("?")[0];

    return PUBLIC_AUTH_ENDPOINTS.some((endpoint) =>
        cleanUrl.endsWith(endpoint)
    );
};

// =====================================================
// ATTACH JWT TOKEN
// =====================================================

api.interceptors.request.use(
    (config) => {
        const url = config.url || "";

        // Public authentication requests do not require JWT.
        if (isPublicAuthEndpoint(url)) {
            if (config.headers?.Authorization) {
                delete config.headers.Authorization;
            }

            console.log("🔓 Public auth request:", url);

            return config;
        }

        // Read JWT from available localStorage keys.
        let token =
            localStorage.getItem("token") ||
            localStorage.getItem("jwtToken") ||
            localStorage.getItem("accessToken");

        if (!token) {
            console.warn("⚠️ No JWT token found for:", url);

            return config;
        }

        // Support both plain JWT strings and JSON-stored tokens.
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
        if (error.response?.status === 401) {
            console.error(
                "❌ 401 UNAUTHORIZED:",
                error.config?.url
            );

            console.error(
                "JWT may be missing, expired or invalid."
            );
        }

        if (error.response?.status === 403) {
            console.error(
                "❌ 403 FORBIDDEN:",
                error.config?.url
            );
        }

        if (error.response?.status === 404) {
            console.error(
                "❌ 404 ENDPOINT NOT FOUND:",
                error.config?.url
            );

            console.error(
                "Check the API URL and backend controller mapping."
            );
        }

        return Promise.reject(error);
    }
);

// =====================================================
// EXPORT API INSTANCE
// =====================================================

export default api;