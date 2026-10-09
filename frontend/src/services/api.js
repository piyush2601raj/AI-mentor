import axios from "axios";

// =====================================================
// API BASE URL
// =====================================================

const configuredBaseURL =
    import.meta.env.VITE_API_URL || "http://localhost:8080";

const normalizedBaseURL = configuredBaseURL.replace(/\/+$/, "");

const apiBaseURL = normalizedBaseURL.endsWith("/api")
    ? normalizedBaseURL
    : `${normalizedBaseURL}/api`;

const api = axios.create({
    baseURL: apiBaseURL,
    headers: {
        "Content-Type": "application/json",
    },
});

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

        if (isPublicAuthEndpoint(url)) {
            if (config.headers?.Authorization) {
                delete config.headers.Authorization;
            }

            console.log("🔓 Public auth request:", url);

            return config;
        }

        let token =
            localStorage.getItem("token") ||
            localStorage.getItem("jwtToken") ||
            localStorage.getItem("accessToken");

        if (!token) {
            console.warn("⚠️ No JWT token found for:", url);
            return config;
        }

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

        return Promise.reject(error);
    }
);

export default api;