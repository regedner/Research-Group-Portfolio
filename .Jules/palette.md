## 2024-05-23 - Micro-UX Improvements
**Learning:** The application heavily relies on icon-only buttons without `aria-label` attributes and form inputs that rely solely on `placeholder` text instead of accessible labels. This creates significant accessibility barriers for screen reader users and navigation issues.
**Action:** When implementing new forms or buttons, always include `aria-label` if a visible label is not design-compliant. For async actions, always provide a visual loading indicator to prevent user confusion and double-submissions.
