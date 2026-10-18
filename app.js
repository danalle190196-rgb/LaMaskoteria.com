/* La Maskoteria · lógica de la página: navegación entre catálogos, filtros, carrito, pago y tasa BCV */


(function(){
var h=document.getElementById('inicio'),vs=document.querySelectorAll('.vista');
function route(){var k=location.hash.slice(1),cur=null;
vs.forEach(function(v){var on=v.id==='vista-'+k;v.hidden=!on;if(on)cur=v});
h.hidden=!!cur;
if(cur||!k||k==='inicio'){window.scrollTo(0,0)}else{var t=document.getElementById(k);if(t)t.scrollIntoView()}}
window.addEventListener('hashchange',route);route();
vs.forEach(function(v){var cs=v.querySelectorAll('.chip'),ps=v.querySelectorAll('.prod');
cs.forEach(function(c){c.addEventListener('click',function(){cs.forEach(function(x){x.setAttribute('aria-pressed',x===c)});
ps.forEach(function(p){p.hidden=!(c.dataset.f==='todos'||p.dataset.cat===c.dataset.f)})})})});
})();
(function(){
var KEY='maskoteria-cart',cart={};
try{cart=JSON.parse(localStorage.getItem(KEY))||{}}catch(e){cart={}}
if(typeof cart!=='object'||Array.isArray(cart))cart={};
function save(){try{localStorage.setItem(KEY,JSON.stringify(cart))}catch(e){}}
var wrap=document.getElementById('cart-wrap'),list=document.getElementById('cart-list'),empty=document.getElementById('cart-empty'),acts=document.getElementById('cart-actions'),send=document.getElementById('cart-send'),live=document.getElementById('cart-live'),opener=document.getElementById('cart-open'),cnt=document.querySelector('.cart-count');
function mk(tx,label,fn){var b=document.createElement('button');b.type='button';b.textContent=tx;b.setAttribute('aria-label',label);b.addEventListener('click',fn);return b}
function chg(n,d){cart[n]=Math.min(99,(cart[n]||0)+d);if(cart[n]<1)delete cart[n];save();render()}
function parseP(t){var m=String(t).replace(/\s/g,'').match(/\d[\d.,]*/);if(!m)return null;var x=m[0].replace(/[.,]+$/,''),a=x.lastIndexOf('.'),b=x.lastIndexOf(','),sp=Math.max(a,b),n;
if(sp<0)n=x;else{var d=x.length-sp-1;n=(a>=0&&b>=0)||d<=2?x.slice(0,sp).replace(/[.,]/g,'')+'.'+x.slice(sp+1):x.replace(/[.,]/g,'')}
n=parseFloat(n);return n>0?Math.round(n*100):null}
function money(c){var p=(c/100).toFixed(2).split('.');p[0]=p[0].replace(/\B(?=(\d{3})+(?!\d))/g,'.');return '$'+p.join(',')}
function priceOf(name){var ps=document.querySelectorAll('.prod');for(var i=0;i<ps.length;i++){var h=ps[i].querySelector('h3');if(h&&h.textContent.trim()===name){var p=ps[i].querySelector('.pp');return p?parseP(p.textContent):null}}return null}
function render(){
var ks=Object.keys(cart),t=ks.reduce(function(a,k){return a+cart[k]},0);
cnt.textContent=t;cnt.hidden=!t;list.textContent='';var sum=0,miss=0;
ks.forEach(function(n){var li=document.createElement('li'),nm=document.createElement('span'),q=document.createElement('span'),v=document.createElement('span');
nm.className='ci-name';nm.textContent=n;q.className='ci-q';v.textContent=cart[n];var pc=priceOf(n),pr=document.createElement('span');pr.className='ci-pr';if(pc===null){miss++;pr.textContent='Precio por confirmar'}else{sum+=pc*cart[n];pr.textContent=cart[n]+' × '+money(pc)+' = '+money(pc*cart[n])}
q.append(mk('−','Quitar una unidad de '+n,function(){chg(n,-1)}),v,mk('+','Agregar una unidad de '+n,function(){chg(n,1)}));
var r=mk('Quitar','Quitar '+n+' del carrito',function(){delete cart[n];save();render()});r.className='ci-rm';
li.append(nm,pr,q,r);list.append(li)});
empty.hidden=t>0;acts.hidden=!t;document.getElementById('cart-total').hidden=!t;document.getElementById('cart-total-v').textContent=money(sum);document.getElementById('cart-total-n').textContent=miss?(miss+(miss===1?' producto sin precio: ':' productos sin precio: ')+'se confirma por WhatsApp.'):'';
send.href='https://wa.me/'+document.getElementById('app').dataset.wa+'?text='+encodeURIComponent('Hola, quiero un presupuesto de:\n'+ks.map(function(n){return '- '+cart[n]+' x '+n}).join('\n'))}
function open(){step(false);wrap.hidden=false;document.getElementById('cart-close').focus()}
function close(){wrap.hidden=true;opener.focus()}
opener.addEventListener('click',open);
document.getElementById('cart-close').addEventListener('click',close);
document.getElementById('cart-ov').addEventListener('click',close);
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!wrap.hidden)close()});
document.getElementById('cart-clear').addEventListener('click',function(){cart={};save();render()});
var drawer=wrap.querySelector('.drawer'),pform=document.getElementById('cart-pay'),ctitle=document.getElementById('cart-t'),perr=document.getElementById('pay-err'),psend=document.getElementById('pay-send');
function step(p){drawer.classList.toggle('paying',p);ctitle.textContent=p?'Finalizar pedido':'Tu carrito';perr.textContent='';perr.className='';
if(p){document.getElementById('pay-count').textContent=Object.keys(cart).reduce(function(a,k){return a+cart[k]},0);pform.elements.nombre.focus()}}
document.getElementById('cart-checkout').addEventListener('click',function(){step(true)});
document.getElementById('pay-back').addEventListener('click',function(){step(false)});
pform.addEventListener('submit',function(e){e.preventDefault()});
pform.addEventListener('change',function(){
pform.querySelectorAll('.pay-info').forEach(function(p){p.hidden=!p.parentNode.querySelector('input').checked});
document.getElementById('dir-l').hidden=pform.elements.entrega.value!=='Envío a domicilio'});
psend.addEventListener('click',function(e){
var f=pform.elements,n=f.nombre.value.trim(),t=f.tel.value.trim(),en=f.entrega.value,d=f.dir.value.trim(),nt=f.nota.value.trim(),pm=pform.querySelector('input[name=pago]:checked'),m=[],dom=en==='Envío a domicilio';
if(!n)m.push('tu nombre');if(!t)m.push('tu teléfono');if(dom&&!d)m.push('la dirección de entrega');if(!pm)m.push('la forma de pago');
if(m.length){e.preventDefault();perr.className='';perr.textContent='Falta: '+m.join(', ')+'.';return}
var ks=Object.keys(cart);if(!ks.length){e.preventDefault();return}
var msg='Hola, quiero hacer este pedido:\n'+ks.map(function(k){return '- '+cart[k]+' x '+k}).join('\n')+'\n\nDatos del pedido\nNombre: '+n+'\nTeléfono: '+t+'\nEntrega: '+en+(dom?'\nDirección: '+d:'')+'\nForma de pago: '+pm.value+(nt?'\nNota: '+nt:'')+'\n\nTe enviaré el comprobante de pago cuando me confirmes el total.';
psend.href='https://wa.me/'+document.getElementById('app').dataset.wa+'?text='+encodeURIComponent(msg);
perr.className='ok';perr.textContent='Se abrió WhatsApp. Envía el mensaje y, cuando te confirmemos el total, haz el pago y manda el comprobante.'});
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.add');if(!b)return;
var n=b.closest('.prod').querySelector('h3').textContent;chg(n,1);
live.textContent=n+' agregado al carrito';b.textContent='Agregado ✓';
setTimeout(function(){b.textContent='Agregar al carrito'},1200)});
render();
})();

