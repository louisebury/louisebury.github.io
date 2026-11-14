# User stories : page projet « Lancement du produit Connect »

Mis à jour le 14/11/2026. Ces stories remplacent l'ancienne story 4 (« consulter un projet ») de la note MVP.

## Ordre de réalisation

| # | Story | Version |
|---|---|---|
| 4.1 | Ouvrir la page projet au clic sur le vinyle Connect, et en revenir | MVP |
| 4.2 | Construire le contenu et la mise en page de la page Connect | MVP |
| 4.3 | Naviguer dans la page projet (sommaire des sections, accès aux autres projets) | MVP |
| 4.4 | Intégrer les 3 animations de wireframes | MVP |
| 4.5 | Effets au défilement (apparitions, carte question qui s'allume) | MVP+ |
| 7.1 | Dessiner la platine et la main, calque par calque (avec Claude, hors Claude Code) | V2 |
| 7.2 | Animation de lancement : la main installe le vinyle, puis la page projet s'affiche | V2 |
| 8.1 | Retravailler l'affichage du vinyle sur la page projet (design à valider d'abord) | V2 |

Une story = une session Claude Code en plan mode, puis `/clear` avant la suivante. On ne passe à la suivante qu'après le test dans le navigateur et le commit.

## Fichiers de référence à placer dans le projet (avant la story 4.1)

| Fichier | Où le mettre | Rôle |
|---|---|---|
| maquette-projet-connect.html | maquettes/page-projet/ | Référence visuelle (s'ouvre dans le navigateur) |
| maquette-projet-connect.svg | maquettes/page-projet/ | Même maquette, en image statique |
| fiche-projet-connect.md | maquettes/page-projet/ | Les textes définitifs de la page |
| wireframe-avant.html, wireframe-chargeur.html, wireframe-transporteur.html | public/wireframes/ | Les animations, servies telles quelles par Vite |

Les encadrés lavande « Note de maquette » et les mentions `[à compléter]` ou `[à vérifier]` ne doivent pas apparaître sur le site.

## Décisions techniques (rappel)

- **Une seule page**, avec le contenu dans index.html. Chaque projet est une `<section>` avec un id (`#connect`), et une seule vue est affichée à la fois : la bibliothèque, ou un projet.
- **L'adresse change** (monsite/#connect). Elle est partageable, et le bouton retour du navigateur ramène à la bibliothèque.
- **Les animations de wireframes sont intégrées avec des `<iframe>`** qui pointent vers public/wireframes/. Elles restent isolées du reste du site, sans rien à réécrire.
- **Le texte est en HTML et les animations en GSAP**, sans framework.

---

## Story 4.1 : ouvrir la page projet au clic sur le vinyle Connect

**En tant que** recruteur, **je veux** cliquer sur le vinyle « Lancement du produit Connect » et arriver sur la page du projet, **afin de** découvrir ce projet en détail.

**Critères d'acceptation**
1. Au clic sur `#vinyle-connect` dans la scène d'accueil, la bibliothèque disparaît et la section `#connect` s'affiche, en haut de page. Le passage se fait par un simple fondu (pas encore de main ni de zoom).
2. L'adresse devient `…/#connect`. Si on ouvre directement cette adresse, la page projet s'affiche sans passer par l'accueil.
3. Un bouton « ← Bibliothèque », visible en haut, ramène à l'accueil. Le bouton retour du navigateur fait la même chose.
4. Au retour, l'accueil réapparaît dans l'état où on l'avait laissé, et la main-curseur fonctionne toujours.
5. Les autres vinyles gardent leur comportement actuel (survol + info-bulle). Ils n'ouvrent encore rien.
6. Au clavier, le focus va sur le titre du projet à l'ouverture, puis revient sur le vinyle Connect au retour.
7. La section `#connect` contient pour l'instant un simple titre provisoire. Le contenu arrive en 4.2.

**Hors périmètre :** le contenu de la page, l'animation de la main, le zoom.

**Pour tester :** cliquer sur le vinyle, retour navigateur, rechargement de la page sur `#connect`, navigation au clavier (Tab, Entrée).

---

## Story 4.2 : construire le contenu et la mise en page de la page Connect

**En tant que** recruteur, **je veux** lire l'histoire du projet (contexte, problématique, réalisations, résultats), **afin de** comprendre en moins de 30 secondes ce que Louise a fait, puis d'approfondir si je le souhaite.

**Références :** maquettes/page-projet/maquette-projet-connect.html (visuel) et fiche-projet-connect.md (textes, à reprendre mot pour mot).

**Critères d'acceptation**
1. **En-tête :** surtitre « Étude de cas · Transport B2B », titre néon, accroche, fiche d'identité (6 champs) et 4 chiffres clés (2 produits, 2 mois, 20 ordres d'affrètement, < 3 min).
2. **Contexte :** l'entreprise et les 2 produits (cartes Smart et Marketplace → Connect), le point de départ, les 4 raisons de l'échec en cartes avec icônes, la phrase « Résultat », puis Ma mission (3 cartes) et la pastille « réorganisation ». Prévoir l'emplacement vide de l'animation « L'ancien parcours, reconstitué » (rempli en 4.4).
3. **Problématique :** la carte question mise en avant, les 2 sous-questions, et deux colonnes : Les contraintes / Comment on mesure le succès (12 et 20).
4. **Réalisations :** une frise verticale en 4 étapes.
   - Comprendre : cartes Connect et Back office.
   - Découper en MVP : le schéma en 3 étapes chargeur → transporteur → plateforme, et le MVP back office.
   - Ce qu'on a livré : blocs Chargeurs et Transporteurs avec un emplacement d'animation, bloc Back office en texte seul.
   - Lancer et apprendre : les 4 cartes et la flèche « on itère ».
