$ErrorActionPreference = "Stop"

$path = ".\src\components\FlightStatusPage.astro"

if (-not (Test-Path $path)) {
  throw "FlightStatusPage.astro bulunamadi: $path"
}

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backup = ".\src\components\FlightStatusPage.astro.backup-$stamp"
Copy-Item $path $backup -Force
Write-Host "Backup: $backup" -ForegroundColor Yellow

$content = Get-Content $path -Raw -Encoding UTF8

# ------------------------------------------------------------
# 1) EN copy
# ------------------------------------------------------------
$old = @'
    canceledTitle: 'Flights Not Cleared for Operation',
    suitableTitle: 'Flights Cleared to Operate',
    partialTitle: 'Sector Decisions Differ',
    pendingTitle: 'Official Decision Pending',
'@

$new = @'
    canceledTitle: 'Flights Not Cleared for Operation',
    suitableTitle: 'Flights Cleared to Operate',
    completedTitle: 'Completed: Morning flights completed.',
    canceledAtLaunchTitle: 'Flights Canceled at Launch Site for Today',
    partialTitle: 'Sector Decisions Differ',
    pendingTitle: 'Official Decision Pending',
'@

if (-not $content.Contains($old)) { throw "EN title block bulunamadi." }
$content = $content.Replace($old, $new)

$old = @'
    canceledBody: 'The official meteorological decision does not permit balloon take-off during the stated valid period.',
    suitableBody: 'The official sector decision is suitable for balloon operations during the stated valid period. Final operation remains subject to pilot and operator safety checks.',
    partialBody: 'Official sector decisions are not identical. Check Sector A, B and C individually below.',
'@

$new = @'
    canceledBody: 'The official meteorological decision does not permit balloon take-off during the stated valid period.',
    suitableBody: 'The official sector decision is suitable for balloon operations during the stated valid period. Final operation remains subject to pilot and operator safety checks.',
    completedBody: 'Today’s morning flights have been completed. No further balloon flights will operate for the rest of the day. Please follow tomorrow’s update.',
    canceledAtLaunchBody: 'The operation reached the launch-site decision stage, but final clearance was not granted. Balloon flights are canceled for today.',
    partialBody: 'Official sector decisions are not identical. Check Sector A, B and C individually below.',
'@

if (-not $content.Contains($old)) { throw "EN body block bulunamadi." }
$content = $content.Replace($old, $new)

$old = "    canceled: 'CANCELED', suitable: 'CLEARED', pending: 'PENDING', mixed: 'MIXED',"
$new = "    canceled: 'CANCELED', suitable: 'CLEARED', completed: 'COMPLETED', pending: 'PENDING', mixed: 'MIXED',"
if (-not $content.Contains($old)) { throw "EN label block bulunamadi." }
$content = $content.Replace($old, $new)

# ------------------------------------------------------------
# 2) TR copy
# ------------------------------------------------------------
$old = "    canceledTitle: 'Balon Uçuşları İptal', suitableTitle: 'Balon Uçuşları Uygun', partialTitle: 'Sektör Kararları Farklı', pendingTitle: 'Resmi Karar Henüz Yayınlanmadı',"
$new = "    canceledTitle: 'Balon Uçuşları İptal', suitableTitle: 'Balon Uçuşları Uygun', completedTitle: 'Tamamlandı: Sabah uçuşları tamamlandı.', canceledAtLaunchTitle: 'Bugünkü Uçuşlar Kalkış Alanında İptal Edildi', partialTitle: 'Sektör Kararları Farklı', pendingTitle: 'Resmi Karar Henüz Yayınlanmadı',"
if (-not $content.Contains($old)) { throw "TR title block bulunamadi." }
$content = $content.Replace($old, $new)

$old = @'
    canceledBody: 'Resmi meteorolojik karar, belirtilen geçerli saat aralığında balon kalkışına izin vermemektedir.',
    suitableBody: 'Resmi sektör kararı belirtilen saat aralığında balon operasyonları için uygundur. Nihai operasyon kararı pilot ve işletmenin emniyet kontrollerine bağlıdır.',
    partialBody: 'Resmi sektör kararları aynı değildir. Aşağıdan Sektör A, B ve C durumlarını ayrı ayrı kontrol edin.',
'@

$new = @'
    canceledBody: 'Resmi meteorolojik karar, belirtilen geçerli saat aralığında balon kalkışına izin vermemektedir.',
    suitableBody: 'Resmi sektör kararı belirtilen saat aralığında balon operasyonları için uygundur. Nihai operasyon kararı pilot ve işletmenin emniyet kontrollerine bağlıdır.',
    completedBody: 'Bugünkü sabah uçuşları tamamlanmıştır. Günün geri kalanında yeni uçuş yapılmayacaktır. Lütfen yarınki güncellemeyi takip ediniz.',
    canceledAtLaunchBody: 'Operasyon kalkış alanındaki karar aşamasına kadar devam etmiş ancak nihai uçuş uygunluğu verilmemiştir. Bugünkü balon uçuşları iptal edilmiştir.',
    partialBody: 'Resmi sektör kararları aynı değildir. Aşağıdan Sektör A, B ve C durumlarını ayrı ayrı kontrol edin.',
