import { createClient } from "@supabase/supabase-js";

const cleanEnv = (value: string | undefined) =>
  String(value ?? "")
    .trim()
    .replace(/^(["'])|(["'])$/g, "");

const supabaseUrl = cleanEnv(import.meta.env.PUBLIC_SUPABASE_URL);
const supabasePublishableKey = cleanEnv(
  import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    "Supabase bağlantısı eksik. Vercel Environment Variables içinde PUBLIC_SUPABASE_URL ve PUBLIC_SUPABASE_PUBLISHABLE_KEY değerlerini kontrol edin."
  );
}

let parsedSupabaseUrl: URL;
try {
  parsedSupabaseUrl = new URL(supabaseUrl);
} catch {
  throw new Error(
    `Geçersiz PUBLIC_SUPABASE_URL: ${JSON.stringify(supabaseUrl)}. Değer https://...supabase.co biçiminde olmalı.`
  );
}

if (!['http:', 'https:'].includes(parsedSupabaseUrl.protocol)) {
  throw new Error(
    `Geçersiz PUBLIC_SUPABASE_URL protokolü: ${parsedSupabaseUrl.protocol}. URL http:// veya https:// ile başlamalı.`
  );
}

// Geçici teşhis: yalnızca URL'yi gösterir, Supabase anahtarını asla loglamaz.
console.log("SUPABASE URL CHECK:", supabaseUrl);

const supabase = createClient(supabaseUrl, supabasePublishableKey);

type Product = {
  id: string; name: string; slug: string; category: string;
  default_price: number; default_capacity: number; active: boolean; ask_for_price?: boolean;
  badge1?: string|null; badge2?: string|null; discount_percent?: number|null;
};
type Availability = {
  id?: string; product_id: string; date: string; price: number;
  capacity: number; booked: number; status: "available"|"sold_out"|"closed";
};
type FaqItem = { question: string; answer: string };
type TourContent = {
  id?: string;
  product_id: string;
  language: "en" | "tr" | "es";
  title: string;
  seo_title: string;
  meta_description: string;
  hero_description: string;
  overview_html: string;
  included_items: string[];
  important_info_items: string[];
  faq: FaqItem[];
  hero_image_url: string;
  gallery_image_urls: string[];
  duration_text: string;
};

function emptyTourContent(productId: string, language: "en" | "tr" | "es"): TourContent {
  return {
    product_id: productId, language, title: "", seo_title: "", meta_description: "",
    hero_description: "", overview_html: "", included_items: [], important_info_items: [],
    faq: [], hero_image_url: "", gallery_image_urls: [], duration_text: "",
  };
}

type Reservation = {
  id:string; reservation_date:string; product_id:string|null; tour_name:string; customer_name:string;
  customer_count:number; hotel:string|null; phone:string|null; email:string|null; note:string|null; created_at?:string;
  pnr_code?:string|null; source?:"admin"|"website"; tour_slug?:string|null; language?:string|null;
};
type SeoPage = {
  id?:string; path:string; lang:"en"|"tr"|"es"; page_label?:string|null; seo_title?:string|null; meta_description?:string|null;
  focus_keyword?:string|null; canonical_url?:string|null; index_enabled:boolean; schema_type?:string|null; og_title?:string|null;
  og_description?:string|null; og_image?:string|null; updated_at?:string;
};

const $ = <T extends HTMLElement>(id:string) => document.getElementById(id) as T;
const loginView = $("loginView"), appView = $("appView");
const loginForm = $("loginForm") as HTMLFormElement, loginError = $("loginError");
const productSelect = $("productSelect") as HTMLSelectElement;
const calendar = $("calendar"), monthTitle = $("monthTitle");
const askPriceBtn = $("askPriceBtn") as HTMLButtonElement;
const dayDialog = $("dayDialog") as HTMLDialogElement;
const bulkDialog = $("bulkDialog") as HTMLDialogElement;
const reservationForm = $("reservationForm") as HTMLFormElement;
const reservationProduct = $("reservationProduct") as HTMLSelectElement;
const reservationsList = $("reservationsList");
const seoForm = $("seoForm") as HTMLFormElement;
const seoPageSelect = $("seoPageSelect") as HTMLSelectElement;
const seoList = $("seoList");
let seoRows: SeoPage[] = [];

let products: Product[] = [];
let availability = new Map<string, Availability>();
let currentDate = new Date();
currentDate.setDate(1);

const yyyyMmDd = (d:Date) => {
  const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,"0"), day=String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
};
const selectedProduct = () => products.find(p => p.id === productSelect.value);
function updateAskPriceButton(){
  const p=selectedProduct(); if(!p||!askPriceBtn) return;
  askPriceBtn.classList.toggle("on",!!p.ask_for_price);
  askPriceBtn.textContent=p.ask_for_price?"💬 Ask For Price: Açık":"💬 Ask For Price: Kapalı";
}

async function ensureAdmin(userId:string) {
  const { data, error } = await supabase.from("admin_users").select("user_id,role").eq("user_id", userId).maybeSingle();
  if (error || !data) throw new Error("Bu kullanıcı yönetici olarak yetkilendirilmemiş.");
  return data;
}

async function boot() {
  const { data:{ session } } = await supabase.auth.getSession();
  if (!session) return showLogin();
  try {
    await ensureAdmin(session.user.id);
    $("adminEmail").textContent = session.user.email || "";
    loginView.classList.add("hidden"); appView.classList.remove("hidden");
    await loadProducts();
    await loadMonth();
  } catch(e:any) {
    await supabase.auth.signOut();
    showLogin(e.message);
  }
}

function showLogin(message="") {
  loginView.classList.remove("hidden"); appView.classList.add("hidden");
  if (message) { loginError.textContent = message; loginError.classList.remove("hidden"); }
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault(); loginError.classList.add("hidden");
  const email = ($("email") as HTMLInputElement).value;
  const password = ($("password") as HTMLInputElement).value;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return showLogin(error?.message || "Giriş başarısız.");
  try { await ensureAdmin(data.user.id); location.reload(); }
  catch(err:any){ await supabase.auth.signOut(); showLogin(err.message); }
});
$("logoutBtn").addEventListener("click", async()=>{ await supabase.auth.signOut(); location.reload(); });

