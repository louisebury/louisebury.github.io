# CLAUDE.md — Site CV de Louise Bury

## Contexte
Site CV / portfolio de Louise Bury, Product Manager / Product Owner (près de 8 ans d'expérience), débutante en développement web. Objectif double : un site qui marque les recruteurs, et apprendre en le construisant.

## Comment travailler avec moi
- Réponds en français, sans jargon non expliqué.
- Une seule étape à la fois, puis attends ma validation.
- Explique pourquoi on fait chaque étape, et le code ligne par ligne quand c'est utile.
- Donne des commandes exactes pour PowerShell (Windows, terminal VS Code, dossier `site-cv`).
- Avant toute décision technique importante : propose 2 ou 3 options avec avantages et inconvénients, recommande-en une adaptée à une PM débutante en code, et attends mon choix.
- Travaille une section à la fois, à partir d'une maquette Figma validée. Ne touche pas aux fichiers hors du périmètre de la tâche.
- Raisonne en versions : MVP d'abord, enrichissements ensuite.

## Choix techniques
- HTML, CSS, JavaScript sans framework, avec Vite (modèle vanilla). Pas de React, Next.js ni Tailwind.
- Animations : GSAP (timelines, ScrollTrigger).
- Le contenu du CV est écrit directement dans `index.html` (lisibilité, référencement). Le JS ne sert qu'aux animations et interactions.
- Illustrations en SVG : un élément animé = un calque/groupe séparé, avec un id sans accents ni espaces (`vinyle`, `etiquette`, `bras-platine`, `main`, `capot`…).
- Déploiement prévu gratuitement (Vercel ou GitHub Pages).

## Direction artistique (néon)
- Ambiance : néon, disco et clubbing années 80, rétro, « neon waves ».
- Couleurs : fond `#0B0B12`, surface `#17171F`, texte `#F5F3FF`, violet `#8B5CF6`, rose `#EC4899`, orange `#FB8C80`, bleu `#3B82F6`. Dégradé signature provisoire : `#8B5CF6 → #EC4899 → #3B82F6`.
- Polices : Righteous pour le nom ; titres de section en police ronde (Rubik Bubbles ou Kavoon) ; texte courant Nunito ou Inter (à trancher).
- Effet « sparkles » (paillettes animées) sous le nom, inspiré d'Aceternity UI, à refaire sans React.
- Maquettes : https://www.figma.com/design/7hPTZPxAUeDBH1GnCfZhbi

## Concept
### Accueil
- Titre : « Louise Bury — Product Manager / Product Owner ».
- Vue dézoomée d'une pièce rétro dédiée à l'écoute de musique : meuble-bibliothèque de vinyles avec une platine dessus, plantes, lampes vintage, casque, enceintes, éventuellement canapé ou fauteuil ; pochettes d'albums affichées au-dessus.
- Vinyles sélectionnables, en surbrillance, titre affiché au survol : Lancement du produit Connect · Refonte de la page indice de prix · Automatisation des benchmarks de masse · Refonte du tunnel de checkout Picard · Mes expériences · Formations · Contact.

### Lancement d'un vinyle (au clic)
- Zoom sur la bibliothèque, puis sur la platine (le meuble et le décor restent visibles).
- Une main de dessin animé rétro néon : ouvre le capot, pose le disque, place le bras de lecture, règle la vitesse (RPM).
- Puis la platine se décale à gauche, le contenu du projet s'affiche à droite.
- Remonter tout en haut = quitter le projet, retour animé à la bibliothèque.

### Consultation d'un projet
- Sections au scroll : Contexte (première vue), Problématique, Réalisations (avec visuels qui suivent le scroll).
- Le vinyle tourne en permanence ; scroll vers le bas = la main scratche dans un sens, vers le haut = dans l'autre.
- Problématique et Réalisations en surbrillance au-dessus du vinyle.
- La main s'arrête pendant la lecture des Réalisations, puis reprend.

## Principes produit
- Un recruteur trouve l'info en moins de 30 s : navigation directe vers les contenus en plus de l'expérience animée.
- Respecter `prefers-reduced-motion`. Animations allégées et scène simplifiée sur mobile.
- Son coupé par défaut, activé par le visiteur, musiques libres de droits.
- Responsive mobile et desktop.
- Aucune donnée confidentielle ni chiffre client non autorisé.

## Décisions encore ouvertes
Ne tranche pas : propose-moi des options (avantages, inconvénients, recommandation) et attends mon choix.
- Technique de la scène et du zoom : SVG + GSAP, 3D, ou mélange.
- Technique de la main animée : SVG + GSAP ou Lottie.
- Reproduction de l'effet « sparkles » sans React.
- Police du texte courant : Nunito ou Inter.

## Commandes utiles
- `npm run dev` : aperçu local.
- `npm run build` : version de production.
- `git status` / `git add .` / `git commit -m "message"` : enregistrer une étape.