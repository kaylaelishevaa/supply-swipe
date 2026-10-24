---
name: Migration boundaries
description: Scope decisions for porting the imported SupplySwipe prototype.
---

Preserve the standalone local demo behavior and synthetic-data status. Do not turn an import port into new backend, authentication, or database work.

**Why:** The Vercel app already supported local rule-based negotiations and localStorage persistence independently of an optional Python/Supabase service. Replacing that optional service would change the product and data architecture beyond the requested port.

**How to apply:** Treat any future live multi-user backend or database migration as separate work requiring explicit user direction.
