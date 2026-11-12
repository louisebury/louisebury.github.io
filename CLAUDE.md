# Site CV de Louise Bury

## Contexte
- Site CV / portfolio personnel de Louise Bury, Product Manager / Product Owner (près de 8 ans d'expérience).
- Louise débute en développement web et apprend en construisant ce site.

## Comment travailler avec moi
- Réponds toujours en français.
- Explique chaque modification simplement, sans jargon non expliqué.
- Fais de petites modifications, une étape à la fois, et explique pourquoi.
- Avant une décision technique importante, propose plusieurs options avec leurs avantages et inconvénients, puis recommande-en une.
- Ne supprime jamais de fichier sans me le demander.

## Choix techniques
- HTML, CSS et JavaScript "vanilla" (sans framework), avec Vite.
- Animations avec GSAP (notamment ScrollTrigger).
- Pas de React, Next.js ni Tailwind.
- Le contenu du CV est écrit directement dans index.html. Le JavaScript sert uniquement aux animations et aux interactions.
- Aperçu local : npm run dev

## Concept créatif
- Univers musical, plutôt sombre, autour du vinyle : un vinyle = une expérience professionnelle.
- Accueil : plusieurs vinyles disponibles sélectionnables qui correspondent chacun à une expérience du CV. Le visiteur devra pouvoir sélectionner un vinyle, ce qui déclenchera une animation de main qui prend le vinyle, et le fait démarrer. 
- Le premier vynile sera celui sur le profil et les coordonnées
- Chaque vinyle correspondant à une expérience aura son animation et son univers, et devra montrer en détails les expériences
- Pour chaque expérience : une main pose un vinyle sur la platine et le lance, puis le disque tourne pendant que l'on fait défiler l'expérience.
- Plus tard, peut-être : des vinyles plus détaillés pour les projets.

## Principes produit
- Le contenu doit rester lisible même sans animation (respecter le réglage "réduire les animations" du visiteur).
- Animations courtes, liées au défilement, jamais bloquantes pour la lecture.
- Les vyniles doivent avoir une animation de vinyle en train d'être écouté, vynile qui tourne pendant la lecture
- Son coupé par défaut, déclenché uniquement par une action du visiteur. Musiques libres de droits uniquement.
- Site responsive mobile et desktop, avec des animations allégées sur mobile.