import {CHOICES} from "./frame-model.mjs";
import {LIMITS,profileAssumptions,calculateBudget,EVIDENCE_GATES,exportComponentReceipt} from "./component-model.mjs";
const el=id=>document.getElementById(id);
const params=Object.keys(LIMITS);
let mechanism=el("hw-mechanism").value;
let inputs={...profileAssumptions(mechanism)};
const fmt=(n,places=1)=>n.toFixed(places);
function render(){
 const result=calculateBudget(inputs,mechanism);
 el("ce-mechanism").textContent=CHOICES[mechanism].name+" / hypothetical input profile";
 for(const k of params)el("ce-"+k+"-value").textContent=fmt(inputs[k],k==="batteryV"?2:0);
 el("ce-draw").textContent=fmt(result.averageMw)+" mW";
 el("ce-peak").textContent=fmt(result.activeMw)+" mW";
 el("ce-energy").textContent=fmt(result.usableMwh,0)+" mWh";
 el("ce-hours").textContent=fmt(result.estimatedHours,2)+" h";
 el("ce-mass").textContent=fmt(result.massG,1)+" g";
 el("ce-target-status").textContent=result.overMassTarget ?
   "Over your illustrative mass target. No safe wearability conclusion." :
   "Within your illustrative mass target, not a comfort or safety approval.";
 el("ce-current").textContent=fmt(result.nominalPeakCurrentMa,1)+" mA";
 for(let i=0;i<3;i++)el("ce-runtime-"+i).textContent=fmt(result.scenarios[i].hours,2)+" h";
}
function syncMechanism(){
 const selected=el("hw-mechanism").value;
 if(!Object.hasOwn(CHOICES,selected))return;
 mechanism=selected;
 // An architecture change intentionally resets the *hypothetical* optical assumptions.
 // Manual edits are preserved for all other sliders.
 const preset=profileAssumptions(mechanism);
 for(const k of ["actuatorIdleMw","actuatorStepMw","opticsG"]){
   inputs[k]=preset[k];el("ce-"+k).value=String(inputs[k]);
 }
 render();
}
el("hw-mechanism").addEventListener("change",syncMechanism);
for(const k of params)el("ce-"+k).addEventListener("input",()=>{
 const value=Number(el("ce-"+k).value),[lo,hi]=LIMITS[k];
 if(Number.isFinite(value)&&value>=lo&&value<=hi){inputs[k]=value;render();}
});
function download(content){
 const url=URL.createObjectURL(new Blob([content],{type:"application/json"}));
 const a=document.createElement("a");a.href=url;a.download="opti-eyes-component-assumptions.json";
 document.body.append(a);a.click();a.remove();URL.revokeObjectURL(url);
}
el("ce-export").addEventListener("click",()=>download(JSON.stringify(exportComponentReceipt(inputs,mechanism),null,2)));
el("ce-reset").addEventListener("click",()=>{
 inputs={...profileAssumptions(mechanism)};
 for(const k of params)el("ce-"+k).value=String(inputs[k]);
 render();
});
el("ce-gates").replaceChildren(...EVIDENCE_GATES.map((gate)=>{
 const li=document.createElement("li"),strong=document.createElement("strong"),span=document.createElement("span");
 strong.textContent=gate.name+" · NOT VERIFIED";
 span.textContent=gate.need;
 li.append(strong,span);
 return li;
}));
// On first load the preset and the range thumb positions must agree.
for(const key of params)el("ce-"+key).value=String(inputs[key]);
render();
