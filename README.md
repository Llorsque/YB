# YnBeweging – Clubkant demo (live business case)

Dit is een **static** demo (HTML/CSS/JS) om een ontwikkelaar mee te nemen in het idee:

- **Club-kant**: routes → aanvragen → status → evalueren
- **Achterkant**: KPI’s, route-populariteit, kennisbank (wat werkt), audit-log, export

## Snel starten

### Lokaal
```bash
python -m http.server 8080
```
Open daarna: http://localhost:8080

### GitHub Pages
1. Upload repo naar GitHub
2. Settings → Pages → Deploy from branch → `main` / `/root`
3. Open de Pages URL

## Aanpassen van inhoud
Bewerk `data/seed.json`:
- `club`: naam, gemeente, rollen, wallet
- `routes`: stappen per route
- `offers`: activiteiten (gekoppeld aan route + step_index)
- `demo_evaluations`: startdata voor kennisbank

## Demo logica (bewust simpel)
- Relevantie-sortering gebruikt: rol-match + focus_routes + kwaliteitssignaal.
- Wallet credits worden afgeboekt bij status **Gepland** (om “money follows action” te laten voelen).

## Reset
Klik op **Reset demo** (wist localStorage).
