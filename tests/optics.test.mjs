import test from "node:test";
import assert from "node:assert/strict";
import { calculateOptics, clamp, distanceDemandD } from "../src/optics.mjs";

test("vergence demand is inverse distance in diopters", () => {
  assert.equal(distanceDemandD(1), 1);
  assert.equal(distanceDemandD(0.5), 2);
  assert.equal(distanceDemandD(0.25), 4);
});
test("invalid inputs fail closed", () => {
  for (const distanceM of [0, Infinity, NaN, -1, 6.01]) assert.throws(() => distanceDemandD(distanceM));
  assert.throws(() => calculateOptics({ mode: "hardware", distanceM: 1, manualAddD: 1 }));
  assert.throws(() => calculateOptics({ mode: "manual", distanceM: 1, manualAddD: -0.1 }));
  assert.throws(() => calculateOptics({ mode: "manual", distanceM: 1, manualAddD: 1, leftOffsetD: 0.76 }));
});
test("manual mode is not influenced by target distance", () => {
  const base = { mode: "manual", manualAddD: 1.2 };
  assert.equal(calculateOptics({ ...base, distanceM: 1 }).baseAddD, 1.2);
  assert.equal(calculateOptics({ ...base, distanceM: 4 }).baseAddD, 1.2);
});
test("adaptive synthetic sensor follows near demand but saturates at limits", () => {
  const base = { mode: "adaptive", manualAddD: 0 };
  assert.equal(calculateOptics({ ...base, distanceM: 0.5 }).baseAddD, 2);
  const near = calculateOptics({ ...base, distanceM: 0.25 });
  assert.equal(near.baseAddD, 3);
  assert.equal(near.actuatorLimited, true);
  assert.equal(near.leftResidualD, 1);
});
test("per-eye offsets independent, bounded and do not change requested base", () => {
  const o = calculateOptics({ mode: "manual", distanceM: 0.5, manualAddD: 2, leftOffsetD: -0.25, rightOffsetD: 0.5 });
  assert.equal(o.baseAddD, 2);
  assert.equal(o.leftAddD, 1.75);
  assert.equal(o.rightAddD, 2.5);
});
test("clamp rejects NaN and bad limits", () => {
  assert.throws(() => clamp(NaN, 0, 1));
  assert.throws(() => clamp(0.5, 1, 0));
});
