---
name: Browser testing
description: Running browser checks in the Nix environment.
---

Use the environment-provided Chromium executable for local Playwright tests.

**Why:** Downloaded generic Linux Chromium fails on this Nix environment with missing shared libraries. The testing subagent callback was also unavailable during the import port, despite its skill being present.

**How to apply:** If the testing subagent is unavailable, run the checked-in Playwright suite using the environment-provided browser rather than installing Linux system dependencies or repeatedly retrying the unavailable callback.