'@

if (-not $content.Contains($old)) { throw "TR body block bulunamadi." }
$content = $content.Replace($old, $new)

$old = "    canceled: 'İPTAL', suitable: 'UYGUN', pending: 'BEKLİYOR', mixed: 'KARIŞIK',"
$new = "    canceled: 'İPTAL', suitable: 'UYGUN', completed: 'TAMAMLANDI', pending: 'BEKLİYOR', mixed: 'KARIŞIK',"
if (-not $content.Contains($old)) { throw "TR label block bulunamadi." }
$content = $content.Replace($old, $new)

# ------------------------------------------------------------
# 3) ES copy
# ------------------------------------------------------------
$old = "    canceledTitle: 'Vuelos en Globo Cancelados', suitableTitle: 'Vuelos en Globo Aptos', partialTitle: 'Decisiones Mixtas por Sector', pendingTitle: 'La Decisión Oficial Aún No Ha Sido Publicada',"
$new = "    canceledTitle: 'Vuelos en Globo Cancelados', suitableTitle: 'Vuelos en Globo Aptos', completedTitle: 'Completado: Los vuelos de la mañana han finalizado.', canceledAtLaunchTitle: 'Vuelos Cancelados Hoy en el Área de Despegue', partialTitle: 'Decisiones Mixtas por Sector', pendingTitle: 'La Decisión Oficial Aún No Ha Sido Publicada',"
if (-not $content.Contains($old)) { throw "ES title block bulunamadi." }
$content = $content.Replace($old, $new)

$old = @'
    canceledBody: 'La decisión meteorológica oficial no permite el despegue de globos durante el periodo válido indicado.',
    suitableBody: 'La decisión oficial es apta para operaciones de globos durante el periodo indicado. La decisión final depende de los controles de seguridad del piloto y operador.',
    partialBody: 'Las decisiones oficiales no son iguales en todos los sectores. Revise los sectores A, B y C.', pendingBody: 'Aún no se ha publicado una decisión oficial válida para esta fecha.',
'@

$new = @'
    canceledBody: 'La decisión meteorológica oficial no permite el despegue de globos durante el periodo válido indicado.',
    suitableBody: 'La decisión oficial es apta para operaciones de globos durante el periodo indicado. La decisión final depende de los controles de seguridad del piloto y operador.',
    completedBody: 'Los vuelos de esta mañana han finalizado. No se realizarán más vuelos en globo durante el resto del día. Consulte la actualización de mañana.',
    canceledAtLaunchBody: 'La operación llegó a la fase de decisión en el área de despegue, pero no se concedió la autorización final. Los vuelos en globo quedan cancelados por hoy.',
    partialBody: 'Las decisiones oficiales no son iguales en todos los sectores. Revise los sectores A, B y C.', pendingBody: 'Aún no se ha publicado una decisión oficial válida para esta fecha.',
'@

if (-not $content.Contains($old)) { throw "ES body block bulunamadi." }
$content = $content.Replace($old, $new)

$old = "sectorC: 'Ortahisar y Ürgüp', canceled: 'CANCELADO', suitable: 'APTO', pending: 'PENDIENTE', mixed: 'MIXTO',"
$new = "sectorC: 'Ortahisar y Ürgüp', canceled: 'CANCELADO', suitable: 'APTO', completed: 'COMPLETADO', pending: 'PENDIENTE', mixed: 'MIXTO',"
if (-not $content.Contains($old)) { throw "ES label block bulunamadi." }
$content = $content.Replace($old, $new)

# ------------------------------------------------------------
# 4) Add daily transition history helpers after currentData
# ------------------------------------------------------------
$old = @'
  let currentData = null;

  function pad(n) { return String(n).padStart(2, '0'); }
'@

