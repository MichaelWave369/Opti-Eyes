// Idealized inverse-distance vergence model. NOT an optical prescription or physical lens design.
export const LIMITS = Object.freeze({ minDistanceM: 0.25, maxDistanceM: 6, minAddD: 0, maxAddD: 3, maxOffsetD: 0.75 });
export const MODES = Object.freeze(["manual", "adaptive", "wrist"]);

export function clamp(value, min, max) {
  if (!Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max) || max < min) throw new RangeError("Finite, ordered numeric limits required");
  return Math.min(max, Math.max(min, value));
}

export function distanceDemandD(distanceM) {
  if (!Number.isFinite(distanceM) || distanceM < LIMITS.minDistanceM || distanceM > LIMITS.maxDistanceM) throw new RangeError("Distance must be 0.25 to 6 m");
  return 1 / distanceM;
}

export function calculateOptics(input) {
  if (!input || !MODES.includes(input.mode)) throw new TypeError("Unknown laboratory mode");
  const { distanceM, manualAddD, leftOffsetD = 0, rightOffsetD = 0 } = input;
  const demandD = distanceDemandD(distanceM);
  if (!Number.isFinite(manualAddD) || manualAddD < LIMITS.minAddD || manualAddD > LIMITS.maxAddD) throw new RangeError("Manual add out of range");
  for (const value of [leftOffsetD, rightOffsetD]) {
    if (!Number.isFinite(value) || Math.abs(value) > LIMITS.maxOffsetD) throw new RangeError("Per-eye offset out of range");
  }
  // Synthetic sensor simply reads the distance slider in adaptive mode.
  const baseAddD = input.mode === "adaptive" ? clamp(demandD, LIMITS.minAddD, LIMITS.maxAddD) : manualAddD;
  const leftAddD = clamp(baseAddD + leftOffsetD, LIMITS.minAddD, LIMITS.maxAddD);
  const rightAddD = clamp(baseAddD + rightOffsetD, LIMITS.minAddD, LIMITS.maxAddD);
  return Object.freeze({
    demandD, baseAddD, leftAddD, rightAddD,
    leftResidualD: Math.abs(demandD - leftAddD), rightResidualD: Math.abs(demandD - rightAddD),
    actuatorLimited: demandD > LIMITS.maxAddD,
    mode: input.mode, distanceM
  });
}
