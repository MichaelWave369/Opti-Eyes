import {LIMITS,DEFAULT,CHOICES,geometry,drawing,benchScad,exportSpec} from "./frame-model.mjs";
const el=id=>document.getElementById(id);
const state={...DEFAULT};
function show(){
 const g=geometry(state), m=CHOICES[g.mechanism];
 el("hw-diagram").innerHTML=drawing(g);
 for(const k of Object.keys(LIMITS))el("hw-"+k+"-value").textContent=g[k].toFixed(1)+" mm";
 el("hw-front").textContent=g.frontWidth.toFixed(1)+" mm";
 el("hw-spacing").textContent=g.centerSpacing.toFixed(1)+" mm";
 el("hw-height").textContent=g.outerHeight.toFixed(1)+" mm";
 for(const k of ["name","status","description","challenge","measure"])el("hw-"+k).textContent=m[k];
}
for(const k of Object.keys(LIMITS))el("hw-"+k).addEventListener("input",()=>{
 const n=Number(el("hw-"+k).value),[lo,hi]=LIMITS[k];
 if(Number.isFinite(n)&&n>=lo&&n<=hi){state[k]=n;show();}
});
el("hw-mechanism").addEventListener("change",()=>{
 if(Object.hasOwn(CHOICES,el("hw-mechanism").value)){state.mechanism=el("hw-mechanism").value;show();}
});
function download(text,name,mime){
 const url=URL.createObjectURL(new Blob([text],{type:mime}));
 const a=document.createElement("a");a.href=url;a.download=name;document.body.append(a);a.click();a.remove();URL.revokeObjectURL(url);
}
el("hw-svg").addEventListener("click",()=>download(drawing(state),"opti-eyes-concept.svg","image/svg+xml"));
el("hw-scad").addEventListener("click",()=>download(benchScad(state),"opti-eyes-nonwearable-bench.scad","text/plain"));
el("hw-json").addEventListener("click",()=>download(JSON.stringify(exportSpec(state),null,2),"opti-eyes-research.json","application/json"));
el("hw-reset").addEventListener("click",()=>{
 Object.assign(state,DEFAULT);
 for(const k of Object.keys(LIMITS))el("hw-"+k).value=String(state[k]);
 el("hw-mechanism").value=state.mechanism;show();
});
show();
