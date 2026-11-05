---
name: c-verse-coming-soon
description: Develop or verify the C-Verse Coming Soon apex site and its separately built join creator deck, including source consistency and release boundaries.
---

# Coming Soon and join

Read the [repository README](../../../README.md) and [package scripts](../../../package.json) before working. Identify the target: apex uses the root Vite app, while join uses `join/`, its own Vite configuration, Worker configuration, and output. From the repository root, use `npm run build` or `npm run cf:check` for apex; use `npm run build:join`, `npm run test:join`, and/or `npm run cf:check:join` for join as appropriate. The `cf:check` commands build and perform Wrangler dry runs; deploy commands publish and require separate authorization.

For join content, consult the Dream creator deck's `build_deck.py` identified in the README and keep corresponding content aligned across both. Compare `join/src/economy.js` with sibling `Platform/packages/shared/src/economy.ts` for economic rules and run the join economy tests when relevant. Coordinate changes to other repositories within the user's requested scope; surface a mismatch when a needed cross-repository change is outside it. Treat calculator inputs as examples, not product promises.

Preserve the owner decision to keep join out of search: HTML `noindex`, the `X-Robots-Tag` header, and robots disallow. The README records an edge-managed robots override, so do not assume robots.txt alone prevents indexing. Only change this decision on owner instruction. For authorized releases, follow the README's target-specific post-deploy checks and report deployment separately from local checks.
