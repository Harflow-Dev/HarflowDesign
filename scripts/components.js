(function(){
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
HF.escape=esc;HF.button=(label,action='',cls='')=>`<button type="button" class="${cls}" ${action?`data-action="${action}"`:''}>${label}</button>`;
HF.chip=(label,cls='')=>`<span class="chip ${cls}">${esc(label)}</span>`;
HF.empty=(title,body,action='')=>`<div class="empty"><h3>${title}</h3><p>${body}</p>${action}</div>`;
HF.skeleton=()=>`<div aria-label="Loading" role="status"><div class="skeleton short"></div><div class="skeleton"></div><div class="skeleton block"></div><div class="skeleton"></div></div>`;
HF.banner=(text,error=false)=>`<div class="banner ${error?'error':''}" role="status">${text}</div>`;
HF.titlebar=(title,options={})=>`<div class="titlebar${options.connectionStatus?' main-window-titlebar':''}"><span class="window-dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="window-title-cluster">${options.connectionStatus?'<span class="window-emblem" aria-hidden="true"><img src="assets/branding/menubarTemplate.png" srcset="assets/branding/menubarTemplate@2x.png 2x" alt="" width="20" height="20"></span>':''}<span class="window-title">${title}</span>${options.connectionStatus?HF.connectionIndicator(options.connectionScreen,options.connectionState):''}</span>${options.actions||''}</div>`;
HF.app=(body,cls='',title='Harflow',extra={})=>`<section class="app ${cls}" aria-label="${title} specimen">${HF.titlebar(title,{connectionStatus:body.includes('class="sidebar"')||body.includes('class="sidebar '),connectionScreen:HF.route?.screen,connectionState:HF.route?.state,...extra})}${body}</section>`;
HF.sheet=(body,cls='')=>HF.app(`<div class="sheet-stage"><section class="sheet ${cls}">${body}</section></div>`,'','Harflow');
HF.field=(label,value='',type='text')=>`<label class="form-field">${label}<input type="${type}" value="${esc(value)}"></label>`;
HF.select=(label,values)=>`<label class="form-field">${label}<select>${values.map(v=>`<option>${v}</option>`).join('')}</select></label>`;
HF.feedback=text=>{const a=document.querySelector('#announcement');a.textContent=text;a.classList.add('visible');clearTimeout(HF.toastTimer);HF.toastTimer=setTimeout(()=>a.classList.remove('visible'),3500)};
HF.fixtures=[{id:'fixture-claude-01',title:'Review session persistence',backend:'claude',status:'running',time:'2 min ago'},{id:'fixture-codex-02',title:'Refine workflow validation',backend:'codex',status:'completed',time:'18 min ago'},{id:'fixture-vibe-03',title:'Implement inspector state',backend:'vibe',status:'failed',time:'42 min ago'},{id:'fixture-claude-04',title:'Audit artifact references',backend:'claude',status:'completed',time:'Yesterday'}];
HF.avatar=backend=>`<span class="avatar ${backend}">${{claude:'C',codex:'X',vibe:'V',opencode:'O',antigravity:'A',cursor:'R'}[backend]||'H'}</span>`;
})();

try{if(typeof location!=='undefined'&&location.protocol==='file:')document.documentElement.classList.add('file-protocol')}catch(e){}
