# Architecture / Rungs 1–2

Opti-Eyes owns an **optical research simulator** today. Hardware design, physical autofocus, XR integration, sensor fusion, prescription adaptation and actual device pairing are **future research**, not working capabilities.

- `src/optics.mjs`: pure deterministic idealized demand/actuator calculations.
- `src/sensor-model.mjs`: deterministic sensor fault fixtures, gate decisions, and visible manual fallback.
- `src/app.mjs`: accessible same-origin UI; input comes exclusively from the user's range controls and mode buttons.
- `src/wrist-bridge.mjs`: pure proposal for a Gen.E.Wrist v1 **demo** manifest and allowlisted synthetic status.
- `tests/`: Node built-in tests for numerical boundaries and preview interface.
- `scripts/build.mjs`: dependency-free static Pages artifact.

All lab state is in memory and reset on reload. No localStorage, telemetry, fetch, cookies, camera, audio, background sensors, physical-device API, or remote AI. Export happens only on explicit click. No clinical data is requested.

## Rung 2 sensor boundaries

The sensor fixtures are triggered by a user-selected dropdown, with no timers or background sampling. A failed reading uses the user-chosen backup; ground truth stays in the mathematical model only to expose a mismatch. Confidence and age gates are illustrative, and a high-confidence biased sample intentionally passes. Gen.E.Wrist remains unchanged and there is still no physical device connection.

## Model limitations

The example uses `1 / distanceM` as idealized vergence demand in diopters, not an actual prescription or a physiological model of accommodation. Simulated lens add of 0–3 D is hypothetical and does not correspond to a qualified physical actuator. Per-eye offsets are research knobs, not refractive correction or interpupillary distance. Residual D is arithmetic mismatch, **not a prediction of eyesight quality**, safety, optical aberrations, or sharpness.

## 3 / 6 / 9

**3 simulation modes:** manual, synthetic adaptive, wrist command preview.

**6 future workstreams:** optics, distance sensing, certified light protection, AR display, wrist connectivity, verification/repair.

**9 verification gates:** model assumptions, optical bench, mechanical safety, electrical safety, sensor failure, wearer comfort, professional fitting, regulatory assessment, independent replication.

Keep Opti-Eyes modular. Do not add a nineteenth core Gen.E.Wrist module, overwrite its 3/6/9 design or invent a network/permissions bridge.
