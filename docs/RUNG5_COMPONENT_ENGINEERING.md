# Rung 5 | Opti-Eyes Component Engineering Lab

## Scope

This rung provides a browser-based **research assumption sandbox**, not a purchasing bill of materials or a wearable prototype plan. Four optical architecture categories reuse the Rung 4 mechanism picker. Each mechanism has an invented, clearly marked starting assumption profile for optical idle/active power and mass. These profiles are **neither actual component specifications nor measurements**.

All sliders permit user edits within UI safety bounds, but those bounds are not physically validated.

## Arithmetic, units and limits

Inputs:
- Battery capacity **mAh**, nominal voltage **V**, usable fraction **%**.
- Controller, sensor, optic-idle, optic-active **increment**, and display power **mW**.
- Optic-active duty **%**.
- Frame, optics, electronics, and battery mass **g**.
- A personal illustrative mass target **g**, never a comfort or fit threshold.

The pure model computes:
- Nominal energy (**mWh**) = nominal cell capacity (mAh) × nominal voltage (V).
- Derated energy (mWh) = nominal energy × usable fraction.
- Baseline draw (mW) = controller + sensor + optics idle + display.
- Active draw (mW) = baseline + optic-active **increment**.
- Average draw (mW) = baseline + optic-active increment × (duty/100).
- Arithmetic runtime (h) = derated energy (mWh) / average draw (mW).
- Approximate nominal peak current (mA) = active power (mW) / nominal voltage (V).
- Simplified mass sum (g) = frame + optics + electronics + battery.

The usable fraction is **user-defined**, and **is not** a validated battery efficiency curve. Calculations ignore voltage sag, control overhead, DC/DC losses, temperature, cell aging, capacity vs discharge rate, battery protections, actuator stalls, radio transmission, display brightness variations, moving targets and dynamic workloads. The peak current assumes the battery nominal voltage, not the real regulator or discharge current profile.

Therefore, no estimated figure proves safe runtime, weight balance, comfort or component compatibility.

## Architecture choices

The same four mechanism names and research descriptions from Rung 4 remain available. Switching mechanism in Rung 4 resets only the hypothetical optic power/mass assumptions, preserving other user edits. The fixed-insert baseline has **zero hypothetical optic actuation**, but it is explicitly **not autofocusing**.

## Evidence / decision gates

Before any actual component or battery selection, collect:
1. Vendor datasheets with revision, manufacturer, part number and source.
2. Actual lens range and optical performance measurements on a fixture.
3. Distance sensor accuracy across materials, lighting, motion and occlusions.
4. Actuator stalled/idle/active measured power and safe fault state.
5. Battery pack protection, electrical, charging, thermal and mechanical review.
6. Real mass/center-of-mass/fit and applicable standards/regulatory assessment.

The visual register is intentionally **all UNVERIFIED**. The export includes `wearableApproved:false`, `prototypingApproved:false` and `eyeSafetyValidated:false`. It is a research artifact, not a qualified engineering signoff.

## Verification

Run `npm run check && npm run build`. Test boundary checks, units, known arithmetic, monotonic runtime under increased duty, mechanism profiles, evidence receipt flags and existing Rung 1–4 UI markers. Browser manual acceptance: move sliders, change the Rung 4 optical architecture, inspect runtime sensitivity and export the JSON receipt. The existing Gen.E.Wrist grant/session behavior must remain unaffected.
