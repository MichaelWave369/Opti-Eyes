// Opti-Eyes Rung 7: offline engineering plans, never a wearable-device controller.
export const COMPONENT_SLOTS = Object.freeze([
  Object.freeze({id:"optic",name:"Optical element",need:"Traceable optical range, clear aperture, aberration and power-loss behavior"}),
  Object.freeze({id:"distance",name:"Distance sensing",need:"Measured accuracy, repeatability, latency and occlusion behavior"}),
  Object.freeze({id:"compute",name:"Local controller",need:"Logic voltage, MCU resources, measured power and watchdog design"}),
  Object.freeze({id:"actuation",name:"Actuation / driver",need:"Motion limits, load measurements, stall handling and safe disable"}),
  Object.freeze({id:"power",name:"Power / protection",need:"Cell protection, charging, discharge, heat and enclosure isolation"}),
  Object.freeze({id:"fixture",name:"Optical test fixture",need:"Rigid non-wearable mount, calibration reference and light-safe test plan"})
]);
export const BENCH_GATES = Object.freeze([
  "Define optical architecture and bench-only boundary",
  "Collect original manufacturer datasheets and revisions",
  "Independently verify candidate specifications",
  "Test power and controller behavior off-device",
  "Test lenses and motion on a guarded optical bench",
  "Characterize sensor errors, drift, occlusion and stale data",
  "Demonstrate authenticated or locally authorized command rejection and loss-of-link cleanup",
  "Document thermal, mechanical and power-failure hazards",
  "Obtain independent optical/regulatory review before any wearability claims"
]);
const textField=(value,label,max=140,required=true)=>{
  if(typeof value!=="string" || value.length>max || (required&&!value.trim()))throw new RangeError("Invalid "+label);
  return value.trim();
};
export function validateCandidate(raw){
  if(!raw || typeof raw!=="object")throw new TypeError("Candidate object required");
  const id=textField(raw.id,"record ID",32);
  if(!/^[a-zA-Z0-9-]{1,32}$/.test(id))throw new RangeError("Invalid record ID");
  const slot=textField(raw.slot,"slot",32);
  if(!COMPONENT_SLOTS.some(s=>s.id===slot))throw new RangeError("Unknown component slot");
  const maker=textField(raw.maker,"manufacturer");
  const part=textField(raw.part,"part number");
  const revision=textField(raw.revision??"","document revision",60,false);
  const notes=textField(raw.notes??"","research notes",240,false);
  const url=textField(raw.datasheetUrl??"","datasheet URL",800,false);
  let datasheetUrl=null;
  if(url){
    const parsed=new URL(url);
    if(parsed.protocol!=="https:" || !parsed.hostname || parsed.username || parsed.password || parsed.port)throw new RangeError("Use an ordinary HTTPS datasheet URL");
    datasheetUrl=parsed.href;
  }
  return Object.freeze({id,slot,maker,part,revision,datasheetUrl,notes,
    evidenceStatus:datasheetUrl?"USER-CITED / NOT INDEPENDENTLY CHECKED":"UNSOURCED / USER RESEARCH",
    validated:false});
}
export function summarizeArchitecture(raw=[]){
  if(!Array.isArray(raw)||raw.length>60)throw new RangeError("Candidate records must be an array of at most 60");
  const candidates=raw.map(validateCandidate);
  if(new Set(candidates.map(c=>c.id)).size!==candidates.length)throw new RangeError("Duplicate IDs");
  const slots=COMPONENT_SLOTS.map(s=>{
    const matches=candidates.filter(c=>c.slot===s.id);
    return Object.freeze({...s,count:matches.length,
      citations:matches.filter(c=>c.datasheetUrl).length,
      status:matches.length?"CANDIDATES / UNVERIFIED":"MISSING"});
  });
  return Object.freeze({
    candidates:Object.freeze(candidates),slots:Object.freeze(slots),
    coveredSlots:slots.filter(s=>s.count>0).length,
    citedCandidates:candidates.filter(c=>c.datasheetUrl).length,
    verifiedCandidates:0,hardwareApproved:false,wearableApproved:false
  });
}
export function initialVirtualLink(){
  return Object.freeze({connected:false,granted:false,sequence:0,focusD:1.5,lastPacket:null,recordCount:0});
}
// Deliberately a *local packet format demonstration*, not Bluetooth, USB or actuation.
export function transitionVirtualLink(current,event){
  if(!current || typeof current!=="object")throw new TypeError("Virtual link state required");
  if(!["connect","disconnect","grant","revoke","focus-near","focus-far","signal-loss","reset"].includes(event))
    throw new RangeError("Unsupported virtual link event");
  if(event==="reset")return initialVirtualLink();
  if(event==="connect"){
    if(current.connected)throw new Error("Already virtually connected");
    return Object.freeze({...current,connected:true,granted:false,lastPacket:null});
  }
  if(event==="disconnect"||event==="signal-loss")
    return Object.freeze({...current,connected:false,granted:false,lastPacket:null});
  if(!current.connected)throw new Error("Virtual link disconnected");
  if(event==="grant")return Object.freeze({...current,granted:true});
  if(event==="revoke")return Object.freeze({...current,granted:false});
  if(!current.granted)throw new Error("Permission denied: explicit virtual grant required");
  const deltaD=event==="focus-near"?0.5:-0.5;
  const nextFocusD=Math.min(3,Math.max(0,Math.round((current.focusD+deltaD)*100)/100));
  const sequence=current.sequence+1;
  const packet=Object.freeze({
    schema:"opti-gen-e-packet-simulation-v1",simulation:true,sequence,
    channel:"local-demo-only",command:"focus-step",deltaD,
    resultingFocusD:nextFocusD,hardwareConnected:false
  });
  return Object.freeze({...current,sequence,focusD:nextFocusD,lastPacket:packet,recordCount:current.recordCount+1});
}
export function exportArchitectureReceipt(rawCandidates,link){
  const architecture=summarizeArchitecture(rawCandidates);
  if(!link||typeof link!=="object")throw new TypeError("Virtual link required");
  return {
    schema:"opti-eyes-bench-architecture-v1",classification:"PLANNING / UNSOURCED OR USER-CITED",
    physicalHardwareConnected:false,opticalActuation:false,
    independentDatasheetsVerified:false,benchTestsCompleted:false,
    wearableApproved:false,regulatoryApproved:false,
    architecture,candidateRecords:architecture.candidates,
    virtualLink:{
      status:link.connected?"LOCAL DEMO CONNECTED":"DISCONNECTED",
      granted:link.granted===true,sequence:link.sequence,focusD:link.focusD,
      lastPacket:link.lastPacket
    },
    gates:BENCH_GATES.map((name,index)=>({index:index+1,name,status:"NOT VERIFIED"})),
    disclaimer:"Non-wearable research planning only. No component endorsement, electrical schematics, safe optical assembly or actual device pairing."
  };
}
