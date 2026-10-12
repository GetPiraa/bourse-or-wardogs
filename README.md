# Bourse de l'or WARDOGS · WARDOGS Gold Exchange

**Page en ligne / Live page : https://getpiraa.github.io/bourse-or-wardogs/** (FR / EN)

## Français

Suivi du taux cash → lingot d'or du jeu WARDOGS : prix confirmé jour par jour, valeur du jour signalée comme provisoire tant qu'elle peut changer, estimations sur 15 jours avec leurs probabilités, journal des prédictions.

- **Mise à jour automatique** par GitHub Actions (`.github/workflows/update.yml`) : un relevé par heure de 0h à 12h UTC, puis un à 18h. Un prix est tenu pour confirmé s'il a été relevé en jeu (`data/manual.json`), ou à partir de 12h UTC le jour même. Sans nouvelle donnée, rien n'est modifié.
- **Sources** : les relevés faits en jeu, le relevé public MetaForge pour le prix du jour, et le flux d'actualités Steam du jeu. Aucun appel aux serveurs du jeu. Le modèle et tous les calculs sont ceux de ce dépôt.
- **Modèle** (`model.js`) : chaque variation passée est un exemple, pondéré selon sa ressemblance avec le jour à prévoir (jour de semaine, phase après un saut, ancienneté). À chaque nouveau prix, le modèle rejoue le passé avec 36 réglages, garde le meilleur, puis simule 4000 trajectoires. Sa précision mesurée est affichée sur la page.

| Fichier | Rôle |
|---|---|
| `build.js` | Télécharge les données, règle le modèle, génère `index.html` |
| `model.js` | Moteur de prévision |
| `src/` | Gabarit, affichage et textes français / anglais |
| `config.json` | Sources, date du prochain wipe, événements du graphique |
| `data/` | Prix, relevés en jeu (`manual.json`), annonces, prédictions enregistrées, révisions, suivi du modèle |

Lancer en local : `node build.js` puis ouvrir `index.html`.

## English

Tracker for the WARDOGS cash → gold bar rate: confirmed daily price, today's value flagged as provisional while it can still change, 15-day estimates with probabilities, and a prediction log.

- **Updates automatically** through GitHub Actions: one reading per hour from 00:00 to 12:00 UTC, then one at 18:00. A price is treated as confirmed once it has been read in the game (`data/manual.json`), or from 12:00 UTC on its own day. Nothing changes when there is no new data.
- **Sources**: readings taken in the game, the public MetaForge reading for the day's price, and the game's Steam news feed. No calls to the game servers. The model and all calculations are this repository's own.
- **Model** (`model.js`): each past move is an example, weighted by how much it resembles the day to predict (weekday, phase after a jump, age). With every new price the model replays the past with 36 settings, keeps the best, then simulates 4,000 paths. Its measured accuracy is shown on the page.

Run locally: `node build.js`, then open `index.html`.

---

Projet de fan, sans lien avec Bulkhead ni WARDOGS. Les lingots sont une monnaie de jeu sans valeur réelle ; les estimations sont des tendances statistiques, pas des certitudes.

Fan project, not affiliated with Bulkhead or WARDOGS. Gold bars are an in-game currency with no real-world value; estimates are statistical trends, not certainties.
