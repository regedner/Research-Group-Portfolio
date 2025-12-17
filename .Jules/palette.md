## 2024-05-22 - Async Interaction Feedback
**Learning:** Adding a specific local loading state (`isFetchingMember`) separate from the main query loading state (`isLoading`) is crucial for user-initiated actions like form submissions. Using `try/finally` ensures the loading state is reset even if the request fails, preventing the UI from getting stuck.
**Action:** When implementing action buttons that trigger async requests, always implement a `disabled` state and a visual loading indicator (spinner + text update) to prevent multiple submissions and reassure the user.

## 2024-05-22 - Invisible Accessibility
**Learning:** Using `sr-only` labels linked with `htmlFor` and `id` provides screen reader accessibility for form inputs without altering the visual design (e.g., when relying on placeholders for sighted users).
**Action:** Always verify that every form input has an associated label. If a visual label is not desired, use `sr-only` class to hide it visually but keep it available for assistive technology.
