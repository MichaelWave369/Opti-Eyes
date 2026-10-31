# Pinned Gen.E.Wrist v0.3.0 SDK source subset

**Upstream:** https://github.com/MichaelWave369/GenEWrist

**Commit:** `f311d7392c346e7361037fc77ad17db061e8fd70` (exact revision). This directory is a **read-only byte-identical subset** of the upstream MIT-licensed SDK, not an Opti-Eyes fork. Its source is pinned in `provenance.mjs`, and CI checks each Git blob SHA-1. Refresh only by verifying and replacing all imported modules from a reviewed upstream commit; do not hand-edit vendored files.

Imported modules: `core.js`, `world-adapter.js`, `catalog.js`, `storage.js`, and `worlds.js`. Included `LICENSE` is upstream's.

Why vendored? GitHub Pages runs a static site with no network dependency at runtime, so a pinned local snapshot lets the Opti-Eyes simulator use the **actual Gen.E.Wrist WorldAdapter implementation** without fetching cross-origin scripts. No physical GEN-E wrist pairing, communication with another browser tab/site, or embedding of the full Gen.E.Wrist console is provided.

No npm install or external service is required to run the Rung 3 laboratory.