async function loadProducts() {
  const { data, error } = await supabase.from("products").select("*").eq("active", true).order("category").order("name");
  if (error) throw error;
  products = data || [];
  productSelect.innerHTML = products.map(p=>`<option value="${p.id}">${p.name}</option>`).join("");
  if (reservationProduct) reservationProduct.innerHTML = products.map(p=>`<option value="${p.id}">${p.name}</option>`).join("");
  $("productsGrid").innerHTML = products.map(p=>`
    <div class="product-card" data-product-id="${p.id}"><h3>${p.name}</h3><p>${p.category}</p>
    <p>Fiyat modu: <b>${p.ask_for_price ? "Fiyat Sorunuz" : "Takvim / Sabit Fiyat"}</b></p>
    <p>Varsayılan fiyat: <b>${p.ask_for_price ? "Ask For Price" : `${p.default_price} €`}</b></p><p>Varsayılan kontenjan: <b>${p.default_capacity}</b></p>
    <button type="button" class="btn ghost" style="margin-top:10px;width:100%" data-edit-product="${p.id}">✏️ Fiyat &amp; Rozetleri Düzenle</button>
    <button type="button" class="btn ghost" style="margin-top:6px;width:100%" data-edit-content="${p.id}" data-product-name="${p.name}" data-product-slug="${p.slug}">📝 İçeriği Düzenle</button></div>
  `).join("");
  document.querySelectorAll<HTMLButtonElement>("[data-edit-product]").forEach(btn=>{
    btn.addEventListener("click", ()=>openEditProductDialog(btn.dataset.editProduct!));
  });
  document.querySelectorAll<HTMLButtonElement>("[data-edit-content]").forEach(btn=>{
    btn.addEventListener("click", ()=>openTourContentDialog(btn.dataset.editContent!, btn.dataset.productName||"", btn.dataset.productSlug||""));
  });
  updateAskPriceButton();
}

function openEditProductDialog(productId: string) {
  const product = products.find(p=>p.id===productId);
  if (!product) return;
  ($("editProductId") as HTMLInputElement).value = product.id;
  ($("editProductName") as HTMLElement).textContent = product.name;
  ($("editProductPrice") as HTMLInputElement).value = String(product.default_price ?? 0);
  ($("editProductCapacity") as HTMLInputElement).value = String(product.default_capacity ?? 0);
  ($("editProductBadge1") as HTMLSelectElement).value = product.badge1 ?? "";
  ($("editProductBadge2") as HTMLSelectElement).value = product.badge2 ?? "";
  ($("editProductDiscount") as HTMLInputElement).value = product.discount_percent != null ? String(product.discount_percent) : "";
  ($("editProductDialog") as HTMLDialogElement).showModal();
}

async function loadMonth() {
  const product = selectedProduct(); if (!product) return;
  const first = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  const start = new Date(first); start.setDate(start.getDate() - offset);
  const end = new Date(start); end.setDate(end.getDate() + 41);
  const { data, error } = await supabase.from("availability")
    .select("*").eq("product_id", product.id).gte("date", yyyyMmDd(start)).lte("date", yyyyMmDd(end));
  if (error) throw error;
  availability = new Map((data || []).map((r:Availability)=>[r.date,r]));
  renderCalendar();
}

function renderCalendar() {
  const product = selectedProduct(); if (!product) return;
  monthTitle.textContent = currentDate.toLocaleDateString("tr-TR",{month:"long",year:"numeric"});
  const labels=["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"];
  let html=labels.map(x=>`<div class="dow">${x}</div>`).join("");
  const first = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const offset=(first.getDay()+6)%7;
  const cursor=new Date(first); cursor.setDate(cursor.getDate()-offset);
  for(let i=0;i<42;i++){
    const key=yyyyMmDd(cursor), inMonth=cursor.getMonth()===currentDate.getMonth();
    const row=availability.get(key);
    const price=row?.price ?? product.default_price;
    const cap=row?.capacity ?? product.default_capacity;
    const booked=row?.booked ?? 0;
    const left=Math.max(0,cap-booked);
    let status=row?.status ?? "available";
    if(status==="available" && left===0) status="sold_out";
    const label=status==="sold_out"?"DOLU":status==="closed"?"KAPALI":left<=3?"SON "+left:"MÜSAİT";
    const cls=status==="available" && left<=3?"low":status;
    const fullDate = cursor.toLocaleDateString("tr-TR",{day:"2-digit",month:"2-digit",year:"numeric"});
    html+=`<div class="day ${inMonth?"":"out"}" data-date="${key}">
      <div class="day-head">
        <span class="day-number">${cursor.getDate()}</span>
        <span class="day-full-date">${fullDate}</span>
      </div>
      <div class="day-row day-price blue"><span class="day-label">Fiyat</span><span class="day-value">${product.ask_for_price?"Ask For Price":`${price} €`}</span></div>
      <div class="day-row gold"><span class="day-label">Satılan</span><span class="day-value">${booked} kişi</span></div>
      <div class="day-row blue"><span class="day-label">Kalan</span><span class="day-value">${left} / ${cap}</span></div>
      <div class="day-row day-status gold"><span class="day-label">Durum</span><span class="status ${cls}">${label}</span></div>
      ${product.ask_for_price?'<span class="ask-chip">💬 Fiyat Sorunuz</span>':''}</div>`;
    cursor.setDate(cursor.getDate()+1);
  }
  calendar.innerHTML=html;
  calendar.querySelectorAll<HTMLElement>(".day").forEach(el=>el.addEventListener("click",()=>openDay(el.dataset.date!)));
}

