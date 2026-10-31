// Manifest proposal only. This module never connects to Gen.E.Wrist or any physical device.
export const OPTI_EYES_DEMO_MANIFEST = Object.freeze({
  apiVersion: 1,
  id: "opti-eyes-lab",
  kind: "demo",
  title: "Opti-Eyes Lab (simulation)",
  icon: "crosshair",
  theme: { accent: "#86ded2" },
  initialContext: "optics",
  capabilities: ["adjust-focus"],
  actions: [
    { id: "focus-near", label: "Increase simulated focus", capability: "adjust-focus" },
    { id: "focus-far", label: "Decrease simulated focus", capability: "adjust-focus" }
  ],
  contexts: [{
    id: "optics", title: "Optical Lab (simulation)", layout: "dashboard",
    fields: [
      { id: "distance-m", label: "Demo distance (m)", type: "number" },
      { id: "focus-d", label: "Demo focus (D)", type: "number" },
      { id: "mode", label: "Demo mode", type: "text" }
    ],
    controls: [
      { action: "focus-near", label: "FOCUS +0.5", icon: "crosshair" },
      { action: "focus-far", label: "FOCUS -0.5", icon: "crosshair" }
    ],
    views: [{ type: "note", title: "Synthetic optics", items: ["No physical eyewear connected.", "Simulated actions require an explicit host grant."] }]
  }]
});

export function createDemoStatus(snapshot) {
  if (!snapshot || !Number.isFinite(snapshot.distanceM) || !Number.isFinite(snapshot.baseAddD)) throw new TypeError("Valid lab snapshot required");
  return {
    contextId: "optics",
    status: { "distance-m": Math.round(snapshot.distanceM * 100) / 100, "focus-d": Math.round(snapshot.baseAddD * 100) / 100, mode: snapshot.mode }
  };
}

export function applyWristPreviewStep(currentAddD, deltaD) {
  if (!Number.isFinite(currentAddD) || !Number.isFinite(deltaD)) throw new TypeError("Finite steps required");
  return Math.min(3, Math.max(0, Math.round((currentAddD + deltaD) * 100) / 100));
}
