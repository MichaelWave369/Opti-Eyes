import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {COMPONENT_SLOTS,BENCH_GATES,validateCandidate,summarizeArchitecture,
 initialVirtualLink,transitionVirtualLink,exportArchitectureReceipt} from "../src/hardware-architecture.mjs";
const sample={id:"C-001",slot:"optic",maker:"Example Maker",part:"Q-01",revision:"rev1",
 datasheetUrl:"https://example.org/sample.pdf",notes:"Unverified research candidate"};
test("architecture includes six independent component slots and nine gates",()=>{
 assert.equal(COMPONENT_SLOTS.length,6);
 assert.equal(BENCH_GATES.length,9);
 assert.equal(new Set(COMPONENT_SLOTS.map(s=>s.id)).size,6);
});
test("candidate form remains unverified even with manufacturer URL",()=>{
 const c=validateCandidate(sample);
 assert.equal(c.evidenceStatus,"USER-CITED / NOT INDEPENDENTLY CHECKED");
 assert.equal(c.validated,false);
 assert.equal(c.datasheetUrl,sample.datasheetUrl);
 assert.equal(summarizeArchitecture([c]).verifiedCandidates,0);
});
test("empty source and source URL restrictions",()=>{
 assert.equal(validateCandidate({...sample,datasheetUrl:""}).evidenceStatus,"UNSOURCED / USER RESEARCH");
 for(const url of ["http://example.com","javascript:alert(1)","https://u:p@example.com/doc.pdf",
   "ftp://example.org/a","https://example.com:8443/file.pdf","not a url"]){
    assert.throws(()=>validateCandidate({...sample,datasheetUrl:url}),url);
 }
 assert.throws(()=>validateCandidate({...sample,slot:"fictional"}));
 assert.throws(()=>validateCandidate({...sample,part:""}));
 assert.throws(()=>validateCandidate({...sample,id:"../../../bad"}));
});
test("summary never equates a citation with verification",()=>{
 const s=summarizeArchitecture([sample,{...sample,id:"C-002",slot:"power",datasheetUrl:""}]);
 assert.equal(s.coveredSlots,2);assert.equal(s.citedCandidates,1);
 assert.equal(s.verifiedCandidates,0);assert.equal(s.hardwareApproved,false);assert.equal(s.wearableApproved,false);
 assert.throws(()=>summarizeArchitecture([sample,sample]));
 assert.throws(()=>summarizeArchitecture(Array.from({length:61},(_,i)=>({...sample,id:"C-"+i}))));
});
test("no virtual action works without a connection and separate grant",()=>{
 let s=initialVirtualLink();
 assert.equal(s.connected,false);assert.equal(s.granted,false);
 assert.throws(()=>transitionVirtualLink(s,"focus-near"),/disconnected/);
 s=transitionVirtualLink(s,"connect");
 assert.equal(s.granted,false);
 assert.throws(()=>transitionVirtualLink(s,"focus-near"),/Permission denied/);
 assert.equal(s.sequence,0);
});
test("granted simulated link yields ordered, marked mock packets",()=>{
 let s=transitionVirtualLink(initialVirtualLink(),"connect");
 s=transitionVirtualLink(s,"grant");
 const first=transitionVirtualLink(s,"focus-near");
 assert.equal(first.focusD,2);
 assert.equal(first.sequence,1);
 assert.equal(first.lastPacket.simulation,true);
 assert.equal(first.lastPacket.hardwareConnected,false);
 const next=transitionVirtualLink(first,"focus-far");
 assert.equal(next.sequence,2);assert.equal(next.focusD,1.5);
 assert.equal(s.sequence,0); // immutable prior state
});
test("permission revocation and loss of link clear access, never silently restore it",()=>{
 let s=transitionVirtualLink(initialVirtualLink(),"connect");
 s=transitionVirtualLink(s,"grant");
 s=transitionVirtualLink(s,"revoke");
 assert.throws(()=>transitionVirtualLink(s,"focus-near"),/Permission denied/);
 s=transitionVirtualLink(s,"grant");
 s=transitionVirtualLink(s,"signal-loss");
 assert.equal(s.connected,false);assert.equal(s.granted,false);
 s=transitionVirtualLink(s,"connect");
 assert.equal(s.granted,false);
 assert.throws(()=>transitionVirtualLink(s,"focus-near"),/Permission denied/);
});
test("simulated focus clamped to 0–3 D and reset clears session",()=>{
 let s=transitionVirtualLink(initialVirtualLink(),"connect");
 s=transitionVirtualLink(s,"grant");
 for(let i=0;i<12;i++)s=transitionVirtualLink(s,"focus-near");
 assert.equal(s.focusD,3);
 for(let i=0;i<12;i++)s=transitionVirtualLink(s,"focus-far");
 assert.equal(s.focusD,0);
 s=transitionVirtualLink(s,"reset");
 assert.deepEqual(s,initialVirtualLink());
 assert.throws(()=>transitionVirtualLink(s,"invent-event"));
});
test("export remains completely unverified and links cannot claim hardware connection",()=>{
 const s=transitionVirtualLink(initialVirtualLink(),"connect");
 const x=exportArchitectureReceipt([sample],s);
 assert.equal(x.physicalHardwareConnected,false);
 assert.equal(x.opticalActuation,false);
 assert.equal(x.independentDatasheetsVerified,false);
 assert.equal(x.regulatoryApproved,false);
 assert.equal(x.gates.length,9);
 assert.equal(x.candidateRecords.length,1);
});
test("browser has complete architecture controls and keeps earlier modules",async()=>{
 const h=await readFile(new URL("../index.html",import.meta.url),"utf8");
 const app=await readFile(new URL("../src/architecture-studio.mjs",import.meta.url),"utf8");
 for(const id of ["arch-slots","arch-records","arch-covered","arch-cited","arch-verified",
  "arch-empty","arch-form","arch-slot","arch-maker","arch-part","arch-revision","arch-url","arch-notes",
  "arch-feedback","arch-link-status","arch-link-grant","arch-link-connect","arch-link-disconnect",
  "arch-link-drop","arch-link-near","arch-link-far","arch-link-seq","arch-link-focus",
  "arch-link-packet","arch-link-feedback","arch-gates","arch-export","arch-reset"]){
   assert.ok(h.includes('id="'+id+'"'),id);
   assert.ok(app.includes('"'+id+'"'),id);
 }
 for(const mod of ["app","hardware-studio","component-studio","bench-studio","architecture-studio"]){
   assert.ok(h.includes('./src/'+mod+'.mjs'),mod);
 }
 assert.match(h,/NO REAL HARDWARE LINK/);
 assert.doesNotMatch(app,/navigator\.bluetooth|navigator\.serial|navigator\.usb|fetch\(/);
});
