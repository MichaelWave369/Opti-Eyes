# Rung 2 / Synthetic Sensor Failure Bench

This is a deterministic educational simulation, **not verified autofocus, a prescription, medical-grade sensing, or a safe physical lens fallback**.

| Fixture | Reading | Confidence | Age | Expected |
|---|---|---|---|---|
| Clear | true simulated distance | 99% | 35ms | accepted |
| Biased | true distance + 0.3m | 98% | 35ms | often accepted despite error |
| Occluded | no reading | 0% | 35ms | manual backup |
| Noisy | true distance + 0.4m | 45% | 35ms | manual backup |
| Stale | true distance | 99% | 1500ms | manual backup |
| Out of range | 8m | 99% | 35ms | manual backup |

The synthetic gate checks confidence ≥ 0.8, age ≤ 250ms, and 0.25–6m sample range. Those numbers are illustrative, not an optical engineering specification. The **biased** fixture intentionally passes basic checks to demonstrate why confidence is not accuracy.

To reproduce: choose ADAPTIVE, set target distance 0.5m, select each condition, and inspect reading, confidence, age, decision, output and model residual. Adjust the manual backup slider; blocked/noisy/stale/out-of-range fixtures must output that setting. Change to MANUAL or WRIST; sensor conditions must not affect output. JSON export captures a marked synthetic report.

Before actual eyewear, any candidate sensor/actuator needs independently characterized accuracy, latency, power-failure behavior, wearer safety, optical test fixtures and professional review. The demo backup value is **not** a validated physical fail-safe state.
