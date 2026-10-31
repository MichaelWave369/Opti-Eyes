import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {CHOICES} from "../src/frame-model.mjs";
import {LIMITS,DEFAULT,profileAssumptions,validateAssumptions,calculateBudget,EVIDENCE_GATES,exportComponentReceipt} from "../src/component-model.mjs";

test("all optical research modes have editable hypothetical profiles",()=>{
 assert.deepEqual(Object.keys(CHOICES),["fixed","alvarez","fluidic","electro"]);
 for(const key of Object.keys(CHOICES))assert.doesNotThrow(()=>calculateBudget(profileAssumptions(key),key));
 assert.equal(profileAssumptions("fixed").actuatorStepMw,0);
 assert.throws(()=>profileAssumptions("magical"));
});
test("simple power arithmetic is deterministic and dimensionally consistent",()=>{
 const o=calculateBudget(DEFAULT,"alvarez");
 assert.equal(o.baselineMw,135);
 assert.equal(o.activeMw,555);
 assert.equal(o.averageMw,219);
 assert.equal(o.nominalMwh,1665);
 assert.equal(o.usableMwh,1332);
 assert.ok(Math.abs(o.estimatedHours-1332/219)<1e-12);
 assert.equal(o.massG,84);
 assert.equal(o.overMassTarget,false);
 assert.ok(Math.abs(o.nominalPeakCurrentMa-555/3.7)<1e-12);
 assert.ok(o.scenarios[0].hours>o.scenarios[1].hours && o.scenarios[1].hours>o.scenarios[2].hours);
});
test("each input range rejects NaN, Infinity and undershoot/overshoot",()=>{
 for(const [k,[low,high]] of Object.entries(LIMITS)){
  assert.doesNotThrow(()=>validateAssumptions({...DEFAULT,[k]:low}));
  assert.doesNotThrow(()=>validateAssumptions({...DEFAULT,[k]:high}));
  for(const bad of [NaN,Infinity,-Infinity,low-0.01,high+0.01])
   assert.throws(()=>validateAssumptions({...DEFAULT,[k]:bad}),k);
 }
 assert.throws(()=>validateAssumptions(null));
 assert.throws(()=>calculateBudget(DEFAULT,"invalid"));
});
test("increasing duty or added system draw reduces estimated runtime",()=>{
 const base=calculateBudget(DEFAULT);
 assert.ok(calculateBudget({...DEFAULT,dutyPct:60}).estimatedHours<base.estimatedHours);
 assert.ok(calculateBudget({...DEFAULT,controllerMw:200}).estimatedHours<base.estimatedHours);
 assert.ok(calculateBudget({...DEFAULT,batteryMah:900}).estimatedHours>base.estimatedHours);
 assert.equal(calculateBudget({...DEFAULT,targetMassG:50}).overMassTarget,true);
});
test("export cannot claim verified datasheets or wearable safety",()=>{
 const r=exportComponentReceipt(DEFAULT,"alvarez");
 assert.equal(r.schema,"opti-eyes-component-research-v1");
 assert.equal(r.wearableApproved,false);
 assert.equal(r.prototypingApproved,false);
 assert.equal(r.eyeSafetyValidated,false);
 assert.equal(r.evidenceGates.length,6);
 assert.match(r.classification,/UNVERIFIED/);
 assert.equal(EVIDENCE_GATES.length,6);
});
test("new component UI is wired without removing Focus or Wrist controls",async()=>{
 const html=await readFile(new URL("../index.html",import.meta.url),"utf8");
 const js=await readFile(new URL("../src/component-studio.mjs",import.meta.url),"utf8");
 for(const id of ["ce-mechanism","ce-draw","ce-peak","ce-energy","ce-hours","ce-mass","ce-target-status","ce-current","ce-export","ce-reset","ce-gates","ce-runtime-0","ce-runtime-1","ce-runtime-2"]){
  assert.ok(html.includes('id="'+id+'"'),id);
  assert.ok(js.includes('el("'+id+'")'),id);
 }
 for(const k of Object.keys(LIMITS)){
  assert.ok(html.includes('id="ce-'+k+'"'),k);
  assert.ok(html.includes('id="ce-'+k+'-value"'),k);
 }
 assert.match(html,/src="\.\/src\/app\.mjs"/);
 assert.match(html,/src="\.\/src\/hardware-studio\.mjs"/);
 assert.match(html,/src="\.\/src\/component-studio\.mjs"/);
 assert.match(html,/NO REAL COMPONENTS CONNECTED/i);
});