function openDay(date:string){
  const p=selectedProduct()!, row=availability.get(date);
  $("dayDialogTitle").textContent=`${p.name} — ${date}`;
  ($("editDate") as HTMLInputElement).value=date;
  ($("editPrice") as HTMLInputElement).value=String(row?.price ?? p.default_price);
  ($("editCapacity") as HTMLInputElement).value=String(row?.capacity ?? p.default_capacity);
  ($("editBooked") as HTMLInputElement).value=String(row?.booked ?? 0);
  ($("editStatus") as HTMLSelectElement).value=row?.status ?? "available";
  dayDialog.showModal();
}

($("dayForm") as HTMLFormElement).addEventListener("submit", async(e)=>{
  e.preventDefault(); const p=selectedProduct()!;
  const payload={
    product_id:p.id,
    date:($("editDate") as HTMLInputElement).value,
    price:Number(($("editPrice") as HTMLInputElement).value),
    capacity:Number(($("editCapacity") as HTMLInputElement).value),
    booked:Number(($("editBooked") as HTMLInputElement).value),
    status:($("editStatus") as HTMLSelectElement).value
  };
  if(payload.booked>payload.capacity) return alert("Satılan sayı kontenjandan büyük olamaz.");
  const {error}=await supabase.from("availability").upsert(payload,{onConflict:"product_id,date"});
  if(error) return alert(error.message);
  dayDialog.close(); await loadMonth();
});
$("dayCancel").addEventListener("click",()=>dayDialog.close());

$("bulkBtn").addEventListener("click",()=>bulkDialog.showModal());
$("bulkCancel").addEventListener("click",()=>bulkDialog.close());
($("bulkForm") as HTMLFormElement).addEventListener("submit", async(e)=>{
  e.preventDefault(); const p=selectedProduct()!;
  const start=new Date(($("bulkStart") as HTMLInputElement).value+"T00:00:00");
  const end=new Date(($("bulkEnd") as HTMLInputElement).value+"T00:00:00");
  if(end<start) return alert("Bitiş tarihi başlangıçtan önce olamaz.");
  const rows=[]; const d=new Date(start);
  while(d<=end){
    rows.push({product_id:p.id,date:yyyyMmDd(d),price:Number(($("bulkPrice") as HTMLInputElement).value),
      capacity:Number(($("bulkCapacity") as HTMLInputElement).value),booked:0,status:($("bulkStatus") as HTMLSelectElement).value});
    d.setDate(d.getDate()+1);
  }
  const {error}=await supabase.from("availability").upsert(rows,{onConflict:"product_id,date"});
  if(error) return alert(error.message);
  bulkDialog.close(); await loadMonth();
});

const resetAllDialog = $("resetAllDialog") as HTMLDialogElement;
$("resetAllBtn").addEventListener("click",()=>{
  const p=selectedProduct(); if(!p) return;
  ($("resetAllPrice") as HTMLInputElement).value=String(p.default_price ?? 0);
  ($("resetAllCapacity") as HTMLInputElement).value=String(p.default_capacity ?? 0);
  resetAllDialog.showModal();
});
$("resetAllCancel").addEventListener("click",()=>resetAllDialog.close());
($("resetAllForm") as HTMLFormElement).addEventListener("submit", async(e)=>{
  e.preventDefault(); const p=selectedProduct()!;
  const days=Number(($("resetAllDays") as HTMLInputElement).value);
  const price=Number(($("resetAllPrice") as HTMLInputElement).value);
  const capacity=Number(($("resetAllCapacity") as HTMLInputElement).value);
  if(!(days>0)) return alert("Geçerli bir gün sayısı girin.");
  if(!confirm(`${p.name} için bugünden itibaren ${days} günlük TÜM tarihler ${price} € / ${capacity} kontenjan olarak tek fiyata sıfırlanacak. Mevcut satılmış (rezerve edilmiş) günlerin satış sayıları korunacak, sadece fiyat/kontenjan/durumu güncellenecek. Devam edilsin mi?`)) return;

  const start=new Date(); start.setHours(0,0,0,0);
  const end=new Date(start); end.setDate(end.getDate()+days-1);

  const {data: existing, error: fetchError}=await supabase.from("availability")
    .select("date,booked").eq("product_id",p.id).gte("date",yyyyMmDd(start)).lte("date",yyyyMmDd(end));
  if(fetchError) return alert(fetchError.message);
  const bookedByDate = new Map((existing || []).map((r:any)=>[r.date, r.booked || 0]));

  const rows=[]; const d=new Date(start);
  while(d<=end){
    const key=yyyyMmDd(d);
    rows.push({product_id:p.id,date:key,price,capacity,booked:bookedByDate.get(key) ?? 0,status:"available"});
    d.setDate(d.getDate()+1);
  }
  const {error}=await supabase.from("availability").upsert(rows,{onConflict:"product_id,date"});
  if(error) return alert(error.message);
  resetAllDialog.close(); await loadMonth();
  alert(`Tamamlandı: ${rows.length} gün ${price} € olarak ayarlandı.`);
});

