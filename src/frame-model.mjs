// Dimensioned concept model only. Not fitted eyewear or certified optics.
export const LIMITS = Object.freeze({lensWidth:[42,60],lensHeight:[28,52],bridge:[14,26],endpiece:[6,16],temple:[125,155],rim:[2,5]});
export const DEFAULT = Object.freeze({lensWidth:50,lensHeight:38,bridge:18,endpiece:10,temple:140,rim:3,mechanism:"fixed"});
export const CHOICES = Object.freeze({
 fixed:{name:"Fixed optical insert",status:"REFERENCE / NOT AUTOFOCUS",description:"Established lens-insert concept, but it cannot change focus without another mechanism.",challenge:"Proper fitting, prescription compatibility and certified optical quality.",measure:"Baseline aperture, clearance, optical insert tolerance and replaceability."},
 alvarez:{name:"Sliding Alvarez-type optics",status:"VARIABLE FOCUS / RESEARCH",description:"Two shaped optical plates move relative to one another to vary power.",challenge:"Actuation travel, plate alignment, distortion, wear and patent review.",measure:"Optical power vs travel, alignment tolerance, optical aberrations."},
 fluidic:{name:"Fluidic variable-curvature optics",status:"VARIABLE FOCUS / RESEARCH",description:"Control of a deformable fluid-based element may change optical power.",challenge:"Seal reliability, fluid stability, temperature and pressure.",measure:"Pressure-power response, leakage, clarity and time response."},
 electro:{name:"Electrically tunable optics",status:"RESEARCH / UNQUALIFIED",description:"Electrical drive of an optical element may change its optical properties.",challenge:"Qualified aperture, transmission, voltage, power and loss of drive.",measure:"Available vendor specifications and measured failure state."}
});
export function geometry(input){
 if(!input || !Object.hasOwn(CHOICES,input.mechanism))throw new RangeError("Unknown mechanism");
 const p={mechanism:input.mechanism};
 for(const [k,[a,b]] of Object.entries(LIMITS)){
  const n=input[k];if(!Number.isFinite(n)||n<a||n>b)throw new RangeError("Invalid "+k);
  p[k]=n;
 }
 return Object.freeze({...p,frontWidth:2*p.lensWidth+p.bridge+2*p.endpiece,centerSpacing:p.lensWidth+p.bridge,outerHeight:p.lensHeight+2*p.rim});
}
export function drawing(input){
 const g=geometry(input),s=Math.min(4.2,670/g.frontWidth);
 const w=g.lensWidth*s,h=g.lensHeight*s,b=g.bridge*s,r=g.rim*s,e=g.endpiece*s;
 const l=400-(w+b)/2, rt=400+(w+b)/2,y=145;
 const lens=(x)=>'<rect x="'+(x-w/2-r/2)+'" y="'+(y-h/2-r/2)+'" width="'+(w+r)+'" height="'+(h+r)+'" rx="16" fill="#153f48" stroke="#8fdbd4" stroke-width="'+r+'"/><rect x="'+(x-w/2)+'" y="'+(y-h/2)+'" width="'+w+'" height="'+h+'" rx="12" fill="#9ce1db" fill-opacity=".12"/><path d="M'+(x-6)+' '+y+'h12 M'+x+' '+(y-6)+'v12" stroke="#d7f1e8" opacity=".55"/>';
 const minX=l-w/2-e,maxX=rt+w/2+e,arm=g.temple*3.1;
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 410" role="img" aria-label="Non-wearable dimensional sketch, front and side reference">'+
 '<rect width="800" height="410" fill="#091d27"/><path d="M0 263H800" stroke="#274953"/>'+
 '<text x="24" y="27" fill="#72cfc8" font-family="monospace" font-size="13">FRONT / RESEARCH SCHEMATIC</text>'+
 '<path d="M'+minX+' '+y+'h'+e+' M'+(rt+w/2)+' '+y+'h'+e+'" stroke="#8fdbd4" stroke-width="'+Math.max(8,r)+'"/>'+
 '<path d="M'+(l+w/2)+' '+y+'Q400 '+(y+12)+' '+(rt-w/2)+' '+y+'" stroke="#8fdbd4" stroke-width="'+Math.max(7,r)+'" fill="none"/>'+
 lens(l)+lens(rt)+'<path d="M'+minX+' 234v13H'+maxX+'v-13" stroke="#ddba80" fill="none"/>'+
 '<text x="400" y="260" text-anchor="middle" font-family="monospace" font-size="13" fill="#ddba80">FRONT SPAN '+g.frontWidth.toFixed(1)+' mm</text>'+
 '<text x="24" y="298" fill="#72cfc8" font-family="monospace" font-size="13">SIDE / LENGTH REFERENCE ONLY</text>'+
 '<rect x="126" y="321" width="15" height="27" rx="5" stroke="#8fdbd4" fill="#1c4a56"/>'+
 '<path d="M142 329H'+(142+arm)+'" stroke="#8fdbd4" stroke-width="8" stroke-linecap="round"/>'+
 '<path d="M142 362v10H'+(142+arm)+'v-10" stroke="#ddba80" fill="none"/>'+
 '<text x="'+(142+arm/2)+'" y="397" text-anchor="middle" font-family="monospace" font-size="13" fill="#ddba80">TEMPLE REFERENCE '+g.temple.toFixed(1)+' mm</text></svg>';
}
export function benchScad(input){
 const g=geometry(input);
 const v=(n)=>Number(n).toFixed(2);
 return ["// Opti-Eyes NON-WEARABLE BENCH GEOMETRY / NOT SAFE EYEWEAR",
 "// No lenses, hinges, temples, electrical parts, tested fit, or safety approval.",
 "$fn=48;","lens_w="+v(g.lensWidth)+";","lens_h="+v(g.lensHeight)+";",
 "bridge="+v(g.bridge)+";","endpiece="+v(g.endpiece)+";","rim="+v(g.rim)+";",
 "cx=(lens_w+bridge)/2;",
 "module rounded(w,h,r){offset(r=r)square([w-2*r,h-2*r],center=true);}",
 "module ring(){difference(){rounded(lens_w+2*rim,lens_h+2*rim,6+rim);rounded(lens_w,lens_h,6);}}",
 "linear_extrude(height=3){",
 "for(side=[-1,1]){translate([side*cx,0])ring();",
 "translate([side*(cx+lens_w/2+endpiece/2),0])square([endpiece+rim,7],center=true);}",
 "square([bridge+2*rim,7],center=true);}",
 "// Temple reference "+v(g.temple)+" mm, not a wearable arm.",
 "// Optic family: "+g.mechanism+" (informational only).",""].join("\n");
}
export function exportSpec(input){
 const g=geometry(input);
 return {schema:"opti-eyes-research-geometry-v1",units:"mm",type:"nonwearable-bench-concept",
  safeToWear:false,medicalDevice:false,fitValidated:false,mechanism:CHOICES[g.mechanism],
  inputs:Object.fromEntries(Object.keys(LIMITS).map(k=>[k,g[k]])),
  geometricModel:{frontWidth:g.frontWidth,centerSpacing:g.centerSpacing,outerHeight:g.outerHeight},
  caveat:"Not prescription/PD fitting, optical power, UV certification or qualified eyewear geometry."};
}
