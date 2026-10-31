import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {SCENARIOS,GATE,simulateSensor,evaluateSensor,assessLaboratoryState} from "../src/sensor-model.mjs";
const lab=(x={})=>({mode:"adaptive",distanceM:.5,manualAddD:1.1,leftOffsetD:0,rightOffsetD:0,sensorCondition:"clear",...x});
test("all six synthetic fixtures deterministic, unknown rejected",()=>{
 assert.equal(SCENARIOS.length,6);
 for(const s of SCENARIOS)assert.deepEqual(simulateSensor(.5,s),simulateSensor(.5,s));
 assert.throws(()=>simulateSensor(.5,"unknown"));assert.throws(()=>simulateSensor(-1));
});
test("clean reading drives adaptive simulated output",()=>{
 const r=assessLaboratoryState(lab());
 assert.equal(r.baseAddD,2);assert.equal(r.fallback,false);assert.equal(r.sensorReport.valid,true);
});
test("invalid readings revert to chosen manual backup",()=>{
 for(const sensorCondition of ["occluded","noisy","stale","out-of-range"]){
  const r=assessLaboratoryState(lab({sensorCondition}));
  assert.equal(r.fallback,true,sensorCondition);assert.equal(r.baseAddD,1.1,sensorCondition);
  assert.equal(r.sensorReport.valid,false);assert.equal(r.estimatedDemandD,null);
 }
});
test("confident biased reading exposes flaw in naive quality gate",()=>{
 const r=assessLaboratoryState(lab({sensorCondition:"biased"}));
 assert.equal(r.sensorReport.hiddenBiasDemonstrated,true);assert.equal(r.sensorReport.valid,true);
 assert.ok(r.leftResidualD>assessLaboratoryState(lab()).leftResidualD);
});
test("manual and wrist modes ignore faults",()=>{
 for(const mode of ["manual","wrist"]){const r=assessLaboratoryState(lab({mode,sensorCondition:"occluded"}));
 assert.equal(r.baseAddD,1.1);assert.equal(r.sensorReport,null);assert.equal(r.fallback,false);}
});
test("out of bounds, non-finite, stale and confidence failures",()=>{
 for(const sample of [null,{}, {readingDistanceM:Infinity,confidence:1,ageMs:5},
 {readingDistanceM:1,confidence:NaN,ageMs:5},{readingDistanceM:1,confidence:1.01,ageMs:5},
 {readingDistanceM:1,confidence:.9,ageMs:-1},{readingDistanceM:.1,confidence:.9,ageMs:5},
 {readingDistanceM:6.01,confidence:.9,ageMs:5}]) assert.equal(evaluateSensor(sample).valid,false);
 assert.equal(evaluateSensor({readingDistanceM:1,confidence:GATE.minConfidence,ageMs:GATE.maxAgeMs}).valid,true);
});
test("browser includes controlled sensor UI and simulated disclaimers",async()=>{
 const html=await readFile(new URL("../index.html",import.meta.url),"utf8");
 const app=await readFile(new URL("../src/app.mjs",import.meta.url),"utf8");
 for(const id of ["sensor-scenario","sensor-status","sensor-reading","sensor-confidence","sensor-age","sensor-notes","manual-add-label"]){
  assert.ok(html.includes('id="'+id+'"'),id);
  assert.ok(app.includes('byId("'+id+'")'),id);
 }
 assert.match(html,/SOFTWARE SIMULATION ONLY/);
 assert.match(app,/assessLaboratoryState\(state\)/);
});
