// YnBeweging voor Clubs — demo (static SPA)
// Hash-routing + localStorage state. Geen build, geen backend.
// Doel: in 10 minuten het idee tastbaar maken: club-kant + achterkant (monitoring).

const APP_KEY = "yb_club_demo_v1";

const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

function nowISO(){ return new Date().toISOString(); }

async function loadSeed(){
  const res = await fetch("./data/seed.json", {cache:"no-store"});
  if(!res.ok) throw new Error("seed.json niet gevonden");
  return await res.json();
}

function toast(msg){
  let el = $(".toast");
  if(!el){
    el = document.createElement("div");
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add("toast--show");
  window.clearTimeout(toast._t);
  toast._t = window.setTimeout(()=>el.classList.remove("toast--show"), 1800);
}

function money(n){
  return new Intl.NumberFormat("nl-NL").format(n);
}

function minutesToText(min){
  if(min >= 60){
    const h = Math.floor(min/60);
    const r = min % 60;
    return r ? `${h}u ${r}m` : `${h}u`;
  }
  return `${min} min`;
}

function getState(){
  const raw = localStorage.getItem(APP_KEY);
  if(!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function setState(state){
  localStorage.setItem(APP_KEY, JSON.stringify(state));
}

function resetState(){
  localStorage.removeItem(APP_KEY);
}

function ensureDefaults(state){
  state.requests ??= [];
  state.evaluations ??= [];
  state.audit ??= [];
  state.presenter ??= { step: 0 };
  return state;
}

function audit(state, action, details={}){
  state.audit.push({
    ts: nowISO(),
    action,
    ...details
  });
}

function uid(prefix="id"){
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function route(){
  const h = location.hash.replace(/^#/, "") || "/";
  const [path, query] = h.split("?");
  const params = new URLSearchParams(query || "");
  return { path, params };
}

function navigate(path){
  location.hash = `#${path}`;
}

function setActiveNav(){
  const {path} = route();
  $$(".topnav .navlink").forEach(a=>{
    const href = a.getAttribute("href")?.replace(/^#/, "") || "";
    const active = (href === path) || (href === "/" && path === "/");
    a.style.opacity = active ? "1" : "0.85";
  });
}

function appRoot(){ return $("#app"); }

function iconDot(color){
  return `<span style="display:inline-block;width:8px;height:8px;border-radius:999px;background:${color};"></span>`;
}

function statusLabel(s){
  const map = {
    "Nieuw": ["Nieuw", "#52E8E8"],
    "In behandeling": ["In behandeling", "#8a94ab"],
    "Gepland": ["Gepland", "#212945"],
    "Afgerond": ["Afgerond", "#0a7a4a"],
    "Geannuleerd": ["Geannuleerd", "#b4382b"]
  };
  const [label, color] = map[s] || [s, "#8a94ab"];
  return `<span class="pill">${iconDot(color)} ${label}</span>`;
}

function pct(n){
  return `${Math.round(n*100)}%`;
}

/* -------------------- Views -------------------- */

function viewHome(state){
  const club = state.seed.club;
  return `
    <section class="hero">
      <h1>Interactieve demo: de club als gebruiker</h1>
      <p>
        Deze demo laat het idee zien uit de pitch: verenigingen kunnen gericht aanbod vinden, kiezen, afnemen en terugkoppelen — 
        terwijl we aan de achterkant realtime inzicht krijgen in gebruik, voortgang en ‘money follows action’.
      </p>
      <div class="badges">
        <span class="badge">Voorverkenning (geen commitment)</span>
        <span class="badge">Kleine MVP-logica</span>
        <span class="badge">Club + achterkant</span>
      </div>
      <div class="hero__actions">
        <button class="btn btn--accent" data-go="/presenter">Start presentatie-modus</button>
        <button class="btn btn--primary" data-go="/club">Open club-kant</button>
        <button class="btn" data-go="/admin">Open achterkant</button>
      </div>
    </section>

    <div class="grid grid--2" style="margin-top:16px">
      <article class="card">
        <div class="card__pad">
          <h2 class="card__title">Demo-scenario</h2>
          <div class="card__muted">Je speelt met één club en een klein aanbod.</div>
          <hr class="hr" />
          <div class="row">
            <div>
              <div class="label">Club</div>
              <div style="font-weight:900;color:var(--brand)">${club.name}</div>
              <div class="card__muted">${club.type} • ${club.municipality}</div>
            </div>
            <div>
              <div class="label">Wallet (tegoed)</div>
              <div style="font-weight:900;color:var(--brand)">${money(state.wallet.credits)} credits</div>
              <div class="card__muted">demo: ‘money follows action’</div>
            </div>
          </div>
          <hr class="hr" />
          <div class="chips" style="gap:10px">
            <button class="chip" data-go="/club" aria-pressed="false">1) Zoek aanbod</button>
            <button class="chip" data-go="/club?tab=aanvragen" aria-pressed="false">2) Doe een aanvraag</button>
            <button class="chip" data-go="/club?tab=evalueren" aria-pressed="false">3) Rond af + evalueer</button>
            <button class="chip" data-go="/admin" aria-pressed="false">4) Bekijk inzicht</button>
          </div>
        </div>
      </article>

      <aside class="card">
        <div class="card__pad">
          <h2 class="card__title">Wat je hier kunt laten zien</h2>
          <div class="card__muted">Perfect om de ontwikkelaar “aan het denken” te zetten.</div>
          <hr class="hr" />
          <ul style="margin:0;padding-left:18px;color:var(--muted);line-height:1.45">
            <li>Club-accounts & rollen (bestuurder/penningmeester/trainer)</li>
            <li>Aanbodcatalogus met filters (look & feel geïnspireerd op YnBeweging activiteiten)</li>
            <li>Flow: vinden → kiezen → aanvraag → status → afronden → evalueren</li>
            <li>Wallet/tegoed: credits koppelen aan afname</li>
            <li>Achterkant: KPI’s, route-populariteit, ratings, export</li>
          </ul>
        </div>
      </aside>
    </div>
  `;
}

function viewClub(state, params){
  const tab = params.get("tab") || "catalogus";

  const filters = state.ui.filters ?? {
    q:"",
    route:"",
    type:"",
    provider:"",
    level:""
  };

  const offers = state.seed.offers.slice().sort((a,b)=>a.title.localeCompare(b.title));

  const routes = ["", ...state.seed.routes.map(r=>r.name)];
  const types = ["", ...Array.from(new Set(state.seed.offers.map(o=>o.type)))];
  const providers = ["", ...Array.from(new Set(state.seed.offers.map(o=>o.provider)))];
  const levels = ["", ...Array.from(new Set(state.seed.offers.map(o=>o.level)))];

  function matches(o){
    const q = (filters.q || "").toLowerCase();
    if(q && !(o.title.toLowerCase().includes(q) || (o.summary||"").toLowerCase().includes(q))) return false;
    if(filters.route && o.route !== filters.route) return false;
    if(filters.type && o.type !== filters.type) return false;
    if(filters.provider && o.provider !== filters.provider) return false;
    if(filters.level && o.level !== filters.level) return false;
    return true;
  }

  const filtered = offers.filter(matches);

  const club = state.seed.club;

  const requests = state.requests.slice().sort((a,b)=>b.createdAt.localeCompare(a.createdAt));

  const openReqs = requests.filter(r=>!["Afgerond","Geannuleerd"].includes(r.status));
  const doneReqs = requests.filter(r=>r.status==="Afgerond");

  const tabBtn = (id, label)=>`
    <button class="chip" data-tab="${id}" aria-pressed="${tab===id ? "true":"false"}">${label}</button>
  `;

  const myWallet = `
    <div class="kpi">
      <div class="kpi__label">Wallet (credits)</div>
      <div class="kpi__value">${money(state.wallet.credits)}</div>
      <div class="kpi__hint">Tegoed gekoppeld aan afname</div>
    </div>
  `;

  const roles = club.roles.map(r=>`<span class="pill">${r.role}: ${r.name}</span>`).join(" ");

  return `
    <section class="card">
      <div class="card__pad">
        <div class="row" style="align-items:flex-end">
          <div>
            <h2 class="card__title" style="margin-bottom:4px">${club.name}</h2>
            <div class="card__muted">${club.type} • ${club.municipality}</div>
            <div class="badges" style="margin-top:10px">${roles}</div>
          </div>
          <div style="min-width:260px">${myWallet}</div>
        </div>

        <hr class="hr" />

        <div class="chips">
          ${tabBtn("catalogus","Aanbod (zoeken)")}
          ${tabBtn("aanvragen",`Mijn aanvragen (${openReqs.length})`)}
          ${tabBtn("evalueren",`Evaluaties (${state.evaluations.length})`)}
        </div>
      </div>
    </section>

    <div style="height:12px"></div>

    ${tab==="catalogus" ? viewCatalogus(state, filters, routes, types, providers, levels, filtered) : ""}
    ${tab==="aanvragen" ? viewAanvragen(state, openReqs, doneReqs) : ""}
    ${tab==="evalueren" ? viewEvaluaties(state) : ""}
  `;
}

function viewCatalogus(state, filters, routes, types, providers, levels, offers){
  const routeOptions = routes.map(r=>`<option value="${escapeHtml(r)}"${filters.route===r ? " selected":""}>${r || "Alle routes"}</option>`).join("");
  const typeOptions = types.map(t=>`<option value="${escapeHtml(t)}"${filters.type===t ? " selected":""}>${t || "Alle types"}</option>`).join("");
  const providerOptions = providers.map(p=>`<option value="${escapeHtml(p)}"${filters.provider===p ? " selected":""}>${p || "Alle aanbieders"}</option>`).join("");
  const levelOptions = levels.map(l=>`<option value="${escapeHtml(l)}"${filters.level===l ? " selected":""}>${l || "Alle niveaus"}</option>`).join("");

  const cards = offers.map(o=>{
    return `
      <article class="offer" data-offer="${o.id}">
        <div class="offer__img" aria-hidden="true"></div>
        <div class="offer__body">
          <h3 class="offer__title">${escapeHtml(o.title)}</h3>
          <div class="offer__meta">
            <span class="pill">${o.route}</span>
            <span class="pill">${o.type}</span>
            <span class="pill">${minutesToText(o.durationMin)}</span>
            <span class="pill">${o.level}</span>
          </div>
          <div class="card__muted">${escapeHtml(o.summary || "")}</div>
          <div class="offer__actions">
            <button class="btn btn--primary" data-action="request" data-id="${o.id}">Aanvragen</button>
            <button class="btn" data-action="details" data-id="${o.id}">Details</button>
            <span class="pill" title="Demo-tegoed">💳 ${money(o.priceCredits)} credits</span>
          </div>
        </div>
      </article>
    `;
  }).join("");

  return `
    <section class="layout">
      <aside class="panel">
        <div class="panel__head">
          <h2>Filters</h2>
          <button class="btn btn--ghost" data-action="clearFilters" type="button">Reset</button>
        </div>
        <div class="panel__body">
          <div class="field">
            <div class="label">Zoek</div>
            <input class="input" id="q" value="${escapeHtml(filters.q||"")}" placeholder="Bijv. VCP, vrijwilligers, quickscan…" />
          </div>
          <div class="field">
            <div class="label">Route</div>
            <select id="routeSel">${routeOptions}</select>
          </div>
          <div class="field">
            <div class="label">Type</div>
            <select id="typeSel">${typeOptions}</select>
          </div>
          <div class="field">
            <div class="label">Aanbieder</div>
            <select id="providerSel">${providerOptions}</select>
          </div>
          <div class="field">
            <div class="label">Niveau</div>
            <select id="levelSel">${levelOptions}</select>
          </div>
          <button class="btn btn--accent" data-action="applyFilters" type="button" style="width:100%">Toepassen</button>

          <hr class="hr" />
          <div class="card__muted">
            <strong>Pitch-haakje:</strong> dit is dezelfde “vinden”-ervaring als activiteiten, maar dan met clubroutes, tegoeden en opvolging.
          </div>
        </div>
      </aside>

      <section>
        <div class="panel">
          <div class="panel__head">
            <h2>Aanbod (${offers.length})</h2>
            <div class="card__muted">Klik “Aanvragen” om een club-flow te starten.</div>
          </div>
          <div class="panel__body">
            <div class="cards">${cards || `<div class="card__muted">Geen resultaten. Probeer minder filters.</div>`}</div>
          </div>
        </div>
      </section>
    </section>

    ${modalShell()}
  `;
}

function viewAanvragen(state, openReqs, doneReqs){
  const rows = (arr)=>arr.map(r=>{
    const offer = state.seed.offers.find(o=>o.id===r.offerId);
    const title = offer?.title || r.offerId;
    const routeName = offer?.route || "—";
    return `
      <tr>
        <td>${new Date(r.createdAt).toLocaleString("nl-NL", {dateStyle:"medium", timeStyle:"short"})}</td>
        <td><strong>${escapeHtml(title)}</strong><div class="card__muted">${routeName}</div></td>
        <td>${statusLabel(r.status)}</td>
        <td>${money(r.priceCredits)} cr</td>
        <td>
          ${r.status==="Nieuw" ? `<button class="btn btn--primary" data-action="setStatus" data-id="${r.id}" data-status="In behandeling">In behandeling</button>` : ""}
          ${["Nieuw","In behandeling"].includes(r.status) ? `<button class="btn" data-action="setStatus" data-id="${r.id}" data-status="Gepland">Plan (commit)</button>` : ""}
          ${r.status==="Gepland" ? `<button class="btn btn--accent" data-action="setStatus" data-id="${r.id}" data-status="Afgerond">Afronden</button>` : ""}
          ${r.status!=="Geannuleerd" && r.status!=="Afgerond" ? `<button class="btn btn--ghost" data-action="setStatus" data-id="${r.id}" data-status="Geannuleerd">Annuleer</button>` : ""}
        </td>
      </tr>
    `;
  }).join("");

  return `
    <section class="panel">
      <div class="panel__head">
        <h2>Mijn aanvragen</h2>
        <div class="card__muted">Status-flow + wallet (money follows action)</div>
      </div>
      <div class="panel__body">
        <div class="kpis" style="margin-bottom:12px">
          <div class="kpi"><div class="kpi__label">Open aanvragen</div><div class="kpi__value">${openReqs.length}</div><div class="kpi__hint">Nieuw / in behandeling / gepland</div></div>
          <div class="kpi"><div class="kpi__label">Afgerond</div><div class="kpi__value">${doneReqs.length}</div><div class="kpi__hint">Kan geëvalueerd worden</div></div>
          <div class="kpi"><div class="kpi__label">Credits besteed</div><div class="kpi__value">${money(state.wallet.spent)}</div><div class="kpi__hint">Commit bij ‘Gepland’</div></div>
          <div class="kpi"><div class="kpi__label">Credits over</div><div class="kpi__value">${money(state.wallet.credits)}</div><div class="kpi__hint">Wallet saldo</div></div>
        </div>

        <table class="table">
          <thead><tr><th>Datum</th><th>Aanbod</th><th>Status</th><th>Credits</th><th>Acties</th></tr></thead>
          <tbody>${rows(openReqs.concat(doneReqs)) || `<tr><td colspan="5" class="card__muted">Nog geen aanvragen. Ga naar Aanbod en klik “Aanvragen”.</td></tr>`}</tbody>
        </table>

        <hr class="hr" />
        <div class="card__muted">
          <strong>Let op (pitch):</strong> in een echte versie kan “Plan” gekoppeld worden aan een boeking/afspraak, en kan kredietreservering/afschrijving anders ingericht worden.
        </div>
      </div>
    </section>
  `;
}

function viewEvaluaties(state){
  const done = state.requests.filter(r=>r.status==="Afgerond");
  const evalByReq = new Map(state.evaluations.map(e=>[e.requestId, e]));
  const items = done.map(r=>{
    const offer = state.seed.offers.find(o=>o.id===r.offerId);
    const title = offer?.title || "Aanbod";
    const existing = evalByReq.get(r.id);
    return `
      <div class="card" style="margin-bottom:12px">
        <div class="card__pad">
          <div class="row" style="align-items:flex-start">
            <div style="flex:1.2">
              <h3 class="card__title" style="margin:0 0 6px 0">${escapeHtml(title)}</h3>
              <div class="card__muted">${offer?.route || ""} • afgerond op ${new Date(r.updatedAt).toLocaleDateString("nl-NL")}</div>
            </div>
            <div style="flex:.8; text-align:right">
              ${existing ? `<span class="pill">⭐ ${existing.rating}/5</span>` : `<span class="pill">Nog niet geëvalueerd</span>`}
            </div>
          </div>

          <hr class="hr" />

          ${existing ? `
            <div class="card__muted"><strong>Opmerking</strong>: ${escapeHtml(existing.note || "—")}</div>
          ` : `
            <form data-action="submitEval" data-id="${r.id}">
              <div class="row">
                <div class="field">
                  <div class="label">Rating</div>
                  <select name="rating" required>
                    <option value="">Kies…</option>
                    <option>5</option><option>4</option><option>3</option><option>2</option><option>1</option>
                  </select>
                </div>
                <div class="field">
                  <div class="label">Kort commentaar</div>
                  <input class="input" name="note" placeholder="Wat werkte goed? Wat is een tip?" />
                </div>
              </div>
              <button class="btn btn--accent" type="submit">Opslaan</button>
            </form>
          `}
        </div>
      </div>
    `;
  }).join("");

  return `
    <section class="panel">
      <div class="panel__head">
        <h2>Evaluaties</h2>
        <div class="card__muted">Kwaliteitsborging + leren wat werkt</div>
      </div>
      <div class="panel__body">
        ${items || `<div class="card__muted">Nog geen afgeronde aanvragen. Rond iets af in “Mijn aanvragen”.</div>`}
      </div>
    </section>
  `;
}

function viewAdmin(state){
  const offers = state.seed.offers;
  const requests = state.requests;
  const evals = state.evaluations;

  const total = requests.length;
  const planned = requests.filter(r=>r.status==="Gepland" || r.status==="Afgerond").length;
  const done = requests.filter(r=>r.status==="Afgerond").length;
  const ratingAvg = evals.length ? (evals.reduce((s,e)=>s+Number(e.rating||0),0) / evals.length) : 0;

  const byRoute = new Map();
  for(const r of requests){
    const offer = offers.find(o=>o.id===r.offerId);
    const rn = offer?.route || "Onbekend";
    byRoute.set(rn, (byRoute.get(rn)||0)+1);
  }
  const routeRows = Array.from(byRoute.entries()).sort((a,b)=>b[1]-a[1]);

  const conversion = total ? planned/total : 0;
  const completion = planned ? done/planned : 0;

  const recent = requests
    .slice()
    .sort((a,b)=>b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6)
    .map(r=>{
      const offer = offers.find(o=>o.id===r.offerId);
      return `
        <tr>
          <td>${new Date(r.createdAt).toLocaleString("nl-NL", {dateStyle:"medium", timeStyle:"short"})}</td>
          <td><strong>${escapeHtml(offer?.title || r.offerId)}</strong><div class="card__muted">${offer?.route||"—"}</div></td>
          <td>${statusLabel(r.status)}</td>
          <td>${money(r.priceCredits)} cr</td>
        </tr>
      `;
    }).join("");

  const bars = routeRows.map(([name,count])=>{
    const max = Math.max(...routeRows.map(r=>r[1]), 1);
    const w = Math.round((count/max)*100);
    return `
      <div style="display:grid; grid-template-columns: 180px 1fr 40px; gap:10px; align-items:center; margin:8px 0">
        <div class="card__muted" style="font-weight:800;color:var(--brand)">${escapeHtml(name)}</div>
        <div style="height:10px;border-radius:999px;background:var(--border);overflow:hidden">
          <div style="height:100%;width:${w}%;background:linear-gradient(90deg,var(--accent), rgba(33,41,69,.9));"></div>
        </div>
        <div class="card__muted" style="text-align:right">${count}</div>
      </div>
    `;
  }).join("");

  return `
    <section class="hero">
      <h1>Achterkant: monitoring & sturing</h1>
      <p>
        Dit is de “business case” in beeld: realtime inzicht in gebruik, voortgang, uitval en kwaliteit — plus een eenvoudige wallet/tegoed-logica.
      </p>
      <div class="hero__actions">
        <button class="btn btn--accent" data-go="/club">Terug naar club-kant</button>
        <button class="btn btn--primary" data-action="exportJson">Exporteer demo-data (JSON)</button>
      </div>
    </section>

    <div style="height:14px"></div>

    <section class="kpis">
      <div class="kpi"><div class="kpi__label">Aanvragen</div><div class="kpi__value">${total}</div><div class="kpi__hint">Totaal gestart</div></div>
      <div class="kpi"><div class="kpi__label">Conversie</div><div class="kpi__value">${pct(conversion)}</div><div class="kpi__hint">→ gepland/afgerond</div></div>
      <div class="kpi"><div class="kpi__label">Afronding</div><div class="kpi__value">${pct(completion)}</div><div class="kpi__hint">Afgerond / gepland</div></div>
      <div class="kpi"><div class="kpi__label">Gem. rating</div><div class="kpi__value">${ratingAvg ? ratingAvg.toFixed(1) : "—"}</div><div class="kpi__hint">${evals.length} evaluatie(s)</div></div>
    </section>

    <div style="height:14px"></div>

    <div class="grid grid--2">
      <section class="panel">
        <div class="panel__head">
          <h2>Populaire routes</h2>
          <div class="card__muted">Waar zit vraag/actie?</div>
        </div>
        <div class="panel__body">
          ${bars || `<div class="card__muted">Nog geen aanvragen. Start een aanvraag vanuit de club-kant.</div>`}
          <hr class="hr" />
          <div class="card__muted">
            <strong>Pitch-haakje:</strong> hier kun je straks subsidies/tegoeden op richten: “money follows action” per route/doel.
          </div>
        </div>
      </section>

      <section class="panel">
        <div class="panel__head">
          <h2>Recente activiteit</h2>
          <div class="card__muted">Workflow-log (light)</div>
        </div>
        <div class="panel__body">
          <table class="table">
            <thead><tr><th>Datum</th><th>Aanbod</th><th>Status</th><th>Credits</th></tr></thead>
            <tbody>${recent || `<tr><td colspan="4" class="card__muted">Nog geen activiteit.</td></tr>`}</tbody>
          </table>
        </div>
      </section>
    </div>

    <div style="height:14px"></div>

    <section class="panel">
      <div class="panel__head">
        <h2>Audit (voor demo)</h2>
        <div class="card__muted">Laat zien dat “sturing” technisch te loggen is</div>
      </div>
      <div class="panel__body">
        ${renderAudit(state)}
      </div>
    </section>
  `;
}

function renderAudit(state){
  const rows = state.audit.slice().reverse().slice(0, 10).map(a=>{
    return `<tr>
      <td>${new Date(a.ts).toLocaleString("nl-NL", {dateStyle:"medium", timeStyle:"short"})}</td>
      <td><strong>${escapeHtml(a.action)}</strong></td>
      <td class="card__muted">${escapeHtml(JSON.stringify({...a, ts: undefined}))}</td>
    </tr>`;
  }).join("");

  return `
    <table class="table">
      <thead><tr><th>Datum</th><th>Actie</th><th>Details</th></tr></thead>
      <tbody>${rows || `<tr><td colspan="3" class="card__muted">Nog geen acties gelogd.</td></tr>`}</tbody>
    </table>
  `;
}

function viewPresenter(state){
  const steps = [
    {title:"Start (context)", go:"/"},
    {title:"Club: aanbod zoeken", go:"/club"},
    {title:"Aanvraag doen", go:"/club?tab=catalogus&focus=aanvragen"},
    {title:"Status + wallet (money follows action)", go:"/club?tab=aanvragen"},
    {title:"Afronden + evalueren", go:"/club?tab=evalueren"},
    {title:"Achterkant: KPI’s & routes", go:"/admin"},
    {title:"Export (data/rapportage)", go:"/admin?focus=export"}
  ];

  const items = steps.map((s,i)=>{
    const active = state.presenter.step===i;
    return `
      <button class="chip" data-action="presenterStep" data-step="${i}" aria-pressed="${active}">
        ${i+1}. ${escapeHtml(s.title)}
      </button>
    `;
  }).join("");

  const current = steps[state.presenter.step] || steps[0];

  return `
    <section class="hero">
      <h1>Presentatie-modus</h1>
      <p>
        Klik door de demo in een logische pitch-volgorde. Dit is bedoeld om de ontwikkelaar mee te nemen, te inspireren en samen te laten verkennen.
      </p>
      <div class="hero__actions">
        <button class="btn btn--accent" data-action="presenterNext">Volgende stap</button>
        <button class="btn btn--primary" data-action="presenterGo">Ga naar stap</button>
      </div>
    </section>

    <div style="height:14px"></div>

    <div class="grid grid--2">
      <section class="panel">
        <div class="panel__head">
          <h2>Stappen</h2>
          <div class="card__muted">Klik om te springen</div>
        </div>
        <div class="panel__body">
          <div class="chips" style="gap:10px">${items}</div>
          <hr class="hr" />
          <div class="card__muted">
            Tip: open deze demo full-screen (F11). Gebruik “Volgende stap” om live door het verhaal te lopen.
          </div>
        </div>
      </section>

      <section class="panel">
        <div class="panel__head">
          <h2>Nu</h2>
          <div class="card__muted">pitch-talking points</div>
        </div>
        <div class="panel__body">
          <h3 class="card__title" style="margin-top:0">${escapeHtml(current.title)}</h3>
          ${presenterNotes(state.presenter.step)}
          <hr class="hr" />
          <button class="btn btn--accent" data-action="presenterGoNow">Open in demo</button>
        </div>
      </section>
    </div>
  `;
}

function presenterNotes(step){
  const notes = [
    `<div class="card__muted">
      <strong>Frame:</strong> dit is een voorverkenning. We willen jullie meenemen in kansen, en toetsen of dit logisch op jullie platform kan landen.
      <br/><br/>
      <strong>Belofte:</strong> van “aanbod ontsluiten” naar “club-cockpit”: vinden → afnemen → meten → sturen.
    </div>`,
    `<div class="card__muted">
      Laat de <strong>filter-ervaring</strong> zien (zoals activiteiten), maar met clubroutes + rollen. 
      Benoem: hergebruik van bestaand aanbod is het uitgangspunt.
    </div>`,
    `<div class="card__muted">
      Klik op <strong>Aanvragen</strong>. Leg uit: dit creëert een workflow-object. 
      Dit is de missing link tussen “zien” en “doen”.
    </div>`,
    `<div class="card__muted">
      Toon <strong>status</strong> + wallet. Leg uit: “commit bij gepland” is een simpele variant van <em>money follows action</em>.
      In een echte versie kunnen reserveringen, subsidiepotjes en goedkeuringen verschillen.
    </div>`,
    `<div class="card__muted">
      Laat zien dat evaluaties <strong>kwaliteit</strong> en “wat werkt” zichtbaar maken. 
      Dit vormt de basis voor bewezen routes + kennisbank.
    </div>`,
    `<div class="card__muted">
      Toon KPI’s: conversie, afronding, ratings, route-populariteit. 
      Dit is de achterkant die gemeenten/partners helpt sturen op resultaat.
    </div>`,
    `<div class="card__muted">
      Exporteer JSON: “dit kan straks een rapportage, dashboard of API zijn”.
      Vraag: welke minimale datapunten willen we v1 loggen?
    </div>`
  ];
  return notes[step] || notes[0];
}

/* -------------------- Modal -------------------- */
function modalShell(){
  return `
    <dialog class="panel" id="modal" style="max-width:720px; width:calc(100% - 24px); padding:0">
      <div class="panel__head">
        <h2 id="modalTitle">Details</h2>
        <button class="btn btn--ghost" data-action="closeModal" type="button">Sluiten</button>
      </div>
      <div class="panel__body" id="modalBody"></div>
    </dialog>
  `;
}

function openOfferModal(state, offerId){
  const offer = state.seed.offers.find(o=>o.id===offerId);
  if(!offer) return;

  $("#modalTitle").textContent = offer.title;
  $("#modalBody").innerHTML = `
    <div class="row">
      <div>
        <div class="label">Route</div>
        <div style="font-weight:900;color:var(--brand)">${offer.route}</div>
      </div>
      <div>
        <div class="label">Type</div>
        <div style="font-weight:900;color:var(--brand)">${offer.type}</div>
      </div>
      <div>
        <div class="label">Duur</div>
        <div style="font-weight:900;color:var(--brand)">${minutesToText(offer.durationMin)}</div>
      </div>
    </div>

    <hr class="hr" />

    <div class="card__muted" style="font-size:14px; line-height:1.5">${escapeHtml(offer.summary || "")}</div>

    <hr class="hr" />

    <div class="row">
      <div>
        <div class="label">Aanbieder</div>
        <div style="font-weight:900;color:var(--brand)">${escapeHtml(offer.provider)}</div>
      </div>
      <div>
        <div class="label">Niveau</div>
        <div style="font-weight:900;color:var(--brand)">${escapeHtml(offer.level)}</div>
      </div>
      <div>
        <div class="label">Credits</div>
        <div style="font-weight:900;color:var(--brand)">${money(offer.priceCredits)}</div>
      </div>
    </div>

    <hr class="hr" />

    <button class="btn btn--primary" data-action="request" data-id="${offer.id}">Aanvragen</button>
  `;

  $("#modal").showModal();
}

/* -------------------- Actions -------------------- */

function requestOffer(state, offerId){
  const offer = state.seed.offers.find(o=>o.id===offerId);
  if(!offer) return;

  const r = {
    id: uid("req"),
    offerId: offer.id,
    status: "Nieuw",
    priceCredits: offer.priceCredits,
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };

  state.requests.push(r);
  audit(state, "request.created", { requestId: r.id, offerId: offer.id, route: offer.route, credits: offer.priceCredits });
  toast("Aanvraag gestart");
  // spring naar aanvragen-tab, dat voelt “pitchy”
  navigate("/club?tab=aanvragen");
}

function setRequestStatus(state, reqId, status){
  const r = state.requests.find(x=>x.id===reqId);
  if(!r) return;
  const prev = r.status;
  r.status = status;
  r.updatedAt = nowISO();

  // wallet-commit bij gepland (demo-keuze)
  if(prev !== "Gepland" && status === "Gepland"){
    if(state.wallet.credits >= r.priceCredits){
      state.wallet.credits -= r.priceCredits;
      state.wallet.spent += r.priceCredits;
      audit(state, "wallet.commit", { requestId: r.id, credits: r.priceCredits });
    } else {
      toast("Onvoldoende credits (demo)");
      // rollback
      r.status = prev;
      r.updatedAt = nowISO();
      return;
    }
  }

  audit(state, "request.status", { requestId: r.id, from: prev, to: status });
  toast(`Status: ${status}`);
}

function submitEvaluation(state, requestId, rating, note){
  const r = state.requests.find(x=>x.id===requestId);
  if(!r) return;
  if(r.status !== "Afgerond"){
    toast("Rond eerst af (demo)");
    return;
  }
  const existing = state.evaluations.find(e=>e.requestId===requestId);
  if(existing){
    existing.rating = rating;
    existing.note = note;
    existing.updatedAt = nowISO();
  } else {
    state.evaluations.push({
      id: uid("ev"),
      requestId,
      rating,
      note,
      createdAt: nowISO(),
      updatedAt: nowISO()
    });
  }
  audit(state, "evaluation.saved", { requestId, rating });
  toast("Evaluatie opgeslagen");
}

function exportJson(state){
  const payload = {
    exportedAt: nowISO(),
    club: state.seed.club,
    wallet: state.wallet,
    requests: state.requests,
    evaluations: state.evaluations,
    audit: state.audit
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `ynbeweging-club-demo-export-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  toast("Export gedownload");
}

/* -------------------- Render & Events -------------------- */

function escapeHtml(s){
  return String(s ?? "").replace(/[&<>"']/g, (c)=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  })[c]);
}

function render(state){
  setActiveNav();
  const {path, params} = route();
  const root = appRoot();

  if(path === "/" || path === ""){
    root.innerHTML = viewHome(state);
  } else if(path === "/club"){
    root.innerHTML = viewClub(state, params);
    // mark active tab chips
    $$(".chip[data-tab]").forEach(b=>{
      const tab = params.get("tab") || "catalogus";
      b.setAttribute("aria-pressed", b.dataset.tab===tab ? "true":"false");
    });
  } else if(path === "/admin"){
    root.innerHTML = viewAdmin(state);
  } else if(path === "/presenter"){
    root.innerHTML = viewPresenter(state);
  } else {
    root.innerHTML = `<div class="card"><div class="card__pad"><h2 class="card__title">Niet gevonden</h2><div class="card__muted">Ga terug naar <a href="#/">start</a>.</div></div></div>`;
  }

  // global "go" buttons
  $$("[data-go]").forEach(btn=>{
    btn.addEventListener("click", ()=>navigate(btn.dataset.go));
  });
}

function attachGlobalHandlers(state){
  window.addEventListener("hashchange", ()=> {
    render(state);
    setState(state);
  });

  document.addEventListener("click", (e)=>{
    const t = e.target.closest("[data-action], [data-tab]");
    if(!t) return;

    // tab switching
    if(t.dataset.tab){
      const {params} = route();
      params.set("tab", t.dataset.tab);
      navigate(`/club?${params.toString()}`);
      return;
    }

    const action = t.dataset.action;

    if(action === "applyFilters"){
      const next = {
        q: $("#q")?.value ?? "",
        route: $("#routeSel")?.value ?? "",
        type: $("#typeSel")?.value ?? "",
        provider: $("#providerSel")?.value ?? "",
        level: $("#levelSel")?.value ?? "",
      };
      state.ui.filters = next;
      audit(state, "filters.applied", next);
      toast("Filters toegepast");
      render(state);
      setState(state);
    }

    if(action === "clearFilters"){
      state.ui.filters = { q:"", route:"", type:"", provider:"", level:"" };
      audit(state, "filters.cleared");
      toast("Filters gereset");
      render(state);
      setState(state);
    }

    if(action === "details"){
      openOfferModal(state, t.dataset.id);
    }

    if(action === "closeModal"){
      $("#modal")?.close();
    }

    if(action === "request"){
      requestOffer(state, t.dataset.id);
      $("#modal")?.close();
      setState(state);
      render(state);
    }

    if(action === "setStatus"){
      setRequestStatus(state, t.dataset.id, t.dataset.status);
      setState(state);
      render(state);
    }

    if(action === "exportJson"){
      exportJson(state);
    }

    if(action === "presenterStep"){
      state.presenter.step = Number(t.dataset.step || 0);
      setState(state);
      render(state);
    }

    if(action === "presenterNext"){
      state.presenter.step = Math.min(state.presenter.step + 1, 6);
      setState(state);
      render(state);
    }

    if(action === "presenterGo" || action === "presenterGoNow"){
      const steps = ["/","/club","/club?tab=catalogus","/club?tab=aanvragen","/club?tab=evalueren","/admin","/admin"];
      navigate(steps[state.presenter.step] || "/");
    }
  });

  document.addEventListener("submit", (e)=>{
    const form = e.target.closest('form[data-action="submitEval"]');
    if(!form) return;
    e.preventDefault();
    const requestId = form.dataset.id;
    const fd = new FormData(form);
    const rating = fd.get("rating");
    const note = fd.get("note");
    submitEvaluation(state, requestId, Number(rating), String(note||""));
    setState(state);
    render(state);
  });

  $("#resetDemoBtn")?.addEventListener("click", async ()=>{
    if(!confirm("Demo resetten naar beginstand?")) return;
    resetState();
    const seed = await loadSeed();
    const next = seedToState(seed);
    setState(next);
    toast("Demo gereset");
    render(next);
  });
}

/* -------------------- Boot -------------------- */

function seedToState(seed){
  const state = ensureDefaults({
    seed,
    wallet: { credits: seed.club.walletCredits, spent: 0 },
    ui: { filters: { q:"", route:"", type:"", provider:"", level:"" } },
    requests: [],
    evaluations: [],
    audit: [],
    presenter: { step: 0 },
  });
  audit(state, "demo.seeded", { club: seed.club.name });
  return state;
}

(async function main(){
  let state = getState();
  if(!state){
    const seed = await loadSeed();
    state = seedToState(seed);
    setState(state);
  }
  // state might miss new fields after updates
  state = ensureDefaults(state);
  setState(state);

  attachGlobalHandlers(state);
  render(state);
})();
