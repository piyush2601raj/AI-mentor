import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const OAuthCallback = () => {
  const navigate = useNavigate();

  const [message, setMessage] = useState(
    "Completing secure login..."
  );

  // React StrictMode runs effects twice in development.
  // This guard ensures the OAuth callback is processed only once.
  const processedRef = useRef(false);

  useEffect(() => {

    // Prevent duplicate OAuth callback processing in React StrictMode.
    if (processedRef.current) {
      console.log("OAuth callback already processed. Skipping duplicate run.");
      return;
    }

    processedRef.current = true;

    const completeOAuthLogin = () => {
      try {
        // =====================================================
        // 1. GET TOKEN FROM URL HASH
        // =====================================================

        const hash = window.location.hash;

        console.log("========================================");
        console.log("OAUTH CALLBACK STARTED");
        console.log("========================================");

        if (!hash) {
          console.error("OAuth token hash not found.");

          setMessage(
            "Authentication token was not received."
          );

          setTimeout(() => {
            navigate(
              "/login?oauthError=token",
              { replace: true }
            );
          }, 1500);

          return;
        }

        // =====================================================
        // 2. READ TOKEN
        // =====================================================

        const params = new URLSearchParams(
          hash.substring(1)
        );

        const token = params.get("token");

        if (!token) {
          console.error("OAuth token is missing.");

          setMessage(
            "Authentication token was not received."
          );

          setTimeout(() => {
            navigate(
              "/login?oauthError=token",
              { replace: true }
            );
          }, 1500);

          return;
        }

        console.log("OAuth token received.");
        console.log(
          "Token length:",
          token.length
        );

        // =====================================================
        // 3. DECODE JWT PAYLOAD
        // =====================================================

        const tokenParts = token.split(".");

        if (tokenParts.length !== 3) {
          throw new Error(
            "Invalid JWT format."
          );
        }

        const base64Url = tokenParts[1];

        const base64 = base64Url
          .replace(/-/g, "+")
          .replace(/_/g, "/");

        const paddedBase64 =
          base64 +
          "=".repeat(
            (4 - (base64.length % 4)) % 4
          );

        const decodedPayload = atob(
          paddedBase64
        );

        const payload = JSON.parse(
          decodedPayload
        );

        // =====================================================
        // 4. READ JWT CLAIMS
        // =====================================================

        const userId =
          payload.userId;

        const role =
          payload.role;

        const email =
          payload.sub;

        console.log(
          "========== OAUTH JWT CLAIMS =========="
        );

        console.log(
          "User ID:",
          userId
        );

        console.log(
          "Role:",
          role
        );

        console.log(
          "Email:",
          email
        );

        console.log(
          "Issuer:",
          payload.iss
        );

        console.log(
          "======================================"
        );

        // =====================================================
        // 5. VALIDATE REQUIRED CLAIMS
        // =====================================================

        if (
          userId === null ||
          userId === undefined ||
          userId === ""
        ) {
          console.error(
            "JWT does not contain userId."
          );

          setMessage(
            "User information was not received."
          );

          setTimeout(() => {
            navigate(
              "/login?oauthError=userid",
              { replace: true }
            );
          }, 1500);

          return;
        }

        if (
          !role ||
          role.trim() === ""
        ) {
          console.error(
            "JWT does not contain role."
          );

          setMessage(
            "User role was not received."
          );

          setTimeout(() => {
            navigate(
              "/login?oauthError=role",
              { replace: true }
            );
          }, 1500);

          return;
        }

        // =====================================================
        // 6. SAVE JWT
        // =====================================================

        localStorage.setItem(
          "token",
          token
        );

        // =====================================================
        // 7. SAVE USER ID
        // =====================================================

        localStorage.setItem(
          "userId",
          String(userId)
        );

        // =====================================================
        // 8. SAVE ROLE
        // =====================================================

        localStorage.setItem(
          "role",
          role
        );

        // =====================================================
        // 9. SAVE EMAIL
        // =====================================================

        if (email) {
          localStorage.setItem(
            "email",
            email
          );
        }

        // =====================================================
        // 10. SAVE NAME IF JWT CONTAINS IT
        // =====================================================

        if (payload.name) {
          localStorage.setItem(
            "name",
            payload.name
          );
        } else {
          // OAuth JWT currently contains userId, role and email.
          // Do not overwrite an existing name with null.
          const existingName = localStorage.getItem("name");

          if (!existingName) {
            console.log(
              "Name claim not present in OAuth JWT. Existing name preserved."
            );
          }
        }

        // =====================================================
        // 11. VERIFY LOCAL STORAGE
        // =====================================================

        console.log(
          "========== LOCAL STORAGE =========="
        );

        console.log(
          "token:",
          localStorage.getItem("token")
            ? "SAVED"
            : "MISSING"
        );

        console.log(
          "userId:",
          localStorage.getItem("userId")
        );

        console.log(
          "role:",
          localStorage.getItem("role")
        );

        console.log(
          "email:",
          localStorage.getItem("email")
        );

        console.log(
          "name:",
          localStorage.getItem("name")
        );

        console.log(
          "==================================="
        );

        // =====================================================
        // 12. FINAL AUTHENTICATION CHECK
        // =====================================================

        const savedToken = localStorage.getItem("token");
        const savedUserId = localStorage.getItem("userId");
        const savedRole = localStorage.getItem("role");

        if (!savedToken || !savedUserId || !savedRole) {
          throw new Error(
            "OAuth login data was not saved correctly."
          );
        }

        console.log("Final OAuth authentication check passed.");

        // =====================================================
        // 13. REMOVE TOKEN FROM URL
        // =====================================================

        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );

        // =====================================================
        // 14. SUCCESS MESSAGE
        // =====================================================

        setMessage(
          "Login successful. Redirecting..."
        );

        console.log(
          "OAuth login completed successfully."
        );

        // =====================================================
        // 15. GO TO DASHBOARD
        // =====================================================

        setTimeout(() => {
          navigate(
            "/dashboard",
            { replace: true }
          );
        }, 300);

      } catch (error) {

        // =====================================================
        // ERROR HANDLING
        // =====================================================

        console.error(
          "========================================"
        );

        console.error(
          "OAUTH CALLBACK ERROR"
        );

        console.error(
          error
        );

        console.error(
          "========================================"
        );

        setMessage(
          "Unable to complete login."
        );

        setTimeout(() => {
          navigate(
            "/login?oauthError=callback",
            { replace: true }
          );
        }, 1500);
      }
    };

    completeOAuthLogin();

  }, [navigate]);

  // =========================================================
  // UI
  // =========================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8fafc",
        fontFamily:
          "Inter, Arial, sans-serif",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          padding: "40px",
          borderRadius: "18px",
          boxShadow:
            "0 15px 40px rgba(15, 23, 42, 0.10)",
          textAlign: "center",
          minWidth: "320px",
        }}
      >
        <div
          style={{
            width: "54px",
            height: "54px",
            borderRadius: "50%",
            margin: "0 auto 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "linear-gradient(135deg, #2563eb, #4f46e5)",
            color: "#fff",
            fontSize: "22px",
            fontWeight: 700,
          }}
        >
          AI
        </div>

        <h2
          style={{
            marginBottom: "8px",
            color: "#172033",
          }}
        >
          AI Mentor
        </h2>

        <p
          style={{
            color: "#64748b",
            margin: 0,
          }}
        >
          {message}
        </p>
      </div>
    </div>
  );
};

export default OAuthCallback;