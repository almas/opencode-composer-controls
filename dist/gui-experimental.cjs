"use strict";Object.defineProperties(exports,{__esModule:{value:!0},[Symbol.toStringTag]:{value:"Module"}});const s=require("solid-js/web"),K=require("@opencode/plugin/gui"),E=require("solid-js"),ge={id:"composer-controls",methods:{prefs:{input:{type:"object",properties:{}},output:{type:"object",properties:{sendKey:{type:"string"},heightPx:{type:"number"},rememberHeight:{type:"boolean"}},required:["sendKey","heightPx","rememberHeight"]}},setPrefs:{input:{type:"object",properties:{sendKey:{type:"string"},heightPx:{type:"number"},rememberHeight:{type:"boolean"}}},output:{type:"object",properties:{sendKey:{type:"string"},heightPx:{type:"number"},rememberHeight:{type:"boolean"}},required:["sendKey","heightPx","rememberHeight"]}}},events:{}};var fe=s.template('<div style="display:flex;flex-direction:column;gap:18px;padding:4px 0;font-size:13px"><div><span style=font-weight:600></span><label><input type=radio name=composer-controls-send-key><span></span></label><label><input type=radio name=composer-controls-send-key><span></span></label></div><label><span style=font-weight:600></span><div><input type=number min=120 max=2400 step=10 style="width:110px;padding:4px 8px"><span style=opacity:0.7>px</span></div></label><label><input type=checkbox><span></span></label><div style=opacity:0.7;max-width:480px;line-height:1.5>');const G="opencode-composer-controls.prefs",B="opencode-composer-controls.collapsed.v2",S={sendKey:"ctrl+enter",heightPx:360,rememberHeight:!0},Y=120,ye=2400,V="composer-controls-style";function J(r){if(!Number.isFinite(r))return S.heightPx;const n=Math.min(ye,Math.max(Y,Math.floor(window.innerHeight*.8)));return Math.max(Y,Math.min(n,Math.round(r)))}function L(r){const n=r&&typeof r=="object"?r:{};return{sendKey:n.sendKey==="enter"||n.sendKey==="ctrl+enter"?n.sendKey:S.sendKey,heightPx:J(typeof n.heightPx=="number"?n.heightPx:S.heightPx),rememberHeight:n.rememberHeight===void 0?S.rememberHeight:n.rememberHeight===!0}}function be(){try{const r=localStorage.getItem(G);return r?L(JSON.parse(r)):void 0}catch{return}}function R(r){try{localStorage.setItem(G,JSON.stringify(r))}catch{}}function ve(r){return r instanceof Error&&r.message?r.message:String(r)}async function U(r,n,f=10,C=800){for(let a=0;a<f;a++)try{return await n()}catch(y){const h=a===f-1;if(console.warn(`[composer-controls] ${r} attempt ${a+1} failed: ${ve(y)}`),h)return;await new Promise(b=>setTimeout(b,C*(a+1)))}}function xe(){if(document.getElementById(V))return;const r=document.createElement("style");r.id=V,r.textContent=`
/* The app sizes the form only for its history preview. Outside that mode we
   own the height: the form becomes a column, the scroll viewport flexes to
   fill it, and the contenteditable stretches over the whole viewport so the
   area you can actually type into grows with the box. */
form[data-component="composer"][data-oc-composer-controls]:not([style*="height"]) {
  height: var(--oc-cr-h, 360px) !important;
  display: flex !important;
  flex-direction: column !important;
}
form[data-component="composer"][data-oc-composer-controls]:not([style*="height"]) [data-slot="composer-content"] {
  display: flex !important;
  flex-direction: column !important;
  flex: 1 1 auto !important;
  min-height: 0 !important;
}
form[data-component="composer"][data-oc-composer-controls]:not([style*="height"]) [data-component="composer-scroll"] {
  display: flex !important;
  flex-direction: column !important;
  flex: 1 1 auto !important;
  min-height: 0 !important;
  max-height: none !important;
}
form[data-component="composer"][data-oc-composer-controls]:not([style*="height"]) [data-component="composer-editor"] {
  /* Grow to fill the viewport, but never shrink below the text height. */
  flex: 1 0 auto !important;
}
form[data-component="composer"] [data-oc-composer-resize] {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 10px;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ns-resize;
  touch-action: none;
  opacity: 0;
  transition: opacity 0.12s ease;
}
form[data-component="composer"] [data-oc-composer-resize]:hover,
form[data-component="composer"] [data-oc-composer-resize][data-oc-dragging] {
  opacity: 1;
}
form[data-component="composer"] [data-oc-composer-resize]::after {
  content: "";
  width: 36px;
  height: 3px;
  border-radius: 999px;
  background: var(--v2-border-border-base, rgba(128, 128, 128, 0.6));
}
/* The host styles every plugin TitlebarItem like an update pill: accent-blue
   text on a filled circle. A reload button is a routine control, not a
   notification, so tone it down to the muted gray the neighbouring ghost-muted
   titlebar icons use. :has() pins the rule to the pill whose icon is the
   rotate-clockwise sprite (the host draws it with <use href>, not an inline
   path), so other plugins' items keep their own look. */
[data-slot="titlebar-update"]:has(use[href="#opencode-v2-icon-outline-rotate-clockwise"]) {
  background: transparent !important;
  border-color: transparent !important;
}
[data-slot="titlebar-update"]:has(use[href="#opencode-v2-icon-outline-rotate-clockwise"]) > button {
  background: transparent !important;
  color: var(--v2-icon-icon-muted, var(--v2-text-text-muted, rgba(145, 145, 145, 0.92))) !important;
}

[data-slot="titlebar-update"]:has(use[href="#opencode-v2-icon-outline-rotate-clockwise"]) > button:hover {
  background: var(--v2-overlay-simple-overlay-hover, rgba(128, 128, 128, 0.16)) !important;
}
[data-slot="titlebar-update"]:has(use[href="#opencode-v2-icon-outline-rotate-clockwise"]) > button:active {
  background: var(--v2-overlay-simple-overlay-pressed, rgba(128, 128, 128, 0.24)) !important;
}
[data-slot="titlebar-update"]:has(use[href="#opencode-v2-icon-outline-rotate-clockwise"]) [data-slot="titlebar-update-label"] {
  color: var(--v2-text-text-muted, rgba(145, 145, 145, 0.92)) !important;
}
`,document.head.appendChild(r)}const we=K.Plugin.define({i18n:{en:{"composer-controls.settings.title":"Composer","composer-controls.settings.sendKey":"Send key","composer-controls.settings.sendKey.ctrlEnter":"⌘/Ctrl+Enter sends the message, Enter starts a new line","composer-controls.settings.sendKey.enter":"Enter sends the message (app default)","composer-controls.settings.height":"Input field height","composer-controls.settings.remember":"Remember the height and restore it after restart","composer-controls.settings.hint":"Drag the top edge of the input field to resize it; a single click on the edge restores the default height.","composer-controls.handle.tooltip":"Drag to resize · click to restore the default height","composer-controls.reload.label":"Reload UI","composer-controls.reload.title":"Reload the window so updated plugin code takes effect"},ja:{"composer-controls.settings.title":"入力欄","composer-controls.settings.sendKey":"送信キー","composer-controls.settings.sendKey.ctrlEnter":"⌘/Ctrl+Enter で送信、Enter は改行","composer-controls.settings.sendKey.enter":"Enter で送信（アプリの既定）","composer-controls.settings.height":"入力欄の高さ","composer-controls.settings.remember":"高さを記憶して再起動後も復元する","composer-controls.settings.hint":"入力欄の上端をドラッグするとサイズ変更できます。上端をクリックすると既定の高さに戻ります。","composer-controls.handle.tooltip":"ドラッグでサイズ変更・クリックで既定の高さに戻す","composer-controls.reload.label":"再読み込み","composer-controls.reload.title":"プラグインの更新を反映するためウィンドウを読み込み直します"}},setup(r){const n=t=>r.t(t),f=r.client.rpc(ge);xe();const C=()=>window.location.reload();r.add(K.TitlebarItem,{id:"composer-controls-reload",get label(){return n("composer-controls.reload.label")},get title(){return n("composer-controls.reload.title")},icon:"outline-rotate-clockwise",run:C}),r.add(K.Command,{id:"composer-controls.reload",get title(){return n("composer-controls.reload.title")},run:C});const[a,y]=E.createSignal(be()??{...S}),[h,b]=E.createSignal((()=>{try{return localStorage.getItem(B)==="true"}catch{return!1}})());let $=!1;const A=t=>{try{localStorage.setItem(B,t?"true":"false")}catch{}},z=()=>{const t=a();U("setPrefs",()=>f.setPrefs({...t}),3,600).then(e=>{if(!e||a()!==t)return;const o=L(e);y(o),R(o)})},v=t=>{$=!0;const e=L({...a(),...t});y(e),R(e),x(),z()};U("prefs",()=>f.prefs({})).then(t=>{if(!t)return;if($){z();return}const e=L(t);y(e),R(e),x()});function Q(t){if(!(t instanceof HTMLElement))return null;const e=t.closest('[data-component="composer-editor"]');return e instanceof HTMLElement?e:null}function X(t){const e=t.closest('form[data-component="composer"]');return e instanceof HTMLFormElement?e:null}function W(t){return!!X(t)?.parentElement?.querySelector('[data-component="composer-suggestions"]')}function Z(t){return t.style.height!==""}function ee(t,e){const o=document.createRange();o.selectNodeContents(t);try{o.setStart(e.endContainer,e.endOffset)}catch{return!1}const l=o.cloneContents();return(l.textContent??"").trim()!==""?!1:l.querySelector("br, img, [data-mention], [data-file], [data-skill]")===null}function te(t){const e=window.getSelection();let o=null;if(e&&e.rangeCount>0){const c=e.getRangeAt(0);t.contains(c.startContainer)&&(o=c)}o||(o=document.createRange(),o.selectNodeContents(t),o.collapse(!1),e?.removeAllRanges(),e?.addRange(o)),o.collapse(!0);const l=ee(t,o),p=document.createElement("br");if(o.insertNode(p),l){const c=document.createRange();c.setStartAfter(p),c.collapse(!0),c.insertNode(document.createElement("br"))}const d=document.createRange();d.setStartAfter(p),d.collapse(!0),e?.removeAllRanges(),e?.addRange(d),t.dispatchEvent(new InputEvent("input",{bubbles:!0,composed:!0,inputType:"insertLineBreak"}))}function oe(t){const e=t.getElementsByTagName("br").length;let o=!1;try{o=document.execCommand("insertLineBreak")}catch{o=!1}o&&t.getElementsByTagName("br").length>e||te(t)}const N=t=>{if(t.key!=="Enter"||t.isComposing||t.keyCode===229||t.altKey||t.shiftKey||t.ctrlKey||t.metaKey)return;const e=Q(t.target);e&&(W(e)||a().sendKey==="ctrl+enter"&&(t.preventDefault(),t.stopPropagation(),!t.repeat&&oe(e)))};window.addEventListener("keydown",N,{capture:!0}),E.onCleanup(()=>window.removeEventListener("keydown",N,{capture:!0}));const[re,q]=E.createSignal(void 0),ne=()=>re()??a().heightPx,j=(t,e)=>{const o=`${e}px`;t.style.getPropertyValue("--oc-cr-h")!==o&&t.style.setProperty("--oc-cr-h",o),t.style.getPropertyValue("--oc-cr-max")&&t.style.removeProperty("--oc-cr-max"),t.style.getPropertyValue("--oc-cr-min")&&t.style.removeProperty("--oc-cr-min")},F=t=>{t.hasAttribute("data-oc-composer-controls")&&t.removeAttribute("data-oc-composer-controls");for(const e of["--oc-cr-h","--oc-cr-max","--oc-cr-min"])t.style.getPropertyValue(e)&&t.style.removeProperty(e)};function se(t){const e=document.createElement("div");return e.setAttribute("data-oc-composer-resize",""),e.title=n("composer-controls.handle.tooltip"),e.addEventListener("pointerdown",o=>{if(o.button!==0)return;o.preventDefault(),o.stopPropagation();const l=Math.round(t.getBoundingClientRect().height),p=o.clientY;let d=!1,c=l;e.setPointerCapture(o.pointerId),e.setAttribute("data-oc-dragging","");const P=u=>{const m=p-u.clientY;Math.abs(m)>=2&&(d=!0),c=J(l+m),j(t,c)},w=u=>{e.removeAttribute("data-oc-dragging"),e.removeEventListener("pointermove",P),e.removeEventListener("pointerup",g),e.removeEventListener("pointercancel",k);try{e.releasePointerCapture(o.pointerId)}catch{}if(u){if(d)h()&&(b(!1),A(!1)),a().rememberHeight?(q(void 0),v({heightPx:c})):q(c);else{const m=!h();b(m),A(m)}x()}},g=()=>w(!0),k=()=>w(!1);e.addEventListener("pointermove",P),e.addEventListener("pointerup",g),e.addEventListener("pointercancel",k)}),e}function x(){const t=document.querySelectorAll('form[data-component="composer"]');for(const e of t)if(!e.querySelector("[data-oc-composer-resize][data-oc-dragging]")){if(Z(e)){e.querySelector("[data-oc-composer-resize]")?.remove(),F(e);continue}if(e.querySelector("[data-oc-composer-resize]")||e.appendChild(se(e)),h()){F(e);continue}e.hasAttribute("data-oc-composer-controls")||e.setAttribute("data-oc-composer-controls",""),j(e,ne())}}let _=!1;const ie=()=>{_||(_=!0,requestAnimationFrame(()=>{_=!1,x()}))},O=new MutationObserver(ie);O.observe(document.body,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["style"]}),E.onCleanup(()=>O.disconnect()),x(),r.add(K.SettingsPage,{id:"composer-controls",get title(){return n("composer-controls.settings.title")},icon:"keyboard",render:()=>s.createComponent(ae,{})});function ae(){const t={display:"flex","align-items":"center",gap:"8px"},e={display:"flex","flex-direction":"column",gap:"8px"};return(()=>{var o=fe(),l=o.firstChild,p=l.firstChild,d=p.nextSibling,c=d.firstChild,P=c.nextSibling,w=d.nextSibling,g=w.firstChild,k=g.nextSibling,u=l.nextSibling,m=u.firstChild,D=m.nextSibling,T=D.firstChild;T.nextSibling;var M=u.nextSibling,I=M.firstChild,ce=I.nextSibling,le=M.nextSibling;return s.insert(p,()=>n("composer-controls.settings.sendKey")),c.addEventListener("change",()=>v({sendKey:"ctrl+enter"})),s.insert(P,()=>n("composer-controls.settings.sendKey.ctrlEnter")),g.addEventListener("change",()=>v({sendKey:"enter"})),s.insert(k,()=>n("composer-controls.settings.sendKey.enter")),s.insert(m,()=>n("composer-controls.settings.height")),T.addEventListener("change",i=>{const H=Number(i.currentTarget.value);Number.isFinite(H)&&(h()&&(b(!1),A(!1)),v({heightPx:H}))}),I.addEventListener("change",i=>v({rememberHeight:i.currentTarget.checked})),s.insert(ce,()=>n("composer-controls.settings.remember")),s.insert(le,()=>n("composer-controls.settings.hint")),s.effect(i=>{var H=e,de=t,pe=t,me=e,ue=t,he=t;return i.e=s.style(l,H,i.e),i.t=s.style(d,de,i.t),i.a=s.style(w,pe,i.a),i.o=s.style(u,me,i.o),i.i=s.style(D,ue,i.i),i.n=s.style(M,he,i.n),i},{e:void 0,t:void 0,a:void 0,o:void 0,i:void 0,n:void 0}),s.effect(()=>c.checked=a().sendKey==="ctrl+enter"),s.effect(()=>g.checked=a().sendKey==="enter"),s.effect(()=>T.value=a().heightPx),s.effect(()=>I.checked=a().rememberHeight),o})()}}});exports.default=we;
