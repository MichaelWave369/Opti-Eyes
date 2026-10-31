# Gen.E.Wrist WorldAdapter integration

**Update / Rung 3:** The [local SDK demo](RUNG3_WRIST_RUNTIME.md) now executes actual pinned Gen.E.Wrist v0.3.0 core and WorldAdapter logic within the Opti-Eyes page. The earlier description below concerns the original proposal and broader future hardware integration.

The canonical [Gen.E.Wrist API v1](https://github.com/MichaelWave369/GenEWrist/blob/main/docs/ADAPTER_API.md) is host-owned, versioned and permission-gated. Opti-Eyes should eventually be a separate, explicitly registered **demo host** in Gen.E.Wrist WORLD Mode. This repository does not change Gen.E.Wrist.

`src/wrist-bridge.mjs` exports the reviewed candidate data-only `OPTI_EYES_DEMO_MANIFEST`, plus functions for synthetic status and simulated button steps. These are **not a live connector**, and they never transfer data between websites.

In a future explicitly reviewed integration, a trusted local host would:

1. Import a *pinned* Gen.E.Wrist SDK and `createWorldAdapter`.
2. Register the candidate manifest with `kind: "demo"`, `apiVersion: 1`, context `optics`, and capability `adjust-focus`.
3. Supply `readState` with **only** `distance-m`, `focus-d` and `mode` synthetic fields.
4. Supply an explicit `subscribe` disposer, plus `focus-near`/`focus-far` callbacks referencing existing local demo state.
5. Call `wrist.connectWorld(adapter)`, then obtain a separately user-approved grant through Gen.E.Wrist's existing `setWorldGrants` interface. Without that grant, action requests are denied.
6. Honor `AbortSignal` cancellation, on-disconnect cleanup, denied grants, and the wrist's existing Home/Back behavior.

Do **not** add a separate permission bypass, use unrestricted postMessage, silently bridge origins, or talk to real optics. Real physical lens actuation requires a different, independently reviewed safety and consent architecture with failsafe reversion to a safe optical state.

No claims of successful SDK runtime integration or physical hardware pairing are made in this rung.
