// Opti-Eyes component exploration. All defaults are hypothetical assumptions,
// NOT vendor parts, measured draws, datasheet data, safety approval, or buying advice.
import { CHOICES } from "./frame-model.mjs";

export const LIMITS = Object.freeze({
  batteryMah:[100,1500], batteryV:[3.0,4.3], usablePct:[50,95],
  controllerMw:[10,600], sensorMw:[0,500], actuatorIdleMw:[0,350],
  actuatorStepMw:[0,1800], displayMw:[0,1500], dutyPct:[0,100],
  frameG:[5,90], opticsG:[5,120], electronicsG:[1,90], batteryG:[2,65],
  targetMassG:[35,220]
});
export const DEFAULT = Object.freeze({
  batteryMah:450,batteryV:3.7,usablePct:80,
  controllerMw:80,sensorMw:45,actuatorIdleMw:10,actuatorStepMw:420,
  displayMw:0,dutyPct:20,frameG:24,opticsG:30,electronicsG:16,
  batteryG:14,targetMassG:85
});
const PROFILE = Object.freeze({
  fixed:{ actuatorIdleMw:0,actuatorStepMw:0,opticsG:22 },
  alvarez:{ actuatorIdleMw:10,actuatorStepMw:420,opticsG:30 },
  fluidic:{ actuatorIdleMw:25,actuatorStepMw:320,opticsG:35 },
  electro:{ actuatorIdleMw:110,actuatorStepMw:200,opticsG:29 }
});

export function profileAssumptions(mechanism) {
  if (!Object.hasOwn(CHOICES,mechanism)) throw new RangeError("Unknown optical concept");
  return Object.freeze({ ...DEFAULT, ...PROFILE[mechanism] });
}
export function validateAssumptions(input) {
  if (!input || typeof input !== "object") throw new TypeError("Expected component assumptions");
  const clean={};
  for(const [key,[low,high]] of Object.entries(LIMITS)){
    const x=input[key];
    if(!Number.isFinite(x) || x<low || x>high) throw new RangeError("Invalid "+key);
    clean[key]=x;
  }
  return Object.freeze(clean);
}
export function calculateBudget(input,mechanism="alvarez"){
  if(!Object.hasOwn(CHOICES,mechanism)) throw new RangeError("Unknown optical concept");
  const x=validateAssumptions(input);
  // Active step power means EXTRA power above idle, only during the specified duty.
  const baselineMw=x.controllerMw+x.sensorMw+x.actuatorIdleMw+x.displayMw;
  const activeMw=baselineMw+x.actuatorStepMw;
  const averageMw=baselineMw+x.actuatorStepMw*x.dutyPct/100;
  const nominalMwh=x.batteryMah*x.batteryV;
  const usableMwh=nominalMwh*x.usablePct/100;
  const estimatedHours=usableMwh/averageMw;
  const massG=x.frameG+x.opticsG+x.electronicsG+x.batteryG;
  const estimateFor=(duty)=>usableMwh/(baselineMw+x.actuatorStepMw*duty/100);
  return Object.freeze({
    mechanism,baselineMw,activeMw,averageMw,nominalMwh,usableMwh,
    estimatedHours,massG,overMassTarget:massG>x.targetMassG,
    nominalPeakCurrentMa:activeMw/x.batteryV,
    scenarios:Object.freeze([
      Object.freeze({label:"Occasional / 5%",dutyPct:5,hours:estimateFor(5)}),
      Object.freeze({label:"Mixed / 25%",dutyPct:25,hours:estimateFor(25)}),
      Object.freeze({label:"Frequent / 60%",dutyPct:60,hours:estimateFor(60)})
    ]),
    caveat:"Pure arithmetic using user-editable, unverified guesses. No actual battery runtime, heat, optical performance, or safety is established."
  });
}
export const EVIDENCE_GATES = Object.freeze([
  Object.freeze({name:"Variable optic",need:"Actual optical power/travel curve, aperture, distortion, loss-of-power state"}),
  Object.freeze({name:"Distance sensor",need:"Ground-truth accuracy, occlusion, latency and signal confidence testing"}),
  Object.freeze({name:"Controller + actuator",need:"Measured idle/step current, stall behavior, firmware fault handling"}),
  Object.freeze({name:"Power system",need:"Cell protection, charging specification, thermal and discharge validation"}),
  Object.freeze({name:"Frame + wearer",need:"Mass distribution, mechanical retention, material suitability and qualified fit"}),
  Object.freeze({name:"GEN-E interface",need:"Explicit grants, disconnect behavior, local control integrity and fault states"})
]);
export function exportComponentReceipt(input,mechanism){
  const assumptions=validateAssumptions(input);
  return {
    schema:"opti-eyes-component-research-v1",mechanism,
    classification:"HYPOTHETICAL ASSUMPTIONS / UNVERIFIED",
    sourceEvidence:"No vendor datasheets or measured component performance attached",
    wearableApproved:false,prototypingApproved:false,eyeSafetyValidated:false,
    valuesUnits:{power:"mW",energy:"mWh",capacity:"mAh",voltage:"V",mass:"g",runtime:"hours"},
    assumptions,calculated:calculateBudget(assumptions,mechanism),evidenceGates:EVIDENCE_GATES
  };
}
