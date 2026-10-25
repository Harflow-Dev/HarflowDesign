(function(){
const valid = new Set(['light','dark','system']);
HF.createAppearanceController = ({storage,matchMedia,document,location,history}={}) => {
  let preference='system', preview=null;
  let media;
  try { if(storage===undefined)storage=globalThis.localStorage; } catch {}
  try { if(matchMedia===undefined)matchMedia=globalThis.matchMedia?.bind(globalThis); } catch {}
  if(document===undefined)document=globalThis.document;
  if(location===undefined)location=globalThis.location;
  if(history===undefined)history=globalThis.history;
  try { media=matchMedia?.('(prefers-color-scheme: dark)'); } catch {}
  try { const saved=storage?.getItem('harflow.appearance'); if(valid.has(saved)) preference=saved; } catch {}
  const effective=()=>preview||(preference==='system'&&media?.matches?'dark':preference==='system'?'light':preference);
  const routeMode=()=>preview||'system';
  const publish=()=>{
    const theme=effective();
    if(document?.documentElement) document.documentElement.dataset.theme=theme;
    if(HF.route){HF.route.theme=theme;HF.route.themeMode=routeMode();}
    document?.querySelectorAll?.('[data-appearance-preference]').forEach(button=>{
      const selected=button.dataset.appearancePreference===preference;
      button.setAttribute('aria-pressed',String(selected));
      button.classList.toggle('selected',selected);
    });
    const picker=document?.querySelector?.('#theme-picker');
    if(picker) picker.value=preview||'preference';
    return theme;
  };
  const replaceRoute=()=>{
    if(!location||!history?.replaceState)return;
    const [screen='foundations',state='default']=location.hash.slice(1).split('/');
    const hash=`#${screen}/${state}/${routeMode()}`;
    try{history.replaceState(history.state,'',hash)}catch{}
  };
  const setPreference=value=>{
    if(!valid.has(value))return effective();
    preference=value;preview=null;
    try{storage?.setItem('harflow.appearance',value)}catch{}
    const theme=publish();replaceRoute();return theme;
  };
  const setPreview=value=>{preview=value==='light'||value==='dark'?value:null;const theme=publish();replaceRoute();return theme};
  const syncRouteTheme=value=>{preview=value==='light'||value==='dark'?value:null;return publish()};
  const onSystemChange=()=>{if(preference==='system'&&!preview)publish()};
  try{if(media?.addEventListener)media.addEventListener('change',onSystemChange);else media?.addListener?.(onSystemChange)}catch{}
  const controller={get preference(){return preference},get preview(){return preview},get theme(){return effective()},get themeMode(){return routeMode()},setPreference,setPreview,syncRouteTheme,publish};
  HF.appearance=controller;
  return controller;
};

HF.createAppearanceController();

HF.appearanceControl=(options={})=>`<div class="appearance-control" role="group" aria-label="Appearance">${[
  ['light','sun.max','Light'],['dark','moon','Dark'],['system','desktopcomputer','System']
].map(([value,symbol,label])=>{const selected=HF.appearance.preference===value;return `<button type="button" class="appearance-button${selected?' selected':''}" data-appearance-preference="${value}" aria-label="${label}" title="${value==='system'?`System — follows this ${options.web?'device':'Mac'}`:label}" aria-pressed="${selected}"><img src="assets/symbols/appearance/${symbol}.png" alt=""></button>`}).join('')}</div>`;
HF.connectionIndicator=(screen,state)=>{
  const setupUnavailable=screen==='tasks'&&['setup-required','setup-installing','setup-failed','setup-update-required','setup-updating','setup-update-failed'].includes(state);
  const disconnected=screen==='tasks'&&(['loading','list-error','install-retry'].includes(state)||setupUnavailable);
  const connected=!disconnected;
  const label=connected?'Connected':'Disconnected';
  const hint=!disconnected?label:state==='setup-installing'?'Required components are being installed.':state==='setup-updating'?'Required components are being updated.':state==='setup-failed'?'Required components could not be installed.':state==='setup-update-failed'?'The required update could not be installed.':state==='setup-update-required'?'Harflow needs updated components.':state==='setup-required'?'Harflow setup is required.':state==='list-error'?'Could not load tasks.':state==='loading'?'Task list has not loaded yet':'Managed runtime could not be prepared';
  return `<span class="connection-indicator ${connected?'connected':'disconnected'}" role="img" aria-label="${label}" title="${hint}"></span>`;
};
})();