$new = @'
  let currentData = null;

  const STATUS_HISTORY_KEY = 'tbc-flight-status-history-v2';

  function readStatusHistory() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STATUS_HISTORY_KEY) || '{}');
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  function writeStatusHistory(history) {
    try {
      localStorage.setItem(STATUS_HISTORY_KEY, JSON.stringify(history));
    } catch {}
  }

  function getDayHistory(dateKey) {
    const history = readStatusHistory();
    return history[dateKey] || { hadGreen:false, hadYellow:false, lastStatus:'' };
  }

  function rememberDayStatus(dateKey, status, hasOfficialRange) {
    if (!dateKey) return getDayHistory(dateKey);

    const history = readStatusHistory();
    const item = history[dateKey] || { hadGreen:false, hadYellow:false, lastStatus:'' };

    if (status === 'FLOWN') item.hadGreen = true;

    // The current API represents a non-red/non-green official waiting decision
    // as PENDING. Only count it as YELLOW when there is an official valid range.
    if (status === 'PENDING' && hasOfficialRange) item.hadYellow = true;

    item.lastStatus = status;
    item.updatedAt = new Date().toISOString();
    history[dateKey] = item;

    // Keep only recent daily records.
    const keys = Object.keys(history).sort().reverse();
    for (const key of keys.slice(14)) delete history[key];

    writeStatusHistory(history);
    return item;
  }

  function pad(n) { return String(n).padStart(2, '0'); }
'@

if (-not $content.Contains($old)) { throw "History insertion point bulunamadi." }
$content = $content.Replace($old, $new)

# ------------------------------------------------------------
# 5) Add COMPLETED pseudo status support
# ------------------------------------------------------------
$old = @'
  function statusLabel(status) {
    if (status === 'CANCELED') return t.canceled;
    if (status === 'FLOWN') return t.suitable;
    if (status === 'PARTIAL') return t.mixed;
    return t.pending;
  }
  function statusClass(status) {
    if (status === 'CANCELED') return 'is-canceled';
    if (status === 'FLOWN') return 'is-suitable';
    if (status === 'PARTIAL') return 'is-partial';
    return 'is-pending';
  }
  function statusTitle(status) {
    if (status === 'CANCELED') return t.canceledTitle;
    if (status === 'FLOWN') return t.suitableTitle;
    if (status === 'PARTIAL') return t.partialTitle;
    return t.pendingTitle;
  }
  function statusBody(status) {
    if (status === 'CANCELED') return t.canceledBody;
    if (status === 'FLOWN') return t.suitableBody;
    if (status === 'PARTIAL') return t.partialBody;
    return t.pendingBody;
  }
'@

$new = @'
  function statusLabel(status) {
    if (status === 'COMPLETED') return t.completed;
    if (status === 'CANCELED') return t.canceled;
    if (status === 'FLOWN') return t.suitable;
    if (status === 'PARTIAL') return t.mixed;
    return t.pending;
  }
  function statusClass(status) {
    if (status === 'COMPLETED') return 'is-suitable';
    if (status === 'CANCELED') return 'is-canceled';
    if (status === 'FLOWN') return 'is-suitable';
    if (status === 'PARTIAL') return 'is-partial';
    return 'is-pending';
  }
  function statusTitle(status, variant = '') {
    if (status === 'COMPLETED') return t.completedTitle;
    if (status === 'CANCELED' && variant === 'launch-site') return t.canceledAtLaunchTitle;
    if (status === 'CANCELED') return t.canceledTitle;
    if (status === 'FLOWN') return t.suitableTitle;
    if (status === 'PARTIAL') return t.partialTitle;
    return t.pendingTitle;
  }
  function statusBody(status, variant = '') {
    if (status === 'COMPLETED') return t.completedBody;
    if (status === 'CANCELED' && variant === 'launch-site') return t.canceledAtLaunchBody;
    if (status === 'CANCELED') return t.canceledBody;
    if (status === 'FLOWN') return t.suitableBody;
    if (status === 'PARTIAL') return t.partialBody;
    return t.pendingBody;
  }
'@

if (-not $content.Contains($old)) { throw "Status helper block bulunamadi." }
$content = $content.Replace($old, $new)

