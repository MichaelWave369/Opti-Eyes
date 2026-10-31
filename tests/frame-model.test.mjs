import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {LIMITS,DEFAULT,CHOICES,geometry,drawing,benchScad,exportSpec} from "../src/frame-model.mjs";

test("default dimensions are internally consistent",()=>{
 const g=geometry(DEFAULT);
 assert.equal(g.frontWidth,138);assert.equal(g.centerSpacing,68);assert.equal(g.outerHeight,44);
});
test("dimensions are bounded and reject non-finite inputs",()=>{
 for(const [k,[a,b]] of Object.entries(LIMITS)){
  assert.doesNotThrow(()=>geometry({...DEFAULT,[k]:a}));
  assert.doesNotThrow(()=>geometry({...DEFAULT,[k]:b}));
  for(const n of [a-0.1,b+0.1,NaN,Infinity,-Infinity])assert.throws(()=>geometry({...DEFAULT,[k]:n}));
 }
 assert.throws(()=>geometry({...DEFAULT,mechanism:"magic"}));assert.throws(()=>geometry(null));
});
test("architecture descriptions make no autofocus claim for fixed baseline",()=>{
 assert.deepEqual(Object.keys(CHOICES),["fixed","alvarez","fluidic","electro"]);
 assert.match(CHOICES.fixed.status,/NOT AUTOFOCUS/);
 for(const c of Object.values(CHOICES))for(const key of ["name","description","challenge","measure"])assert.ok(c[key].length>15);
});
test("SVG exports dimensioned concept geometry, not executable markup",()=>{
 const s=drawing(DEFAULT);
 assert.match(s,/^<svg xmlns=/);assert.match(s,/FRONT SPAN 138.0 mm/);
 assert.match(s,/TEMPLE REFERENCE 140.0 mm/);assert.doesNotMatch(s,/<script|onload=/);
});
test("SCAD is a real, front-only, nonwearable geometry export",()=>{
 const s=benchScad(DEFAULT);
 assert.match(s,/NON-WEARABLE BENCH GEOMETRY/);assert.match(s,/linear_extrude\(height=3\)/);
 assert.match(s,/lens_w=50.00/);assert.match(s,/not a wearable arm/);
});
test("JSON clearly labels lack of fit and safety validation",()=>{
 const s=exportSpec(DEFAULT);
 assert.equal(s.safeToWear,false);assert.equal(s.fitValidated,false);
 assert.equal(s.medicalDevice,false);assert.equal(s.geometricModel.frontWidth,138);
});
test("browser controls are present and original focus + wrist simulator preserved",async()=>{
 const html=await readFile(new URL("../index.html",import.meta.url),"utf8");
 const js=await readFile(new URL("../src/hardware-studio.mjs",import.meta.url),"utf8");
 for(const id of ["hw-diagram","hw-mechanism","hw-svg","hw-scad","hw-json","hw-reset","hw-front","hw-spacing","hw-height"]){
  assert.ok(html.includes('id="'+id+'"'),id);
  assert.ok(js.includes('el("'+id+'")'),id);
 }
 for(const id of ["hw-name","hw-status","hw-description","hw-challenge","hw-measure"]){
  assert.ok(html.includes('id="'+id+'"'),id);
 }
 for(const key of Object.keys(LIMITS))assert.ok(html.includes('id="hw-'+key+'"'),key);
 assert.match(js,/el\("hw-"\+k\)/);
 assert.match(html,/src="\.\/src\/app\.mjs"/);
 assert.match(html,/src="\.\/src\/hardware-studio\.mjs"/);
 assert.match(html,/SOFTWARE SIMULATION ONLY/);
});