const editProductDialog = $("editProductDialog") as HTMLDialogElement;
$("editProductCancel").addEventListener("click",()=>editProductDialog.close());
($("editProductForm") as HTMLFormElement).addEventListener("submit", async(e)=>{
  e.preventDefault();
  const id=($("editProductId") as HTMLInputElement).value;
  const default_price=Number(($("editProductPrice") as HTMLInputElement).value);
  const default_capacity=Number(($("editProductCapacity") as HTMLInputElement).value);
  const badge1raw=($("editProductBadge1") as HTMLSelectElement).value;
  const badge2raw=($("editProductBadge2") as HTMLSelectElement).value;
  const discountRaw=($("editProductDiscount") as HTMLInputElement).value.trim();
  const badge1 = badge1raw || null;
  const badge2 = badge2raw || null;
  const discount_percent = discountRaw === "" ? null : Number(discountRaw);
  if(!(default_price>=0)) return alert("Geçerli bir fiyat girin.");
  if(!(default_capacity>=0)) return alert("Geçerli bir kontenjan girin.");
  if(discount_percent!==null && !(discount_percent>=0 && discount_percent<=100)) return alert("İndirim yüzdesi 0-100 arasında olmalı.");
  const {error}=await supabase.from("products").update({default_price,default_capacity,badge1,badge2,discount_percent}).eq("id",id);
  if(error) return alert(error.message);
  editProductDialog.close();
  await loadProducts();
  await loadMonth();
});

$("prevMonth").addEventListener("click",()=>{currentDate.setMonth(currentDate.getMonth()-1);loadMonth();});
$("nextMonth").addEventListener("click",()=>{currentDate.setMonth(currentDate.getMonth()+1);loadMonth();});
productSelect.addEventListener("change",async()=>{updateAskPriceButton();await loadMonth();});
askPriceBtn.addEventListener("click",async()=>{const p=selectedProduct();if(!p)return;const next=!p.ask_for_price;const {error}=await supabase.from("products").update({ask_for_price:next}).eq("id",p.id);if(error)return alert(error.message);p.ask_for_price=next;updateAskPriceButton();await loadMonth();await loadProducts();});


function resetReservationForm(){
  ($("reservationId") as HTMLInputElement).value="";
  ($("reservationDate") as HTMLInputElement).value=yyyyMmDd(new Date());
  ($("reservationName") as HTMLInputElement).value="";
  ($("reservationCount") as HTMLInputElement).value="1";
  ($("reservationHotel") as HTMLInputElement).value="";
  ($("reservationPhone") as HTMLInputElement).value="";
  ($("reservationEmail") as HTMLInputElement).value="";
  ($("reservationNote") as HTMLTextAreaElement).value="";
}

