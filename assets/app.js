const $ = (sel, el=document) => el.querySelector(sel);
const $$ = (sel, el=document) => Array.from(el.querySelectorAll(sel));

const STORAGE_KEY = "yb_demo_state_v2";

function nowISO(){ return new Date().toISOString(); }

async function loadSeed(){
  const res = await fetch("./data/seed.json");
  return await res.json();
}

function loadState(seed){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(!raw){
    const state = {
      club: seed.club,
      role: seed.club.default_role,
      wallet: seed.club.wallet,
      requests: [],
      evaluations: seed.demo_evaluations ?? [],
      logs: []
    };
    state.logs.push({t: nowISO(), type:"init", msg:"Demo state initialized"});
    saveState(state);
    return state;
  }
  try{ return JSON.parse(raw); }
  catch(e){ localStorage.removeItem(STORAGE_KEY); return loadState(seed); }
}

function saveState(state){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

function toast(msg){
  const el = $("#toast"); if(!el) return;
  el.textContent = msg; el.classList.add("show");
  setTimeout(()=> el.classList.remove("show"), 2600);
}

function log(state, type, msg, data=null){
  state.logs.unshift({t: nowISO(), type, msg, data});
  saveState(state);
}

function fmtDate(iso){
  const d = new Date(iso);
  return d.toLocaleString(undefined, {year:"numeric", month:"short", day:"2-digit", hour:"2-digit", minute:"2-digit"});
}

function avg(arr){ return arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0; }

function clamp01(x){ return Math.max(0, Math.min(1, x)); }

function offerStats(seed, state){
  const byOffer = new Map();
  for(const o of seed.offers) byOffer.set(o.id, {offer:o, ratings:[], count:0, avg:0});
  for(const ev of (state.evaluations||[])){
    if(byOffer.has(ev.offer_id)){
      const s = byOffer.get(ev.offer_id);
      s.ratings.push(ev.rating); s.count += 1;
    }
  }
  for(const [k,s] of byOffer) s.avg = s.count ? avg(s.ratings) : 0;
  return byOffer;
}

function scoreOffer(seed, state, offer){
  let score = 0;
  const role = state.role;
  if((offer.roles||[]).includes(role)) score += 4;
  if((state.club.focus_routes||[]).includes(offer.route_id)) score += 2;
  const stats = offerStats(seed, state).get(offer.id);
  if(stats && stats.count) score += (stats.avg/5)*3;
  score += clamp01((6 - (offer.credits||0))/6);
  return score;
}

function recommendedOffers(seed, state, limit=3){
  const offers = seed.offers.slice();
  offers.sort((a,b)=> scoreOffer(seed,state,b) - scoreOffer(seed,state,a));
  return offers.slice(0, limit);
}

function provenBadge(seed, state, offerId){
  const s = offerStats(seed,state).get(offerId);
  if(!s) return null;
  if(s.count >= 3 && s.avg >= 4.2) return "Bewezen";
  if(s.count >= 2 && s.avg >= 4.0) return "Veelbelovend";
  return null;
}

function resetDemo(){ localStorage.removeItem(STORAGE_KEY); location.reload(); }
