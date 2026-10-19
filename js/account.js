'use strict';
// ================= Account + cloud save (same login as Death Arena and Spicewood: one Holiday Games account for every game) =================
// The single save lives in localStorage and, when you are logged in, also in a Supabase table (supabase_lastsignal.sql, run once).
// Login: user name + password (internally <name>@players.holiday-games.com). No password reset.
// Sync: the client remembers the hash of the last agreed state (meta.base).
//   only local changed -> upload, only cloud changed -> download, both changed (or first connect) -> the player chooses.
// While playing, every saveGame() uploads after a few quiet seconds. Without network or table the game simply runs offline.
const Account={
  URL:'https://kqtjtagbhaaddfqibaxh.supabase.co',
  KEY:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxdGp0YWdiaGFhZGRmcWliYXhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1NTAzMDQsImV4cCI6MjEwNzEyNjMwNH0.dqw0HzW7UNdr_xW7BzauWXzAMJaP7M8TcUQwe5IjC78',
  DOMAIN:'players.holiday-games.com',
  TABLE:'lastsignal_saves',
  META_KEY:'lastsignal.account',
  DELAY:6000,
  meta:null,changed:false,syncing:0,status:'',statusColor:null,busy:false,pushing:false,timer:null,started:false,conflict:null,el:null,refresh:null,

  get configured(){return!!(this.URL&&this.KEY)},
  get on(){return!!(this.meta&&this.meta.ref)},
  load(){try{const raw=localStorage.getItem(this.META_KEY);if(raw)this.meta=JSON.parse(raw)}catch(e){this.meta=null}if(this.meta&&typeof this.meta.base!=='string')this.meta.base=''},
  saveMeta(){try{if(this.meta)localStorage.setItem(this.META_KEY,JSON.stringify(this.meta));else localStorage.removeItem(this.META_KEY)}catch(e){}},
  say(text,color){this.status=text;this.statusColor=color||null;if(this.refresh)this.refresh()},

  // ---- network ----
  async http(method,path,body,token,extra){
    try{
      const h=Object.assign({apikey:this.KEY,'Content-Type':'application/json',Authorization:'Bearer '+(token||this.KEY)},extra||{});
      const res=await fetch(this.URL+path,{method,headers:h,body:body===undefined?undefined:JSON.stringify(body)});
      let json=null;try{json=await res.json()}catch(e){}
      return{ok:res.ok,status:res.status,json};
    }catch(e){return{ok:false,status:0,offline:true,json:null}}
  },
  errText(r){
    if(r.offline)return'NO CONNECTION';
    const m=String((r.json&&(r.json.msg||r.json.error_description||r.json.message||r.json.error))||'');
    if(r.status===404||/relation.*does not exist|could not find the table/i.test(m))return'CLOUD TABLE MISSING (RUN supabase_lastsignal.sql)';
    if(/already registered|already exists/i.test(m))return'THIS NAME IS ALREADY TAKEN';
    if(/invalid login/i.test(m))return'WRONG NAME OR PASSWORD';
    if(/password/i.test(m)&&/(least|short|weak)/i.test(m))return'PASSWORD TOO SHORT (6+ CHARACTERS)';
    if(/rate limit|too many/i.test(m))return'TOO MANY TRIES - WAIT A MINUTE';
    return m?m.slice(0,80).toUpperCase():'ERROR '+r.status;
  },
  emailOf(name){return name.toLowerCase()+'@'+this.DOMAIN},
  validName(name){return/^[a-z0-9_]{3,20}$/i.test(name)},
  setSession(j,name){
    const prev=this.meta;
    this.meta={name:name||(prev&&prev.name)||'',uid:j.user.id,tok:j.access_token,ref:j.refresh_token,exp:Date.now()+(j.expires_in||3600)*1000,base:prev&&prev.name===name?prev.base||'':''};
    this.saveMeta();
  },
  async auth(kind,name,pw){
    if(!this.configured)return{ok:false,error:'CLOUD SAVES ARE NOT SET UP YET'};
    if(!this.validName(name))return{ok:false,error:'NAME: 3-20 LETTERS, NUMBERS OR _'};
    if(String(pw).length<6)return{ok:false,error:'PASSWORD TOO SHORT (6+ CHARACTERS)'};
    const body={email:this.emailOf(name),password:pw};
    const r=kind==='signup'?await this.http('POST','/auth/v1/signup',body):await this.http('POST','/auth/v1/token?grant_type=password',body);
    if(!r.ok)return{ok:false,error:this.errText(r)};
    if(!r.json||!r.json.access_token)return{ok:false,error:'ACCOUNT MADE, BUT E-MAIL CONFIRMATION IS STILL ON IN SUPABASE'};
    this.setSession(r.json,name.toLowerCase());
    return{ok:true};
  },
  logout(){this.meta=null;this.conflict=null;this.saveMeta();clearTimeout(this.timer)},
  async token(){
    const m=this.meta;if(!m)return null;
    if(m.exp-Date.now()>60000)return m.tok;
    const r=await this.http('POST','/auth/v1/token?grant_type=refresh_token',{refresh_token:m.ref});
    if(r.ok&&r.json&&r.json.access_token){m.tok=r.json.access_token;m.ref=r.json.refresh_token;m.exp=Date.now()+(r.json.expires_in||3600)*1000;this.saveMeta();return m.tok}
    if(r.status===400||r.status===401){this.meta.ref=null;this.saveMeta();this.say('SESSION EXPIRED - PLEASE LOG IN AGAIN','red')}
    return null;
  },
  async rest(method,path,body,extra){
    const t=await this.token();if(!t)return{ok:false,status:0,offline:!this.meta||!!this.meta.ref,json:null};
    return this.http(method,path,body,t,extra);
  },

  // ---- the save code is the raw JSON string from localStorage ----
  localCode(){return storedRaw()},
  hash(code){if(!code)return'';let h=2166136261;for(let i=0;i<code.length;i++){h^=code.charCodeAt(i);h=Math.imul(h,16777619)>>>0}return h.toString(16)+'.'+code.length},
  peek(code){try{return saveSummary(finishSave(cleanSave(JSON.parse(code),false)))}catch(e){return'?'}},
  importCode(code){   // checks the save like an import, keeps the old one as a backup, then stores it
    let clean;try{if(String(code).length>SAVE_MAX_BYTES)throw 0;clean=finishSave(cleanSave(JSON.parse(code),false))}catch(e){return{ok:false,error:'THE CLOUD SAVE COULD NOT BE READ'}}
    backupOf(storedRaw());
    const stored=JSON.stringify(clean);
    try{localStorage.setItem(SAVE_KEY,stored)}catch(e){return{ok:false,error:'COULD NOT WRITE THE SAVE'}}
    return{ok:true,code:stored};
  },
  async upload(code){
    const r=await this.rest('POST','/rest/v1/'+this.TABLE+'?on_conflict=user_id',[{user_id:this.meta.uid,code}],{Prefer:'resolution=merge-duplicates,return=minimal'});
    if(r.ok){this.meta.base=this.hash(code);this.saveMeta()}
    return r;
  },
  async download(cloudCode){
    const res=this.importCode(cloudCode);
    if(!res.ok)return{ok:false,status:0,json:{msg:res.error}};
    this.meta.base=this.hash(res.code);this.saveMeta();
    return{ok:true};
  },

  // ---- sync (call from the title screen only: a download replaces the local save) ----
  async syncAll(){
    if(!this.on||this.busy)return;
    this.busy=true;this.syncing++;this.changed=false;this.say('SYNCING...','grey');
    let ok=false;
    try{
      const r=await this.rest('GET','/rest/v1/'+this.TABLE+'?select=code');
      if(!r.ok){if(this.on)this.say(this.errText(r),'red');return}
      const cc=(r.json&&r.json[0]&&r.json[0].code)||null,lc=this.localCode(),lh=this.hash(lc),ch=this.hash(cc),base=this.meta.base;
      this.conflict=null;let res=null,msg='EVERYTHING IS UP TO DATE';
      if(!lc&&!cc){}
      else if(lh===ch){this.meta.base=lh;this.saveMeta()}
      else if(!lc){res=await this.download(cc);msg='SYNCED: DOWNLOADED'}
      else if(!cc||base===ch){res=await this.upload(lc);msg='SYNCED: UPLOADED'}
      else if(base===lh){res=await this.download(cc);msg='SYNCED: DOWNLOADED'}
      else this.conflict={local:lc,cloud:cc};
      if(res&&!res.ok){this.say(this.errText(res),'red');return}
      ok=true;
      this.say(this.conflict?'CHOOSE WHICH SAVE TO KEEP':msg,this.conflict?'orange':'teal');
    }finally{this.busy=false;this.syncing--;if(!ok)this.changed=true;if(this.refresh)this.refresh()}
  },
  async resolve(choice){
    const c=this.conflict;if(!c||this.busy)return;
    this.busy=true;
    try{
      const res=choice==='cloud'?await this.download(c.cloud):await this.upload(this.localCode()||c.local);
      if(res.ok){this.conflict=null;this.say('SYNCED','teal')}
      else this.say(this.errText(res),'red');
    }finally{this.busy=false;if(this.refresh)this.refresh()}
  },
  async deleteCloud(){const r=await this.rest('DELETE','/rest/v1/'+this.TABLE+'?user_id=eq.'+this.meta.uid);if(r.ok&&this.meta){this.meta.base='';this.saveMeta()}return r},

  // ---- continuous upload: every saveGame() reports here; after DELAY of quiet the save goes up ----
  dirty(){
    if(this.pushing||!this.on)return;
    this.changed=true;clearTimeout(this.timer);
    this.timer=setTimeout(()=>this.pushActive(),this.DELAY);
  },
  async pushActive(){
    if(!this.on||this.busy||this.conflict)return;
    const code=this.localCode();
    if(!code||this.hash(code)===this.meta.base)return;
    const r=await this.upload(code);
    if(r.ok)this.say('SAVED TO CLOUD','teal');
    else if(!r.offline)this.say(this.errText(r),'red');
  },
  flush(){if(this.timer){clearTimeout(this.timer);this.timer=null;this.pushActive()}},

  // ---- dialog (real HTML inputs: works in the iframe and on tablets) ----
  open(){
    if(this.el)return;
    try{if(document.fullscreenElement)document.exitFullscreen()}catch(e){}
    const C={bg:'#0c1020',panel:'#161c34',line:'#40c8e0',text:'#d8e4ff',dim:'#8890b0',gold:'#ffd040',teal:'#7fd6b0',red:'#ff7a6a',orange:'#ff9a50',grey:'#8a8a9a',blue:'#8fd0ff'};
    const mk=(tag,css,text)=>{const e=document.createElement(tag);e.style.cssText=css||'';if(text)e.textContent=text;return e};
    const root=mk('div','position:fixed;inset:0;background:rgba(4,6,16,.9);z-index:10;display:flex;align-items:center;justify-content:center;font-family:"Segoe UI",Tahoma,Verdana,Arial,sans-serif;');
    root.setAttribute('data-nogame','1');
    const box=mk('div','width:min(520px,92vw);max-height:92vh;overflow:auto;box-sizing:border-box;padding:16px;background:'+C.bg+';border:2px solid '+C.line+';color:'+C.text+';');
    const btn=(label,color,fn)=>{const b=mk('button','flex:1 1 130px;padding:10px 8px;margin:3px;cursor:pointer;background:'+C.panel+';color:'+color+';border:2px solid '+color+';font:inherit;font-size:14px;font-weight:bold;',label);b.onclick=fn;return b};
    const input=(type,ph)=>{const e=mk('input','width:100%;box-sizing:border-box;margin:4px 0;padding:8px;background:#05070f;color:'+C.text+';border:2px solid '+C.line+';font:16px monospace;');e.type=type;e.placeholder=ph;e.autocomplete=type==='password'?'current-password':'username';e.spellcheck=false;return e};
    const colorOf=c=>(c&&C[c])||C.grey;
    let nameIn=null,pwIn=null;
    const render=()=>{
      const keepName=nameIn?nameIn.value:'',keepPw=pwIn?pwIn.value:'';
      box.textContent='';
      box.appendChild(mk('div','color:'+C.gold+';font-size:22px;margin-bottom:6px;font-weight:bold;','ACCOUNT'));
      const msg=mk('div','min-height:20px;margin:8px 2px;font-size:13px;color:'+colorOf(this.statusColor)+';',this.status);
      const row=mk('div','display:flex;flex-wrap:wrap;');
      if(!this.configured){
        box.appendChild(mk('div','color:'+C.dim+';font-size:14px;line-height:1.4;','Cloud saves are not set up. Your save lives in this browser; SAVE DATA > EXPORT moves it between devices.'));
      }else if(!this.on){
        box.appendChild(mk('div','color:'+C.dim+';font-size:13px;line-height:1.4;margin-bottom:6px;','Log in to keep your save in the cloud and play with the same progress on every device. It is the same Holiday Games login as Death Arena and Spicewood. Choose any name and a password. There is NO password reset, so remember it.'));
        nameIn=input('text','NAME');pwIn=input('password','PASSWORD (6+ CHARACTERS)');
        nameIn.value=keepName||(this.meta&&this.meta.name)||'';pwIn.value=keepPw;
        box.appendChild(nameIn);box.appendChild(pwIn);box.appendChild(msg);
        const go=async kind=>{
          this.say(kind==='signup'?'CREATING ACCOUNT...':'LOGGING IN...','grey');
          const r=await this.auth(kind,nameIn.value.trim(),pwIn.value);
          if(!r.ok){this.say(r.error,'red');return}
          pwIn=null;nameIn=null;this.say('LOGGED IN','teal');await this.syncAll();
        };
        row.appendChild(btn('LOG IN',C.blue,()=>go('login')));row.appendChild(btn('CREATE ACCOUNT',C.orange,()=>go('signup')));
        pwIn.addEventListener('keydown',e=>{if(e.key==='Enter')go('login')});
      }else{
        nameIn=null;pwIn=null;
        box.appendChild(mk('div','color:'+C.teal+';font-size:16px;margin-bottom:4px;font-weight:bold;','LOGGED IN AS '+this.meta.name.toUpperCase()));
        box.appendChild(mk('div','color:'+C.dim+';font-size:13px;line-height:1.4;','Your save is uploaded a few seconds after every save and compared when you open the title screen. If you play on two devices, the last one to save wins, so let a device finish saving before you switch.'));
        box.appendChild(msg);
        if(this.conflict){
          const c=this.conflict,card=mk('div','border:2px solid '+C.orange+';padding:8px;margin:6px 0;');
          card.appendChild(mk('div','color:'+C.orange+';font-size:15px;font-weight:bold;','THIS DEVICE AND THE CLOUD DIFFER'));
          card.appendChild(mk('div','font-size:13px;margin:4px 0;','THIS DEVICE:  '+this.peek(c.local)));
          card.appendChild(mk('div','font-size:13px;margin:4px 0;','CLOUD:  '+this.peek(c.cloud)));
          const r2=mk('div','display:flex;flex-wrap:wrap;');
          r2.appendChild(btn('KEEP THIS DEVICE',C.blue,()=>this.resolve('local')));r2.appendChild(btn('KEEP CLOUD',C.gold,()=>this.resolve('cloud')));
          card.appendChild(r2);box.appendChild(card);
        }
        row.appendChild(btn('SYNC NOW',C.blue,()=>this.syncAll()));row.appendChild(btn('LOG OUT',C.red,()=>{this.logout();this.say('LOGGED OUT (YOUR SAVE STAYS ON THIS DEVICE)','grey')}));
      }
      row.appendChild(btn('CLOSE',C.grey,()=>this.close()));
      box.appendChild(row);
      if(nameIn)nameIn.focus();
    };
    this.refresh=render;
    root.appendChild(box);render();
    root.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape')this.close()});
    root.addEventListener('keyup',e=>e.stopPropagation());
    root.addEventListener('mousedown',e=>e.stopPropagation());
    root.addEventListener('wheel',e=>e.stopPropagation());
    root.addEventListener('contextmenu',e=>e.stopPropagation(),true);
    document.body.appendChild(root);
    this.el=root;
  },
  close(){
    if(!this.el)return;
    this.el.remove();this.el=null;this.refresh=null;
    window.focus();
  }
};
Account.load();
// Title screen tick: when logged in and something changed (or on first start), compare the save. A conflict opens the dialog.
Account.menuTick=function(){
  if(!this.on||!this.configured||this.busy||(this.started&&!this.changed))return;
  this.started=true;
  this.syncAll().then(()=>{if(this.conflict)this.open()});
};
document.addEventListener('visibilitychange',()=>{if(document.hidden)Account.flush()});
