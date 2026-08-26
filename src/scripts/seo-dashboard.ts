import { createClient } from "@supabase/supabase-js";

type Check = { label:string; ok:boolean; weight:number; tip:string };
type PageAudit = { route:string; file:string; lang:string; score:number; status:string; title:string; h1Count:number; h2Count:number; internalLinks:number; altRatio:number; checks:Check[] };

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
const authView = document.getElementById('authView');
const dashboard = document.getElementById('dashboard');
const dataEl = document.getElementById('seo-audit-data');
const pages:PageAudit[] = dataEl?.textContent ? JSON.parse(dataEl.textContent) : [];
function escapeHtml(value:any){return String(value??'').replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c] as string));}

async function checkAuth(){
  try{
    if(!supabaseUrl || !supabaseKey){ location.href='/admin/'; return; }
    const supabase=createClient(supabaseUrl,supabaseKey);
    const {data:{session}}=await supabase.auth.getSession();
    if(!session){ location.href='/admin/'; return; }
    const {data,error}=await supabase.from('admin_users').select('user_id').eq('user_id',session.user.id).maybeSingle();
    if(error||!data){ location.href='/admin/'; return; }
    authView?.classList.add('hidden'); dashboard?.classList.remove('hidden');
  }catch{ location.href='/admin/'; }
}

document.querySelectorAll<HTMLButtonElement>('[data-tab-target]').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('[data-tab-target]').forEach(x=>x.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll<HTMLElement>('.tab-panel').forEach(p=>p.classList.add('hidden'));
  document.getElementById(btn.dataset.tabTarget||'')?.classList.remove('hidden');
}));

const search=document.getElementById('search') as HTMLInputElement|null;
const langFilter=document.getElementById('langFilter') as HTMLSelectElement|null;
const scoreFilter=document.getElementById('scoreFilter') as HTMLSelectElement|null;
const rows=[...document.querySelectorAll<HTMLElement>('.seo-row')];
function filterRows(){
  const q=(search?.value||'').toLowerCase().trim(); const lang=langFilter?.value||''; const status=scoreFilter?.value||'';
  rows.forEach(r=>{const text=`${r.dataset.route||''} ${r.dataset.file||''}`;const ok=(!q||text.includes(q))&&(!lang||r.dataset.lang===lang)&&(!status||r.dataset.status===status);r.style.display=ok?'':'none';});
}
search?.addEventListener('input',filterRows); langFilter?.addEventListener('change',filterRows); scoreFilter?.addEventListener('change',filterRows);

const legacySearch=document.getElementById('legacySearch') as HTMLInputElement|null;
const legacyStatus=document.getElementById('legacyStatus') as HTMLSelectElement|null;
const legacyValue=document.getElementById('legacyValue') as HTMLSelectElement|null;
const legacyRows=[...document.querySelectorAll<HTMLElement>('.legacy-row')];
function filterLegacy(){
  const q=(legacySearch?.value||'').toLowerCase().trim();
  const status=legacyStatus?.value||'';
  const value=legacyValue?.value||'';
  legacyRows.forEach(r=>{
    const score=Number(r.dataset.legacyScore||0);
    const scoreOk=!value||(value==='high'&&score>=80)||(value==='mid'&&score>=50&&score<80)||(value==='low'&&score<50);
    const ok=(!q||(r.dataset.legacySearch||'').includes(q))&&(!status||r.dataset.legacyStatus===status)&&scoreOk;
    r.style.display=ok?'':'none';
  });
}
legacySearch?.addEventListener('input',filterLegacy); legacyStatus?.addEventListener('change',filterLegacy); legacyValue?.addEventListener('change',filterLegacy);

const dlg=document.getElementById('detailDialog') as HTMLDialogElement|null;
document.getElementById('closeDialog')?.addEventListener('click',()=>dlg?.close());
document.querySelectorAll<HTMLButtonElement>('[data-open]').forEach(btn=>btn.addEventListener('click',()=>{
  const p=pages[Number(btn.dataset.open)]; if(!p) return;
  const routeEl=document.getElementById('modalRoute'); const fileEl=document.getElementById('modalFile'); const scoreEl=document.getElementById('modalScore'); const checksEl=document.getElementById('modalChecks');
  if(routeEl) routeEl.textContent=`${p.route} — ${p.score}/100`;
  if(fileEl) fileEl.textContent=p.file;
  if(scoreEl) scoreEl.innerHTML=`<p><b>SEO Title:</b> ${escapeHtml(p.title)}</p><p><b>H1:</b> ${p.h1Count} &nbsp; <b>H2:</b> ${p.h2Count} &nbsp; <b>İç link:</b> ${p.internalLinks} &nbsp; <b>Görsel ALT:</b> %${p.altRatio}</p>`;
  if(checksEl) checksEl.innerHTML=p.checks.map(c=>`<div class="check"><div class="check-top"><span>${escapeHtml(c.label)}</span><span class="${c.ok?'ok':'bad'}">${c.ok?'✓ '+c.weight+' puan':'✕ 0/'+c.weight}</span></div><div class="tip">${escapeHtml(c.ok?'Tamam':c.tip)}</div></div>`).join('');
  dlg?.showModal();
}));
checkAuth();
