# Architecture / Rungs 1–6

Opti-Eyes owns an **optical research simulator** today. Hardware design, physical autofocus, XR integration, sensor fusion, prescription adaptation and actual device pairing are **future research**, not working capabilities.

- `src/optics.mjs`: pure deterministic idealized demand/actuator calculations.
- `src/frame-model.mjs`: pure bounded geometry model and local concept export generators.
- `src/component-model.mjs`: pure editable, explicitly unverified power/energy/mass arithmetic and evidence gates.
- `src/optical-bench.mjs`: pure trial/schema validation, user criteria comparison, deterministic synthetic fixtures, source-aware research exports.
- `src/bench-studio.mjs`: manual record-entry UI and in-memory ledger with no hardware or persistence.
- `src/component-studio.mjs`: isolated UI controls, optical-mechanism profile sync, and local research receipt export.
- `src/hardware-studio.mjs`: isolated browser parametric controls and export buttons, no shared wrist/sensor state.
- `src/sensor-model.mjs`: deterministic sensor fault fixtures, gate decisions, and visible manual fallback.
- `src/wrist-session.mjs`: trusted, same-page Gen.E.Wrist WorldAdapter v1 host, reversible permissions and cleanup.
- `vendor/genewrist/`: byte-pinned, read-only MIT-licensed upstream SDK subset with automated provenance validation.
- `src/app.mjs`: accessible same-origin UI; input comes exclusively from the user's range controls and mode buttons.
- `src/wrist-bridge.mjs`: pure proposal for a Gen.E.Wrist v1 **demo** manifest and allowlisted synthetic status.
- `tests/`: Node built-in tests for numerical boundaries and preview interface.
- `scripts/build.mjs`: dependency-free static Pages artifact.

All lab state is in memory and reset on reload. No localStorage, telemetry, fetch, cookies, camera, audio, background sensors, physical-device API, or remote AI. Export happens only on explicit click. No clinical data is requested.

## Rung 2 sensor boundaries

The sensor fixtures are triggered by a user-selected dropdown, with no timers or background sampling. A failed reading uses the user-chosen backup; ground truth stays in the mathematical model only to expose a mismatch. Confidence and age gates are illustrative, and a high-confidence biased sample intentionally passes. Gen.E.Wrist remains unchanged and there is still no physical device connection.

## Rung 3 SDK boundary

The Opti-Eyes host creates a genuine `createWrist` instance using the pinned Gen.E.Wrist core and a genuine `createWorldAdapter` instance using pinned upstream `world-adapter.js`. It registers only three synthetic status fields and two guarded commands. The wrist starts with no `adjust-focus` grant. This is same-process, same-page JavaScript only, not cross-origin messaging or hardware I/O.

Leaving wrist mode, resetting, or disconnecting closes the adapter and unsubscribes. A separate interactive grant is mandatory before commands can affect the synthetic model. Gen.E.Wrist's upstream source is bundled to keep the static Pages build offline capable; it is not edited within Opti-Eyes or pushed back upstream.

## Model limitations

The example uses `1 / distanceM` as idealized vergence demand in diopters, not an actual prescription or a physiological model of accommodation. Simulated lens add of 0–3 D is hypothetical and does not correspond to a qualified physical actuator. Per-eye offsets are research knobs, not refractive correction or interpupillary distance. Residual D is arithmetic mismatch, **not a prediction of eyesight quality**, safety, optical aberrations, or sharpness.

## 3 / 6 / 9

**3 simulation modes:** manual, synthetic adaptive, wrist command preview.

**6 future workstreams:** optics, distance sensing, certified light protection, AR display, wrist connectivity, verification/repair.

**9 verification gates:** model assumptions, optical bench, mechanical safety, electrical safety, sensor failure, wearer comfort, professional fitting, regulatory assessment, independent replication.

Keep Opti-Eyes modular. Do not add a nineteenth core Gen.E.Wrist module, overwrite its 3/6/9 design or invent a network/permissions bridge.
