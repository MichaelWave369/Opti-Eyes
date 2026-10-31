# Opti-Eyes Rung 7: Bench Hardware Architecture

## Why this rung exists

Rungs 1–6 built the optical, sensor fault, Gen.E.Wrist software, CAD geometry, power-budget and bench-recordkeeping tools. **No physical lens, sensor or frame has been manufactured or tested.** Rung 7 connects these software artifacts with an evidence-first physical architecture plan, but still does not operate hardware.

## Six component slots

1. Optical element: document the optical technology family, aperture, diopter range, aberrations and loss-of-power state using primary manufacturer datasheets.
2. Distance sensor: characterize range, accuracy by surface and light, field of view, failure signals and latency.
3. Local compute: controller I/O, firmware signing/updates, watchdog, measured current, protection strategy and offline operation.
4. Actuator/driver: guarded bench-only motion with explicit hard travel limits, end stops, fault detection and electrical disable.
5. Power and protections: charging, cell certification, reverse polarity, thermal behavior, current protection, ingress and safe storage.
6. Optical test fixture: non-wearable clamped mount, calibrated reference tools, repeatable measurements and never a live wearer.

The sourcing form stores a manufacturer name, part reference, optional revision and optional HTTPS URL. **All data is user-provided and unverified.** An HTTPS URL establishes a citation field, not an official source, current availability, suitability, electrical compatibility, or verified specification. No prices, power ratings, performance or inventory are inferred.

## Mock packet model

The local protocol demonstrator has the following states: DISCONNECTED → CONNECTED (grant false) → GRANTED (explicit user opt-in). Focus commands are denied without a connection and explicit grant. Every accepted local mock action creates a deterministic, sequenced envelope labeled `simulation:true`, `hardwareConnected:false`, `channel:"local-demo-only"`. Simulated signal loss/disconnect clears the grant. Reconnecting does not restore it. No Bluetooth, serial, USB, HID, network, WebSockets, real sensors or motors are used.

This **is not** the connected Gen.E.Wrist SDK from Rung 3, which is separately bundled and permission-checked for same-page virtual controls. A later design must reconcile the protocol with the real versioned WorldAdapter, device hardware and appropriate physical safety interlocks. A pure software grant is never sufficient to make eye-facing optical actuation safe. Do not bridge the mock packet generator into a physical motor controller.

## Nine verification gates

The nine gates are published explicitly in `BENCH_GATES`. They cover architectural scope; original and versioned manufacturer data; independent specification review; off-device electrical tests; guarded optical bench checks; sensor failure cases; permission and connection loss; thermal/mechanical/power failures; and independent optical/regulatory assessment.

All gates remain NOT VERIFIED in this rung. Candidate provenance does not automatically close any gate. The JSON receipt includes `physicalHardwareConnected:false`, `opticalActuation:false`, `wearableApproved:false`, `independentDatasheetsVerified:false` and `regulatoryApproved:false`.

## Bench-first experiment design

The first *potential* real-world step is not glasses: choose an optical technology and document measurable requirements, source supplier datasheets, and commission a qualified bench-only feasibility review. Any physical test must be planned with suitable electrical, optical and mechanical safety expertise. User-facing eyewear, motorization near eyes, prescriptions, battery use around a face and similar high-risk steps remain out of scope.

## Acceptance

`npm run check && npm run build`. Test empty sourcing, source URL validation, duplicate records, missing slots, permissions, sequential mock packets, signal loss, export caveats, and Pages static build. Rungs 1–6 and the independent Gen.E.Wrist SDK remain unchanged.
