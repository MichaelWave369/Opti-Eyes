import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { createOptiEyesWristSession } from "../src/wrist-session.mjs";
import { applyWristPreviewStep } from "../src/wrist-bridge.mjs";
import { CATALOG, RINGS } from "../vendor/genewrist/src/catalog.js";
import { WORLD_ADAPTER_VERSION } from "../vendor/genewrist/src/world-adapter.js";
import { PINNED_BLOBS, PINNED_COMMIT } from "../vendor/genewrist/provenance.mjs";

const setup = () => {
  const lab = { mode: "wrist", distanceM: 1, manualAddD: 1, leftOffsetD: 0, rightOffsetD: 0, sensorCondition: "clear" };
  const changes = [];
  const session = createOptiEyesWristSession({
    readLab: () => lab,
    applyStep(delta) { lab.manualAddD = applyWristPreviewStep(lab.manualAddD, delta); session.publish(); },
    onChange: () => changes.push("change")
  });
  return { lab, session, changes };
};
test("runs actual pinned Gen.E.Wrist SDK v1 and preserves 3/6/9 canonical catalog", () => {
  assert.equal(WORLD_ADAPTER_VERSION, 1);
  assert.equal(PINNED_COMMIT, "f311d7392c346e7361037fc77ad17db061e8fd70");
  assert.equal(CATALOG.length, 18);
  assert.deepEqual(RINGS.map((r) => r.count), [3,6,9]);
});
test("bundled Gen.E.Wrist sources are byte-identical to pinned GitHub blob IDs", async () => {
  for (const [path, expected] of Object.entries(PINNED_BLOBS)) {
    const bytes = await readFile(new URL("../vendor/genewrist/"+path, import.meta.url));
    const actual = createHash("sha1").update("blob "+bytes.length+"\0").update(bytes).digest("hex");
    assert.equal(actual, expected, "Pin mismatch: "+path);
  }
});
test("connect starts without grants and rejects unauthorized action", async () => {
  const { lab,session } = setup();
  assert.deepEqual(session.snapshot().grants, []);
  await assert.rejects(session.requestAction("focus-near"),/Capability not granted/);
  assert.equal(lab.manualAddD,1);
  session.disconnect();
});
test("explicit grant, action, status subscription, revocation and disconnect", async () => {
  const { lab,session,changes } = setup();
  session.setGranted(true);
  assert.deepEqual(session.snapshot().grants, ["adjust-focus"]);
  await session.requestAction("focus-near");
  assert.equal(lab.manualAddD,1.5);
  assert.equal(session.snapshot().status["focus-d"],1.5);
  assert.ok(changes.length>0);
  session.setGranted(false);
  await assert.rejects(session.requestAction("focus-far"),/Capability not granted/);
  assert.equal(lab.manualAddD,1.5);
  session.disconnect();
  assert.equal(session.snapshot(),null);
  await assert.rejects(session.requestAction("focus-near"),/disconnected/);
});
test("changing out of wrist mode invalidates an otherwise granted action", async () => {
  const { lab,session } = setup();
  session.setGranted(true);
  lab.mode="manual";
  await assert.rejects(session.requestAction("focus-near"),/Wrist preview mode required/);
  assert.equal(lab.manualAddD,1);
  session.disconnect();
});
test("signed steps clamp to model limits; unsupported actions cannot be performed", async () => {
  const { lab,session } = setup();
  lab.manualAddD=2.8;
  session.setGranted(true);
  await session.requestAction("focus-near");
  assert.equal(lab.manualAddD,3);
  await assert.rejects(session.requestAction("erase-data"),/Undocumented action/);
  session.disconnect();
});
test("Opti-Eyes UI explicitly separates virtual connection and permission controls", async () => {
  const html = await readFile(new URL("../index.html",import.meta.url),"utf8");
  const app = await readFile(new URL("../src/app.mjs",import.meta.url),"utf8");
  for(const id of ["wrist-connect","wrist-disconnect","wrist-grant","wrist-sdk-state","wrist-sdk-status","wrist-live-focus"]){
    assert.ok(html.includes('id="'+id+'"'),id);
    assert.ok(app.includes('byId("'+id+'")'),id);
  }
  assert.match(html,/NO PHYSICAL DEVICE/i);
  assert.match(app,/createOptiEyesWristSession/);
  assert.doesNotMatch(app,/window\.postMessage|navigator\.bluetooth|navigator\.usb/);
});
