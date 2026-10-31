# Opti-Eyes | Φ369 Labs

**Vision is an interface. Clarity is a responsibility.**

Opti-Eyes is the open, local-first adaptive optics research track of the original **physical GEN-E ecosystem**. The physical **GEN.E.WRIST** is the planned companion controller; the existing [Gen.E.Wrist software project](https://github.com/MichaelWave369/GenEWrist) is a separate, already implemented UI system.

## Rung 1: Focus Lab

A dependency-free, GitHub Pages-ready browser simulator. It demonstrates the relationship between viewing distance, idealized optical vergence (diopters), and hypothetical independent left/right adjustable-focus elements. It contains:

- Three explicit simulation modes: **Manual**, **Simulated Adaptive** (synthetic distance sensor), and **Wrist Preview** (mock actions, no pairing).
- A live near/far demand model with a simulated 0–3 D focusing actuator and per-eye research offsets.
- Accessible range controls, an interactive optical diagram, optical limit indicators, and a local-only export of the current synthetic lab snapshot.
- A **proposed**, noninstalled Gen.E.Wrist WorldAdapter v1 demo manifest. No hardware I/O or hidden permissions.
- Node built-in tests, Actions checks, and a GitHub Pages deployment workflow.

**This is not an eyeglass prescription calculator, a medical device, or a working autofocus/UV-filtering product.** The simulation is deliberately simplified. No optical or clinical outcomes are claimed, and the prototype should never be used for driving or safety-critical vision tasks.

## Rung 2: Sensor-fault simulator

Adaptive mode now offers six synthetic sensor conditions: clear, confidently biased, occluded, noisy, stale, and out-of-range. A deterministic validation gate accepts or rejects each sample and visibly reverts to the **manual-backup slider setting** when rejected. The high-confidence biased case deliberately passes, illustrating the limitation of a simple gate. A new synthetic telemetry panel reports distance, confidence, age, and decision. The optional export labels its report as schema v2, synthetic, with no hardware attached.

**This is not verified autofocus, safe physical fallback, optical correction, or a medical device.** See [Sensor Bench](docs/SENSOR_BENCH.md).

## Rung 3: Real SDK, local virtual wrist

Opti-Eyes now uses a **byte-pinned, unmodified subset of the actual Gen.E.Wrist 0.3.0 core and WorldAdapter v1 implementation**, bundled locally for offline GitHub Pages use. In **WRIST*** mode you can explicitly connect a virtual wrist, inspect its live status, grant or revoke `adjust-focus`, and send focus-step commands through Gen.E.Wrist's real `requestWorldAction` permission checks.

No action is permitted on connect. Leaving Wrist Preview, resetting the lab, or disconnecting clears the virtual grant and subscriptions. An action attempted before a grant is denied. The virtual wrist is **inside this same browser page**: this is *not* a connection to another Gen.E.Wrist website/tab or a physical device, and no Bluetooth, USB or network interaction is provided.

See [Real SDK Bridge](docs/RUNG3_WRIST_RUNTIME.md) and [pinned upstream provenance](vendor/genewrist/README.md).

## Rung 4: Browser Hardware Design Studio

A standalone parametric front-and-side geometry sketch with six bounded dimensions and four optomechanical architecture research options. Exports are local: vector SVG, OpenSCAD source for **non-wearable bench geometry only**, and JSON with explicit safety/fit disclaimers.

This does not provide optical alignment, interpupillary distance fitting, certified lenses, a safe wearable frame, or a physical device. Review the Rung 4 design specification in docs/RUNG4_HARDWARE_STUDIO.md.

## Run

Open `index.html` in a modern browser, or serve this directory using a static HTTP server.

```sh
npm test
npm run check
npm run build
```

No package installation is required; Node 20+ is recommended for build/tests. The deployable static site is in `dist/`. GitHub Pages workflow runs after changes merge to `main` and requires Pages to be configured for GitHub Actions in repository Settings.

## Boundaries and roadmap

- [Architecture](docs/ARCHITECTURE.md)
- [Gen.E.Wrist bridge design](docs/GENE_WRIST_BRIDGE.md)
- [Optics and hardware safety gates](docs/HARDWARE_ROADMAP.md)

Everything is offline-capable after being served locally, with no remote services, telemetry, camera, microphone, biometric collection, or connected devices. This repository **does not modify** Gen.E.Wrist or its canonical 3–6–9 module count.

MIT licensed. Enter the Field | Φ369 Labs.