5. **Résultats :**
   - 2 cartes mises en avant : délai tenu, 20 ordres d'affrètement ;
   - les barres « objectif → réel » (20/20 en dégradé, 4/12 en orange), dessinées en CSS ;
   - le verbatim « Simple, intuitif et facile. » ;
   - « Ce que j'en retiens ».
6. **Pied de page :** bouton « ← Retour à la bibliothèque » et carte « Projet suivant : Refonte de la page indice de prix » (lien inactif pour l'instant).
7. **Mise en page desktop :** colonne de contenu de 740 px à droite. La colonne de gauche reste vide pour l'instant, le vinyle arrive en 8.1.
8. **Mise en page sous 768 px :** une seule colonne, les cartes s'empilent, aucun défilement horizontal.
9. **Style :** couleurs, polices (Tilt Neon pour les titres, Nunito pour le texte) et effets néon en variables CSS, cohérents avec l'accueil. Les icônes sont en SVG dans le HTML.
10. **HTML sémantique :** `<article>`, `<section>` par partie, titres `<h1>` à `<h3>` dans l'ordre, listes en `<ul>`. Aucune annotation de maquette ni texte `[à compléter]` sur le site.

**Hors périmètre :** sommaire fixe (4.3), animations (4.4), effets au scroll (4.5), vinyle (8.1).

**Pour tester :** comparer côte à côte avec la maquette, en largeur 1440 px puis 375 px.

---

## Story 4.3 : naviguer dans la page projet

**En tant que** recruteur pressé, **je veux** sauter directement à la partie qui m'intéresse ou à un autre projet, **afin de** ne pas tout faire défiler.

**Critères d'acceptation**
1. **Barre du haut fixe :**
   - le nom « Louise Bury » à gauche ;
   - le bouton « ← Bibliothèque » ;
   - les 7 contenus avec la pastille de leur couleur, Connect actif, les autres visibles mais inactifs pour l'instant ;
   - le bouton « Son coupé » à droite.
2. **Sommaire fixe** sous la barre du haut : Contexte, Problématique, Réalisations, Résultats. Un clic fait défiler en douceur jusqu'à la section. La section en cours de lecture s'allume (avec IntersectionObserver).
3. Le défilement en douceur est désactivé si le visiteur a activé « réduire les animations ».
4. Sous 768 px, le sommaire devient une barre qu'on fait défiler horizontalement, et les 7 contenus de la barre du haut sont repliés dans un menu.
5. Tout est utilisable au clavier, avec un focus visible.

---

## Story 4.4 : intégrer les animations de wireframes

**En tant que** recruteur, **je veux** voir les parcours livrés en action, **afin de** comprendre concrètement les choix produit.

**Critères d'acceptation**
1. Trois `<iframe>` pointent vers `/wireframes/wireframe-avant.html` (dans le Contexte), `/wireframes/wireframe-chargeur.html` et `/wireframes/wireframe-transporteur.html` (dans Ce qu'on a livré).
2. Chaque iframe :
   - occupe toute la largeur de son bloc et garde ses proportions (1200 × 692, plus 44 px pour la barre Pause), avec `aspect-ratio` en CSS ;
   - porte un `title` explicite, par exemple « Animation : parcours chargeur sur Connect » ;
   - utilise `loading="lazy"` et n'a pas de bordure.
3. Les animations ne démarrent que lorsqu'elles sont visibles à l'écran (IntersectionObserver côté page + `postMessage` vers l'iframe, ou équivalent proposé dans le plan). Elles se mettent en pause quand elles sortent de l'écran.
4. Avec « réduire les animations », chaque animation affiche son image finale, sans mouvement (comportement déjà prévu dans les fichiers).
5. Sur mobile, les animations restent lisibles (pleine largeur). Si elles sont trop petites sous 480 px, le plan propose une solution.
6. Les fichiers public/wireframes/*.html ne sont modifiés que si c'est nécessaire (par exemple pour recevoir le message lecture / pause), et le plan dit exactement quoi.

---

## Story 4.5 : effets au défilement

**En tant que** visiteur, **je veux** une page vivante mais lisible, **afin de** retrouver l'ambiance néon du site.

**Critères d'acceptation**
1. Les blocs apparaissent en fondu léger avec une petite montée, au premier passage seulement (GSAP ScrollTrigger).
2. La carte question de la Problématique s'allume (halo néon rose) quand elle arrive au centre de l'écran.
3. Les barres « objectif → réel » se remplissent quand elles entrent à l'écran.
4. Avec « réduire les animations », il n'y a aucun mouvement : tout est affiché directement.
5. Aucun effet ne retarde la lecture : le texte est lisible immédiatement, même si le JavaScript ne charge pas.

---

## Story 7.1 : dessiner la platine et la main (avec Claude, hors Claude Code)

**Objectif :** préparer les illustrations SVG de l'animation de lancement, avant tout code.

**Livrables**
1. Un storyboard en 6 à 8 images clés :
   1. zoom sur la bibliothèque ;
   2. zoom sur la platine ;
   3. ouverture du capot ;
   4. pose du disque ;
   5. pose du bras de lecture ;
   6. réglage sur 33 tours ;
   7. le disque tourne ;
   8. transition vers la page projet.
2. La platine en SVG, un calque nommé par élément animé : `capot`, `plateau`, `vinyle`, `etiquette`, `bras-platine`, `selecteur-rpm`, `bouton-start`.
3. La main néon en 3 ou 4 poses (ouverte, pince, appui), en SVG, avec le point d'attache du poignet indiqué.
4. La durée cible : 4 à 6 secondes au total, avec un bouton « Passer l'animation ».

## Story 7.2 : animation de lancement d'un vinyle

**En tant que** visiteur, **je veux** voir la main installer le disque sur la platine, **afin de** vivre l'expérience « j'écoute un projet » avant de le lire.

**Critères d'acceptation**
1. Au clic sur le vinyle Connect, une timeline GSAP joue le storyboard validé en 7.1, puis affiche la page projet (la même qu'en 4.1, qui reste le point d'arrivée).
2. Un bouton « Passer », visible et accessible au clavier, mène directement à la page projet.
3. Avec « réduire les animations », sur mobile, ou si on arrive directement sur `#connect` : pas d'animation, la page projet s'affiche tout de suite.
4. La timeline est écrite pour être réutilisée par les autres vinyles (couleur et titre en paramètres).
5. Au retour à la bibliothèque, l'animation se joue à l'envers en version courte (moins de 1,5 s), ou un simple fondu, au choix proposé dans le plan.

## Story 8.1 : retravailler l'affichage du vinyle sur la page projet

**Préalable :** choisir ensemble la direction avant d'ouvrir Claude Code. Pistes :
- un petit vinyle fixe dans un coin ;
- un vinyle derrière l'en-tête seulement ;
- un vinyle qui tourne dans le sommaire ;
- un vinyle qui suit le scroll.

Une maquette sera validée avant le code.

**Critères d'acceptation (à préciser après le choix)**
1. Le vinyle tourne en continu, plus vite pendant le défilement. Avec « réduire les animations », il est immobile.
2. Il ne gêne jamais la lecture : il ne passe sous aucun texte et ne bouge pas la mise en page.
3. Version mobile simplifiée ou masquée.

---

## Message type à donner à Claude Code (plan mode)

```
Lis CLAUDE.md, puis docs/stories-page-projet.md, section « Story 4.1 ».
Références : maquettes/page-projet/ (maquette HTML + fiche-projet-connect.md).
Propose un plan court (fichiers touchés, étapes, risques), puis attends ma validation.
Après validation : exécute, lance npm run build, et arrête-toi avant le commit pour que je teste.
```

## Définition de « terminé » (pour chaque story)

- Tous les critères d'acceptation sont vérifiés dans le navigateur, en desktop et en mobile.
- `npm run build` passe sans erreur.
- La console du navigateur ne montre aucune erreur.
- Le commit est fait par Louise après son test, avec un message clair.
- Avant la mise en ligne : Louise a vérifié que le nom Upply, ses couleurs et les chiffres (4 utilisateurs actifs, 20 ordres d'affrètement) peuvent être publiés.
