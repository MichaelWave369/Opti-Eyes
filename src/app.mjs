import { calculateOptics, LIMITS } from "./optics.mjs";
import { applyWristPreviewStep, createDemoStatus } from "./wrist-bridge.mjs";

const byId = (id) => document.getElementById(id);
const state = { mode: "manual", distanceM: 0.65, manualAddD: 1.5, leftOffsetD: 0, rightOffsetD: 0 };
const labels = {
  manual: "Directly adjust the simulated focus actuator.",
  adaptive: "A synthetic distance sensor controls a simulated actuator. No real camera or sensor is used.",
  wrist: "Preview capability-gated Gen.E.Wrist commands locally. No device connection exists."
};
const round2 = (n) => (Math.round(n * 100) / 100).toFixed(2);
const signed = (n) => (n > 0 ? "+" : "") + round2(n) + " D";
const clampedPct = (value) => Math.max(0, Math.min(100, value / LIMITS.maxAddD * 100));

function render() {
  const result = calculateOptics(state);
  byId("target-distance").textContent = round2(state.distanceM) + " m";
  byId("target-demand").textContent = round2(result.demandD) + " D";
  byId("focus-output").textContent = round2(result.baseAddD) + " D";
  byId("left-output").textContent = round2(result.leftAddD) + " D";
  byId("right-output").textContent = round2(result.rightAddD) + " D";
  byId("left-error").textContent = "Residual " + round2(result.leftResidualD) + " D";
  byId("right-error").textContent = "Residual " + round2(result.rightResidualD) + " D";
  byId("distance-value").textContent = round2(state.distanceM) + " m";
  byId("manual-value").textContent = round2(state.manualAddD) + " D";
  byId("left-bias-value").textContent = signed(state.leftOffsetD);
  byId("right-bias-value").textContent = signed(state.rightOffsetD);
  byId("mode-readout").textContent = state.mode.toUpperCase() + (state.mode === "manual" ? "" : " / DEMO");
  byId("mode-help").textContent = labels[state.mode];
  byId("output-fill").style.width = clampedPct(result.baseAddD) + "%";
  byId("demand-marker").style.left = clampedPct(result.demandD) + "%";
  byId("limit-message").textContent = result.actuatorLimited
    ? "LIMIT REACHED: this hypothetical 0–3 D element cannot match the selected near-demand value."
    : "Residual is a model difference, NOT a measurement of visual acuity or lens performance.";
  byId("manual-add").disabled = state.mode === "adaptive";
  byId("wrist-near").disabled = state.mode !== "wrist";
  byId("wrist-far").disabled = state.mode !== "wrist";
  document.querySelectorAll("[data-mode]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.mode === state.mode)));
  // Schematic only: conveys an intuitive change, never claims physical ray tracing.
  const amplitude = 6 + result.baseAddD * 6;
  byId("lens-curve").setAttribute("d", "M520 55Q" + (520 - amplitude) + " 155 520 256Q" + (520 + amplitude) + " 155 520 55");
}
function numberInput(id, key) {
  byId(id).addEventListener("input", () => { state[key] = Number(byId(id).value); render(); });
}
numberInput("distance", "distanceM");
numberInput("manual-add", "manualAddD");
numberInput("left-bias", "leftOffsetD");
numberInput("right-bias", "rightOffsetD");
document.querySelectorAll("[data-mode]").forEach((button) => button.addEventListener("click", () => { state.mode = button.dataset.mode; render(); }));
function focusStep(delta) {
  if (state.mode !== "wrist") return;
  state.manualAddD = applyWristPreviewStep(state.manualAddD, delta);
  byId("manual-add").value = String(state.manualAddD);
  render();
}
byId("wrist-near").addEventListener("click", () => focusStep(0.5));
byId("wrist-far").addEventListener("click", () => focusStep(-0.5));
byId("reset").addEventListener("click", () => {
  Object.assign(state, { mode: "manual", distanceM: 0.65, manualAddD: 1.5, leftOffsetD: 0, rightOffsetD: 0 });
  for (const [id, value] of [["distance", state.distanceM], ["manual-add", state.manualAddD], ["left-bias", 0], ["right-bias", 0]]) byId(id).value = String(value);
  render();
});
byId("export").addEventListener("click", () => {
  const result = calculateOptics(state);
  const content = JSON.stringify({ kind: "opti-eyes-synthetic-lab", schemaVersion: 1, hardwareConnected: false, state, result, proposedWristStatus: createDemoStatus(result) }, null, 2);
  const url = URL.createObjectURL(new Blob([content], { type: "application/json" }));
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = "opti-eyes-lab-simulation.json";
  document.body.append(anchor); anchor.click(); anchor.remove();
  URL.revokeObjectURL(url);
});
render();