function escapeHtml(value:any){
  return String(value ?? "").replace(/[&<>'"]/g,(ch)=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[ch] as string));
}

async function loadReservations(){
  if(!reservationsList) return;
  reservationsList.innerHTML='<div class="notice">Rezervasyonlar yükleniyor…</div>';
  const {data,error}=await supabase.from("reservations").select("*").order("reservation_date",{ascending:true}).order("created_at",{ascending:false}).limit(250);
  if(error){ reservationsList.innerHTML=`<div class="notice">${escapeHtml(error.message)}<br><b>Önce supabase/admin-reservations.sql dosyasını çalıştırın.</b></div>`; return; }
  const rows=(data||[]) as Reservation[];
  if(!rows.length){reservationsList.innerHTML='<div class="notice">Henüz manuel rezervasyon kaydı yok.</div>';return;}
  reservationsList.innerHTML=rows.map(r=>`<article class="reservation-item">
    <div class="reservation-item-head"><div><h3>${escapeHtml(r.customer_name)} ${r.pnr_code?`<span class="reservation-pnr">${escapeHtml(r.pnr_code)}</span>`:''} ${r.source==='website'?'<span class="reservation-source-badge">🌐 Web sitesinden</span>':''}</h3><small>${escapeHtml(r.tour_name)}</small></div><span class="reservation-date">${new Date(r.reservation_date+'T00:00:00').toLocaleDateString('tr-TR')}</span></div>
    <div class="reservation-meta"><span><b>Kişi:</b> ${r.customer_count}</span><span><b>Otel:</b> ${escapeHtml(r.hotel||'-')}</span><span><b>Telefon:</b> ${escapeHtml(r.phone||'-')}</span><span><b>E-posta:</b> ${escapeHtml(r.email||'-')}</span></div>
    ${r.note?`<div class="reservation-note"><b>Not:</b> ${escapeHtml(r.note)}</div>`:''}
    <div class="reservation-item-actions"><button type="button" class="btn danger" data-delete-reservation="${r.id}">Sil</button></div>
  </article>`).join('');
  reservationsList.querySelectorAll<HTMLButtonElement>('[data-delete-reservation]').forEach(btn=>btn.addEventListener('click',async()=>{
    if(!confirm('Bu rezervasyon kaydı silinsin mi?')) return;
    const {error}=await supabase.from('reservations').delete().eq('id',btn.dataset.deleteReservation!);
    if(error) return alert(error.message); await loadReservations();
  }));
}

reservationForm?.addEventListener("submit",async(e)=>{
  e.preventDefault();
  const product=products.find(p=>p.id===reservationProduct.value);
  if(!product) return alert("Tur seçiniz.");
  const payload={
    reservation_date:($('reservationDate') as HTMLInputElement).value,
    product_id:product.id,
    tour_name:product.name,
    customer_name:($('reservationName') as HTMLInputElement).value.trim(),
    customer_count:Number(($('reservationCount') as HTMLInputElement).value),
    hotel:($('reservationHotel') as HTMLInputElement).value.trim()||null,
    phone:($('reservationPhone') as HTMLInputElement).value.trim()||null,
    email:($('reservationEmail') as HTMLInputElement).value.trim()||null,
    note:($('reservationNote') as HTMLTextAreaElement).value.trim()||null
  };
  if(!payload.reservation_date||!payload.customer_name||payload.customer_count<1) return alert("Tarih, müşteri adı ve kişi sayısı zorunludur.");
  const {error}=await supabase.from('reservations').insert(payload);
  if(error) return alert(error.message);
  resetReservationForm(); await loadReservations(); alert('Rezervasyon kaydedildi.');
});
$('reservationReset')?.addEventListener('click',resetReservationForm);
resetReservationForm();


function normalizeSeoPath(value:string){
  let p=(value||'/').trim();
  if(!p.startsWith('/')) p='/'+p;
  p=p.split('?')[0].split('#')[0];
  return p==='/'?'/':`/${p.replace(/^\/+|\/+$/g,'')}/`;
}
function suggestedSeoPages(){
  const fixed=[
    ['/en/','EN — Home'],['/tr/','TR — Ana Sayfa'],['/es/','ES — Inicio'],
    ['/en/balloon-tours/','EN — Balloon Tours'],['/tr/balloon-tours/','TR — Balon Turları'],['/es/balloon-tours/','ES — Tours en Globo'],
    ['/en/cappadocia-tours/','EN — Cappadocia Tours'],['/tr/cappadocia-tours/','TR — Kapadokya Turları'],['/es/cappadocia-tours/','ES — Tours de Capadocia'],
    ['/en/activities/','EN — Activities'],['/tr/activities/','TR — Aktiviteler'],['/es/activities/','ES — Actividades'],
    ['/en/private-tours/','EN — Private Tours'],['/tr/private-tours/','TR — Özel Turlar'],['/es/private-tours/','ES — Tours Privados'],
    ['/en/transfers/','EN — Transfers'],['/tr/transfers/','TR — Transferler'],['/es/transfers/','ES — Traslados'],
    ['/en/flight-status/','EN — Flight Status'],['/tr/flight-status/','TR — Uçuş Durumu'],['/es/flight-status/','ES — Estado de Vuelo'],
    ['/en/blog/','EN — Travel Guide'],['/tr/blog/','TR — Gezi Rehberi'],['/es/blog/','ES — Guía de Viaje']
  ];
  for(const p of products){ for(const lang of ['en','tr','es']) fixed.push([`/${lang}/tours/${p.slug}/`,`${lang.toUpperCase()} — ${p.name}`]); }
  return fixed;
}
function fillSeoPageSelect(){
  const items=suggestedSeoPages();
  seoPageSelect.innerHTML='<option value="">— Sayfa seçin veya özel URL girin —</option>'+items.map(([path,label])=>`<option value="${escapeHtml(path)}">${escapeHtml(label)}</option>`).join('');
}
function seoLangFromPath(path:string){ const m=normalizeSeoPath(path).match(/^\/(en|tr|es)\//); return (m?.[1]||'en') as 'en'|'tr'|'es'; }
function setSeoCounter(elId:string,countId:string,target:number,min:number){
  const el=$(elId) as HTMLInputElement|HTMLTextAreaElement, count=$(countId); const n=el.value.trim().length; count.textContent=`${n}/${target}`; count.className='char-count '+(n>=min&&n<=target?'good':n>target?'bad':'warn');
}
function seoScore(){
  const title=($('seoTitle') as HTMLInputElement).value.trim(); const desc=($('seoDescription') as HTMLTextAreaElement).value.trim(); const kw=($('seoKeyword') as HTMLInputElement).value.trim().toLowerCase();
  const canonical=($('seoCanonical') as HTMLInputElement).value.trim(); const path=normalizeSeoPath(($('seoPath') as HTMLInputElement).value); const img=($('seoOgImage') as HTMLInputElement).value.trim();
  const checks=[
    {ok:title.length>=30&&title.length<=60,txt:'Title 30–60 karakter'},
    {ok:desc.length>=120&&desc.length<=160,txt:'Description 120–160 karakter'},
    {ok:!!kw&&title.toLowerCase().includes(kw),txt:'Focus keyword title içinde'},
    {ok:!!kw&&desc.toLowerCase().includes(kw),txt:'Focus keyword description içinde'},
    {ok:canonical.startsWith('https://tatildokya.com/')&&canonical.endsWith(path),txt:'Canonical doğru domain ve URL'},
    {ok:!!img,txt:'Sosyal paylaşım görseli tanımlı'},
    {ok:($('seoIndex') as HTMLSelectElement).value==='true',txt:'Sayfa index açık'}
  ];
  const score=Math.round(checks.filter(x=>x.ok).length/checks.length*100); const ring=$('seoScore'); ring.style.setProperty('--score',score+'%'); ring.querySelector('strong')!.textContent=String(score);
  $('seoChecks').innerHTML=checks.map(c=>`<div class="seo-check ${c.ok?'ok':'no'}"><span>${c.ok?'✓':'•'}</span><span>${c.txt}</span></div>`).join('');
  return score;
}
function updateSeoPreview(){
  setSeoCounter('seoTitle','seoTitleCount',60,30); setSeoCounter('seoDescription','seoDescCount',160,120); seoScore();
  const path=normalizeSeoPath(($('seoPath') as HTMLInputElement).value||'/'); $('seoPreviewUrl').textContent='tatildokya.com'+path;
  $('seoPreviewTitle').textContent=($('seoTitle') as HTMLInputElement).value.trim()||'SEO başlığı önizlemesi'; $('seoPreviewDesc').textContent=($('seoDescription') as HTMLTextAreaElement).value.trim()||'Meta açıklamanız burada görünecek.';
}
function clearSeoForm(path=''){
  ($('seoPath') as HTMLInputElement).value=path; ($('seoLang') as HTMLSelectElement).value=seoLangFromPath(path||'/en/'); ($('seoSchema') as HTMLSelectElement).value='WebPage';
  for(const id of ['seoTitle','seoDescription','seoKeyword','seoCanonical','seoOgImage','seoOgTitle','seoOgDescription']) ($(id) as HTMLInputElement|HTMLTextAreaElement).value='';
  ($('seoIndex') as HTMLSelectElement).value='true'; if(path) ($('seoCanonical') as HTMLInputElement).value='https://tatildokya.com'+normalizeSeoPath(path); updateSeoPreview();
}
function loadSeoIntoForm(row:SeoPage){
  ($('seoPath') as HTMLInputElement).value=row.path; ($('seoLang') as HTMLSelectElement).value=row.lang; ($('seoSchema') as HTMLSelectElement).value=row.schema_type||'WebPage';
  ($('seoTitle') as HTMLInputElement).value=row.seo_title||''; ($('seoDescription') as HTMLTextAreaElement).value=row.meta_description||''; ($('seoKeyword') as HTMLInputElement).value=row.focus_keyword||''; ($('seoCanonical') as HTMLInputElement).value=row.canonical_url||''; ($('seoIndex') as HTMLSelectElement).value=String(row.index_enabled!==false); ($('seoOgImage') as HTMLInputElement).value=row.og_image||''; ($('seoOgTitle') as HTMLInputElement).value=row.og_title||''; ($('seoOgDescription') as HTMLTextAreaElement).value=row.og_description||''; updateSeoPreview();
}
async function loadSeoPages(){
  fillSeoPageSelect(); if(!seoList) return; seoList.innerHTML='<div class="notice">SEO kayıtları yükleniyor…</div>';
  const {data,error}=await supabase.from('seo_pages').select('*').order('path');
  if(error){seoList.innerHTML=`<div class="notice">${escapeHtml(error.message)}<br><b>Önce supabase/seo-management.sql dosyasını çalıştırın.</b></div>`;return;}
  seoRows=(data||[]) as SeoPage[]; seoList.innerHTML=seoRows.length?seoRows.map(r=>`<div class="seo-row" data-seo-path="${escapeHtml(r.path)}"><strong>${escapeHtml(r.seo_title||r.page_label||r.path)}</strong><small>${escapeHtml(r.path)} · ${r.lang.toUpperCase()}</small></div>`).join(''):'<div class="notice">Henüz özel SEO kaydı yok. Mevcut taşınmış SEO değerleri site üzerinde çalışmaya devam ediyor.</div>';
  seoList.querySelectorAll<HTMLElement>('[data-seo-path]').forEach(el=>el.addEventListener('click',()=>{const r=seoRows.find(x=>x.path===el.dataset.seoPath);if(r)loadSeoIntoForm(r);}));
}
seoPageSelect?.addEventListener('change',()=>{const path=seoPageSelect.value;if(!path)return;const row=seoRows.find(r=>normalizeSeoPath(r.path)===normalizeSeoPath(path));row?loadSeoIntoForm(row):clearSeoForm(path);});
['seoPath','seoTitle','seoDescription','seoKeyword','seoCanonical','seoOgImage'].forEach(id=>$(id)?.addEventListener('input',updateSeoPreview));
$('seoReset')?.addEventListener('click',()=>clearSeoForm(seoPageSelect.value));
seoForm?.addEventListener('submit',async(e)=>{
  e.preventDefault(); const {data:{user}}=await supabase.auth.getUser(); const path=normalizeSeoPath(($('seoPath') as HTMLInputElement).value); const title=($('seoTitle') as HTMLInputElement).value.trim(); const desc=($('seoDescription') as HTMLTextAreaElement).value.trim();
  if(!path||!title||!desc) return alert('URL, SEO Title ve Meta Description zorunludur.');
  const payload={path,lang:($('seoLang') as HTMLSelectElement).value,page_label:seoPageSelect.options[seoPageSelect.selectedIndex]?.text||path,seo_title:title,meta_description:desc,focus_keyword:($('seoKeyword') as HTMLInputElement).value.trim()||null,canonical_url:($('seoCanonical') as HTMLInputElement).value.trim()||`https://tatildokya.com${path}`,index_enabled:($('seoIndex') as HTMLSelectElement).value==='true',schema_type:($('seoSchema') as HTMLSelectElement).value,og_title:($('seoOgTitle') as HTMLInputElement).value.trim()||null,og_description:($('seoOgDescription') as HTMLTextAreaElement).value.trim()||null,og_image:($('seoOgImage') as HTMLInputElement).value.trim()||null,updated_by:user?.id||null};
  const {error}=await supabase.from('seo_pages').upsert(payload,{onConflict:'path'}); if(error)return alert(error.message); await loadSeoPages(); alert('SEO kaydedildi. Yayına almak için terminalde: npm run seo:sync ardından npm run build');
});
clearSeoForm('/en/');

// --- Site-wide TripAdvisor rating ------------------------------------------
const ratingForm = $("ratingForm") as HTMLFormElement | null;
async function loadSiteRating(){
  const {data,error}=await supabase.from('site_rating').select('rating_value,review_count').eq('id',1).maybeSingle();
  if(error){console.warn('site_rating okunamadı (önce supabase/site-rating.sql çalıştırın):',error.message);return;}
  if(!data) return;
  ($('ratingValue') as HTMLInputElement).value=String(data.rating_value ?? '4.9');
  ($('ratingCount') as HTMLInputElement).value=String(data.review_count ?? '1141');
}
ratingForm?.addEventListener('submit', async(e)=>{
  e.preventDefault();
  const {data:{user}}=await supabase.auth.getUser();
  const rating_value=Number(($('ratingValue') as HTMLInputElement).value);
  const review_count=Number(($('ratingCount') as HTMLInputElement).value);
  if(!(rating_value>=0&&rating_value<=5)) return alert('Puan 0–5 arasında olmalı.');
  if(!(review_count>=0)) return alert('Yorum sayısı 0 veya üzeri olmalı.');
  const {error}=await supabase.from('site_rating').update({rating_value,review_count,updated_by:user?.id||null}).eq('id',1);
  if(error)return alert(error.message);
  alert('Puan kaydedildi. Yayına almak için terminalde: npm run seo:sync ardından npm run build');
});


// ===== TUR İÇERİK YÖNETİMİ (dinamik tur sayfaları) =====
let tcProductId = "";
let tcProductSlug = "";
let tcLang: "en" | "tr" | "es" = "en";
let tcCache: Record<string, TourContent> = {};

function readStringList(containerId: string): string[] {
  const el = $(containerId);
  return Array.from(el.querySelectorAll<HTMLInputElement>("input")).map(inp => inp.value.trim()).filter(Boolean);
}

function renderStringList(containerId: string, items: string[]) {
  const el = $(containerId);
  el.innerHTML = items.map((val, i) => `
    <div class="dynamic-list-row" data-idx="${i}">
      <input type="text" value="${(val || "").replace(/"/g, "&quot;")}" />
      <button type="button" class="row-remove" data-remove="${i}">✕</button>
    </div>
  `).join("");
  el.querySelectorAll<HTMLButtonElement>("[data-remove]").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.remove);
      const list = readStringList(containerId);
      list.splice(idx, 1);
      renderStringList(containerId, list);
    });
  });
}

