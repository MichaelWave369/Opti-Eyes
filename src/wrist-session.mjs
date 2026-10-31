// Actual Gen.E.Wrist v0.3.0 WorldAdapter and createWrist core, pinned and bundled locally.
// A same-page simulated host bridge. No device access or cross-site pairing.
import { createWrist } from "../vendor/genewrist/src/core.js";
import { createWorldAdapter } from "../vendor/genewrist/src/world-adapter.js";
import { OPTI_EYES_DEMO_MANIFEST, createDemoStatus } from "./wrist-bridge.mjs";
import { assessLaboratoryState } from "./sensor-model.mjs";

export function createOptiEyesWristSession({ readLab, applyStep, onChange = () => {} } = {}) {
  if (typeof readLab !== "function" || typeof applyStep !== "function" || typeof onChange !== "function") throw TypeError("Trusted host callbacks are required");
  let closed = false;
  const listeners = new Set();
  const wrist = createWrist({ storage: null, worlds: [] });
  const describeLab = () => createDemoStatus(assessLaboratoryState(readLab()));
  const executeStep = (delta, { signal } = {}) => {
    if (closed || signal?.aborted) throw Error("Simulated wrist action cancelled");
    if (readLab().mode !== "wrist") throw Error("Wrist preview mode required");
    return applyStep(delta);
  };
  const adapter = createWorldAdapter({
    manifest: OPTI_EYES_DEMO_MANIFEST,
    readState: describeLab,
    subscribe(notify) {
      if (closed) throw Error("Host closed");
      listeners.add(notify);
      return () => listeners.delete(notify);
    },
    actions: {
      "focus-near": (options) => executeStep(+0.5, options),
      "focus-far": (options) => executeStep(-0.5, options)
    },
    onCapture: () => {}, // No input takeover in the separate Opti-Eyes control panel.
    onDisconnect: () => listeners.clear()
  });
  const unsubscribe = wrist.subscribe(() => onChange());
  wrist.connectWorld(adapter); // Default grants are empty; user alone controls them.
  wrist.navigate("world");
  return Object.freeze({
    snapshot: () => closed ? null : wrist.snapshot().worldHost,
    setGranted(enabled) {
      if (closed) throw Error("Virtual wrist disconnected");
      wrist.setWorldGrants(enabled ? ["adjust-focus"] : []);
    },
    requestAction(actionId) {
      if (closed) return Promise.reject(Error("Virtual wrist disconnected"));
      return wrist.requestWorldAction(actionId);
    },
    publish() {
      if (closed) return;
      const status = describeLab();
      for (const notify of [...listeners]) notify(status);
    },
    disconnect() {
      if (closed) return;
      closed = true;
      wrist.disconnectWorld();
      unsubscribe();
      wrist.dispose();
      listeners.clear();
      onChange();
    }
  });
}
