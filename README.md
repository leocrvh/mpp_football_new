# Dashboard MPP TV

Page unique prévue pour une télévision 16:9.

Elle affiche :

- à gauche : le classement de la ligue MPP ;
- à droite : les matchs Coupe du Monde 2026 utiles pour le bureau.

## Fenêtre des matchs affichés

Le dashboard n'affiche plus seulement les matchs du jour.

Il affiche automatiquement :

- les résultats de la veille au soir ;
- les résultats de la nuit ;
- les matchs du jour ;
- les matchs de la nuit qui arrive.

Concrètement, le script récupère les matchs de J-1, J et J+1, puis la page filtre l'affichage pour garder la fenêtre utile en heure française.

## Installation GitHub Pages

1. Copier tous les fichiers à la racine du dépôt GitHub.
2. Aller dans `Settings > Pages`.
3. Choisir `Deploy from a branch`, branche `main`, dossier `/root`.
4. Aller dans `Actions`.
5. Lancer `Update dashboard data` une première fois avec `Run workflow`.

Ensuite, le workflow se relance automatiquement toutes les 10 minutes.

## Classement MPP

La ligue configurée est :

`https://mpp.football/leagues/mpp_challenge_UC8MVG4F`

MPP n'a pas d'API publique documentée. Le projet utilise donc Playwright pour ouvrir la page et essayer d'extraire le classement dans `data/mpp.json`.

Si le classement ne se met pas à jour, ouvrir l'erreur dans GitHub Actions et adapter le scraper `scripts/scrape-mpp.mjs`.

## Matchs

Les matchs sont récupérés via ESPN en priorité, sans clé API.

Le fichier généré est :

`data/matches.json`

La page tente aussi de charger ESPN directement depuis le navigateur. Si la télé bloque l'appel direct, elle utilise le JSON local généré par GitHub Actions.


## Connexion MPP avec cookie GitHub Secret

La ligue MPP est privée. Pour que GitHub Actions puisse récupérer le classement, il faut ajouter le cookie de session MPP dans un secret GitHub nommé `MPP_COOKIE`.

1. Connecte-toi à https://mpp.football sur Chrome.
2. Ouvre la page de la ligue.
3. Appuie sur F12, onglet Network / Réseau.
4. Recharge la page.
5. Clique sur la requête principale vers `mpp.football` ou une requête API MPP.
6. Dans Request Headers, copie la valeur complète de `Cookie`.
7. Dans GitHub : Settings > Secrets and variables > Actions > New repository secret.
8. Name : `MPP_COOKIE`
9. Secret : colle la valeur complète du cookie.
10. Relance Actions > Update dashboard data > Run workflow.

Ne mets jamais ce cookie dans un fichier du dépôt.
