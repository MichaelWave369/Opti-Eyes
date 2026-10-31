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
