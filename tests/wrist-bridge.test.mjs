import test from "node:test";
import assert from "node:assert/strict";
import { OPTI_EYES_DEMO_MANIFEST, createDemoStatus, applyWristPreviewStep } from "../src/wrist-bridge.mjs";
test("proposed manifest conforms to its explicit permission strategy", () => {
  assert.equal(OPTI_EYES_DEMO_MANIFEST.apiVersion, 1);
  assert.equal(OPTI_EYES_DEMO_MANIFEST.kind, "demo");
  assert.deepEqual(OPTI_EYES_DEMO_MANIFEST.capabilities, ["adjust-focus"]);
  for (const action of OPTI_EYES_DEMO_MANIFEST.actions) assert.equal(action.capability, "adjust-focus");
});
test("preview focus commands clamp to actuator range", () => {
  assert.equal(applyWristPreviewStep(2.8, 0.5), 3);
  assert.equal(applyWristPreviewStep(0.1, -0.5), 0);
  assert.throws(() => applyWristPreviewStep(1, NaN));
});
test("demo status is allowlisted and contains no per-eye or private state", () => {
  const snapshot = { distanceM: 0.5, baseAddD: 2, mode: "wrist", leftOffsetD: 0.25, rightOffsetD: -0.5 };
  const status = createDemoStatus(snapshot);
  assert.deepEqual(Object.keys(status.status).sort(), ["distance-m", "focus-d", "mode"]);
  assert.equal(status.status["focus-d"], 2);
  assert.throws(() => createDemoStatus({ distanceM: Infinity, baseAddD: 1 }));
});
