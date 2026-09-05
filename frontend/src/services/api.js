import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080",
    headers: {
        "Content-Type": "application/json",
    },
});

// =====================================================
// PUBLIC AUTH ENDPOINTS
// These endpoints must NOT receive an old/stale JWT
// =====================================================

const PUBLIC_AUTH_ENDPOINTS = [
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/reset-password",
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

        // -------------------------------------------------
        // DO NOT ATTACH JWT TO LOGIN / REGISTER
        // -------------------------------------------------

        if (isPublicAuthEndpoint(url)) {

            if (config.headers?.Authorization) {
                delete config.headers.Authorization;
            }

            console.log(
                "🔓 Public auth request:",
                url
            );

            return config;
        }

        // -------------------------------------------------
        // FIND TOKEN
        // -------------------------------------------------

        let token =
            localStorage.getItem("token") ||
            localStorage.getItem("jwtToken") ||
            localStorage.getItem("accessToken");

        // -------------------------------------------------
        // TOKEN NOT FOUND
        // -------------------------------------------------

        if (!token) {

            console.warn(
                "⚠️ No JWT token found for:",
                url
            );

            return config;
        }

        // -------------------------------------------------
        // TOKEN MAY BE STORED AS JSON
        // -------------------------------------------------

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

        } catch (e) {

            // Normal JWT string.
        }

        // -------------------------------------------------
        // NORMALIZE TOKEN
        // -------------------------------------------------

        token = token
            .toString()
            .trim()
            .replace(/^Bearer\s+/i, "");

        // -------------------------------------------------
        // ATTACH JWT
        // -------------------------------------------------

        if (token) {

            config.headers =
                config.headers || {};

            config.headers.Authorization =
                `Bearer ${token}`;

            console.log(
                "🔐 JWT attached:",
                url
            );
        }

        return config;
    },

    (error) => {
        return Promise.reject(error);
    }
);

// =====================================================
// RESPONSE INTERCEPTOR
// =====================================================

api.interceptors.response.use(

    (response) => {
        return response;
    },

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