/* Tasa BCV automática (DolarAPI). Si el servicio falla, se queda con la última tasa guardada. */
(function(){
var API='https://ve.dolarapi.com/v1/dolares/oficial',KEY='maskoteria-tasa',EVERY=30*60*1000;
var v=document.getElementById('tasa-v'),w=document.getElementById('tasa');if(!v||!w)return;
var base=parseFloat(String(v.textContent).replace(/\./g,'').replace(',','.'))||0;
function fmt(n){var p=n.toFixed(2).split('.');p[0]=p[0].replace(/\B(?=(\d{3})+(?!\d))/g,'.');return p.join(',')}
function fecha(iso){var d=new Date(iso);if(isNaN(d))return '';try{return d.toLocaleDateString('es-VE',{day:'numeric',month:'short',year:'numeric',timeZone:'America/Caracas'})}catch(e){return d.toISOString().slice(0,10)}}
function show(rate,iso){v.textContent=fmt(rate);var f=fecha(iso);if(f)v.dataset.fecha=f;w.title='Tasa oficial BCV'+(f?' · actualizada el '+f:'')}
function ok(n){return typeof n==='number'&&isFinite(n)&&n>0&&(!base||(n>base*0.5&&n<base*2))}
try{var c=JSON.parse(localStorage.getItem(KEY));if(c&&ok(c.r))show(c.r,c.d)}catch(e){}
function load(){
var ctl=window.AbortController?new AbortController():null,t=setTimeout(function(){if(ctl)ctl.abort()},8000);
fetch(API,{cache:'no-store',signal:ctl?ctl.signal:undefined}).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(j){
clearTimeout(t);var n=Number(j.promedio||j.venta);if(!ok(n))return;show(n,j.fechaActualizacion);
try{localStorage.setItem(KEY,JSON.stringify({r:n,d:j.fechaActualizacion}))}catch(e){}
}).catch(function(){clearTimeout(t)})}
load();setInterval(load,EVERY);
})();
