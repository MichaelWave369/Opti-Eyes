// Optical bench *recordkeeping* model. No real sensors, commands or certification.
// Never interpret a value inside user-chosen criteria as physical safety or efficacy.
import { CHOICES } from "./frame-model.mjs";

export const DEFAULT_CRITERIA=Object.freeze({maxErrorD:0.25,maxSettlingMs:300,maxDriftD:0.10});
export const CRITERIA_LIMITS=Object.freeze({maxErrorD:[0.01,1.5],maxSettlingMs:[20,5000],maxDriftD:[0.01,1]});
export const MEASURE_LIMITS=Object.freeze({targetD:[0,3],observedD:[0,3],settlingMs:[0,5000],driftD:[0,2]});
export const SOURCES=Object.freeze(["synthetic","user-reported"]);
const str=(value,name,max=140)=>{
  if(typeof value!=="string" || !value.trim() || value.length>max)throw new RangeError("Invalid "+name);
  return value.trim();
};
const numeric=(value,name,range)=>{
  if(typeof value!=="number" || !Number.isFinite(value) || value<range[0] || value>range[1])throw new RangeError("Invalid "+name);
  return value;
};

export function validateCriteria(raw){
  if(!raw||typeof raw!=="object")throw new TypeError("Criteria required");
  const out={};
  for(const [key,range] of Object.entries(CRITERIA_LIMITS))out[key]=numeric(raw[key],key,range);
  return Object.freeze(out);
}
export function validateTrial(raw){
  if(!raw||typeof raw!=="object")throw new TypeError("Trial required");
  const id=str(raw.id,"id",48);
  if(!/^[a-zA-Z0-9-]{1,48}$/.test(id))throw new RangeError("Invalid record ID");
  if(!SOURCES.includes(raw.source))throw new RangeError("Invalid evidence source");
  if(!Object.hasOwn(CHOICES,raw.mechanism))throw new RangeError("Invalid optical architecture");
  const r={id,source:raw.source,mechanism:raw.mechanism};
  for(const [key,range] of Object.entries(MEASURE_LIMITS))r[key]=numeric(raw[key],key,range);
  r.instrument=str(raw.instrument,"instrument");
  r.method=str(raw.method,"method");
  r.notes=raw.notes==null?"":String(raw.notes).slice(0,240);
  return Object.freeze(r);
}
export function evaluateTrial(raw,rawCriteria=DEFAULT_CRITERIA){
  const trial=validateTrial(raw),criteria=validateCriteria(rawCriteria);
  // Round to a microdiopter for deterministic equality at user-selected thresholds.
  const errorD=Math.round(Math.abs(trial.observedD-trial.targetD)*1e6)/1e6;
  const checks=Object.freeze({
    error:errorD<=criteria.maxErrorD,
    settling:trial.settlingMs<=criteria.maxSettlingMs,
    drift:trial.driftD<=criteria.maxDriftD
  });
  return Object.freeze({
    ...trial,errorD,checks,
    classification:Object.values(checks).every(Boolean)?"WITHIN USER CRITERIA":"OUTSIDE USER CRITERIA",
    evidenceStatus:trial.source==="synthetic"?"SYNTHETIC EXAMPLE":"USER ENTRY / UNVERIFIED"
  });
}
export function evaluateBatch(rawTrials,criteria=DEFAULT_CRITERIA){
  if(!Array.isArray(rawTrials)||rawTrials.length>200)throw new RangeError("Dataset exceeds 200 trials");
  const evaluated=rawTrials.map(t=>evaluateTrial(t,criteria));
  if(new Set(evaluated.map(t=>t.id)).size!==evaluated.length)throw new RangeError("Duplicate trial IDs");
  const count=(source)=>evaluated.filter(t=>t.source===source).length;
  return Object.freeze({
    trials:Object.freeze(evaluated),
    count:evaluated.length,syntheticCount:count("synthetic"),selfReportedCount:count("user-reported"),
    withinCount:evaluated.filter(t=>t.classification==="WITHIN USER CRITERIA").length,
    outsideCount:evaluated.filter(t=>t.classification==="OUTSIDE USER CRITERIA").length
  });
}

export function syntheticFixtures(mechanism="alvarez"){
  if(!Object.hasOwn(CHOICES,mechanism))throw new RangeError("Unknown mechanism");
  const examples=[
    ["DEMO-NEAR",2,1.96,145,0.04,"Nominal near illustration"],
    ["DEMO-MID",1.25,1.38,220,0.06,"Nominal intermediate illustration"],
    ["DEMO-FAR",0.5,0.45,180,0.04,"Nominal far illustration"],
    ["DEMO-LAG",2.5,2.2,460,0.08,"Error and settling outside example criteria"],
    ["DEMO-DRIFT",1.5,1.45,210,0.26,"Illustrated drift exceeds example criteria"],
    ["DEMO-LIMIT",3,2.7,550,0.12,"Illustrated multiple failures"]
  ];
  return Object.freeze(examples.map(([id,targetD,observedD,settlingMs,driftD,notes])=>
    validateTrial({id,source:"synthetic",mechanism,targetD,observedD,settlingMs,driftD,
      instrument:"SYNTHETIC FIXTURE, NO HARDWARE",method:"Deterministic code example, not observed",notes})
  ));
}
export function makeReceipt(trials,criteria){
  const verifiedCriteria=validateCriteria(criteria);
  const data=evaluateBatch(trials,verifiedCriteria);
  return {
    schema:"opti-eyes-bench-research-v1",
    status:"NOT VALIDATED FOR WEARABLE OR MEDICAL USE",
    independentVerification:false,eyeSafetyValidated:false,
    observationsVerified:false,
    rules:"Comparisons use USER-CHOSEN illustrative criteria, not product standards",
    criteria:verifiedCriteria,summary:{
      total:data.count,synthetic:data.syntheticCount,userReportedUnverified:data.selfReportedCount,
      withinUserCriteria:data.withinCount,outsideUserCriteria:data.outsideCount
    },
    trials:data.trials,
    requiredFollowup:[
      "Document instrument calibration and traceable references",
      "Attach original dated measurements and independent review",
      "Test aberrations, aperture, optical power curve, repeatability, mechanical faults, loss of power",
      "Complete professional fitting and applicable regulatory assessment"
    ]
  };
}
// CSV user text is guarded against spreadsheet formula injection.
const csvCell=(v)=>{
  let s=String(v).replaceAll('"','""');
  if(/^[\s]*[=+\-@]/.test(s))s="'"+s;
  return '"'+s+'"';
};
export function makeCsv(trials,criteria){
  const {trials:rows}=evaluateBatch(trials,criteria);
  const columns=["id","source","mechanism","targetD","observedD","errorD","settlingMs","driftD","classification","evidenceStatus","instrument","method","notes"];
  return [
    "# Opti-Eyes research record, not verified optical measurement or safety approval",
    columns.join(","),
    ...rows.map(row=>columns.map(key=>csvCell(row[key])).join(","))
  ].join("\r\n")+"\r\n";
}
