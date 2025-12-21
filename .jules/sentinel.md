## 2024-12-21 - [CRITICAL] Hardcoded API Key in Properties
**Vulnerability:** A valid SerpAPI key (`d3aee3...`) was hardcoded in `backend/src/main/resources/application.properties`.
**Learning:** Developers often commit local configuration files with real secrets for convenience, forgetting that these become part of the repo history.
**Prevention:** Use environment variables (e.g., `${SERPAPI_API_KEY}`) for all sensitive configuration. Add checks in CI/CD (like trufflehog or git-secrets) to block commits containing high-entropy strings or known key patterns.