# ------------------------------------------------------------
# 6) alertCard variant support
# ------------------------------------------------------------
$old = @'
  function alertCard(date, status, range, isToday, update) {
    const times=parseOfficialTime(range);
    const tag=isToday?t.today:t.tomorrow;
    const cls=statusClass(status);
    const icon=status==='CANCELED'?'✕':status==='FLOWN'?'✓':status==='PARTIAL'?'!':'⌛';
    return `<article class="alert-card ${cls}">
      <div class="alert-top"><span class="date-tag">${tag} (${displayDate(date)})</span><span class="state-text">● ${status==='PENDING'?t.decisionPending:`${t.liveStatus}: ${statusLabel(status)}`}</span></div>
      <div class="alert-title"><span class="alert-icon">${icon}</span><strong>${statusTitle(status)}</strong></div>
      <p>${statusBody(status)}</p>
'@

$new = @'
  function alertCard(date, status, range, isToday, update, variant = '') {
    const times=parseOfficialTime(range);
    const tag=isToday?t.today:t.tomorrow;
    const cls=statusClass(status);
    const icon=status==='CANCELED'?'✕':status==='COMPLETED'||status==='FLOWN'?'✓':status==='PARTIAL'?'!':'⌛';
    return `<article class="alert-card ${cls}">
      <div class="alert-top"><span class="date-tag">${tag} (${displayDate(date)})</span><span class="state-text">● ${status==='PENDING'?t.decisionPending:`${t.liveStatus}: ${statusLabel(status)}`}</span></div>
      <div class="alert-title"><span class="alert-icon">${icon}</span><strong>${statusTitle(status, variant)}</strong></div>
      <p>${statusBody(status, variant)}</p>
'@

if (-not $content.Contains($old)) { throw "alertCard block bulunamadi." }
$content = $content.Replace($old, $new)

# ------------------------------------------------------------
# 7) Core transition logic in renderAlerts
# ------------------------------------------------------------
$old = @'
  function renderAlerts(data) {
    const today=getTurkeyDate(0), tomorrow=getTurkeyDate(1);
    const validISO=validDateFromRange(data.validDateRange);
    const todayISO=isoDate(today), tomorrowISO=isoDate(tomorrow);
    let todayStatus='PENDING', tomorrowStatus='PENDING';
    let todayRange='', tomorrowRange='';
    let todayUpdate='', tomorrowUpdate='';
    if(validISO===todayISO){todayStatus=data.status;todayRange=data.validDateRange;todayUpdate=data.lastUpdate;}
    else if(validISO===tomorrowISO){tomorrowStatus=data.status;tomorrowRange=data.validDateRange;tomorrowUpdate=data.lastUpdate;}
    else if(!validISO){todayStatus=data.status;todayRange=data.validDateRange;todayUpdate=data.lastUpdate;}
    const el=document.getElementById('dynamic-alerts-container');
    if(el) el.innerHTML=alertCard(today,todayStatus,todayRange,true,todayUpdate)+alertCard(tomorrow,tomorrowStatus,tomorrowRange,false,tomorrowUpdate);
  }
'@

$new = @'
  function renderAlerts(data) {
    const today=getTurkeyDate(0), tomorrow=getTurkeyDate(1);
    const validISO=validDateFromRange(data.validDateRange);
    const todayISO=isoDate(today), tomorrowISO=isoDate(tomorrow);
    let todayStatus='PENDING', tomorrowStatus='PENDING';
    let todayRange='', tomorrowRange='';
    let todayUpdate='', tomorrowUpdate='';
    let todayVariant='';

    if(validISO===todayISO){
      todayStatus=data.status;
      todayRange=data.validDateRange;
      todayUpdate=data.lastUpdate;
    }
    else if(validISO===tomorrowISO){
      tomorrowStatus=data.status;
      tomorrowRange=data.validDateRange;
      tomorrowUpdate=data.lastUpdate;
    }
    else if(!validISO){
      todayStatus=data.status;
      todayRange=data.validDateRange;
      todayUpdate=data.lastUpdate;
    }

    // Daily flag-transition rules:
    // GREEN -> RED                 = morning flights COMPLETED
    // YELLOW -> GREEN -> RED       = morning flights COMPLETED
    // YELLOW -> RED (no GREEN)     = canceled at launch site
    //
    // IMPORTANT: read history BEFORE remembering the current RED,
    // so the decision is based on statuses seen earlier today.
    const previous = getDayHistory(todayISO);

    if (todayStatus === 'CANCELED') {
      if (previous.hadGreen) {
        todayStatus = 'COMPLETED';
      } else if (previous.hadYellow) {
        todayVariant = 'launch-site';
      }
    }

    // Store the raw official status, not the display pseudo-status.
    const rawTodayStatus =
      validISO===todayISO || !validISO
        ? data.status
        : 'PENDING';

    rememberDayStatus(todayISO, rawTodayStatus, Boolean(todayRange));

    const el=document.getElementById('dynamic-alerts-container');
    if(el) {
      el.innerHTML=
        alertCard(today,todayStatus,todayRange,true,todayUpdate,todayVariant)+
        alertCard(tomorrow,tomorrowStatus,tomorrowRange,false,tomorrowUpdate);
    }
  }
'@

if (-not $content.Contains($old)) { throw "renderAlerts block bulunamadi." }
$content = $content.Replace($old, $new)

# Save UTF-8 without BOM
[System.IO.File]::WriteAllText(
  (Resolve-Path $path),
  $content,
  (New-Object System.Text.UTF8Encoding($false))
)

Write-Host ""
Write-Host "Flight Status transition logic updated for EN / TR / ES." -ForegroundColor Green
Write-Host ""
Write-Host "Rules:" -ForegroundColor Cyan
Write-Host "GREEN -> RED = COMPLETED"
Write-Host "YELLOW -> GREEN -> RED = COMPLETED"
Write-Host "YELLOW -> RED = CANCELED AT LAUNCH SITE"
Write-Host "Direct RED = normal cancellation"
Write-Host ""
Write-Host "Next: npm run build" -ForegroundColor Yellow
