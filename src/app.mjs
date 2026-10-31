import { LIMITS } from "./optics.mjs";
import { assessLaboratoryState } from "./sensor-model.mjs";
import { applyWristPreviewStep, createDemoStatus } from "./wrist-bridge.mjs";
import { createOptiEyesWristSession } from "./wrist-session.mjs";

const byId = (id) => document.getElementById(id);
const state = { mode: "manual", distanceM: 0.65, manualAddD: 1.5, leftOffsetD: 0, rightOffsetD: 0, sensorCondition: "clear" };
let wristSession = null;
const labels = {
  manual: "Directly adjust the simulated focus actuator.",
  adaptive: "Test synthetic sensor confidence, staleness, range limits and manual backup. No physical sensor is used.",
  wrist: "Connect the pinned Gen.E.Wrist SDK, explicitly grant simulated control, and exercise the real permission checks. No physical pairing."
};
const round2 = (n) => (Math.round(n * 100) / 100).toFixed(2);
const signed = (n) => (n > 0 ? "+" : "") + round2(n) + " D";
const clampedPct = (value) => Math.max(0, Math.min(100, value / LIMITS.maxAddD * 100));

function render() {
  const result = assessLaboratoryState(state);
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
  byId("manual-add-label").textContent = state.mode === "adaptive" ? "MANUAL BACKUP (SENSOR FAILURE)" : "FOCUS ACTUATOR (SIMULATED)";
  const report = result.sensorReport;
  byId("sensor-scenario").disabled = state.mode !== "adaptive";
  byId("sensor-status").textContent = !report ? "NOT ACTIVE" : result.fallback ? "REJECTED / BACKUP" : report.hiddenBiasDemonstrated ? "ACCEPTED / BIAS!" : "ACCEPTED";
  byId("sensor-status").dataset.quality = !report ? "inactive" : result.fallback ? "rejected" : report.hiddenBiasDemonstrated ? "warning" : "accepted";
  byId("sensor-reading").textContent = !report ? "—" : report.readingDistanceM === null ? "NO SIGNAL" : round2(report.readingDistanceM) + " m";
  byId("sensor-confidence").textContent = !report ? "—" : Math.round(report.confidence * 100) + "%";
  byId("sensor-age").textContent = !report ? "—" : report.ageMs + " ms";
  byId("sensor-notes").textContent = !report ? "Choose adaptive mode to experiment with synthetic sensor faults." :
    report.hiddenBiasDemonstrated ? "WARNING: a confident but biased sample passed the gate. Confidence does not prove accuracy." :
    result.fallback ? report.reason + ": manual backup selected. NOT a qualified safe optical state." :
    "Synthetic sample accepted by range, age and confidence checks. Real-world accuracy is not established.";
  byId("output-fill").style.width = clampedPct(result.baseAddD) + "%";
  byId("demand-marker").style.left = clampedPct(result.demandD) + "%";
  byId("limit-message").textContent = result.fallback
    ? "SENSOR REJECTED: manually chosen backup shown. No physically safe optical state is asserted."
    : result.actuatorLimited ? "LIMIT REACHED: this hypothetical 0–3 D element cannot match the selected near-demand value."
    : "Residual is a model difference, NOT a measurement of visual acuity or lens performance.";
  // Manual slider remains active in adaptive mode as an explicit backup setting.
  const canCommand = state.mode === "wrist" && Boolean(wristSession);
  byId("wrist-near").disabled = !canCommand;
  byId("wrist-far").disabled = !canCommand;
  wristSession?.publish();
  renderWristPanel();
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
byId("sensor-scenario").addEventListener("change", () => { state.sensorCondition = byId("sensor-scenario").value; render(); });
function disconnectWrist(reason) {
  const old = wristSession;
  wristSession = null;
  old?.disconnect();
  byId("wrist-grant").checked = false;
  if (reason) byId("wrist-sdk-status").textContent = reason;
  renderWristPanel();
}
function renderWristPanel() {
  const snapshot = wristSession?.snapshot();
  const connected = Boolean(snapshot);
  const granted = connected && snapshot.grants.includes("adjust-focus");
  byId("wrist-sdk-state").textContent = !connected ? "DISCONNECTED" : granted ? "CONNECTED / GRANTED" : "CONNECTED / LOCKED";
  byId("wrist-connect").disabled = connected || state.mode !== "wrist";
  byId("wrist-disconnect").disabled = !connected;
  byId("wrist-grant").disabled = !connected;
  byId("wrist-grant").checked = Boolean(granted);
  byId("wrist-live-focus").textContent = connected ? Number(snapshot.status["focus-d"]).toFixed(2) + " D" : "—";
}
document.querySelectorAll("[data-mode]").forEach((button) => button.addEventListener("click", () => {
  if (state.mode === "wrist" && button.dataset.mode !== "wrist") disconnectWrist("Exited Wrist Preview. Session closed and permission revoked.");
  state.mode = button.dataset.mode;
  render();
}));
byId("wrist-connect").addEventListener("click", () => {
  if (wristSession || state.mode !== "wrist") return;
  try {
    wristSession = createOptiEyesWristSession({
      readLab: () => ({ ...state }),
      applyStep: (delta) => {
        state.manualAddD = applyWristPreviewStep(state.manualAddD, delta);
        byId("manual-add").value = String(state.manualAddD);
        render();
      },
      onChange: renderWristPanel
    });
    byId("wrist-sdk-status").textContent = "Local SDK connected. Focus actions are DENIED until you explicitly grant access.";
    render();
  } catch (error) {
    disconnectWrist("Connection failed: " + error.message);
  }
});
byId("wrist-grant").addEventListener("change", () => {
  if (!wristSession) { byId("wrist-grant").checked = false; return; }
  try {
    wristSession.setGranted(byId("wrist-grant").checked);
    byId("wrist-sdk-status").textContent = byId("wrist-grant").checked ?
      "Explicit grant active. Simulated focus commands now use Gen.E.Wrist's guarded requestWorldAction." :
      "Permission revoked. Focus actions are denied again.";
  } catch (error) {
    byId("wrist-sdk-status").textContent = error.message;
  }
  renderWristPanel();
});
byId("wrist-disconnect").addEventListener("click", () => disconnectWrist("Local SDK disconnected. Grants revoked and subscriptions released."));
async function sendWristCommand(actionId) {
  if (state.mode !== "wrist" || !wristSession) return;
  try {
    await wristSession.requestAction(actionId);
    byId("wrist-sdk-status").textContent = "Approved simulated action completed: " + actionId + ".";
  } catch (error) {
    byId("wrist-sdk-status").textContent = "Action DENIED: " + error.message;
  }
  renderWristPanel();
}
byId("wrist-near").addEventListener("click", () => sendWristCommand("focus-near"));
byId("wrist-far").addEventListener("click", () => sendWristCommand("focus-far"));
byId("reset").addEventListener("click", () => {
  disconnectWrist("Laboratory reset. Any virtual wrist grant was revoked.");
  Object.assign(state, { mode: "manual", distanceM: 0.65, manualAddD: 1.5, leftOffsetD: 0, rightOffsetD: 0, sensorCondition: "clear" });
  byId("sensor-scenario").value = "clear";
  for (const [id, value] of [["distance", state.distanceM], ["manual-add", state.manualAddD], ["left-bias", 0], ["right-bias", 0]]) byId(id).value = String(value);
  render();
});
byId("export").addEventListener("click", () => {
  const result = assessLaboratoryState(state);
  const content = JSON.stringify({ kind: "opti-eyes-synthetic-lab", schemaVersion: 3, hardwareConnected: false, syntheticSensorOnly: true, virtualWristOnly: true, state, result, proposedWristStatus: createDemoStatus(result) }, null, 2);
  const url = URL.createObjectURL(new Blob([content], { type: "application/json" }));
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = "opti-eyes-lab-simulation.json";
  document.body.append(anchor); anchor.click(); anchor.remove();
  URL.revokeObjectURL(url);
});
render();
