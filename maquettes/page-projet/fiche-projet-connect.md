# Fiche projet : Lancement du produit Connect

> **Comment lire ce fichier**
> - Chaque bloc porte une étiquette : **[obligatoire]** (présent sur toutes les fiches projet) ou **[optionnel]** (à garder seulement si tu as la matière).
> - `[à compléter]` = information que je n'avais pas ; `[à vérifier]` = j'ai reformulé ou supposé, relis.
> - Les notes de relecture (ce que j'ai changé et pourquoi) sont à la fin.

---

## En-tête [obligatoire]

**Surtitre :** Étude de cas · Transport B2B

**Titre :** Lancement du produit Connect

**Accroche (1 à 2 phrases) :**
Une première marketplace de transport n'avait pas trouvé son marché. J'ai été recrutée pour la relancer en deux mois, en plus simple et plus proche du terrain, avec le back office qui va avec.

**Fiche d'identité :**

| Champ | Contenu |
|---|---|
| Entreprise | Upply (start-up supply chain) |
| Marché | Transport routier, B2B |
| Utilisateurs | Chargeurs, transporteurs, commissionnaires `[à vérifier : ils n'apparaissent nulle part ailleurs dans la fiche]` · Équipes internes : sales et customer care |
| Mon rôle | Product Manager |
| Équipe produit | 1 CPO, 2 UX designers, 1 PM (moi) + équipe de développement `[à compléter : taille]` |
| Durée | 2 mois de conception et de développement, puis 2 mois de suivi en bêta |
| Année | `[à compléter]` |

**En un coup d'œil (4 chiffres clés maximum) [optionnel] :**
- **2 produits** lancés en parallèle : Connect et son back office
- **2 mois** : le délai fixé par les investisseurs, tenu
- **20 ordres d'affrètement** générés en bêta : objectif atteint
- **3 minutes** : l'objectif de temps pour publier un lot

---

## Contexte [obligatoire]

### L'entreprise
Upply est une start-up qui met la tech au service de la supply chain. À l'époque, elle porte deux produits :
- **Smart** : il permet aux professionnels du transport de comparer leurs prix grâce à plus de 2 milliards de données de transport. Déjà commercialisé, il commence à faire ses preuves.
- **Marketplace** (renommée ensuite **Connect** `[à vérifier : renommée au moment de la relance ?]`) : elle met en relation les chargeurs, qui ont une marchandise (un fret) à transporter, et les transporteurs, qui ont un camion disponible. Ils doivent y négocier puis conclure un ordre de transport.

### Le point de départ : un premier lancement manqué
La Marketplace a été construite et commercialisée en 2020. Le lancement a été un échec commercial : le produit ne répondait pas aux attentes du terrain.

**Pourquoi ça n'a pas marché [optionnel, mais très parlant ici] :**
1. **Un formulaire trop long.** Publier un besoin de transport prenait trop de temps.
2. **Des habitudes très ancrées.** Chargeurs et transporteurs avaient leur carnet d'adresses et négociaient par téléphone.
3. **Des utilisateurs peu digitalisés.** Leur quotidien exige d'aller vite, et l'outil les ralentissait.
4. **Un matching trop rigide.** Le système attendait que des critères précis coïncident entre chargeur et transporteur. Sur le terrain, au contraire, on négocie tous les jours et on a besoin de souplesse et de réactivité.

Résultat : le produit ne se vendait pas, et les équipes s'essoufflaient.

**Visuel [optionnel] :** animation de l'ancienne Marketplace (wireframe-avant.html), une reconstitution de mémoire : formulaire long en plusieurs étapes, attente d'un « match », tableau des lots.

### Ma mission
J'arrive avec trois objectifs :
1. **Relancer une marketplace** beaucoup plus simple, facile à prendre en main.
2. **Refondre le back office** utilisé par les sales et le customer care, pour suivre l'activité de la nouvelle marketplace et gagner en efficacité opérationnelle.
3. **Tenir le délai** attendu par les investisseurs.

Le tout pendant une réorganisation de l'équipe produit et de l'entreprise : l'équipe était à reconstruire.

---

## Problématique [obligatoire]

**La question centrale :**
> Comment faire adopter une marketplace à des professionnels du transport peu digitalisés, qui doivent négocier vite et ont l'habitude du téléphone ?

**Les questions qui en découlent [optionnel] :**
- Comment s'adapter à leurs contraintes quotidiennes, pour qu'ils négocient une offre de transport plus vite qu'au téléphone ?
- Comment donner aux équipes internes un back office qui leur permette de suivre ce qui se passe sur la plateforme ?

**Les contraintes [optionnel] :**
- **Délai :** 2 mois, fixés par les investisseurs.
- **Moyens :** une équipe produit et une équipe de développement réduites. Le produit devait être simple et rapide à développer.
- **Organisation :** une équipe produit en pleine réorganisation, où tout était à construire.
- **Périmètre :** deux produits à développer en parallèle, Connect et le back office.

**Comment on mesure le succès [optionnel] :**
Lancement en bêta avec 4 entreprises identifiées par l'équipe sales (2 chargeurs, 2 transporteurs), et suivi pendant 2 mois. Objectifs à 2 mois :
- **3 utilisateurs actifs par entreprise**, soit 12 au total
- **20 ordres d'affrètement** générés sur la plateforme

---

## Réalisations [obligatoire]

### Étape 1 · Comprendre (discovery)

**Connect.** Mot d'ordre : *une plateforme simple et facile à utiliser.*
- J'ai mené des ateliers avec les sales et le customer care pour comprendre le monde du transport `[à vérifier : « j'ai mené » ou « nous avons mené »]`.
- Ateliers de conception avec l'équipe produit et les métiers, puis avec les développeurs.
- Benchmark concurrentiel.
- Conception et prototypage des parcours, validés auprès des bêta-testeurs.

**Back office.** Mot d'ordre : *suivre en temps réel ce qui se passe sur Connect.*
- Ateliers avec les sales et le customer care pour comprendre leurs besoins.
- Ateliers de conception avec l'équipe produit, puis avec les développeurs.

### Étape 2 · Découper en MVP
Avec 2 mois et une petite équipe, il fallait aller à l'essentiel.

**MVP Connect : un ordre de transport doit pouvoir se conclure de bout en bout sur la plateforme.**
Trois parcours minimum :
1. Le chargeur publie un lot.
2. Le transporteur envoie une offre.
3. L'ordre de transport (ordre d'affrètement) est généré.

**MVP back office : les équipes internes doivent pouvoir consulter toute l'activité.**
Lots publiés · offres envoyées · ordres d'affrètement.

J'ai ensuite construit la roadmap et priorisé les epics à partir de ce découpage.

### Étape 3 · Ce qu'on a livré
> Visuels : une animation de wireframe pour les chargeurs (wireframe-chargeur.html) et une pour les transporteurs (wireframe-transporteur.html). Pas de visuel pour le back office : le bloc reste en texte.

**Pour les chargeurs : publier un lot en moins de 3 minutes**
- Un formulaire de publication réduit : on garde le minimum de critères, on en ajoutera si le besoin apparaît.
- Les adresses se complètent automatiquement (intégration Google) pour gagner du temps.
- Un lot récurrent se duplique en un clic.
- Une liste des lots épurée, avec des statuts clairs pour suivre chaque transport.
- Une notification par e-mail dès qu'un transporteur fait une offre : plus besoin de se connecter pour vérifier.

**Pour les transporteurs : trouver le bon lot et négocier en direct**
- Une page de recherche simple, avec l'essentiel en première vue : destination et marchandise à transporter.
- Un formulaire d'offre court et un suivi simplifié, pour permettre la négociation en direct.
- Les recherches s'enregistrent : le transporteur reçoit un e-mail quand un nouveau lot correspond, sans avoir à se connecter chaque jour.

**Pour les équipes internes : un back office repensé**
- Une vue chargeurs et une vue transporteurs.
- Le détail de chaque lot et de chaque offre consultable (MVP).

### Étape 4 · Lancer et apprendre
- Lancement auprès des 4 entreprises bêta-testeuses.
- Entretiens utilisateurs pour recueillir leurs retours.
- Suivi des indicateurs : ordres d'affrètement, utilisateurs actifs.
- Améliorations de la plateforme à partir des retours.

---

## Résultats [obligatoire]

**Ce qui a marché :**
- **Délai tenu :** Connect et le back office ont été lancés dans les 2 mois attendus par les investisseurs.
- **20 ordres d'affrètement** générés pendant la bêta : l'objectif est atteint.

**Indicateurs à 2 mois (objectif → réel) :**
- Ordres d'affrètement : 20 → **20**, objectif atteint
- Utilisateurs actifs : 12 → **4**, en dessous de l'objectif

**Ce que disaient les bêta-testeurs [optionnel, recommandé] :**
> « Simple, intuitif et facile. »
Les mots qui revenaient le plus souvent dans leurs retours.

**Ce que j'en retiens [optionnel, recommandé] :**
Le produit tenait sa promesse : les utilisateurs engagés publiaient des lots et faisaient des offres, et l'objectif d'ordres d'affrètement a été atteint.
Le vrai défi était ailleurs : l'adoption. Il fallait convaincre davantage d'utilisateurs dans chaque entreprise. Nous avons donc concentré la discovery suivante sur cette question : donner envie d'adopter l'outil, au sein des entreprises clientes comme auprès de nouvelles entreprises `[à vérifier : ta phrase s'arrêtait sur « et de nouvelles… », j'ai compris « nouvelles entreprises »]`.

---

## Pied de page [obligatoire]
- Bouton : ← Retour à la bibliothèque
- Lien : Projet suivant · Refonte de la page indice de prix →

---

## Notes de relecture (à supprimer ensuite)

**Ce que j'ai reclassé**
- Ta seconde liste « Résultats » (formulaire réduit, auto-complétion, duplication…) décrit ce que vous avez **livré**, pas des résultats. Je l'ai déplacée dans Réalisations, sous « Ce qu'on a livré », classée par utilisateur. Un recruteur y voit tout de suite tes choix produit.
- Les indicateurs sont passés dans Problématique, sous « Comment on mesure le succès ». On pose l'objectif avant de raconter ce qu'on a fait, puis on y répond dans Résultats.
- Les Réalisations suivent maintenant 4 étapes : comprendre → découper → livrer → apprendre. C'est la démarche produit qu'un recruteur PM/PO cherche à reconnaître.
- « Le produit ne se vendait pas, les équipes étaient démotivées » est une conséquence, pas une cause. Je l'ai sorti de la liste des causes.

**Ce que j'ai reformulé**
- L'accroche résume toute l'histoire en 2 phrases, pour le recruteur qui ne lira que ça.
- Corrections : « encrées » → ancrées, « commencait » → commençait, « basées » → basé, « companies » → entreprises.
- « Formulaire devait prendre 3 minutes » → « publier un lot en moins de 3 minutes » : c'est devenu le titre du bloc chargeurs.

**Résultats : pourquoi j'affiche aussi l'objectif manqué**
4 utilisateurs actifs sur 12 visés : je l'ai gardé visible. Un recruteur produit fait davantage confiance à un bilan honnête, et cet écart amène naturellement « Ce que j'en retiens ». Ça montre que tu as su lire tes indicateurs et réorienter la discovery. Si tu préfères, on peut retirer la barre et garder seulement le texte.

**Ce qui manque encore (par ordre d'importance)**
1. **Ton rôle personnel.** Utilise « j'ai » pour ce que tu as porté toi-même (ateliers, découpage du MVP, roadmap) et « nous » pour le travail d'équipe.
2. **L'année et la taille de l'équipe de développement.**
3. **Les commissionnaires.** Ils sont cités comme utilisateurs mais n'apparaissent nulle part : précise leur rôle ou retire-les.

**Confidentialité :** Upply était ton employeur. Vérifie que les objectifs de bêta et les chiffres réels (4 utilisateurs actifs, 20 ordres) peuvent être publiés.