function readFaqList(): FaqItem[] {
  const el = $("tc-faq-list");
  const rows = el.querySelectorAll<HTMLElement>(".faq-row");
  const out: FaqItem[] = [];
  rows.forEach(row => {
    const q = (row.querySelector("[data-faq-q]") as HTMLInputElement)?.value.trim() || "";
    const a = (row.querySelector("[data-faq-a]") as HTMLTextAreaElement)?.value.trim() || "";
    if (q || a) out.push({ question: q, answer: a });
  });
  return out;
}

function renderFaqListUI(items: FaqItem[]) {
  const el = $("tc-faq-list");
  el.innerHTML = items.map((qa, i) => `
    <div class="faq-row" data-idx="${i}">
      <input type="text" placeholder="Soru" value="${(qa.question || "").replace(/"/g, "&quot;")}" data-faq-q="${i}" />
      <textarea placeholder="Cevap" rows="2" data-faq-a="${i}">${qa.answer || ""}</textarea>
      <button type="button" class="row-remove" data-remove-faq="${i}" style="justify-self:end">✕ Sil</button>
    </div>
  `).join("");
  el.querySelectorAll<HTMLButtonElement>("[data-remove-faq]").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.removeFaq);
      const list = readFaqList();
      list.splice(idx, 1);
      renderFaqListUI(list);
    });
  });
}

