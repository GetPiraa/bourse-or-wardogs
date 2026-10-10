// Tous les textes fixes de la page, en français puis en anglais : [fr, en].
// Les en-têtes de colonnes commençant par « > » sont alignés à droite.
const STR = {
  brand: ["Bourse de l'or · WARDOGS", 'Gold Exchange · WARDOGS'],
  h1: ["Bourse de l'or", 'Gold Exchange'],
  sub: ["Suivi du taux cash → lingot de WARDOGS depuis le 21 août 2026, premier jour avec des joueurs. Un prix par jour, en vigueur à minuit UTC, décidé par le studio et publié un peu avant. Bulkhead n'a jamais expliqué comment il le fixe : tout ce qui suit est déduit des données et des fichiers du jeu.",
    'Tracking the WARDOGS cash → gold bar rate since 21 August 2026, the first day with players. One price per day, effective at midnight UTC, set by the studio and published shortly before. Bulkhead has never explained how it sets it: everything below is inferred from the data and the game files.'],
  auto: ['Mise à jour automatique chaque soir, dès la sortie du prix du lendemain', "Updates automatically every evening, as soon as tomorrow's price is out"],
  h_chart: ['Cours du lingot', 'Gold bar price'],
  lg_actual: ['Prix réel', 'Actual price'],
  lg_est: ['Estimation (médiane)', 'Estimate (median)'],
  lg_grad: ['Bleu : probable · pâle : peu probable', 'Blue: likely · pale: unlikely'],
  note_chart: ["Survole le graphique pour lire un jour, y compris les jours estimés à droite du dernier prix. Clique sur un jour pour l'envoyer au simulateur en dessous : le survol reste libre. Pour l'enlever, reclique dessus, appuie sur Échap ou utilise « Libérer ce jour » dans le simulateur.",
    'Hover the chart to read a day, including the estimated days to the right of the last price. Click a day to send it to the simulator below: hovering stays free. To remove it, click it again, press Esc or use "Release this day" in the simulator.'],
  h_sim: ['Simulateur de conversion', 'Conversion simulator'],
  sim_cash: ['Ton cash', 'Your cash'],
  sim_best: ['Meilleur cas observé', 'Best case seen so far'],
  sim_x3: ['Si le prix fait ×3 au wipe', 'If the price triples at the wipe'],
  note_sim: ["Le simulateur utilise le jour épinglé d'un clic sur le graphique, marqué d'un cercle doré. Sans jour épinglé, il suit le survol, puis revient au dernier prix connu.", 'The simulator uses the day pinned by a click on the chart, marked with a gold ring. With no pinned day, it follows the hover, then falls back to the last known price.'],
  h_find: ["Constats d'audit", 'Audit findings'],
  h_wd: ['Comportement par jour de la semaine', 'Behaviour by day of the week'],
  note_wd: ['Depuis le 21 août, hors jours de saut de plus de +100 %. Peu de semaines de données : les tendances sont nettes mais l\'échantillon reste petit.', 'Since 21 August, excluding jump days above +100%. Only a few weeks of data: the trends are clear but the sample is small.'],
  h_rules: ['Règles conditionnelles', 'Conditional rules'],
  note_rules: ["Recalculé à chaque mise à jour, hors jours de saut. Une règle avec 4 à 7 cas reste fragile : plusieurs règles actives qui vont dans le même sens valent plus qu'une seule.",
    'Recomputed at every update, excluding jump days. A rule with 4 to 7 cases is fragile: several active rules pointing the same way are worth more than one.'],
  h_fc: ['Estimations sur 15 jours', '15-day estimates'],
  h_jr: ['Journal des prédictions', 'Prediction log'],
  note_jr: ["Chaque jour passé est rejoué avec les seules données connues la veille. Les lignes « Prédit en direct » sont les annonces réellement enregistrées avant que le prix sorte. Une « surprise » est un prix sorti de la fourchette 80 % : c'est là que le studio a fait autre chose que d'habitude.",
    'Each past day is replayed using only the data known the day before. Rows marked "Predicted live" are forecasts actually recorded before the price came out. A "surprise" is a price outside the 80% range: that is where the studio did something unusual.'],
  h_mh: ['Apprentissage du modèle', 'Model learning'],
  note_mh: ["À chaque nouveau prix, le modèle rejoue tout le passé avec 36 réglages différents et garde celui qui aurait le mieux prévu, puis élargit ou resserre la fourchette pour qu'elle contienne bien 8 prix sur 10.",
    'With every new price, the model replays the whole past with 36 different settings and keeps the one that would have predicted best, then widens or narrows the range so that it really contains 8 prices out of 10.'],
  h_reco: ['Recommandations', 'Recommendations'],
  h_day: ['Relevé quotidien', 'Daily record'],
  h_news: ['Annonces officielles', 'Official announcements'],
  note_news: ["Les sauts de prix tombent sur des lancements annoncés à l'avance. Une nouvelle annonce de bêta, de saison ou de mise à jour majeure est le meilleur signal d'un saut à venir.",
    'Price jumps land on launches announced in advance. A new beta, season or major update announcement is the best signal of an upcoming jump.'],
  h_src: ['Sources de données', 'Data sources'],
  h_cmp: ['Jeux comparables', 'Comparable games'],
  note_cmp: ["Aucun jeu trouvé ne publie de formule pour un taux à sens unique fixé chaque jour par le studio. Les jetons WoW, PLEX et gemmes s'échangent dans les deux sens.",
    'No game found publishes a formula for a one-way rate set daily by the studio. WoW tokens, PLEX and gems trade both ways.'],
  h_links: ['Sources', 'Sources'],
  more: ["Détails de l'audit · clique sur un titre pour l'ouvrir", 'Audit details · click a title to open it'],
  open_all: ['Tout déplier', 'Expand all'],
  close_all: ['Tout replier', 'Collapse all'],
  foot: ["Projet de fan, sans lien avec Bulkhead ni WARDOGS. Les lingots sont une monnaie de jeu sans valeur réelle. Les estimations sont des tendances statistiques, pas des certitudes.",
    'Fan project, not affiliated with Bulkhead or WARDOGS. Gold bars are an in-game currency with no real-world value. Estimates are statistical trends, not certainties.'],
  code: ['Code et données sur GitHub', 'Code and data on GitHub']
};
const TH = {
  find: [['Constat', 'Preuve dans les données', 'Fiabilité'], ['Finding', 'Evidence in the data', 'Confidence']],
  wd: [['Jour', '>Hausses', '>Stables', '>Baisses', 'Variation moyenne'], ['Day', '>Up', '>Flat', '>Down', 'Average change']],
  rules: [['Quand…', 'Le jour même', '>Cas', '>Variation médiane', 'Fiabilité', 'Prochain prix'], ['When…', 'That day', '>Cases', '>Median change', 'Reliability', 'Next price']],
  fc: [['Jour', 'Tendance', '>Estimation', '>8 chances sur 10', '>Extrêmes (95 %)', 'Chance du sens', 'Chance à ±10 %', 'Fondée sur'], ['Day', 'Trend', '>Estimate', '>8 chances in 10', '>Extremes (95%)', 'Direction odds', 'Odds within ±10%', 'Based on']],
  jr: [['Jour', '>Annoncé la veille', '>8 chances sur 10', '>Prix réel', ">Écart de l'annonce", 'Sens', 'Lecture du mouvement'], ['Day', '>Forecast the day before', '>8 chances in 10', '>Actual price', '>Forecast error', 'Direction', 'Reading of the move']],
  mh: [["Données jusqu'au", '>Jours rejoués', '>Bon sens', '>Prix à ±10 %', '>Réel dans la fourchette 80 %', 'Réglage retenu'], ['Data up to', '>Days replayed', '>Right direction', '>Price within ±10%', '>Actual inside 80% range', 'Setting kept']],
  day: [['Date', 'Jour', '>Prix du lingot', '>Vs veille', 'Événement'], ['Date', 'Day', '>Gold bar price', '>Vs previous day', 'Event']],
  news: [['Date', 'Jour', 'Annonce de Bulkhead sur Steam'], ['Date', 'Day', 'Bulkhead announcement on Steam']],
  src: [['Donnée', 'Où la trouver', 'Utilité'], ['Data', 'Where to find it', 'Usefulness']],
  cmp: [['Jeu', 'Comment le prix est fixé', 'Ce que ça apprend pour WARDOGS'], ['Game', 'How the price is set', 'What it teaches for WARDOGS']]
};
// [titre, preuve, niveau (hi/mid/lo), libellé]
const FINDINGS = [
  [['Le taux est une courbe envoyée par le serveur', 'The rate is a curve sent by the server'], ['Les fichiers du jeu nomment le mécanisme : <i>LiveCurves</i>, des courbes à points-clés (temps, valeur, interpolation) livrées avec les données de jeu du backend. Le client lit le taux sur cette courbe ; il ne le calcule pas.', 'The game files name the mechanism: <i>LiveCurves</i>, keyframed curves (time, value, interpolation) delivered with the backend game data. The client reads the rate off that curve; it does not compute it.'], 'hi', ['Haute', 'High']],
  [["Le prix du lendemain est publié à l'avance", "Tomorrow's price is published in advance"], ["Le 8 octobre à 23h01 UTC, un tracker public affichait déjà le prix du 9 octobre (451 212), une heure avant son entrée en vigueur. La courbe envoyée par le jeu contient donc le point suivant. L'avance exacte est mesurée au fil des jours.", "On 8 October at 23:01 UTC, a public tracker already showed the 9 October price (451,212), one hour before it took effect. The curve sent by the game therefore contains the next point. The exact lead time is being measured day after day."], 'mid', ['Moyenne', 'Medium']],
  [['Le prix bouge même serveurs fermés', 'The price moves even with servers closed'], ['La bêta 2 a fermé le dimanche 6 septembre à 08h00 UTC. Sans aucun joueur, le prix a encore fait −10,1 %, −16,0 % et −16,9 % les 7, 8 et 9 septembre.', 'Beta 2 closed on Sunday 6 September at 08:00 UTC. With no players at all, the price still moved −10.1%, −16.0% and −16.9% on 7, 8 and 9 September.'], 'hi', ['Haute', 'High']],
  [['Les achats des joueurs ne font pas bouger le prix', 'Player purchases do not move the price'], ["L'achat est une simple demande d'échange au serveur, et le prix varie sans joueurs. Le nombre d'achats par jour n'est publié nulle part, et il ne servirait à rien.", 'A purchase is a plain exchange request to the server, and the price varies without players. The number of purchases per day is published nowhere, and it would be useless anyway.'], 'hi', ['Haute', 'High']],
  [['Le dimanche ne bouge jamais', 'Sunday never moves'], ['Tous les dimanches observés sont identiques au samedi, au dollar près.', 'Every Sunday observed is identical to Saturday, to the dollar.'], 'hi', ['Très haute', 'Very high']],
  [['Le vendredi baisse souvent, pas toujours', 'Friday often drops, not always'], ['6 vendredis sur 7 en baisse hors jour de lancement. Le 9 octobre a fait +0,8 % alors que trois règles annonçaient une baisse : les habitudes du studio ne sont pas des lois.', '6 Fridays out of 7 down, excluding launch day. 9 October did +0.8% while three rules called a drop: the studio\'s habits are not laws.'], 'mid', ['Moyenne', 'Medium']],
  [['Chaque lancement triple le prix', 'Every launch triples the price'], ['×2,80 le 21 août, ×3,36 le 3 septembre, ×3,49 le 10 septembre par rapport à la veille.', '×2.80 on 21 August, ×3.36 on 3 September, ×3.49 on 10 September versus the day before.'], 'hi', ['Haute', 'High']],
  [["Le prix s'érode après un lancement", 'The price erodes after a launch'], ['703k → 396k en 11 jours, 1,40M → 803k en 6 jours, 2,80M → 1,42M en 19 jours.', '703k → 396k in 11 days, 1.40M → 803k in 6 days, 2.80M → 1.42M in 19 days.'], 'hi', ['Haute', 'High']],
  [["La veille d'un lancement est un creux", 'The eve of a launch is a low'], ['251k, 416k et 803k : au plus bas ou tout près du plus bas de chaque vague.', '251k, 416k and 803k: at or right next to the low of each wave.'], 'mid', ['Moyenne', 'Medium']],
  [['Les ouvertures sont posées à la main', 'Opening prices are set by hand'], ["703 481, puis 1 398 240, puis 2 798 240 : l'écart entre les deux dernières vaut exactement 1 400 000.", '703,481, then 1,398,240, then 2,798,240: the gap between the last two is exactly 1,400,000.'], 'hi', ['Haute', 'High']],
  [['166 000 est un plancher', '166,000 is a floor'], ['Chiffre rond tenu deux jours. La moitié du prix de la veille aurait donné 165 791, juste en dessous.', 'A round number held for two days. Half of the previous price would have been 165,791, just below.'], 'mid', ['Moyenne', 'Medium']],
  [["L'historique avant le 21 août est factice", 'The history before 21 August is synthetic'], ["Des centaines de jours entre 268k et 356k, ±0,5 % par jour, alors que le jeu n'était pas ouvert. Il est écarté de cette page.", 'Hundreds of days between 268k and 356k, ±0.5% a day, while the game was not open. It is left out of this page.'], 'hi', ['Haute', 'High']],
  [["Le lendemain d'un saut baisse", 'The day after a jump drops'], ['4 fois sur 4, y compris après le rebond du 5 octobre (médiane −5 %).', '4 times out of 4, including after the 5 October rebound (median −5%).'], 'hi', ['Haute', 'High']],
  [['Une vague finit vers 55 % de son ouverture', 'A wave ends at about 55% of its opening'], ["0,59 pour la bêta 1, 0,57 pour la bêta 2, 0,51 pour l'accès anticipé avant le krach.", '0.59 for beta 1, 0.57 for beta 2, 0.51 for early access before the crash.'], 'mid', ['Moyenne', 'Medium']],
  [["Aucun lien avec l'or réel ni les marchés", 'No link with real gold or the markets'], ['Or, argent, bitcoin, S&amp;P 500 testés avec 0 à 3 jours de décalage : même sens que le lingot environ une fois sur deux, corrélations entre −0,14 et 0,27.', 'Gold, silver, bitcoin and the S&amp;P 500 tested with 0 to 3 days of lag: same direction as the bar about half the time, correlations between −0.14 and 0.27.'], 'hi', ['Haute', 'High']],
  [['Le nombre de joueurs ne prédit pas le lendemain', 'Player count does not predict the next day'], ["Du 18 septembre au 8 octobre, prix et joueurs Steam baissent ensemble (corrélation 0,71 sur les niveaux), mais leurs variations d'un jour à l'autre ne sont pas liées (0,07).", 'From 18 September to 8 October, price and Steam players fall together (0.71 correlation on levels), but their day-to-day changes are unrelated (0.07).'], 'mid', ['Moyenne', 'Medium']],
  [['Lien avec le cash en circulation', 'Link with cash in circulation'], ['Théorie de joueurs. Le krach de −77 % a commencé la veille du patch 0.1.2, pas après.', 'A player theory. The −77% crash began the day before patch 0.1.2, not after.'], 'lo', ['Non prouvé', 'Unproven']]
];
const RECOS = [
  [['Chaque soir, regarde le prix du lendemain avant de décider.', "Every evening, check tomorrow's price before deciding."], ["Il apparaît ici avant minuit UTC. S'il est plus haut, convertis ce soir ; s'il est plus bas, attends. C'est la seule information certaine, tout le reste est une tendance.", 'It shows up here before midnight UTC. If it is higher, convert tonight; if it is lower, wait. It is the only certain information; everything else is a trend.']],
  [['La veille du wipe, vérifie le prix du jour de lancement.', 'On the eve of the wipe, check the launch-day price.'], ["S'il saute comme aux trois lancements précédents, convertis avant minuit UTC. Le cash est effacé au wipe de toute façon.", 'If it jumps like the three previous launches, convert before midnight UTC. Cash is wiped anyway.']],
  [['Sous 350 000, convertis sans attendre mieux.', 'Below 350,000, convert without waiting for better.'], ["C'est le bas absolu de l'historique ; le plancher connu est 166 000.", 'That is the very bottom of the history; the known floor is 166,000.']],
  [['Samedi, tu connais dimanche.', 'On Saturday, you know Sunday.'], ['Le prix ne bouge pas le dimanche : 48 heures au même taux.', 'The price does not move on Sunday: 48 hours at the same rate.']]
];
const DATASRC = [
  [['Prix du jour et du lendemain', "Today's and tomorrow's price"], ['Deux trackers publics qui relaient la courbe du jeu : MetaForge et WarGold. La mise à jour les fusionne et signale tout écart.', 'Two public trackers relaying the game curve: MetaForge and WarGold. The update merges them and flags any mismatch.'], 'hi', ['Décisive', 'Decisive']],
  [['Annonces et maintenances', 'Announcements and maintenance'], ['Flux officiel des actualités Steam du jeu, relevé à chaque mise à jour.', 'The official Steam news feed of the game, read at every update.'], 'hi', ['Forte', 'Strong']],
  [["Réécritures de l'historique", 'History rewrites'], ["Chaque état des données est archivé dans l'historique Git ; tout prix passé modifié est signalé.", 'Every state of the data is archived in the Git history; any modified past price is flagged.'], 'mid', ['Moyenne', 'Medium']],
  [['Joueurs connectés', 'Players online'], ['API publique Steam et SteamCharts.', 'Public Steam API and SteamCharts.'], 'lo', ['Faible', 'Weak']],
  [['Achats de lingots par jour, cash en circulation', 'Gold bars bought per day, cash in circulation'], ["Publié nulle part. Ces chiffres n'existent que sur les serveurs de Bulkhead.", 'Published nowhere. These figures only exist on Bulkhead servers.'], 'lo', ['Inaccessible', 'Unavailable']]
];
const COMPARE = [
  [['Animal Crossing, navets', 'Animal Crossing, turnips'], ["Script du jeu : quatre motifs hebdomadaires et une table de transition d'une semaine à l'autre. Décodé par les joueurs, il est devenu prévisible.", 'Game script: four weekly patterns and a transition table from one week to the next. Decoded by players, it became predictable.'], ["Un prix scripté se lit par régimes (saut, puis érosion), pas comme un cours de bourse. C'est le cas le plus proche.", 'A scripted price is read in regimes (jump, then erosion), not like a stock price. It is the closest case.']],
  [['Escape from Tarkov, bitcoin', 'Escape from Tarkov, bitcoin'], ['Calé sur le cours réel du bitcoin, rafraîchi une fois par jour, avec un coefficient que le studio modifie quand il veut.', 'Pegged to the real bitcoin price, refreshed once a day, with a coefficient the studio changes whenever it wants.'], ['Le studio peut changer les paramètres sans prévenir : le krach du 30 septembre et le rebond du 5 octobre y ressemblent.', 'The studio can change parameters without warning: the 30 September crash and the 5 October rebound look like that.']],
  [['WoW, jeton', 'WoW Token'], ["Formule du studio, pas d'enchères. Pics courts aux annonces et aux extensions.", 'Studio formula, no auction. Short spikes at announcements and expansions.'], ['Les sorties de contenu font monter le prix, puis il retombe.', 'Content releases push the price up, then it falls back.']],
  [['EVE Online, PLEX', 'EVE Online, PLEX'], ['Vrai marché entre joueurs. −43,5 % entre mai 2019 et mai 2020, attribué à la lutte contre les bots.', 'A real player market. −43.5% between May 2019 and May 2020, attributed to the fight against bots.'], ['Une purge de tricheurs peut faire chuter un prix, mais ici la chute a commencé avant le patch.', 'A cheater purge can crash a price, but here the drop started before the patch.']],
  [['GTA Online, BAWSAQ', 'GTA Online, BAWSAQ'], ["Agrège l'activité des joueurs côté serveur. Algorithme jamais documenté.", 'Aggregates player activity server-side. Algorithm never documented.'], ['Un prix piloté par serveur reste opaque : seules les régularités observées sont exploitables.', 'A server-driven price stays opaque: only observed regularities can be used.']],
  [['Guild Wars 2, gemmes', 'Guild Wars 2, gems'], ['Deux réserves (or et gemmes), 15 % de frais, échange dans les deux sens.', 'Two pools (gold and gems), 15% fee, two-way exchange.'], ["Non transposable : WARDOGS n'a pas de revente, donc pas de vendeur pour faire le prix.", 'Not transferable: WARDOGS has no resale, so no seller to make the price.']]
];
const LINKS = [
  ['MetaForge', 'https://metaforge.app/wardogs/market'], ['WarGold', 'https://wargold.app/'], ['Steam news', 'https://store.steampowered.com/news/app/1867240'],
  ['WardogsHub', 'https://wardogshub.gg/gold-market/'], ['AllThings.How', 'https://allthings.how/wardogs-gold-bars-explained-the-gold-exchange-and-season-resets/'],
  ['SteamCharts', 'https://steamcharts.com/app/1867240'], ['Nookipedia', 'https://nookipedia.com/wiki/Stalk_Market'], ['Tarkov wiki', 'https://escapefromtarkov.fandom.com/wiki/Physical_Bitcoin'],
  ['WoW Token', 'https://worldofwarcraft.blizzard.com/en-us/news/18141101/introducing-the-wow-token'], ['EVE forum', 'https://forums.eveonline.com/t/q1-2020-economy-review/251541'], ['GW2 wiki', 'https://wiki.guildwars2.com/wiki/Currency_exchange']
];
