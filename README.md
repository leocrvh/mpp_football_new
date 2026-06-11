# Dashboard TV - MPP + Coupe du monde 2026

Site statique prévu pour GitHub Pages, en 16:9 plein écran.

## Mise en route rapide

1. Crée un nouveau dépôt GitHub.
2. Envoie tous les fichiers de ce dossier à la racine du dépôt.
3. Dans GitHub : Settings > Pages > Build and deployment > Deploy from a branch > `main` / root.
4. Ouvre l'URL GitHub Pages sur la télé.

## Matchs du jour

La page tente maintenant de récupérer les matchs directement depuis le scoreboard ESPN, sans clé API.

Si le navigateur de la télé bloque l'appel direct, le workflow GitHub Actions remplit `data/matches.json` toutes les 10 minutes, toujours via ESPN en priorité.

Tu n'es donc pas obligé de créer une clé `FOOTBALL_DATA_TOKEN`. Elle reste seulement une solution de secours optionnelle.

## Classement MPP

MPP n'a pas d'API publique documentée. Le script fait donc un scraping de la page publique de la ligue :

https://mpp.football/leagues/mpp_challenge_UC8MVG4F

Pour mettre à jour le classement :

1. Va dans l'onglet `Actions` du dépôt GitHub.
2. Clique sur `Update dashboard data`.
3. Clique sur `Run workflow`.

Ensuite, le workflow se relance automatiquement toutes les 10 minutes.

Si le classement reste vide, MPP bloque sûrement le scraping ou demande une session. Dans ce cas, il faudra adapter `scripts/scrape-mpp.mjs` ou remplir `data/mpp.json` avec une autre source.
