import {DEFAULT_CRITERIA,CRITERIA_LIMITS,syntheticFixtures,evaluateBatch,makeReceipt,makeCsv,validateTrial} from "./optical-bench.mjs";
import {CHOICES} from "./frame-model.mjs";
const el=id=>document.getElementById(id);
let criteria={...DEFAULT_CRITERIA};
let records=[...syntheticFixtures(el("hw-mechanism").value)];
let nextId=0;
const fmt=(n,d=2)=>Number(n).toFixed(d);

function classify(){
 const batch=evaluateBatch(records,criteria);
 el("bench-total").textContent=String(batch.count);
 el("bench-demo-count").textContent=String(batch.syntheticCount);
 el("bench-user-count").textContent=String(batch.selfReportedCount);
 el("bench-within").textContent=String(batch.withinCount);
 el("bench-outside").textContent=String(batch.outsideCount);
 const body=el("bench-rows");
 body.replaceChildren();
 for(const trial of batch.trials){
   const tr=document.createElement("tr");
   const cols=[trial.id,trial.source==="synthetic"?"DEMO":"USER ENTRY",trial.mechanism,
     fmt(trial.targetD),fmt(trial.observedD),fmt(trial.errorD),
     fmt(trial.settlingMs,0),fmt(trial.driftD),trial.classification];
   for(const value of cols){const td=document.createElement("td");td.textContent=value;tr.append(td);}
   body.append(tr);
 }
 el("bench-empty").hidden=Boolean(batch.count);
 el("bench-status").textContent="Custom comparison only. "+batch.syntheticCount+
  " synthetic demonstrations; "+batch.selfReportedCount+
  " unverified manually reported observations. No instrument or wearable is connected.";
}
for(const key of Object.keys(CRITERIA_LIMITS)){
 const ctrl=el("bench-"+key);
 ctrl.addEventListener("input",()=>{
   const value=Number(ctrl.value),[low,high]=CRITERIA_LIMITS[key];
   if(Number.isFinite(value)&&value>=low&&value<=high){criteria[key]=value;classify();}
 });
}
el("bench-load-demo").addEventListener("click",()=>{
 records=[...syntheticFixtures(el("hw-mechanism").value)];
 el("bench-entry-status").textContent="Synthetic demonstrations loaded. No real observations are implied.";
 classify();
});
el("bench-clear").addEventListener("click",()=>{
 records=[];el("bench-entry-status").textContent="In-memory records cleared. Nothing was uploaded or persisted.";classify();
});
el("bench-form").addEventListener("submit",(event)=>{
 event.preventDefault();
 const form=el("bench-form");
 if(!form.reportValidity())return;
 if(records.length>=200){el("bench-entry-status").textContent="Limit of 200 records reached. Export or clear first.";return;}
 const val=id=>el("bench-"+id).value;
 try{
  // User-entered readings are UNVERIFIED; this does not access a sensor.
  const trial=validateTrial({
   id:"USER-"+String(++nextId).padStart(3,"0"),source:"user-reported",
   mechanism:el("hw-mechanism").value,
   targetD:Number(val("targetD")),observedD:Number(val("observedD")),
   settlingMs:Number(val("settlingMs")),driftD:Number(val("driftD")),
   instrument:val("instrument"),method:val("method"),notes:val("notes")
  });
  records.push(trial);classify();
  el("bench-entry-status").textContent="Recorded "+trial.id+" as USER ENTRY / UNVERIFIED. No physical measurement was validated.";
  form.reset();
 }catch(e){el("bench-entry-status").textContent="Unable to record observation: "+e.message;}
});
function download(text,filename,mime){
 const url=URL.createObjectURL(new Blob([text],{type:mime}));
 const link=document.createElement("a");
 link.href=url;link.download=filename;document.body.append(link);link.click();link.remove();
 URL.revokeObjectURL(url);
}
el("bench-json").addEventListener("click",()=>download(JSON.stringify(makeReceipt(records,criteria),null,2),
 "opti-eyes-bench-research.json","application/json"));
el("bench-csv").addEventListener("click",()=>download(makeCsv(records,criteria),
 "opti-eyes-bench-research.csv","text/csv"));
classify();
