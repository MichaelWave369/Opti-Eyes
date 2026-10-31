// Pure synthetic fault fixtures. No hardware or network access.
import { calculateOptics, clamp, distanceDemandD, LIMITS } from "./optics.mjs";
export const SCENARIOS = Object.freeze(["clear","biased","occluded","noisy","stale","out-of-range"]);
export const GATE = Object.freeze({ minConfidence: 0.8, maxAgeMs: 250 });
export function simulateSensor(distanceM,scenario="clear"){
  distanceDemandD(distanceM);
  if(!SCENARIOS.includes(scenario))throw new RangeError("Unknown sensor fixture");
  const readings={
    clear:{readingDistanceM:distanceM,confidence:.99,ageMs:35},
    biased:{readingDistanceM:distanceM+.3,confidence:.98,ageMs:35},
    occluded:{readingDistanceM:null,confidence:0,ageMs:35},
    noisy:{readingDistanceM:distanceM+.4,confidence:.45,ageMs:35},
    stale:{readingDistanceM:distanceM,confidence:.99,ageMs:1500},
    "out-of-range":{readingDistanceM:8,confidence:.99,ageMs:35}
  };
  return Object.freeze({scenario,...readings[scenario]});
}
export function evaluateSensor(sample){
  if(!sample || typeof sample!=="object")return Object.freeze({valid:false,reason:"NO READING"});
  const {readingDistanceM:d,confidence:c,ageMs:a}=sample;
  if(!Number.isFinite(d)||d<=0)return Object.freeze({valid:false,reason:"SIGNAL LOST"});
  if(!Number.isFinite(c)||c<0||c>1)return Object.freeze({valid:false,reason:"INVALID CONFIDENCE"});
  if(!Number.isFinite(a)||a<0||a>GATE.maxAgeMs)return Object.freeze({valid:false,reason:"STALE READING"});
  if(c<GATE.minConfidence)return Object.freeze({valid:false,reason:"LOW CONFIDENCE"});
  if(d<LIMITS.minDistanceM||d>LIMITS.maxDistanceM)return Object.freeze({valid:false,reason:"DISTANCE OUT OF RANGE"});
  return Object.freeze({valid:true,reason:"ACCEPTED"});
}
export function assessLaboratoryState(state){
  if(!state||!["manual","adaptive","wrist"].includes(state.mode))throw new TypeError("Invalid lab state");
  if(state.mode!=="adaptive")return Object.freeze({...calculateOptics(state),sensorReport:null,fallback:false,estimatedDemandD:null});
  const sample=simulateSensor(state.distanceM,state.sensorCondition??"clear");
  const verdict=evaluateSensor(sample);
  const estimatedDemandD=verdict.valid?distanceDemandD(sample.readingDistanceM):null;
  const output=verdict.valid?clamp(estimatedDemandD,LIMITS.minAddD,LIMITS.maxAddD):state.manualAddD;
  // Ground truth is retained for mismatch DISPLAY, never substituted for a failed sensor reading.
  const optics=calculateOptics({...state,mode:"manual",manualAddD:output});
  return Object.freeze({...optics,mode:"adaptive",estimatedDemandD,fallback:!verdict.valid,
    sensorReport:Object.freeze({...sample,valid:verdict.valid,reason:verdict.reason,
      hiddenBiasDemonstrated:verdict.valid&&sample.scenario==="biased"})});
}
