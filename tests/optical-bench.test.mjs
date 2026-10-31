import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {DEFAULT_CRITERIA,syntheticFixtures,validateCriteria,validateTrial,evaluateTrial,evaluateBatch,makeReceipt,makeCsv} from "../src/optical-bench.mjs";

test("six deterministic synthetic examples, with three inside and three outside illustrative criteria",()=>{
 const records=syntheticFixtures();
 assert.equal(records.length,6);
 assert.deepEqual(records,syntheticFixtures());
 const batch=evaluateBatch(records,DEFAULT_CRITERIA);
 assert.equal(batch.syntheticCount,6);
 assert.equal(batch.selfReportedCount,0);
 assert.equal(batch.withinCount,3);
 assert.equal(batch.outsideCount,3);
});
test("absolute power error and timing/drift decision are independent",()=>{
 const [sample]=syntheticFixtures();
 const inside=evaluateTrial(sample);
 assert.equal(inside.errorD,0.04);
 assert.deepEqual(inside.checks,{error:true,settling:true,drift:true});
 const bad=evaluateTrial({...sample,observedD:1.5,settlingMs:500,driftD:0.5});
 assert.deepEqual(bad.checks,{error:false,settling:false,drift:false});
 assert.match(bad.classification,/OUTSIDE/);
});
test("criteria are user-modifiable, threshold boundaries inclusive",()=>{
 const [sample]=syntheticFixtures();
 assert.equal(evaluateTrial(sample,{maxErrorD:.04,maxSettlingMs:145,maxDriftD:.04}).classification,"WITHIN USER CRITERIA");
 assert.equal(evaluateTrial(sample,{maxErrorD:.03,maxSettlingMs:145,maxDriftD:.04}).classification,"OUTSIDE USER CRITERIA");
 for(const key of ["maxErrorD","maxSettlingMs","maxDriftD"])for(const invalid of [-1,NaN,Infinity])
   assert.throws(()=>validateCriteria({...DEFAULT_CRITERIA,[key]:invalid}));
});
test("source claims and measurement range cannot be silently invented",()=>{
 const [sample]=syntheticFixtures();
 for(const invalid of [null,{}, {...sample,source:"certified"}, {...sample,mechanism:"magic"},
  {...sample,observedD:Infinity},{...sample,driftD:-.1},{...sample,id:"x/../bad"},
  {...sample,instrument:""}, {...sample,method:""}])assert.throws(()=>validateTrial(invalid));
 const user=validateTrial({...sample,id:"USER-001",source:"user-reported",instrument:"Meter A",method:"Manual note"});
 assert.equal(evaluateTrial(user).evidenceStatus,"USER ENTRY / UNVERIFIED");
});
test("batch and receipt reject duplicate records or excessive dataset",()=>{
 const [sample]=syntheticFixtures();
 assert.throws(()=>evaluateBatch([sample,sample]));
 assert.throws(()=>evaluateBatch(Array.from({length:201},(_,i)=>({...sample,id:"T-"+i}))));
 const receipt=makeReceipt([sample],DEFAULT_CRITERIA);
 assert.equal(receipt.eyeSafetyValidated,false);
 assert.equal(receipt.observationsVerified,false);
 assert.equal(receipt.summary.synthetic,1);
 assert.equal(receipt.schema,"opti-eyes-bench-research-v1");
});
test("CSV escapes spreadsheet formula injection in user-entered fields",()=>{
 const [base]=syntheticFixtures();
 const bad={...base,id:"USER-001",source:"user-reported",notes:'=HYPERLINK("evil")',method:"-1+1",instrument:"@invalid"};
 const csv=makeCsv([bad],DEFAULT_CRITERIA);
 assert.match(csv,/USER ENTRY \/ UNVERIFIED/);
 assert.ok(csv.includes("'=HYPERLINK"));
 assert.ok(csv.includes("'-1+1"));
 assert.ok(csv.includes("'@invalid"));
});
test("browser links all controls and retains prior optical and component tools",async()=>{
 const html=await readFile(new URL("../index.html",import.meta.url),"utf8");
 const js=await readFile(new URL("../src/bench-studio.mjs",import.meta.url),"utf8");
 const ids=["bench-total","bench-demo-count","bench-user-count","bench-within","bench-outside",
  "bench-rows","bench-empty","bench-status","bench-load-demo","bench-clear","bench-form",
  "bench-entry-status","bench-json","bench-csv"];
 for(const id of ids){assert.ok(html.includes('id="'+id+'"'),id);assert.ok(js.includes('el("'+id+'")'),id);}
 for(const id of ["bench-targetD","bench-observedD","bench-settlingMs","bench-driftD","bench-instrument",
 "bench-method","bench-notes"])assert.ok(html.includes('id="'+id+'"'));
 for(const id of ["bench-maxErrorD","bench-maxSettlingMs","bench-maxDriftD"])assert.ok(html.includes('id="'+id+'"'));
 assert.match(html,/src="\.\/src\/app\.mjs"/);
 assert.match(html,/src="\.\/src\/hardware-studio\.mjs"/);
 assert.match(html,/src="\.\/src\/component-studio\.mjs"/);
 assert.match(html,/src="\.\/src\/bench-studio\.mjs"/);
 assert.match(html,/NO PHYSICAL OPTICAL INSTRUMENT CONNECTED/i);
});