function populateContentForm(content: TourContent) {
  ($("tc-title") as HTMLInputElement).value = content.title || "";
  ($("tc-duration") as HTMLInputElement).value = content.duration_text || "";
  ($("tc-seoTitle") as HTMLInputElement).value = content.seo_title || "";
  ($("tc-metaDescription") as HTMLTextAreaElement).value = content.meta_description || "";
  ($("tc-heroDescription") as HTMLTextAreaElement).value = content.hero_description || "";
  ($("tc-overview") as HTMLTextAreaElement).value = content.overview_html || "";
  ($("tc-heroImage") as HTMLInputElement).value = content.hero_image_url || "";
  renderStringList("tc-included-list", content.included_items || []);
  renderStringList("tc-important-list", content.important_info_items || []);
  renderStringList("tc-gallery-list", content.gallery_image_urls || []);
  renderFaqListUI(content.faq || []);
}

function collectContentForm(): TourContent {
  return {
    product_id: tcProductId,
    language: tcLang,
    title: ($("tc-title") as HTMLInputElement).value.trim(),
    seo_title: ($("tc-seoTitle") as HTMLInputElement).value.trim(),
    meta_description: ($("tc-metaDescription") as HTMLTextAreaElement).value.trim(),
    hero_description: ($("tc-heroDescription") as HTMLTextAreaElement).value.trim(),
    overview_html: ($("tc-overview") as HTMLTextAreaElement).value.trim(),
    included_items: readStringList("tc-included-list"),
    important_info_items: readStringList("tc-important-list"),
    faq: readFaqList(),
    hero_image_url: ($("tc-heroImage") as HTMLInputElement).value.trim(),
    gallery_image_urls: readStringList("tc-gallery-list"),
    duration_text: ($("tc-duration") as HTMLInputElement).value.trim(),
  };
}

async function openTourContentDialog(productId: string, productName: string, productSlug: string) {
  tcProductId = productId;
  tcProductSlug = productSlug;
  tcLang = "en";
  tcCache = {};
  ($("tourContentProductName") as HTMLElement).textContent = productName;
  ($("tourContentPreviewLink") as HTMLAnchorElement).href = `/en/tours/${productSlug}`;

  const { data, error } = await supabase.from("tour_content").select("*").eq("product_id", productId);
  if (error) { alert(error.message); return; }

  (["en", "tr", "es"] as const).forEach(lang => {
    const row = (data || []).find((r: any) => r.language === lang);
    tcCache[lang] = row ? {
      id: row.id, product_id: productId, language: lang, title: row.title || "",
      seo_title: row.seo_title || "", meta_description: row.meta_description || "",
      hero_description: row.hero_description || "", overview_html: row.overview_html || "",
      included_items: row.included_items || [], important_info_items: row.important_info_items || [],
      faq: row.faq || [], hero_image_url: row.hero_image_url || "",
      gallery_image_urls: row.gallery_image_urls || [], duration_text: row.duration_text || "",
    } : emptyTourContent(productId, lang);
  });

  document.querySelectorAll<HTMLButtonElement>("[data-content-lang]").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.contentLang === "en");
  });
  populateContentForm(tcCache.en);
  ($("tourContentDialog") as HTMLDialogElement).showModal();
}

