"use strict";Object.defineProperties(exports,{__esModule:{value:!0},[Symbol.toStringTag]:{value:"Module"}});const s=require("solid-js/web"),k=require("@opencode/plugin/gui"),E=require("solid-js"),ge={id:"composer-controls",methods:{prefs:{input:{type:"object",properties:{}},output:{type:"object",properties:{sendKey:{type:"string"},heightPx:{type:"number"},rememberHeight:{type:"boolean"}},required:["sendKey","heightPx","rememberHeight"]}},setPrefs:{input:{type:"object",properties:{sendKey:{type:"string"},heightPx:{type:"number"},rememberHeight:{type:"boolean"}}},output:{type:"object",properties:{sendKey:{type:"string"},heightPx:{type:"number"},rememberHeight:{type:"boolean"}},required:["sendKey","heightPx","rememberHeight"]}}},events:{}};var fe=s.template('<div style="display:flex;flex-direction:column;gap:18px;padding:4px 0;font-size:13px"><div><span style=font-weight:600></span><label><input type=radio name=composer-controls-send-key><span></span></label><label><input type=radio name=composer-controls-send-key><span></span></label></div><label><span style=font-weight:600></span><div><input type=number min=120 max=2400 step=10 style="width:110px;padding:4px 8px"><span style=opacity:0.7>px</span></div></label><label><input type=checkbox><span></span></label><div style=opacity:0.7;max-width:480px;line-height:1.5>');const J="opencode-composer-controls.prefs",B="opencode-composer-controls.collapsed.v2",C={sendKey:"ctrl+enter",heightPx:360,rememberHeight:!0},Y=120,ye=2400,U="composer-controls-style";function V(r){if(!Number.isFinite(r))return C.heightPx;const n=Math.min(ye,Math.max(Y,Math.floor(window.innerHeight*.8)));return Math.max(Y,Math.min(n,Math.round(r)))}function L(r){const n=r&&typeof r=="object"?r:{};return{sendKey:n.sendKey==="enter"||n.sendKey==="ctrl+enter"?n.sendKey:C.sendKey,heightPx:V(typeof n.heightPx=="number"?n.heightPx:C.heightPx),rememberHeight:n.rememberHeight===void 0?C.rememberHeight:n.rememberHeight===!0}}function be(){try{const r=localStorage.getItem(J);return r?L(JSON.parse(r)):void 0}catch{return}}function R(r){try{localStorage.setItem(J,JSON.stringify(r))}catch{}}function ve(r){return r instanceof Error&&r.message?r.message:String(r)}async function G(r,n,f=10,S=800){for(let a=0;a<f;a++)try{return await n()}catch(y){const h=a===f-1;if(console.warn(`[composer-controls] ${r} attempt ${a+1} failed: ${ve(y)}`),h)return;await new Promise(b=>setTimeout(b,S*(a+1)))}}function xe(){if(document.getElementById(U))return;const r=document.createElement("style");r.id=U,r.textContent=`
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
   titlebar icons use. :has() pins the rule to the pill carrying the
   rotate-clockwise icon so other plugins' items keep their own look. */
[data-slot="titlebar-update"]:has(path[d^="M14.1992 8C14.1992 9.18669"]) {
  background-color: transparent;
}
[data-slot="titlebar-update"]:has(path[d^="M14.1992 8C14.1992 9.18669"]) > button {
  color: var(--v2-icon-icon-muted, var(--v2-text-text-muted, rgba(128, 128, 128, 0.9)));
}
[data-slot="titlebar-update"]:has(path[d^="M14.1992 8C14.1992 9.18669"]) > button:hover {
  background-color: var(--v2-overlay-simple-overlay-hover, rgba(128, 128, 128, 0.14));
}
[data-slot="titlebar-update"]:has(path[d^="M14.1992 8C14.1992 9.18669"]) > button:active {
  background-color: var(--v2-overlay-simple-overlay-pressed, rgba(128, 128, 128, 0.22));
}
[data-slot="titlebar-update"]:has(path[d^="M14.1992 8C14.1992 9.18669"]) [data-slot="titlebar-update-label"] {
  color: var(--v2-text-text-muted, rgba(128, 128, 128, 0.9));
}
`,document.head.appendChild(r)}const we=k.Plugin.define({i18n:{en:{"composer-controls.settings.title":"Composer","composer-controls.settings.sendKey":"Send key","composer-controls.settings.sendKey.ctrlEnter":"⌘/Ctrl+Enter sends the message, Enter starts a new line","composer-controls.settings.sendKey.enter":"Enter sends the message (app default)","composer-controls.settings.height":"Input field height","composer-controls.settings.remember":"Remember the height and restore it after restart","composer-controls.settings.hint":"Drag the top edge of the input field to resize it; a single click on the edge restores the default height.","composer-controls.handle.tooltip":"Drag to resize · click to restore the default height","composer-controls.reload.label":"Reload UI","composer-controls.reload.title":"Reload the window so updated plugin code takes effect"},ja:{"composer-controls.settings.title":"入力欄","composer-controls.settings.sendKey":"送信キー","composer-controls.settings.sendKey.ctrlEnter":"⌘/Ctrl+Enter で送信、Enter は改行","composer-controls.settings.sendKey.enter":"Enter で送信（アプリの既定）","composer-controls.settings.height":"入力欄の高さ","composer-controls.settings.remember":"高さを記憶して再起動後も復元する","composer-controls.settings.hint":"入力欄の上端をドラッグするとサイズ変更できます。上端をクリックすると既定の高さに戻ります。","composer-controls.handle.tooltip":"ドラッグでサイズ変更・クリックで既定の高さに戻す","composer-controls.reload.label":"再読み込み","composer-controls.reload.title":"プラグインの更新を反映するためウィンドウを読み込み直します"}},setup(r){const n=e=>r.t(e),f=r.client.rpc(ge);xe();const S=()=>window.location.reload();r.add(k.TitlebarItem,{id:"composer-controls-reload",get label(){return n("composer-controls.reload.label")},get title(){return n("composer-controls.reload.title")},icon:"outline-rotate-clockwise",run:S}),r.add(k.Command,{id:"composer-controls.reload",get title(){return n("composer-controls.reload.title")},run:S});const[a,y]=E.createSignal(be()??{...C}),[h,b]=E.createSignal((()=>{try{return localStorage.getItem(B)==="true"}catch{return!1}})());let $=!1;const M=e=>{try{localStorage.setItem(B,e?"true":"false")}catch{}},z=()=>{const e=a();G("setPrefs",()=>f.setPrefs({...e}),3,600).then(t=>{if(!t||a()!==e)return;const o=L(t);y(o),R(o)})},v=e=>{$=!0;const t=L({...a(),...e});y(t),R(t),x(),z()};G("prefs",()=>f.prefs({})).then(e=>{if(!e)return;if($){z();return}const t=L(e);y(t),R(t),x()});function Q(e){if(!(e instanceof HTMLElement))return null;const t=e.closest('[data-component="composer-editor"]');return t instanceof HTMLElement?t:null}function X(e){const t=e.closest('form[data-component="composer"]');return t instanceof HTMLFormElement?t:null}function W(e){return!!X(e)?.parentElement?.querySelector('[data-component="composer-suggestions"]')}function Z(e){return e.style.height!==""}function ee(e,t){const o=document.createRange();o.selectNodeContents(e);try{o.setStart(t.endContainer,t.endOffset)}catch{return!1}const l=o.cloneContents();return(l.textContent??"").trim()!==""?!1:l.querySelector("br, img, [data-mention], [data-file], [data-skill]")===null}function te(e){const t=window.getSelection();let o=null;if(t&&t.rangeCount>0){const c=t.getRangeAt(0);e.contains(c.startContainer)&&(o=c)}o||(o=document.createRange(),o.selectNodeContents(e),o.collapse(!1),t?.removeAllRanges(),t?.addRange(o)),o.collapse(!0);const l=ee(e,o),p=document.createElement("br");if(o.insertNode(p),l){const c=document.createRange();c.setStartAfter(p),c.collapse(!0),c.insertNode(document.createElement("br"))}const d=document.createRange();d.setStartAfter(p),d.collapse(!0),t?.removeAllRanges(),t?.addRange(d),e.dispatchEvent(new InputEvent("input",{bubbles:!0,composed:!0,inputType:"insertLineBreak"}))}function oe(e){const t=e.getElementsByTagName("br").length;let o=!1;try{o=document.execCommand("insertLineBreak")}catch{o=!1}o&&e.getElementsByTagName("br").length>t||te(e)}const N=e=>{if(e.key!=="Enter"||e.isComposing||e.keyCode===229||e.altKey||e.shiftKey||e.ctrlKey||e.metaKey)return;const t=Q(e.target);t&&(W(t)||a().sendKey==="ctrl+enter"&&(e.preventDefault(),e.stopPropagation(),!e.repeat&&oe(t)))};window.addEventListener("keydown",N,{capture:!0}),E.onCleanup(()=>window.removeEventListener("keydown",N,{capture:!0}));const[re,q]=E.createSignal(void 0),ne=()=>re()??a().heightPx,j=(e,t)=>{const o=`${t}px`;e.style.getPropertyValue("--oc-cr-h")!==o&&e.style.setProperty("--oc-cr-h",o),e.style.removeProperty("--oc-cr-max"),e.style.removeProperty("--oc-cr-min")},F=e=>{e.removeAttribute("data-oc-composer-controls"),e.style.removeProperty("--oc-cr-h"),e.style.removeProperty("--oc-cr-max"),e.style.removeProperty("--oc-cr-min")};function se(e){const t=document.createElement("div");return t.setAttribute("data-oc-composer-resize",""),t.title=n("composer-controls.handle.tooltip"),t.addEventListener("pointerdown",o=>{if(o.button!==0)return;o.preventDefault(),o.stopPropagation();const l=Math.round(e.getBoundingClientRect().height),p=o.clientY;let d=!1,c=l;t.setPointerCapture(o.pointerId),t.setAttribute("data-oc-dragging","");const P=u=>{const m=p-u.clientY;Math.abs(m)>=2&&(d=!0),c=V(l+m),j(e,c)},w=u=>{t.removeAttribute("data-oc-dragging"),t.removeEventListener("pointermove",P),t.removeEventListener("pointerup",g),t.removeEventListener("pointercancel",H);try{t.releasePointerCapture(o.pointerId)}catch{}if(u){if(d)h()&&(b(!1),M(!1)),a().rememberHeight?(q(void 0),v({heightPx:c})):q(c);else{const m=!h();b(m),M(m)}x()}},g=()=>w(!0),H=()=>w(!1);t.addEventListener("pointermove",P),t.addEventListener("pointerup",g),t.addEventListener("pointercancel",H)}),t}function x(){const e=document.querySelectorAll('form[data-component="composer"]');for(const t of e)if(!t.querySelector("[data-oc-composer-resize][data-oc-dragging]")){if(Z(t)){t.querySelector("[data-oc-composer-resize]")?.remove(),F(t);continue}if(t.querySelector("[data-oc-composer-resize]")||t.appendChild(se(t)),h()){F(t);continue}t.setAttribute("data-oc-composer-controls",""),j(t,ne())}}let _=!1;const ie=()=>{_||(_=!0,requestAnimationFrame(()=>{_=!1,x()}))},O=new MutationObserver(ie);O.observe(document.body,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["style"]}),E.onCleanup(()=>O.disconnect()),x(),r.add(k.SettingsPage,{id:"composer-controls",get title(){return n("composer-controls.settings.title")},icon:"keyboard",render:()=>s.createComponent(ae,{})});function ae(){const e={display:"flex","align-items":"center",gap:"8px"},t={display:"flex","flex-direction":"column",gap:"8px"};return(()=>{var o=fe(),l=o.firstChild,p=l.firstChild,d=p.nextSibling,c=d.firstChild,P=c.nextSibling,w=d.nextSibling,g=w.firstChild,H=g.nextSibling,u=l.nextSibling,m=u.firstChild,D=m.nextSibling,T=D.firstChild;T.nextSibling;var A=u.nextSibling,I=A.firstChild,ce=I.nextSibling,le=A.nextSibling;return s.insert(p,()=>n("composer-controls.settings.sendKey")),c.addEventListener("change",()=>v({sendKey:"ctrl+enter"})),s.insert(P,()=>n("composer-controls.settings.sendKey.ctrlEnter")),g.addEventListener("change",()=>v({sendKey:"enter"})),s.insert(H,()=>n("composer-controls.settings.sendKey.enter")),s.insert(m,()=>n("composer-controls.settings.height")),T.addEventListener("change",i=>{const K=Number(i.currentTarget.value);Number.isFinite(K)&&(h()&&(b(!1),M(!1)),v({heightPx:K}))}),I.addEventListener("change",i=>v({rememberHeight:i.currentTarget.checked})),s.insert(ce,()=>n("composer-controls.settings.remember")),s.insert(le,()=>n("composer-controls.settings.hint")),s.effect(i=>{var K=t,de=e,pe=e,me=t,ue=e,he=e;return i.e=s.style(l,K,i.e),i.t=s.style(d,de,i.t),i.a=s.style(w,pe,i.a),i.o=s.style(u,me,i.o),i.i=s.style(D,ue,i.i),i.n=s.style(A,he,i.n),i},{e:void 0,t:void 0,a:void 0,o:void 0,i:void 0,n:void 0}),s.effect(()=>c.checked=a().sendKey==="ctrl+enter"),s.effect(()=>g.checked=a().sendKey==="enter"),s.effect(()=>T.value=a().heightPx),s.effect(()=>I.checked=a().rememberHeight),o})()}}});exports.default=we;
