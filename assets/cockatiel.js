// Decorative homepage cockatiel: fixed medium-detail ASCII, with no external assets.
(() => {
'use strict';
const canvas = document.querySelector('[data-ascii-cockatiel]');
if (!canvas) return;
const ctx = canvas.getContext('2d');
if (!ctx) return;
const stage = canvas.parentElement;
const motion = matchMedia('(prefers-reduced-motion: reduce)');
let yaw = -.65;
let pitch = .32;
let pointerActive=false,pointerX=0,pointerY=0;
let width=0,height=0,cols=0,rows=0,depth,values,kinds;
let ch=16,cw=ch*.60;
let colors=[],visible=false,frame=0,last=0;
function updateColors() {
 const style=getComputedStyle(stage);
 const purple=style.getPropertyValue('--bird-purple').trim().split(',').map(Number);
 const green=style.getPropertyValue('--bird-green').trim().split(',').map(Number);
 const palette=[purple,green,purple,green,purple,green];
 colors=palette.map(color=>Array.from({length:12},(_,i)=>{
  const shade=.62+.38*i/11;
  return `rgb(${color.map(v=>Math.round(v*shade)).join(',')})`;
 }));
 render();
}
const meshes=[];
// Surfaces use shared triangle topology; shading and visibility are evaluated in 3D.
function ellipsoid(cx,cy,cz,rx,ry,rz,tilt=0,wing=0,kind=0){
 const vertices=[],faces=[],nu=40,nv=22,ct=Math.cos(tilt),st=Math.sin(tilt);
 for(let j=0;j<=nv;j++){let v=j/nv*Math.PI;for(let i=0;i<=nu;i++){let u=i/nu*Math.PI*2;let x=rx*Math.sin(v)*Math.cos(u),y=ry*Math.cos(v),z=rz*Math.sin(v)*Math.sin(u);vertices.push([cx+x*ct-y*st,cy+x*st+y*ct,cz+z]);}}
 for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){let a=j*(nu+1)+i,b=a+nu+1;faces.push([a,b,a+1],[a+1,b,b+1]);}
 meshes.push({vertices,faces,wing,kind});
}
// Grey plumage, a yellow face, orange cheeks, and a swept crest.
ellipsoid(0,0,0,.88,.38,.32,.12);
ellipsoid(.65,.30,0,.40,.31,.265,.55);
ellipsoid(1.0,.60,0,.34,.36,.29,0,0,3);
// A compact upper mandible curves downward to the characteristic hook.
ellipsoid(1.30,.57,0,.175,.14,.13,-.3,0,1);
meshes.push({vertices:[[1.36,.59,-.11],[1.36,.59,.11],[1.52,.49,0],[1.40,.27,0],[1.27,.43,0]],faces:[[0,1,2],[0,2,3],[1,3,2],[0,3,4],[1,4,3],[0,4,1]],wing:0,kind:1});
// Separate tapered crest feathers, swept back from the crown.
function crestFeather(base,tip,radius){
 const vertices=[],faces=[],rings=10,sides=8;
 for(let j=0;j<=rings;j++){
  const t=j/rings,r=radius*Math.sin(Math.PI*(.12+.88*t));
  const x=base[0]+(tip[0]-base[0])*t-.08*t*t;
  const y=base[1]+(tip[1]-base[1])*t;
  const z=base[2]+(tip[2]-base[2])*t;
  for(let k=0;k<sides;k++){const u=k/sides*Math.PI*2;vertices.push([x+r*Math.cos(u),y,z+r*Math.sin(u)]);}
 }
 for(let j=0;j<rings;j++)for(let k=0;k<sides;k++){const a=j*sides+k,b=j*sides+(k+1)%sides;faces.push([a,a+sides,b],[b,a+sides,b+sides]);}
 meshes.push({vertices,faces,wing:0,kind:3});
}
for(let i=0;i<6;i++)crestFeather([.93-i*.038,.84,(i-2.5)*.038],[.72-i*.105,1.47-i*.066,(i-2.5)*.055],.036);
for(const side of [-1,1]){
 ellipsoid(1.13,.70,side*.258,.053,.055,.039,0,0,2);
 ellipsoid(1.0,.46,side*.287,.155,.145,.075,0,0,4);
 // Grey wing coverts and overlapping white flight-feather panels.
 ellipsoid(-.10,.09,side*.70,.56,.13,.66,-.15,side);
 ellipsoid(-.28,.05,side*1.27,.49,.105,.59,-.12,side);
 for(let i=0;i<8;i++){
  const z=side*(1.13+i*.172),x=-.56-i*.055;
  ellipsoid(x,-.035-i*.012,z,.56-i*.025,.062,.125,-.10,side,i<4?5:0);
 }
 ellipsoid(-.29,.145,side*.88,.36,.035,.35,-.1,side,5);
 // Long narrow tail; the central pair extends furthest.
 for(let i=0;i<3;i++)ellipsoid(-1.43+i*.14,-.15,side*(.055+i*.075),1.05-i*.17,.047,.075,.13,0,i===0?3:0);
}
function resize() {
 const rect=stage.getBoundingClientRect();width=rect.width;height=rect.height;
 const dpr=Math.min(devicePixelRatio||1,2);
 canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
 ctx.setTransform(dpr,0,0,dpr,0,0);
 const style=getComputedStyle(stage);
 ch=parseFloat(style.fontSize)||16;
 ctx.font=ch+'px '+style.fontFamily;
 cw=ctx.measureText('M').width;
 ctx.textBaseline='top';
 cols=Math.ceil(width/cw);rows=Math.ceil(height/ch);
 depth=new Float32Array(cols*rows);values=new Float32Array(cols*rows);kinds=new Uint8Array(cols*rows);
 if(colors.length)render();
}
function render(){
 if (!width || !height) return;
 depth.fill(-Infinity);values.fill(0);kinds.fill(0);
 const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
 const scale=Math.min(width/6,height/3.8);
 for(const mesh of meshes){
  const flap=0,cf=Math.cos(flap),sf=Math.sin(flap);
  const verts=mesh.vertices.map(v=>{let [x,y,z]=v;if(mesh.wing){let pivot=mesh.wing*.27;z-=pivot;let ny=y*cf-z*sf;z=y*sf+z*cf+pivot;y=ny;}let xx=x*cy+z*sy,zz=-x*sy+z*cy,yy=y*cp-zz*sp;return [(width/2+xx*scale)/cw,(height/2-yy*scale)/ch,y*sp+zz*cp,xx,yy];});
  for(const face of mesh.faces){
   const a=verts[face[0]],b=verts[face[1]],c=verts[face[2]];
   let ux=b[3]-a[3],uy=b[4]-a[4],uz=b[2]-a[2],vx=c[3]-a[3],vy=c[4]-a[4],vz=c[2]-a[2];
   let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx,nlen=Math.hypot(nx,ny,nz)||1;
   // Two-sided surfaces retain readable feathers even at grazing angles.
   if(nz<0){nx=-nx;ny=-ny;nz=-nz;}
   const light=.19+.81*Math.max(0,(-.36*nx+.65*ny+.67*nz)/nlen);
   const minX=Math.max(0,Math.floor(Math.min(a[0],b[0],c[0]))),maxX=Math.min(cols-1,Math.ceil(Math.max(a[0],b[0],c[0])));
   const minY=Math.max(0,Math.floor(Math.min(a[1],b[1],c[1]))),maxY=Math.min(rows-1,Math.ceil(Math.max(a[1],b[1],c[1])));
   const den=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);if(Math.abs(den)<1e-8)continue;
   for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){
    let px=x+.5,py=y+.5,w1=((b[1]-c[1])*(px-c[0])+(c[0]-b[0])*(py-c[1]))/den,w2=((c[1]-a[1])*(px-c[0])+(a[0]-c[0])*(py-c[1]))/den,w3=1-w1-w2;
    if(w1<0||w2<0||w3<0)continue;let z=w1*a[2]+w2*b[2]+w3*c[2],idx=y*cols+x;
    if(z>depth[idx]){depth[idx]=z;values[idx]=light;kinds[idx]=mesh.kind;}
   }
  }
 }
 ctx.clearRect(0,0,width,height);
 const chars='.,:;iloxOX#@';
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
  const i=y*cols+x;
  if(depth[i]===-Infinity)continue;
  const level=Math.min(chars.length-1,Math.floor(values[i]*chars.length));
  ctx.fillStyle=colors[kinds[i]][level];
  ctx.fillText(kinds[i]===2?'@':chars[level],x*cw,y*ch);
 }

}
// Only animate when someone can see it; never animate reduced-motion visits.
function tick(now) {
 frame=0;
 if(!visible||document.hidden||motion.matches)return;
 if(!last||now-last>=50){
  const dt=last?Math.min((now-last)/1000,.1):0;
  const ease=1-Math.exp(-dt*5);
  if(pointerActive){
   const target=-.65+pointerX*1.25;
   // Take the shortest turn, even after several automatic revolutions.
   const turn=Math.atan2(Math.sin(target-yaw),Math.cos(target-yaw));
   yaw+=turn*ease;
  }else{
   yaw+=dt*.22;
  }
  pitch+=((pointerActive?.32+pointerY*.45:.32)-pitch)*ease;
  last=now;
  render();
 }
 frame=requestAnimationFrame(tick);
}
function updateAnimation() {
 cancelAnimationFrame(frame);frame=0;last=0;
 if(visible&&!document.hidden&&!motion.matches)frame=requestAnimationFrame(tick);
}
// Listen on the document so the decoration never intercepts clicks or scrolling.
function releasePointer(){pointerActive=false;}
document.addEventListener('pointermove',event=>{
 if(event.pointerType==='touch'||motion.matches||!visible)return;
 const rect=stage.getBoundingClientRect();
 pointerActive=event.clientX>=rect.left&&event.clientX<=rect.right&&
  event.clientY>=rect.top&&event.clientY<=rect.bottom;
 if(!pointerActive)return;
 pointerX=(event.clientX-rect.left)/rect.width*2-1;
 pointerY=(event.clientY-rect.top)/rect.height*2-1;
},{passive:true});
document.documentElement.addEventListener('pointerleave',releasePointer);
window.addEventListener('blur',releasePointer);
window.addEventListener('scroll',releasePointer,{passive:true});
resize();updateColors();
document.fonts.ready.then(resize);
new ResizeObserver(resize).observe(stage);
new IntersectionObserver(entries=>{
 visible=entries[0].isIntersecting;
 if(!visible)releasePointer();
 updateAnimation();
}).observe(stage);
new MutationObserver(updateColors).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',updateColors);
motion.addEventListener('change',()=>{releasePointer();updateAnimation();});
document.addEventListener('visibilitychange',updateAnimation);
})();
