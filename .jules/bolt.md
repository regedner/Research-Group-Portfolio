## 2024-05-23 - Linear Delay Scaling in Lists
**Learning:** Using `index * delay` for animation staggering in long lists (e.g., `delay={index * 150}`) creates massive delays for items further down the list, causing them to appear broken or blank even after entering the viewport.
**Action:** Always cap the delay or use modulo logic (e.g., `(index % 3) * 150`) to stagger animations in batches relative to the row/view, rather than globally.
