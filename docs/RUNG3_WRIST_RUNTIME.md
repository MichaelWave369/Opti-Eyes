# Rung 3 / Actual Gen.E.Wrist software integration, no hardware

## What really runs

Opti-Eyes imports `createWrist` from the pinned upstream Gen.E.Wrist `src/core.js` and `createWorldAdapter` from upstream `src/world-adapter.js`, both at commit `f311d7392c346e7361037fc77ad17db061e8fd70`. The five necessary upstream ES modules and MIT license are bundled under `vendor/genewrist`, and tests compare each to its exact pinned Git blob hash.

This is **not** the full separate Gen.E.Wrist web application. It is a trusted, in-process WorldAdapter host demonstrating the actual canonical permission system. No cross-site communications, external script tags, external CDN, browser storage, telemetry, networking, physical lenses or physical wrists.

## Exercise the demo

1. Select **WRIST*** mode.
2. Click **CONNECT VIRTUAL WRIST**. The widget reads live synthetic focus and starts with **no permissions**.
3. Before granting, try a focus action. The real Gen.E.Wrist request should reject with `Capability not granted`, leaving focus unchanged.
4. Check **GRANT SIMULATED FOCUS CONTROL**. The explicit Gen.E.Wrist `setWorldGrants` call enables the two allowlisted actions.
5. Press either focus button. `requestWorldAction` routes to the current Opti-Eyes host, which steps the simulated actuator only while Wrist Preview is active.
6. Uncheck the grant; another request must reject. Disconnect, reset or change modes; the session and subscriptions are discarded, and no permission survives reconnection.

## Responsibilities

- Gen.E.Wrist core owns WORLD state, capability approvals, allowlisted context controls, action checking, disconnect lifecycle and subscription cleanup.
- Opti-Eyes owns synthetic distance and focus values, the virtual button handlers, its local-only status reporting and UI state.
- No additional 3–6–9 modules were added, and the upstream Gen.E.Wrist repo is unchanged.
- SDK pin upgrades require review and revalidation of the vendor files, not hand-editing cloned SDK source.

## Security and hardware claims

The API is not a sandbox for untrusted plugins: only locally bundled trusted callbacks may register. Revocation does not retroactively undo an already completed action. The model's focus setting is **not** an eye-safe physical lens position, the bridge is **not** device communication, and clinical or physical hardware usage remains outside this rung.
