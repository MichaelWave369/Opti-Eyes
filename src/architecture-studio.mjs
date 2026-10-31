import {COMPONENT_SLOTS,BENCH_GATES,validateCandidate,summarizeArchitecture,
  initialVirtualLink,transitionVirtualLink,exportArchitectureReceipt} from "./hardware-architecture.mjs";

const $=id=>document.getElementById(id);
let candidates=[],counter=0,link=initialVirtualLink();
const slots=$("arch-slots"),records=$("arch-records");
function element(tag,value){
 const e=document.createElement(tag);
 if(value!==undefined)e.textContent=String(value);
 return e;
}
function renderComponents(){
 const summary=summarizeArchitecture(candidates);
 $("arch-covered").textContent=summary.coveredSlots+" / "+COMPONENT_SLOTS.length;
 $("arch-cited").textContent=String(summary.citedCandidates);
 $("arch-verified").textContent="0";
 slots.replaceChildren();
 for(const s of summary.slots){
   const li=element("li"),name=element("strong",s.name),detail=element("span",s.status+" / "+s.count+" entry(s) / "+s.citations+" user-cited");
   li.append(name,detail);slots.append(li);
 }
 records.replaceChildren();
 for(const c of summary.candidates){
   const tr=element("tr");
   for(const k of ["id","slot","maker","part","revision","evidenceStatus"]){
     const td=element("td",c[k]||"—");tr.append(td);
   }
   const td=element("td"),btn=element("button","REMOVE");
   btn.type="button";btn.setAttribute("aria-label","Remove "+c.id);
   btn.addEventListener("click",()=>{candidates=candidates.filter(item=>item.id!==c.id);renderComponents();});
   td.append(btn);tr.append(td);records.append(tr);
 }
 $("arch-empty").hidden=summary.candidates.length>0;
}
function renderLink(){
 $("arch-link-status").textContent=link.connected?"VIRTUAL CONNECTION ACTIVE":"OFFLINE";
 $("arch-link-grant").checked=link.granted;
 $("arch-link-grant").disabled=!link.connected;
 $("arch-link-connect").disabled=link.connected;
 $("arch-link-disconnect").disabled=!link.connected;
 $("arch-link-drop").disabled=!link.connected;
 $("arch-link-near").disabled=!link.connected;
 $("arch-link-far").disabled=!link.connected;
 $("arch-link-seq").textContent=String(link.sequence);
 $("arch-link-focus").textContent=link.focusD.toFixed(2)+" D";
 $("arch-link-packet").textContent=link.lastPacket?JSON.stringify(link.lastPacket,null,2):
  "No mock command packet issued.";
}
$("arch-form").addEventListener("submit",event=>{
 event.preventDefault();
 if(!$("arch-form").reportValidity())return;
 if(candidates.length>=60){$("arch-feedback").textContent="Maximum 60 research candidates reached.";return;}
 const get=id=>$(id).value;
 const proposedId="C-"+String(counter+1).padStart(3,"0");
 try{
  const c=validateCandidate({id:proposedId,slot:get("arch-slot"),maker:get("arch-maker"),
    part:get("arch-part"),revision:get("arch-revision"),datasheetUrl:get("arch-url"),notes:get("arch-notes")});
  counter++;candidates.push(c);
  renderComponents();
  $("arch-feedback").textContent="Added "+c.id+" as "+c.evidenceStatus+". Not independently verified.";
  $("arch-form").reset();
 }catch(error){$("arch-feedback").textContent="Rejected entry: "+error.message;}
});
function applyLink(event){
 try{
  link=transitionVirtualLink(link,event);
  $("arch-link-feedback").textContent=
    event==="focus-near"||event==="focus-far" ?
      "Mock packet created inside this page. No real Gen.E.Wrist action or optical device command.":
      event==="signal-loss"?"Signal-loss simulation: connection and grant cleared.":
      "Virtual event "+event+" applied. Nothing was sent externally.";
 }catch(error){$("arch-link-feedback").textContent="DENIED: "+error.message;}
 renderLink();
}
$("arch-link-connect").addEventListener("click",()=>applyLink("connect"));
$("arch-link-disconnect").addEventListener("click",()=>applyLink("disconnect"));
$("arch-link-drop").addEventListener("click",()=>applyLink("signal-loss"));
$("arch-link-near").addEventListener("click",()=>applyLink("focus-near"));
$("arch-link-far").addEventListener("click",()=>applyLink("focus-far"));
$("arch-link-grant").addEventListener("change",()=>applyLink($("arch-link-grant").checked?"grant":"revoke"));
$("arch-reset").addEventListener("click",()=>{
 candidates=[];counter=0;link=initialVirtualLink();
 renderComponents();renderLink();
 $("arch-feedback").textContent="Research list cleared; virtual link reset. Nothing persisted or uploaded.";
 $("arch-link-feedback").textContent="Simulated link reset.";
});
$("arch-gates").replaceChildren(...BENCH_GATES.map((name,i)=>{
 const li=element("li"),s=element("strong","GATE "+String(i+1).padStart(2,"0")+" / NOT VERIFIED"),p=element("span",name);
 li.append(s,p);return li;
}));
$("arch-export").addEventListener("click",()=>{
 const report=exportArchitectureReceipt(candidates,link);
 const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:"application/json"}));
 const a=document.createElement("a");a.href=url;a.download="opti-eyes-bench-architecture.json";
 document.body.append(a);a.click();a.remove();URL.revokeObjectURL(url);
});
renderComponents();renderLink();
