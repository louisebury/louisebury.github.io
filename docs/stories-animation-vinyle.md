# User stories : animation du vinyle (lancement, disque en fond, scratch, retour)

Mis à jour le 16/11/2026. La technique est validée : **SVG + GSAP**, sans Lottie.

Ces stories remplacent les anciennes 7.2 et 8.1 de docs/stories-page-projet.md.

## Ordre de réalisation

| # | Story | Version |
|---|---|---|
| 7.1 ✅ | Storyboard et éléments dessinés (fait avec Claude, hors Claude Code) | — |
| 7.2 | Préparer les fichiers : platine vide, nouvelle main-curseur, éléments de l'animation | MVP |
| 7.3 | Le disque en fond de la page projet (fixe, atténué, qui tourne) | MVP |
| 7.4 | Le scratch au défilement (main en fond) | V2 |
| 7.5 | Animation de lancement, partie 1 : zoom, prise du vinyle, sortie de la pochette, demi-tour | V2 |
| 7.6 | Animation de lancement, partie 2 : vue de dessus, pose, bras, 33 tours, arrivée sur la page projet | V2 |
| 7.7 | Animation de retour, interruptions, bouton « Passer », mobile | V2 |

Une story = une session Claude Code en plan mode, puis `/clear`. On ne passe à la suivante qu'après le test dans le navigateur et le commit.

## Fichiers de référence

