# CLAUDE.md — Site CV de Louise Bury

## Contexte
Site CV / portfolio de Louise Bury, Product Manager / Product Owner (près de 8 ans d'expérience), débutante en développement web. Double objectif : marquer les recruteurs et apprendre en construisant. On construit d'abord le MVP décrit plus bas.

## Comment travailler avec moi
- Réponds en français, sans jargon non expliqué.
- Pour chaque user story : présente un plan court et attends ma validation. Ensuite, enchaîne les étapes sans me redemander, lance npm run build, et arrête-toi avant le commit pour que je teste dans le navigateur.
- Explique pourquoi on fait chaque étape, et le code ligne par ligne quand c'est utile.
- Donne des commandes exactes pour PowerShell (Windows, terminal VS Code, dossier `site-cv`).
- Avant toute décision technique importante : propose 2 ou 3 options avec avantages et inconvénients, recommande-en une adaptée à une PM débutante en code, et attends mon choix.
- Travaille une user story à la fois. Ne touche pas aux fichiers hors du périmètre de la tâche.

## Choix techniques (validés)
- HTML, CSS, JavaScript sans framework, avec Vite (modèle vanilla). Pas de React, Next.js ni Tailwind.
- Animations : CSS pour les effets simples, GSAP pour les séquences complexes.
- Scène : le SVG est intégré directement dans le HTML, pour pouvoir cibler chaque calque en CSS et en JavaScript.
- Tous les textes (nom, poste, consigne, info-bulle, contenus des projets) sont en HTML, jamais dans le SVG : référencement et accessibilité.
- Fichiers sources dans `src/assets/` :
  - `scene-accueil.svg` : décor et bibliothèque (1440 × 900). Les 7 vinyles cliquables ont un `id`, `class="vinyle-cliquable"` et un `data-titre`. Ses animations SMIL (sol, lampe à lave) servent de référence visuelle.
  - `main-pointe.svg` : la main néon qui sert de curseur.
  - Ne modifie pas le dessin de ces fichiers sans me demander.
- Déploiement gratuit prévu (Vercel ou GitHub Pages).

## Direction artistique
- Néon rétro années 80, sobre : fond sombre, néons doux, une couleur d'accent par vinyle cliquable.
- Couleurs : fond `#0B0B12`, surface `#17171F`, texte `#F5F3FF`, magenta `#FF4FA0`, soleil `#FFC46B`, bleu `#3B82F6`, violet néon `#B23FE0`, orange `#FB8C80`, violet `#8B5CF6`, lavande `#C084FC` (contour de la bibliothèque, consigne).
- Dégradé signature « Sunset néon » : `#FFC46B → #FF8A6B → #FF4FA0 → #B23FE0 → #4B1FA0`.
- Polices (Google Fonts) : Monoton pour le nom (avec le dégradé signature) ; Tilt Neon pour le poste en capitales, les titres, la consigne et le titre de l'info-bulle ; Nunito pour le texte courant.
- Maquettes : https://www.figma.com/design/7hPTZPxAUeDBH1GnCfZhbi (cadres « Accueil - validé » et « Main - neon »).

## MVP en cours : page d'accueil et sélection d'un vinyle
1. **Scène** : la pièce et la bibliothèque s'affichent en entier sur un écran d'ordinateur, sans défilement. Nom, poste, consigne « Survolez un vinyle lumineux pour découvrir un projet » (pastille néon lavande) et bouton « Son coupé » sont en HTML, par-dessus.
2. **Survol** : un vinyle cliquable s'illumine davantage et une info-bulle affiche son `data-titre` en Tilt Neon, avec « Cliquer pour écouter ce projet ».
3. **Main-curseur** : au-dessus de la bibliothèque, la main remplace la flèche de la souris et la suit (bout de l'index = point de clic). Ailleurs, curseur normal.
4. **Projet** : au clic, une page projet simple s'affiche (titre, Contexte, Problématique, Réalisations, en texte, sans animation de la main), avec un retour à la bibliothèque.
5. **Accessibilité** : Tab passe d'un vinyle à l'autre, Entrée ouvre le projet, le titre est lisible par un lecteur d'écran. Le réglage « réduire les animations » coupe les animations.
6. **Ambiance animée** : les lignes horizontales du sol défilent vers le spectateur ; les bulles de la lampe à lave montent et descendent et son halo « respire ». À refaire en CSS ou GSAP (pas en SMIL), pour pouvoir les couper.

Hors MVP : animation de lancement par la main (capot, disque, bras, 33 tours), zoom vers la platine, scratch au scroll, son, version mobile détaillée. Sur mobile, le MVP affiche une liste simple des projets.

## Principes produit
- Un recruteur trouve l'info en moins de 30 secondes.
- Respecter `prefers-reduced-motion`. Son coupé par défaut.
- Aucune donnée confidentielle ni chiffre client non autorisé.

## Décisions encore ouvertes (hors MVP)
Ne tranche pas : propose-moi des options et attends mon choix.
- Technique de la main animée pour le lancement : SVG + GSAP ou Lottie.
- Technique du zoom vers la platine.
- Mise en page détaillée des pages projet (maquette en cours).

## Commandes utiles
- `npm run dev` : aperçu local.
- `npm run build` : version de production.
- `git status` / `git add` / `git commit -m "message"` : enregistrer une étape.