document.querySelectorAll<HTMLButtonElement>("[data-content-lang]").forEach(btn => {
  btn.addEventListener("click", () => {
    tcCache[tcLang] = collectContentForm();
    tcLang = (btn.dataset.contentLang as "en" | "tr" | "es") || "en";
    document.querySelectorAll<HTMLButtonElement>("[data-content-lang]").forEach(b => b.classList.toggle("active", b === btn));
    populateContentForm(tcCache[tcLang]);
  });
});

document.querySelectorAll<HTMLButtonElement>("[data-add]").forEach(btn => {
  btn.addEventListener("click", () => {
    const type = btn.dataset.add;
    if (type === "included") { const l = readStringList("tc-included-list"); l.push(""); renderStringList("tc-included-list", l); }
    if (type === "important") { const l = readStringList("tc-important-list"); l.push(""); renderStringList("tc-important-list", l); }
    if (type === "gallery") { const l = readStringList("tc-gallery-list"); l.push(""); renderStringList("tc-gallery-list", l); }
    if (type === "faq") { const l = readFaqList(); l.push({ question: "", answer: "" }); renderFaqListUI(l); }
  });
});

($("tourContentForm") as HTMLFormElement)?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const content = collectContentForm();
  if (!content.title) { alert("Başlık zorunlu."); return; }
  tcCache[tcLang] = content;

  const payload = {
    product_id: content.product_id, language: content.language, title: content.title,
    seo_title: content.seo_title, meta_description: content.meta_description,
    hero_description: content.hero_description, overview_html: content.overview_html,
    included_items: content.included_items, important_info_items: content.important_info_items,
    faq: content.faq, hero_image_url: content.hero_image_url,
    gallery_image_urls: content.gallery_image_urls, duration_text: content.duration_text,
  };

  const { error } = await supabase.from("tour_content").upsert(payload, { onConflict: "product_id,language" });
  if (error) { alert(error.message); return; }
  alert(`${tcLang.toUpperCase()} içeriği kaydedildi. Sayfa: /${tcLang}/tours/${tcProductSlug}/`);
});

$("tourContentCancel")?.addEventListener("click", () => {
  ($("tourContentDialog") as HTMLDialogElement).close();
});

// ===== YENİ TUR EKLEME =====
$("newTourBtn")?.addEventListener("click", () => {
  ($("newTourForm") as HTMLFormElement).reset();
  ($("newTourDialog") as HTMLDialogElement).showModal();
});
$("newTourCancel")?.addEventListener("click", () => {
  ($("newTourDialog") as HTMLDialogElement).close();
});

let tourSlugManuallyEdited = false;
($("newTourSlug") as HTMLInputElement)?.addEventListener("input", () => { tourSlugManuallyEdited = true; });
($("newTourName") as HTMLInputElement)?.addEventListener("input", () => {
  if (tourSlugManuallyEdited) return;
  const name = ($("newTourName") as HTMLInputElement).value;
  const slug = name.toLowerCase()
    .replace(/ı/g, "i").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  ($("newTourSlug") as HTMLInputElement).value = slug;
});

($("newTourForm") as HTMLFormElement)?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = ($("newTourName") as HTMLInputElement).value.trim();
  const slug = ($("newTourSlug") as HTMLInputElement).value.trim();
  const category = ($("newTourCategory") as HTMLSelectElement).value;
  const default_price = Number(($("newTourPrice") as HTMLInputElement).value);
  const default_capacity = Number(($("newTourCapacity") as HTMLInputElement).value);

  if (!name || !slug) { alert("Tur adı ve slug zorunlu."); return; }
  if (!/^[a-z0-9-]+$/.test(slug)) { alert("Slug sadece küçük harf, rakam ve tire (-) içerebilir."); return; }
  if (!(default_price >= 0)) { alert("Geçerli bir fiyat girin."); return; }
  if (!(default_capacity >= 0)) { alert("Geçerli bir kontenjan girin."); return; }

  const { data: existing } = await supabase.from("products").select("id").eq("slug", slug).limit(1);
  if (existing && existing.length > 0) { alert("Bu slug zaten kullanılıyor, başka bir tane seçin."); return; }

  const { data, error } = await supabase.from("products").insert({
    name, slug, category, default_price, default_capacity, active: true,
  }).select().single();
  if (error) { alert(error.message); return; }

  ($("newTourDialog") as HTMLDialogElement).close();
  await loadProducts();
  tourSlugManuallyEdited = false;
  openTourContentDialog(data.id, name, slug);
});

document.querySelectorAll<HTMLButtonElement>("[data-tab]").forEach(btn=>btn.addEventListener("click",async()=>{
  document.querySelectorAll("[data-tab]").forEach(x=>x.classList.remove("active")); btn.classList.add("active");
  const tab=btn.dataset.tab || "calendar";
  $("calendarTab").classList.toggle("hidden",tab!=="calendar");
  $("productsTab").classList.toggle("hidden",tab!=="products");
  $("reservationsTab").classList.toggle("hidden",tab!=="reservations");
  $("seoTab").classList.toggle("hidden",tab!=="seo");
  $("pageTitle").textContent=tab==="calendar"?"Fiyat & Kontenjan Takvimi":tab==="products"?"Ürünler":tab==="reservations"?"Rezervasyon Detayları":"SEO Yönetimi";
  if(tab==="reservations") await loadReservations();
  if(tab==="seo"){ await loadSeoPages(); await loadSiteRating(); }
}));

boot();
