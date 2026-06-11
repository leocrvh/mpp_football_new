# Dashboard TV - MPP + Coupe du monde 2026

Site statique prévu pour GitHub Pages, en 16:9 plein écran.

## Mise en route rapide

1. Crée un nouveau dépôt GitHub.
2. Envoie tous les fichiers de ce dossier à la racine du dépôt.
3. Dans GitHub : Settings > Pages > Build and deployment > Deploy from a branch > `main` / root.
4. Ouvre l'URL GitHub Pages sur la télé.

## Mise à jour automatique

Le workflow GitHub Actions `.github/workflows/update-dashboard.yml` tourne toutes les 10 minutes et met à jour :

- `data/mpp.json` avec le classement de la ligue MPP via Playwright.
- `data/matches.json` avec les matchs du jour.

Pour de meilleurs résultats sur les matchs, crée une clé gratuite sur football-data.org puis ajoute-la dans GitHub :

Settings > Secrets and variables > Actions > New repository secret

Nom : `FOOTBALL_DATA_TOKEN`

Sans clé, le script tente une API open-source de secours pour la Coupe du monde 2026.

## Point important pour MPP

MPP n'a pas d'API publique documentée. Le script fait donc un scraping de la page publique de la ligue. Si MPP change son site ou demande une connexion, il faudra adapter `scripts/scrape-mpp.mjs`, ou remplir `data/mpp.json` via une source externe type Google Sheet exportée en CSV/JSON.