| Fichier | Où | Rôle |
|---|---|---|
| storyboard-lancement-vinyle.svg | maquettes/animation/ | Images clés, durées, cadrages (viewBox), règles d'interruption |
| page-projet-vinyle.svg | maquettes/animation/ | Disque en fond (option A), 4 états du scratch, couches, règles |
| elements-animation-vinyle.svg | maquettes/animation/ | Planche des éléments, poses de main, gestuelle |
| mains.py | maquettes/animation/ | Calcul exact des poses de main (référence pour le portage en JavaScript) |
| vue-dessus.svg | src/assets/animation/ | Dessus du meuble : décor, platine, bras (#bras-platine, pivot 480 86 en coordonnées platine), pochette posée |
| disque.svg | src/assets/animation/ | Disque et #etiquette, couleur = `var(--couleur-vinyle)` |
| pochette.svg | src/assets/animation/ | Pochette, couleur = `var(--couleur-vinyle)` |
| main.svg | src/assets/animation/ | Main articulée : #main-complete, et #main-tenue (arrière + pouce devant) |
| poses-main.json | src/assets/animation/ | Les 5 poses (pince, tient, ouverte, pointe, scratch) |
| main-pointe.svg | src/assets/ (remplace l'ancien) | Nouvelle main-curseur : bout de l'index à 37,9 % / 13,9 % du fichier |

**Comment fonctionne la main articulée.**
- Les doigts sont dans des `<defs>` (`.doigt`, avec leur `.phalange`).
- Des `<use>` superposés dessinent le halo, le néon, le trait foncé et le remplissage. Il suffit donc de modifier les doigts dans les `<defs>` : tous les calques suivent.
- Une pose intermédiaire = un mélange linéaire des valeurs de deux poses (voir `melange()` dans mains.py). GSAP anime un nombre de 0 à 1 et recalcule la pose à chaque image.

---

## Story 7.2 : préparer les fichiers

**En tant que** développeuse, **je veux** les bons fichiers en place, **afin de** construire l'animation sur des bases propres.

**Critères d'acceptation**
1. Dans src/assets/scene-accueil.svg, le groupe `#vinyle-platine` est remplacé par un plateau vide :
   ```
   <g id="plateau-vide"><ellipse cx="700" cy="494" rx="84" ry="15" fill="#1F1F29" stroke="#F5F3FF" stroke-opacity="0.25" stroke-width="1.5"/><circle cx="700" cy="494" r="1.6" fill="#F5F3FF"/></g>
   ```
2. La nouvelle src/assets/main-pointe.svg est utilisée par la main-curseur. Le décalage du bout de l'index est mis à jour (37,9 % / 13,9 %), et le clic tombe exactement sous le doigt.
3. Les fichiers de src/assets/animation/ sont présents. Un petit module `src/animation/elements.js` sait les insérer dans la page (import `?raw`, comme la scène), sans les afficher pour l'instant.
4. Le module `src/animation/main-articulee.js` reprend la logique de mains.py en JavaScript :
   - `appliquerPose(elementMain, pose)` ;
   - `melangerPoses(poseA, poseB, t)`.

   Une page de test temporaire affiche les 5 poses, et une transition « tient → ouverte » animée par GSAP en boucle.
5. Rien ne change pour le visiteur, en dehors de la platine vide et de la nouvelle main-curseur.

**Pour tester :** l'accueil s'affiche avec la platine vide, et la main-curseur clique au bon endroit. La page de test montre des mains souples, sans trait parasite.

---

## Story 7.3 : le disque en fond de la page projet

**En tant que** visiteur, **je veux** voir le vinyle du projet tourner en fond, **afin de** sentir que « j'écoute » ce projet pendant que je le lis.

**Référence :** page-projet-vinyle.svg, image « 1 · Lecture » et carte « Les couches ».

**Critères d'acceptation**
1. **Le disque :** un demi-disque en gros plan, à gauche, en `position: fixed` derrière le contenu (`z-index` négatif ou couche dédiée).
   - Il est centré à environ 4 % de la largeur et à mi-hauteur, avec un rayon d'environ 0,42 × la largeur de l'écran.
   - Son opacité est de 60 %.
2. **Le fondu noir** passe par-dessus le disque, sous le contenu : un dégradé de gauche à droite et un en haut et en bas, comme sur la maquette. Le disque doit rester discret.
3. **L'étiquette prend la couleur du projet** (`--couleur-vinyle`, rose pour Connect).
4. **Le disque tourne en continu, dans le sens horaire**, à environ 1 tour en 1,8 s (33 tours).
5. **Le contenu est décalé à gauche et chevauche le disque.** La colonne commence à environ 30 % de la largeur, comme sur la maquette. Le sommaire suit le même décalage.
6. **Le disque ne capte aucun clic** (`pointer-events: none`) et n'est pas lu par les lecteurs d'écran (`aria-hidden`).
7. **Avec « réduire les animations »**, le disque est immobile.
8. **Sous 768 px**, le disque est plus petit, encore plus atténué et centré en fond, et le contenu reprend toute la largeur.
9. Le disque n'apparaît que sur la page projet, jamais sur l'accueil.

---

## Story 7.4 : le scratch au défilement

**En tant que** visiteur, **je veux** voir une main scratcher le disque quand je fais défiler la page, **afin de** vivre l'ambiance DJ sans être gêné dans ma lecture.

**Référence :** page-projet-vinyle.svg, états 2, 3 et 4.

**Critères d'acceptation**
1. **La main fait partie du fond.** Elle est placée entre le disque et le fondu noir, donc atténuée comme le disque. Elle est posée en bas à gauche, sur la partie visible du disque, en pose « scratch » avec l'effet de pression.
2. **Défilement vers le bas :** la main apparaît (en 0,15 s) et le disque tourne dans le sens horaire, à une vitesse proportionnelle à la vitesse de défilement (`ScrollTrigger` et sa propriété de vélocité, ou équivalent proposé dans le plan).

   **2 bis. La main fait un seul passage (option A).**
   - Au début d'un défilement, la main apparaît en haut de la partie visible du disque.
   - Elle est accrochée au disque (même centre, même angle) et descend avec lui jusqu'en bas de la partie visible.
   - Arrivée en bas, elle se détend (« scratch → ouverte ») et disparaît. Elle ne revient pas tant que le défilement continue.
   - Elle ne réapparaît qu'au prochain défilement, après un arrêt.
   - Si le défilement s'arrête avant qu'elle n'arrive en bas, elle disparaît sur place après 0,6 s.
3. **Défilement vers le haut :** sens anti-horaire. Même passage en sens inverse : la main apparaît en bas de la partie visible et remonte jusqu'en haut, puis disparaît.
4. **Arrêt :** 0,6 s après le dernier mouvement, si la main est encore sur le disque, elle se détend (passage « scratch → ouverte ») et disparaît sur place. Le disque reprend doucement sa rotation normale.
5. **Pendant qu'une animation de wireframe est visible à l'écran**, la main n'apparaît pas.
6. **Avec « réduire les animations » et sous 768 px**, il n'y a pas de main.
7. Le défilement reste fluide, sans saccade visible.
8. **Plan B :** si ce comportement ne convient pas au test, on retire la main ; le disque garde sa réaction au défilement et la story est notée « à revoir ».

---

## Story 7.5 : animation de lancement, partie 1 (vue de face)

**En tant que** visiteur, **je veux** voir une main prendre le vinyle que j'ai choisi et le sortir de sa pochette, **afin de** comprendre que je lance ce projet comme on lance un disque.

**Référence :** storyboard, images 1 à 4, avec leurs durées et leurs cadres (viewBox).

**Critères d'acceptation**
1. **Au clic sur un vinyle**, une timeline GSAP démarre (sauf dans les cas prévus en 7.7). La main-curseur se cache.
2. **La caméra** est le `viewBox` du SVG de la scène, animé dans un seul sens, sans aller-retour. Cadres de référence (x, y, largeur, hauteur) :
   - accueil 0 0 1440 900 ;
   - prise 250 370 600 375 ;
   - sortie 380 330 560 350 ;
   - demi-tour 575 330 330 206.
3. **Les gestes :**
   1. La main droite pince la tranche du vinyle cliqué et la tire hors du casier. Le casier montre un trou sombre.
   2. La tranche devient la pochette, vue de face. La main gauche apparaît et tient la pochette, doigts derrière et pouce devant.
   3. La main droite sort le disque.
   4. Le disque fait un demi-tour sur lui-même en 0,3 s (aplatissement horizontal), tenu par les deux mains.
4. **La couleur de la pochette, de la tranche et de l'étiquette** est celle du vinyle cliqué (`--couleur-vinyle`).
5. **Les mains passent d'une pose à l'autre en continu** (module de 7.2), jamais par saut brusque.
6. **Durée de cette partie : environ 1,2 s.** Pour cette story, la timeline se termine sur l'image 4, puis la page projet s'affiche par un fondu (la suite arrive en 7.6).

---

## Story 7.6 : animation de lancement, partie 2 (vue de dessus)

**Référence :** storyboard, images 5 à 10.

**Critères d'acceptation**
1. **Le raccord :** à la fin de la partie 1, on bascule sur vue-dessus.svg. Le disque garde sa place et sa taille à l'écran pendant la bascule (0,2 s), pour que la coupure ne se voie pas.
2. **La vue de dessus** montre le décor : la platine, la pochette posée, l'ampli, le casque et la plante. Le bras de lecture est visible dès la première image, au repos.
3. **L'enchaînement :**
   1. pose du disque (l'ombre se resserre, les mains passent de « tient » à « ouverte ») ;
   2. la main droite pince la tête du bras et le fait pivoter de -30° à 0° (pivot 480 86, en coordonnées de la platine) ;
   3. l'index appuie sur 33 : le bouton s'allume ;
   4. le disque tourne ;
   5. les mains sortent par le bas.
4. **L'arrivée sur la page projet :** le disque grossit et glisse vers sa place de fond (7.3), le décor s'efface, puis le contenu apparaît par-dessus. Le disque de l'animation et celui du fond se confondent, sans saut.
5. **Durée totale de l'aller : environ 3 s**, avec les durées du storyboard.
6. À la fin, le focus clavier est placé sur le titre du projet (comme en 4.1).

---

## Story 7.7 : retour, interruptions, bouton « Passer », mobile

**Critères d'acceptation**
1. **Le retour (≈ 1,8 s, images R1 à R5 du storyboard)** se joue au clic sur « ← Bibliothèque », et quand on remonte tout en haut de la page projet au-delà du haut.
   1. Le contenu s'efface.
   2. Le bras revient au repos.
   3. Les mains soulèvent le disque.
   4. Le disque rentre dans sa pochette.
   5. La tranche est poussée dans le casier, et la caméra recule jusqu'à l'accueil.
2. **Un clic n'importe où pendant l'aller** saute à la fin : page projet affichée, disque en fond qui tourne.
3. **Un clic pendant le retour** affiche directement la bibliothèque, vinyle rangé.
4. **Un bouton « Passer »** est visible pendant toute l'animation, accessible au clavier (Tab, Entrée, Échap).
5. **Pas d'animation, mais un simple fondu,** dans ces cas :
   - « réduire les animations » activé ;
   - arrivée directe sur `#connect` ;
   - bouton retour du navigateur ;
   - mobile (sous 768 px).
6. **La même timeline sert pour les 7 vinyles.** Seuls la couleur et la position de la tranche changent. Ces deux valeurs sont lues sur le vinyle cliqué.
7. Le focus clavier revient sur le vinyle au retour (comme en 4.1).

---

## Message type pour Claude Code (plan mode)

```
Lis CLAUDE.md, puis docs/stories-animation-vinyle.md, section « Story 7.X ».
Références : maquettes/animation/ (storyboard, page projet, éléments, mains.py) et src/assets/animation/.
Propose un plan court (fichiers touchés, étapes, risques), puis attends ma validation.
Après validation : exécute, lance npm run build, et arrête-toi avant le commit pour que je teste.
```
