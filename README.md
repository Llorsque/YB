# YnBeweging voor Clubs — interactieve demo (voorverkenning)

Deze repo is een **pitch-demo** (“live business case”) om het idee uit de pitch tastbaar te maken:

- **Club-kant**: verenigingen vinden → kiezen → aanvragen → status → afronden → evalueren  
- **Achterkant**: KPI’s, route-populariteit, ratings, wallet/tegoed (“money follows action”), export

De demo is **100% static** (HTML/CSS/JS) en gebruikt **localStorage** als “mini-backend”.  
Ideaal voor **GitHub Pages** en een live gesprek met de huidige ontwikkelaar.

## Starten (lokaal)

Optie A (Python):
```bash
cd ynbeweging-clubkant-demo
python -m http.server 8080
```
Open daarna: http://localhost:8080

Optie B (Node / npx):
```bash
npx serve .
```

## Deploy naar GitHub Pages

1. Maak een repo op GitHub (bijv. `ynbeweging-clubkant-demo`)
2. Upload alle bestanden uit deze map
3. GitHub → **Settings → Pages**
4. Source: **Deploy from a branch**
5. Branch: `main` / folder: `/root`
6. Opslaan → je krijgt een Pages-URL

## Pitch-flow (presentatie)

Open **Presenteren** in de demo (menu).  
Daar vind je een step-by-step volgorde + talking points.

## Demo-data aanpassen

- `data/seed.json` bevat:
  - club (naam, gemeente, wallet)
  - routes
  - aanbod (offers)

Je kunt hier makkelijk eigen voorbeelden toevoegen.

## Wat is bewust “MVP” in deze demo?

- Geen echte auth / accounts (wel rollen zichtbaar)
- Geen echte boekingskalender
- Wallet-commit gebeurt bij status **Gepland** (demo-keuze)
- Exports zijn JSON (kan later naar rapportage/API)

## Technische notities

- Hash-router (geen server routes nodig)
- State in localStorage key: `yb_club_demo_v1`
- Reset-knop onderin zet alles terug naar seed

## Volgende stap (richting echte bouw)

Gebruik deze demo om met de ontwikkelaar te bespreken:
- welke bestaande modules hergebruikt kunnen worden (aanbod, accounts, dashboards)
- minimaal datamodel: Club, Role, Offer, Request/Booking, Evaluation, Wallet/Entitlement
- logging/analytics: welke events willen we vanaf dag 1

---

**Bron voor pitch-inhoud:** het aangeleverde pitchdocument (bijlage).
