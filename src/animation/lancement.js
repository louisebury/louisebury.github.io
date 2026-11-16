/* ---------------------------------------------------------
   Story 7.5 : animation de lancement, partie 1 (vue de face)
   Référence : maquettes/animation/storyboard-lancement-vinyle.svg, images 1 à 4.

   Au clic sur un vinyle, une timeline GSAP joue la séquence, puis main.js
   affiche la page projet par son fondu habituel.

   Palier 1 : la caméra (zoom accueil → prise → sortie → demi-tour).
   Palier 2 : la main droite pince la tranche et la tire hors du casier (trou sombre).
   Palier 3 : la tranche devient la pochette, la main gauche la tient, la main droite sort le disque.
   Palier 4 : demi-tour du disque tenu par les deux mains, pochette posée contre la platine.

   Story 7.6 : animation de lancement, partie 2 (vue de dessus), storyboard images 5 à 10.
   Palier 1 : raccord vers la vue de dessus (le disque garde sa place et sa taille), bras au repos.
   Palier 2 : pose du disque (l'ombre se resserre, les mains s'ouvrent), la main droite amène le bras sur le disque.
   Palier 3 : l'index appuie sur 33 (le bouton s'allume), le disque tourne, les mains sortent par le bas.
   Palier 4 : le disque grossit et glisse jusqu'à la place mesurée du disque de fond (fond-vinyle.js),
              le décor s'efface ; main.js échange alors la scène contre la page projet, sans fondu,
              et le contenu apparaît (voir afficherVue et .vue-projet--arrivee).
   --------------------------------------------------------- */
import { gsap } from 'gsap'
import { insererElement } from './elements.js'
import { appliquerPose, melangerPoses } from './main-articulee.js'
import { mesurerDisqueDeFond, calerRotationFondVinyle } from '../fond-vinyle.js'

/* ---------- Réglages : modifiez ces valeurs pour changer le rythme ---------- */
// Durées en secondes (storyboard : 0 → 0,4 s, 0,4 → 0,9 s, 0,9 → 1,2 s)
const DUREE_PRISE = 0.5 // image 1 → 2 : zoom vers la bibliothèque, la main pince et tire la tranche
const DUREE_SORTIE = 0.7 // image 2 → 3 : pochette, main gauche, sortie du disque
const DUREE_DEMI_TOUR = 0.7 // image 3 → 4 : demi-tour du disque
// Story 7.6 (storyboard : 0,2 / 0,25 / 0,35 / 0,2 / 0,3 / 0,5 s), objectif : aller complet sous 4,5 s
const DUREE_RACCORD = 0.2 // image 4 → 5 : bascule vers la vue de dessus
const DUREE_POSE = 0.35 // image 5 → 6 : le disque se pose, les mains s'ouvrent
const DUREE_BRAS = 0.5 // image 6 → 7 : la main droite amène le bras sur le disque
const DUREE_33 = 0.3 // image 7 → 8 : l'index appuie sur 33, le disque se met à tourner
const DUREE_MAINS = 0.4 // image 8 → 9 : les mains sortent par le bas
const CHEVAUCHEMENT_MAINS = 0.2 // les mains commencent à sortir 0,2 s avant la fin de l'étape « 33 »
const DUREE_ARRIVEE = 0.7 // image 9 → 10 : le disque grossit et glisse à sa place de fond
// Ensuite, le contenu de la page projet apparaît en 0,3 s : DUREE_APPARITION_CONTENU dans main.js
const RALENTI = 1 // 1 = vitesse normale ; 0.25 = 4 fois plus lent (pratique pour observer)

// Cadres de la caméra = le viewBox du SVG de la scène : [x, y, largeur, hauteur]
// Ils ont tous le rapport 1,6 de la scène (1440 / 900) : le zoom ne déforme rien.
const CADRE_ACCUEIL = [0, 0, 1440, 900]
const CADRE_PRISE = [250, 370, 600, 375]
const CADRE_SORTIE = [380, 330, 560, 350]
const CADRE_DEMI_TOUR = [575, 330, 330, 206]
// Story 7.6 : le cadre de la vue de dessus, en coordonnées de vue-dessus.svg (storyboard, images 5 à 9)
const CADRE_DESSUS = [80, 40, 1360, 850]

// Image 2 : la prise de la tranche
const PART_APPROCHE = 0.6 // part de DUREE_PRISE où la main arrive et se ferme ; le reste = le tirage
const TIRAGE = 46 // de combien la tranche monte hors du casier (storyboard : y 570 → 524)
const DEPART_MAIN = 150 // la main droite arrive d'en bas : elle part 150 unités plus bas que sa place

// Image 3 : la sortie du disque
const PART_POCHETTE = 0.45 // part de DUREE_SORTIE où la tranche devient pochette ; le reste = le disque sort

// Image 4 : le demi-tour du disque
const APLATISSEMENT_MIN = 0.25 // largeur du disque au milieu du demi-tour (0.25 = un quart ; storyboard : 13,5 / 54)

// Story 7.6, image 7 : le bras de lecture
const PART_APPROCHE_BRAS = 0.35 // part de DUREE_BRAS où la main va pincer la tête du bras ; le reste = la rotation

/* ---------- Le reste du fichier n'a pas besoin d'être modifié ---------- */
const SVG = 'http://www.w3.org/2000/svg'
const PIVOT_MAIN = '110 130' // point autour duquel une main tourne (voir poses-main.json)

// Placement de la main droite par rapport au coin haut-gauche de la tranche, recopié du storyboard (image 2) :
// la main est à (440.9, 496.3) quand la tranche est à (444, 524), réduite à 30 %, penchée de -10°.
const MAIN_PINCE = { dx: -3.1, dy: -27.7, echelle: 0.3, angle: -10 }

// Image 3, recopiée du storyboard (coordonnées de la scène)
const IMAGE_3 = {
  pochette: { x: 470, y: 360, l: 104, h: 104 }, // de face, carrée
  disque: { cx: 574, cy: 412, rayon: 48 }, // à moitié sorti, vers la droite
  // Main gauche : c'est une main droite retournée (miroir autour de la ligne verticale x = miroir)
  mainGauche: { miroir: 476, x: 459.9, y: 368.6, echelle: 0.27, angle: -60 },
  mainDroite: { x: 601, y: 383.2, echelle: 0.27, angle: -70 },
}
// Image 4, recopiée du storyboard : la pochette est posée contre la platine,
// le disque est tenu par les deux mains, une de chaque côté
const IMAGE_4 = {
  pochette: { x: 560, y: 452, l: 64, h: 64, angle: -6, opacite: 0.95 },
  disque: { cx: 720, cy: 430, rayon: 54 },
  mainGauche: { miroir: 678, x: 660.4, y: 398.1, echelle: 0.25, angle: -70 },
  mainDroite: { x: 744.4, y: 402.1, echelle: 0.25, angle: -70 },
}
// Au début de la sortie, le disque est caché dans la pochette : son centre est celui de la pochette
const DISQUE_RENTRE = { cx: IMAGE_3.pochette.x + IMAGE_3.pochette.l / 2, cy: IMAGE_3.disque.cy }
const RAYON_DISQUE_SVG = 196 // rayon du disque dans disque.svg
const COTE_POCHETTE_SVG = 200 // côté de la pochette dans pochette.svg

/* Story 7.6 : la vue de dessus.
   On ne bouge pas la caméra : la vue de dessus est réduite et posée dans le cadre de l'image 4.
   Les valeurs ci-dessous sont recopiées du storyboard, en coordonnées de vue-dessus.svg ;
   les fonctions versSceneX / versSceneY les convertissent en coordonnées de la scène. */
const K_DESSUS = CADRE_DEMI_TOUR[2] / CADRE_DESSUS[2] // 330 / 1360 : 1 unité de la vue de dessus = 0,24 unité de la scène
const versSceneX = (x) => CADRE_DEMI_TOUR[0] + (x - CADRE_DESSUS[0]) * K_DESSUS
const versSceneY = (y) => CADRE_DEMI_TOUR[1] + (y - CADRE_DESSUS[1]) * K_DESSUS
// Une main du storyboard (vue de dessus) → la même main en coordonnées de la scène
const mainVersScene = ({ x, y, echelle, angle, miroir }) => ({
  x: versSceneX(x),
  y: versSceneY(y),
  echelle: echelle * K_DESSUS,
  angle,
  ...(miroir === undefined ? {} : { miroir: versSceneX(miroir) }), // seulement pour une main gauche
})
// Image 6 : le disque est posé sur le plateau, les mains ouvertes s'écartent
const IMAGE_6 = {
  disque: { cx: 720, cy: 450, rayon: 227.5 },
  mainGauche: { miroir: 452.5, x: 407.3, y: 491.7, echelle: 0.72, angle: -55 },
  mainDroite: { x: 942.3, y: 481.7, echelle: 0.72, angle: -55 },
}
// L'ombre du disque, décalée vers le bas à droite : loin quand le disque est en l'air (image 5),
// resserrée quand il est posé (image 6). dx, dy en unités de la vue de dessus ; taille = part du rayon du disque.
const OMBRE_EN_L_AIR = { dx: 40, dy: 60, taille: 0.89, opacite: 0.5 }
const OMBRE_POSEE = { dx: 6, dy: 8, taille: 1, opacite: 0.4 }
const FLOU_OMBRE = 14 // flou de l'ombre (unités de la vue de dessus)
// Le bras de lecture : pivot et tête (cellule), en coordonnées de la platine (vue-dessus.svg)
const PLATINE = { x: 420, y: 175, echelle: 1.25 } // place de la platine dans la vue de dessus
const PIVOT_BRAS = { x: 480, y: 86 }
const TETE_BRAS = { x: 352, y: 303 } // centre de la cellule, quand le bras est à 0°
const ANGLE_BRAS_REPOS = -30
const ANGLE_BRAS_POSE = 0
// La main droite qui pince la tête du bras (image 7 : échelle 0,7, penchée de -10° quand le bras est à 0°).
// Elle tourne avec le bras : son angle = ANGLE_MAIN_BRAS + l'angle du bras.
const ECHELLE_MAIN_BRAS = 0.7
const ANGLE_MAIN_BRAS = -10
const PRISE_PINCE = { x: 38.9, y: 112.9 } // point entre l'index et le pouce en pose « pince » (mains.py, point_prise)
// Image 8 : l'index de la main droite appuie sur « 33 » (bout de l'index sur le bouton, en 976, 656)
const IMAGE_8_MAIN_DROITE = { x: 934.9, y: 636.7, echelle: 0.62, angle: -8 }
const PART_APPROCHE_33 = 0.6 // part de DUREE_33 où la main va jusqu'au bouton ; l'appui a lieu à la fin de cette part
const BOUTON_33 = { cx: 445, cy: 388, halo: 27.2 } // centre du bouton et rayon du halo, en coordonnées de la platine
const COULEUR_BOUTON = '#FF4FA0' // le bouton allumé (rose, comme le néon de la platine)
const DEMARRAGE_DISQUE = 0.4 // secondes pour que le disque atteigne sa vitesse (comme une vraie platine)
const DUREE_TOUR = 1.8 // secondes pour un tour (33 tours par minute), comme le disque de fond (fond-vinyle.js)
// Image 9 : les mains sortent par le bas (le storyboard les montre à mi-chemin, à moitié effacées)
const IMAGE_9 = {
  mainGauche: { miroir: 360, x: 277.3, y: 739.7, echelle: 0.7, angle: 20 },
  mainDroite: { x: 1017.3, y: 729.7, echelle: 0.7, angle: 20 },
}
const DESCENTE_MAINS = 250 // les mains finissent 250 unités (vue de dessus) plus bas que l'image 9 : hors du cadre

const reduireAnimations = window.matchMedia('(prefers-reduced-motion: reduce)')
let timeline = null // l'animation en cours (null = aucune)
let calque = null // le groupe <g> qui contient tout ce que l'animation ajoute à la scène
let vinyleCache = null // le vinyle d'origine, caché pendant l'animation
let rotationDisque = null // story 7.6 : la fonction qui fait tourner l'étiquette à chaque image (null = arrêtée)

// Vrai si l'animation peut se jouer (sinon main.js fait un simple fondu)
export function lancementPossible() {
  return !reduireAnimations.matches
}

// Vrai pendant l'animation : main.js ignore alors les nouveaux clics
export function lancementEnCours() {
  return timeline !== null
}

// Transforme un tableau [x, y, l, h] en objet que GSAP sait animer
const enObjet = ([x, y, largeur, hauteur]) => ({ x, y, largeur, hauteur })

// Crée un élément SVG avec ses attributs, par exemple creer('rect', { x: 0, y: 0 })
function creer(nom, attributs = {}) {
  const element = document.createElementNS(SVG, nom)
  Object.entries(attributs).forEach(([cle, valeur]) => element.setAttribute(cle, valeur))
  return element
}

/**
 * Une main « en deux couches » : le dos (paume + 4 doigts) et le pouce, séparés.
 * On peut ainsi glisser un objet entre les deux : doigts derrière, pouce devant.
 * On colle main.svg, on garde ses deux groupes « main-tenue », et on jette le reste.
 * Chaque couche est enveloppée dans un <g> qu'on déplace avec un transform.
 */
function creerMainEnDeuxCouches(prefixe) {
  const svg = insererElement('main', calque, prefixe)
  const couches = ['main-tenue-arriere', 'main-tenue-pouce'].map((nom) => {
    const enveloppe = creer('g', { class: 'main-lancement' })
    enveloppe.append(svg.querySelector(`#${prefixe}-${nom}`)) // déplace le groupe hors du <svg>
    return enveloppe
  })
  svg.remove()
  return { dos: couches[0], pouce: couches[1] }
}

// Colle pochette.svg ou disque.svg dans un <g> qu'on pourra déplacer et agrandir
function creerElementMobile(nom, prefixe) {
  const svg = insererElement(nom, calque, prefixe)
  svg.setAttribute('overflow', 'visible') // le contour du bord ne doit pas être coupé
  const enveloppe = creer('g')
  enveloppe.append(svg)
  return enveloppe
}

// Copie de la tranche du vinyle, sans ses halos ni ses attributs de lien : elle peut bouger librement
function copierTranche(vinyle) {
  const tranche = vinyle.cloneNode(true)
  ;['id', 'class', 'tabindex', 'role', 'aria-label', 'style'].forEach((nom) => tranche.removeAttribute(nom))
  // Les halos = les rectangles colorés transparents ; on garde le rectangle plein et le reflet blanc
  tranche.querySelectorAll('rect[fill-opacity]').forEach((rect) => {
    if (rect.getAttribute('fill').toUpperCase() !== '#FFFFFF') rect.remove()
  })
  return tranche
}

/**
 * Joue l'animation de lancement pour le vinyle cliqué.
 * - svgScene : le <svg> du décor de l'accueil
 * - vinyle : le groupe .vinyle-cliquable cliqué (sa tranche donne la position et la couleur)
 * Renvoie une promesse, tenue quand l'animation est finie.
 */
export function jouerLancement(svgScene, vinyle) {
  return new Promise((terminer) => {
    /* ====== 1. Préparer les éléments ====== */
    calque = creer('g', { id: 'calque-lancement', 'aria-hidden': 'true', 'pointer-events': 'none' })
    // La couleur du vinyle cliqué : pochette et étiquette du disque la lisent dans --couleur-vinyle
    calque.style.setProperty('--couleur-vinyle', vinyle.style.getPropertyValue('--couleur-vinyle'))
    svgScene.append(calque) // en dernier dans la scène : par-dessus le décor

    // La tranche d'origine : son rectangle plein donne la position et la taille
    const plein = vinyle.querySelector('rect:not([fill-opacity])')
    const tx = Number(plein.getAttribute('x'))
    const ty = Number(plein.getAttribute('y'))
    const tl = Number(plein.getAttribute('width'))
    const th = Number(plein.getAttribute('height'))

    const trou = creer('rect', { x: tx, y: ty, width: tl, height: th, fill: '#0B0814' }) // couleur du storyboard
    const mainGauche = creerMainEnDeuxCouches('main-gauche')
    const mainDroite = creerMainEnDeuxCouches('main-droite')
    const disque = creerElementMobile('disque', 'disque-lancement')
    const tranche = copierTranche(vinyle)
    const pochette = creerElementMobile('pochette', 'pochette-lancement')

    // Story 7.6 : la vue de dessus, cachée jusqu'au raccord.
    // On ne déplace pas la caméra (le décor de la bibliothèque sauterait pendant le fondu) :
    // c'est la vue de dessus qu'on place pour que son cadre remplisse exactement le cadre actuel.
    // translate(-80 -40) amène le coin du cadre en (0, 0), scale le réduit, translate(575 330) le pose.
    const placementDessus = `translate(${CADRE_DEMI_TOUR[0]} ${CADRE_DEMI_TOUR[1]}) scale(${K_DESSUS}) translate(${-CADRE_DESSUS[0]} ${-CADRE_DESSUS[1]})`
    const vueDessus = creer('g', { transform: placementDessus, opacity: 0 })
    calque.append(vueDessus)
    insererElement('vue-dessus', vueDessus, 'vue-dessus')

    // Le bras de lecture doit passer AU-DESSUS du disque posé : on le sort de la vue de dessus
    // et on le met dans son propre calque, placé de la même façon.
    const calqueBras = creer('g', { transform: placementDessus, opacity: 0 })
    calqueBras.append(vueDessus.querySelector('#vue-dessus-bras-platine-place'))
    const bras = calqueBras.querySelector('#vue-dessus-bras-platine')

    // Le bouton « 33 » (1er rectangle du sélecteur) et son halo, ajouté dans la platine, éteint au départ
    const bouton33 = vueDessus.querySelector('#vue-dessus-selecteur-rpm rect')
    const haloBouton = creer('circle', {
      cx: BOUTON_33.cx,
      cy: BOUTON_33.cy,
      r: BOUTON_33.halo,
      fill: 'none',
      stroke: COULEUR_BOUTON,
      'stroke-width': 2.4,
      opacity: 0,
    })
    vueDessus.querySelector('#vue-dessus-platine-dessus').append(haloBouton)

    // L'ombre du disque : un cercle noir flouté (le flou est un « filtre » SVG, défini une fois dans <defs>)
    const defs = creer('defs')
    const filtre = creer('filter', { id: 'flou-ombre-lancement', x: '-30%', y: '-30%', width: '160%', height: '160%' })
    filtre.append(creer('feGaussianBlur', { stdDeviation: FLOU_OMBRE * K_DESSUS }))
    defs.append(filtre)
    const ombre = creer('circle', { fill: '#000', filter: 'url(#flou-ombre-lancement)', opacity: 0 })

    // Palier 4 : un voile de la couleur du fond de la page, très grand (il déborde de tous les côtés),
    // qui recouvre peu à peu le décor. À la fin, seul le disque reste visible, comme sur la page projet.
    const voile = creer('rect', { x: -20000, y: -20000, width: 40000, height: 40000, opacity: 0 })
    voile.style.fill = 'var(--fond, #0B0B12)'

    // Ordre d'empilement, du fond vers l'avant :
    // trou, vue de dessus, ombre, voile, doigts des deux mains, disque, bras de lecture, tranche et pochette, pouces des deux mains.
    // Les doigts passent donc derrière la pochette et le disque, les pouces devant.
    // La vue de dessus est sous les mains et le disque : ils restent visibles pendant le raccord.
    calque.append(defs, trou, vueDessus, ombre, voile, mainGauche.dos, mainDroite.dos, disque, calqueBras, tranche, pochette, mainGauche.pouce, mainDroite.pouce)

    // Le vrai vinyle est caché : c'est la copie qui bouge (il est réaffiché à la remise à zéro)
    vinyleCache = vinyle
    vinyle.style.visibility = 'hidden'

    /* ====== 2. Ce que GSAP anime : de simples nombres, recopiés dans le dessin à chaque image ====== */
    // La caméra
    const camera = enObjet(CADRE_ACCUEIL)
    const dessinerCamera = () =>
      svgScene.setAttribute('viewBox', `${camera.x} ${camera.y} ${camera.largeur} ${camera.hauteur}`)

    // La « boîte » de la tranche puis de la pochette : position, taille, et fondu de l'une vers l'autre.
    // La tranche (vue de profil) s'élargit en pochette (vue de face) : on croirait qu'elle pivote.
    // fondu : 0 = tranche, 1 = pochette ; angle : inclinaison en degrés, autour du centre de la boîte
    const boite = { x: tx, y: ty, l: tl, h: th, fondu: 0, angle: 0, opacite: 1 }
    const dessinerBoite = () => {
      const rotation = `rotate(${boite.angle} ${boite.x + boite.l / 2} ${boite.y + boite.h / 2}) `
      // La tranche est étirée pour remplir la boîte, puis s'efface vite (dans le premier tiers du fondu)
      tranche.setAttribute('transform', `${rotation}translate(${boite.x} ${boite.y}) scale(${boite.l / tl} ${boite.h / th}) translate(${-tx} ${-ty})`)
      tranche.setAttribute('opacity', Math.max(0, 1 - boite.fondu * 3))
      pochette.setAttribute('transform', `${rotation}translate(${boite.x} ${boite.y}) scale(${boite.l / COTE_POCHETTE_SVG} ${boite.h / COTE_POCHETTE_SVG})`)
      pochette.setAttribute('opacity', boite.fondu * boite.opacite)
    }

    // Le disque : son centre et son rayon (caché tant qu'il est dans la pochette)
    // aplati : 1 = disque rond, vu de face ; plus petit = disque vu de biais (il tourne sur lui-même)
    const rond = { cx: DISQUE_RENTRE.cx, cy: DISQUE_RENTRE.cy, rayon: IMAGE_3.disque.rayon, aplati: 1, opacite: 0 }
    const dessinerDisque = () => {
      const echelle = rond.rayon / RAYON_DISQUE_SVG
      // disque.svg a son centre en (200, 200) : on le ramène en (0, 0), on le réduit
      // (moins en largeur s'il est aplati), puis on le place
      disque.setAttribute('transform', `translate(${rond.cx} ${rond.cy}) scale(${echelle * rond.aplati} ${echelle}) translate(-200 -200)`)
      disque.setAttribute('opacity', rond.opacite)
      // Story 7.6 : l'ombre suit le disque (décalage en unités de la vue de dessus, converti pour la scène)
      ombre.setAttribute('cx', rond.cx + ombreDisque.dx * K_DESSUS)
      ombre.setAttribute('cy', rond.cy + ombreDisque.dy * K_DESSUS)
      ombre.setAttribute('r', rond.rayon * ombreDisque.taille)
      ombre.setAttribute('opacity', ombreDisque.opacite * ombreDisque.visible)
    }
    // visible : 0 = cachée (vue de face), 1 = visible (vue de dessus)
    const ombreDisque = { ...OMBRE_EN_L_AIR, visible: 0 }

    // Story 7.6 : le bras de lecture tourne autour de son pivot (coordonnées de la platine)
    const brasLecture = { angle: ANGLE_BRAS_REPOS }
    const dessinerBras = () => bras.setAttribute('transform', `rotate(${brasLecture.angle} ${PIVOT_BRAS.x} ${PIVOT_BRAS.y})`)

    // Où doit être la main droite pour pincer la tête du bras, quand le bras est à « angle » ?
    // 1. On calcule où est la tête (rotation autour du pivot, puis place de la platine, puis conversion en scène).
    // 2. On place la main pour que son point de prise (entre index et pouce) tombe sur la tête (même calcul que mains.py).
    function mainSurTeteBras(angle) {
      const a = (angle * Math.PI) / 180
      const dx = TETE_BRAS.x - PIVOT_BRAS.x
      const dy = TETE_BRAS.y - PIVOT_BRAS.y
      const teteX = versSceneX(PLATINE.x + PLATINE.echelle * (PIVOT_BRAS.x + dx * Math.cos(a) - dy * Math.sin(a)))
      const teteY = versSceneY(PLATINE.y + PLATINE.echelle * (PIVOT_BRAS.y + dx * Math.sin(a) + dy * Math.cos(a)))
      const angleMain = ANGLE_MAIN_BRAS + angle
      const echelle = ECHELLE_MAIN_BRAS * K_DESSUS
      const m = (angleMain * Math.PI) / 180
      const px = PRISE_PINCE.x - 110 // la main tourne autour de son point (110, 130)
      const py = PRISE_PINCE.y - 130
      const priseX = 110 + px * Math.cos(m) - py * Math.sin(m)
      const priseY = 130 + px * Math.sin(m) + py * Math.cos(m)
      return { x: teteX - echelle * priseX, y: teteY - echelle * priseY, echelle, angle: angleMain }
    }

    // Les mains : position, taille, angle, pose et opacité
    const droite = {
      couches: mainDroite,
      miroir: null, // null = pas retournée
      x: tx + MAIN_PINCE.dx,
      y: ty + MAIN_PINCE.dy + DEPART_MAIN, // en bas, sous le casier
      echelle: MAIN_PINCE.echelle,
      angle: MAIN_PINCE.angle,
      opacite: 0,
      pose: 'ouverte',
    }
    const gauche = {
      couches: mainGauche,
      ...IMAGE_3.mainGauche,
      x: IMAGE_3.mainGauche.x + 70, // miroir : +70 la place 70 unités plus à GAUCHE à l'écran
      y: IMAGE_3.mainGauche.y + 30,
      opacite: 0,
      pose: 'ouverte',
    }

    /* ====== 3. La timeline ====== */
    timeline = gsap.timeline({
      onComplete: () => {
        timeline = null
        terminer()
      },
    })
    timeline.timeScale(RALENTI) // ralentit (ou accélère) toute la séquence d'un coup

    // Repères de temps (en secondes) : chaque étape commence où la précédente finit
    const debutSortie = DUREE_PRISE
    const debutDemiTour = DUREE_PRISE + DUREE_SORTIE
    const dureeApproche = DUREE_PRISE * PART_APPROCHE
    const dureeTirage = DUREE_PRISE - dureeApproche
    const dureePochette = DUREE_SORTIE * PART_POCHETTE
    const dureeDisque = DUREE_SORTIE - dureePochette
    const debutDisque = debutSortie + dureePochette

    // Petits raccourcis : « bouger » anime une main, « poser » change sa pose en douceur.
    // Le dernier argument = le moment (en secondes) où le mouvement commence.
    const bouger = (main, valeurs, duree, debut, ease = 'power2.inOut') =>
      timeline.to(main, { ...valeurs, duration: duree, ease, onUpdate: () => dessinerMain(main) }, debut)
    const poser = (main, versPose, duree, debut) => {
      const avance = { t: 0 }
      let depart // la pose au moment où le changement commence
      timeline.to(
        avance,
        {
          t: 1,
          duration: duree,
          ease: 'sine.inOut',
          onStart: () => (depart = main.pose),
          onUpdate: () => {
            main.pose = melangerPoses(depart, versPose, avance.t)
            dessinerMain(main)
          },
        },
        debut
      )
    }

    // --- Caméra : un seul mouvement, dans un seul sens ---
    // Ça démarre doucement (sine.in), ça glisse à vitesse constante (none), ça freine à l'arrivée (sine.out).
    timeline
      .to(camera, { ...enObjet(CADRE_PRISE), duration: DUREE_PRISE, ease: 'sine.in', onUpdate: dessinerCamera }, 0)
      .to(camera, { ...enObjet(CADRE_SORTIE), duration: DUREE_SORTIE, ease: 'none', onUpdate: dessinerCamera }, debutSortie)
      .to(camera, { ...enObjet(CADRE_DEMI_TOUR), duration: DUREE_DEMI_TOUR, ease: 'sine.out', onUpdate: dessinerCamera }, debutDemiTour)

    // --- Image 2 : la main droite monte jusqu'à la tranche en se fermant (ouverte → pince)… ---
    bouger(droite, { y: ty + MAIN_PINCE.dy, opacite: 1 }, dureeApproche, 0, 'power2.out')
    poser(droite, 'pince', dureeApproche, 0)
    // … puis tire la tranche vers le haut : main et tranche montent ensemble
    bouger(droite, { y: ty + MAIN_PINCE.dy - TIRAGE }, dureeTirage, dureeApproche)
    timeline.to(boite, { y: ty - TIRAGE, duration: dureeTirage, ease: 'power2.inOut', onUpdate: dessinerBoite }, dureeApproche)

    // --- Image 3, 1re partie : la tranche pivote et devient la pochette, vue de face ---
    timeline.to(boite, { ...IMAGE_3.pochette, fondu: 1, duration: dureePochette, ease: 'power2.inOut', onUpdate: dessinerBoite }, debutSortie)
    // La main gauche arrive par la gauche et tient la pochette (doigts derrière, pouce devant)
    bouger(gauche, { x: IMAGE_3.mainGauche.x, y: IMAGE_3.mainGauche.y, opacite: 1 }, dureePochette, debutSortie, 'power2.out')
    poser(gauche, 'pince', dureePochette, debutSortie)
    // La main droite lâche la tranche et va chercher le bord du disque, encore dans la pochette
    const ecartMainDisque = IMAGE_3.mainDroite.x - IMAGE_3.disque.cx // la main reste à la même distance du centre du disque
    bouger(droite, { ...IMAGE_3.mainDroite, x: DISQUE_RENTRE.cx + ecartMainDisque }, dureePochette, debutSortie)
    poser(droite, 'tient', dureePochette, debutSortie)

    // --- Image 3, 2e partie : la main droite sort le disque vers la droite ---
    timeline.set(rond, { opacite: 1, onComplete: dessinerDisque }, debutDisque) // apparaît, encore caché par la pochette
    timeline.to(rond, { cx: IMAGE_3.disque.cx, duration: dureeDisque, ease: 'power2.inOut', onUpdate: dessinerDisque }, debutDisque)
    bouger(droite, { x: IMAGE_3.mainDroite.x }, dureeDisque, debutDisque)

    // --- Image 4 : le disque fait un demi-tour, tenu par les deux mains, pendant que la caméra plonge ---
    // La pochette se pose contre la platine (plus petite, légèrement penchée)
    timeline.to(boite, { ...IMAGE_4.pochette, duration: DUREE_DEMI_TOUR, ease: 'power2.inOut', onUpdate: dessinerBoite }, debutDemiTour)
    // Le disque se déplace vers la platine…
    timeline.to(rond, { ...IMAGE_4.disque, duration: DUREE_DEMI_TOUR, ease: 'power2.inOut', onUpdate: dessinerDisque }, debutDemiTour)
    // … et tourne sur lui-même : il s'aplatit, puis redevient rond (les deux faces se ressemblent)
    timeline
      .to(rond, { aplati: APLATISSEMENT_MIN, duration: DUREE_DEMI_TOUR / 2, ease: 'sine.in', onUpdate: dessinerDisque }, debutDemiTour)
      .to(rond, { aplati: 1, duration: DUREE_DEMI_TOUR / 2, ease: 'sine.out', onUpdate: dessinerDisque }, debutDemiTour + DUREE_DEMI_TOUR / 2)
    // La main gauche lâche la pochette et prend le bord gauche du disque ; la droite garde le bord droit
    bouger(gauche, IMAGE_4.mainGauche, DUREE_DEMI_TOUR, debutDemiTour)
    poser(gauche, 'tient', DUREE_DEMI_TOUR, debutDemiTour)
    bouger(droite, IMAGE_4.mainDroite, DUREE_DEMI_TOUR, debutDemiTour)

    // --- Story 7.6, image 5 : raccord vers la vue de dessus ---
    // Le disque et les mains ne bougent pas : seule la vue de dessus apparaît dessous, en fondu.
    // La pochette de l'image 4 s'efface : la vue de dessus a sa propre pochette posée.
    const debutRaccord = debutDemiTour + DUREE_DEMI_TOUR
    timeline.to([vueDessus, calqueBras], { opacity: 1, duration: DUREE_RACCORD, ease: 'none' }, debutRaccord)
    timeline.to(boite, { opacite: 0, duration: DUREE_RACCORD, ease: 'none', onUpdate: dessinerBoite }, debutRaccord)
    timeline.to(ombreDisque, { visible: 1, duration: DUREE_RACCORD, ease: 'none', onUpdate: dessinerDisque }, debutRaccord)

    // --- Story 7.6, image 6 : pose du disque ---
    // Le disque glisse au centre du plateau et l'ombre se resserre sous lui : il « descend ».
    // Les mains l'accompagnent, puis s'ouvrent (tient → ouverte) dans la 2e moitié : elles le lâchent.
    const debutPose = debutRaccord + DUREE_RACCORD
    const disquePose = {
      cx: versSceneX(IMAGE_6.disque.cx),
      cy: versSceneY(IMAGE_6.disque.cy),
      rayon: IMAGE_6.disque.rayon * K_DESSUS,
    }
    timeline.to(rond, { ...disquePose, duration: DUREE_POSE, ease: 'power2.inOut', onUpdate: dessinerDisque }, debutPose)
    timeline.to(ombreDisque, { ...OMBRE_POSEE, duration: DUREE_POSE, ease: 'power2.in', onUpdate: dessinerDisque }, debutPose)
    bouger(gauche, mainVersScene(IMAGE_6.mainGauche), DUREE_POSE, debutPose)
    bouger(droite, mainVersScene(IMAGE_6.mainDroite), DUREE_POSE, debutPose)
    poser(gauche, 'ouverte', DUREE_POSE / 2, debutPose + DUREE_POSE / 2)
    poser(droite, 'ouverte', DUREE_POSE / 2, debutPose + DUREE_POSE / 2)
    // Le disque est posé : les doigts ne sont plus dessous. On passe les mains au premier plan,
    // au-dessus du disque et du bras (la main droite va pincer le bras).
    const debutBras = debutPose + DUREE_POSE
    timeline.call(() => calqueBras.after(mainGauche.dos, mainDroite.dos), null, debutBras)

    // --- Story 7.6, image 7 : la main droite amène le bras sur le disque ---
    // 1. Elle va pincer la tête du bras, au repos…
    const dureeApprocheBras = DUREE_BRAS * PART_APPROCHE_BRAS
    const dureeRotationBras = DUREE_BRAS - dureeApprocheBras
    bouger(droite, mainSurTeteBras(ANGLE_BRAS_REPOS), dureeApprocheBras, debutBras, 'power2.out')
    poser(droite, 'pince', dureeApprocheBras, debutBras)
    // 2. … puis le fait pivoter jusqu'au bord du disque : à chaque image, la main suit la tête du bras.
    timeline.to(
      brasLecture,
      {
        angle: ANGLE_BRAS_POSE,
        duration: dureeRotationBras,
        ease: 'power1.inOut',
        onUpdate: () => {
          dessinerBras()
          Object.assign(droite, mainSurTeteBras(brasLecture.angle))
          dessinerMain(droite)
        },
      },
      debutBras + dureeApprocheBras
    )

    // --- Story 7.6, image 8 : l'index appuie sur « 33 », le disque se met à tourner ---
    // 1. La main droite lâche le bras et va jusqu'au bouton en tendant l'index (pince → pointe)
    const debut33 = debutBras + DUREE_BRAS
    const dureeApproche33 = DUREE_33 * PART_APPROCHE_33
    const appui33 = debut33 + dureeApproche33 // le moment où l'index touche le bouton
    bouger(droite, mainVersScene(IMAGE_8_MAIN_DROITE), dureeApproche33, debut33)
    poser(droite, 'pointe', dureeApproche33, debut33)
    // 2. Le bouton s'allume, très vite (comme une lampe), avec son halo
    timeline.to(bouton33, { attr: { fill: COULEUR_BOUTON }, duration: 0.08, ease: 'none' }, appui33)
    timeline.to(haloBouton, { attr: { opacity: 0.8 }, duration: 0.08, ease: 'none' }, appui33)
    // 3. Le disque démarre : sa vitesse passe de 0 à 1 (1 = 1 tour en DUREE_TOUR), puis il tourne sans s'arrêter.
    //    À chaque image, gsap.ticker appelle tournerEtiquette, qui ajoute à l'angle le chemin parcouru depuis l'image précédente.
    const etiquette = disque.querySelector('#disque-lancement-etiquette')
    const platineEnMarche = { vitesse: 0, angle: 0 }
    const tournerEtiquette = (temps, ecartMs) => {
      // ecartMs = millisecondes depuis l'image précédente ; × RALENTI pour suivre le ralenti de la timeline
      platineEnMarche.angle += (360 / DUREE_TOUR) * platineEnMarche.vitesse * (ecartMs / 1000) * RALENTI
      etiquette.setAttribute('transform', `rotate(${platineEnMarche.angle % 360} 0 0)`) // angle qui augmente = sens horaire
    }
    timeline.call(
      () => {
        rotationDisque = tournerEtiquette
        gsap.ticker.add(rotationDisque)
      },
      null,
      appui33
    )
    timeline.to(platineEnMarche, { vitesse: 1, duration: DEMARRAGE_DISQUE, ease: 'power1.in' }, appui33)

    // --- Story 7.6, image 9 : les mains sortent par le bas ---
    // Elles partent un peu avant la fin de l'étape « 33 » (CHEVAUCHEMENT_MAINS), en s'ouvrant et en s'effaçant.
    const debutMains = debut33 + DUREE_33 - CHEVAUCHEMENT_MAINS
    const sortie = (image) => {
      const versLeBas = { ...image, y: image.y + DESCENTE_MAINS }
      return { ...mainVersScene(versLeBas), opacite: 0 }
    }
    bouger(gauche, sortie(IMAGE_9.mainGauche), DUREE_MAINS, debutMains, 'power2.in')
    bouger(droite, sortie(IMAGE_9.mainDroite), DUREE_MAINS, debutMains, 'power2.in')
    poser(droite, 'ouverte', DUREE_MAINS / 2, debutMains)

    // --- Story 7.6, image 10 : le disque grossit et glisse jusqu'à sa place de fond ---
    // La place d'arrivée est mesurée au dernier moment (onStart) : si la fenêtre a changé de taille
    // pendant l'animation, on vise quand même la bonne place.
    const debutArrivee = debutMains + DUREE_MAINS
    const arrivee = { t: 0 }
    let depart = null // le disque au début de l'arrivée
    let cible = null // le disque de fond, converti en coordonnées de la scène
    timeline.to(
      arrivee,
      {
        t: 1,
        duration: DUREE_ARRIVEE,
        ease: 'power2.inOut',
        onStart: () => {
          depart = { cx: rond.cx, cy: rond.cy, rayon: rond.rayon, opacite: rond.opacite }
          const fond = mesurerDisqueDeFond()
          if (!fond) {
            cible = depart // pas de disque de fond : le disque reste où il est
            return
          }
          // Pixels de l'écran → coordonnées de la scène : getScreenCTM donne la conversion scène → écran
          // (elle tient compte de la caméra) ; inverse() donne la conversion dans l'autre sens.
          const versScene = svgScene.getScreenCTM().inverse()
          const centre = new DOMPoint(fond.x, fond.y).matrixTransform(versScene)
          cible = { cx: centre.x, cy: centre.y, rayon: fond.rayon * versScene.a, opacite: fond.opacite }
        },
        onUpdate: () => {
          // Chaque valeur va de « depart » à « cible » ; gsap.utils.interpolate fait ce calcul
          Object.assign(rond, gsap.utils.interpolate(depart, cible, arrivee.t))
          dessinerDisque()
        },
      },
      debutArrivee
    )
    // Le décor s'efface sous le voile ; le bras, qui est au-dessus du disque, s'efface aussi
    timeline.to(voile, { opacity: 1, duration: DUREE_ARRIVEE, ease: 'power1.in' }, debutArrivee)
    timeline.to(calqueBras, { opacity: 0, duration: DUREE_ARRIVEE / 2, ease: 'none' }, debutArrivee)
    // Tout dernier instant : l'étiquette du disque de fond prend l'angle de celle de l'animation.
    // main.js fait l'échange juste après, avant que le navigateur ne redessine : la rotation continue sans à-coup.
    timeline.call(() => calerRotationFondVinyle(platineEnMarche.angle), null, debutArrivee + DUREE_ARRIVEE)

    // Première image : tout est en place avant que l'animation ne démarre
    dessinerBoite()
    dessinerDisque()
    dessinerMain(droite)
    dessinerMain(gauche)
  })
}

// Redessine une main à partir de ses nombres (position, taille, angle, pose, opacité)
function dessinerMain(main) {
  // Une main gauche = une main droite retournée autour de la ligne verticale x = miroir
  const retournement = main.miroir === null ? '' : `translate(${main.miroir} 0) scale(-1 1) translate(${-main.miroir} 0) `
  const transform = `${retournement}translate(${main.x} ${main.y}) scale(${main.echelle}) rotate(${main.angle} ${PIVOT_MAIN})`
  ;[main.couches.dos, main.couches.pouce].forEach((couche) => {
    couche.setAttribute('transform', transform)
    couche.setAttribute('opacity', main.opacite)
    appliquerPose(couche, main.pose)
  })
}

/**
 * Remet la scène dans son état d'accueil (appelé quand la scène est cachée,
 * pour que le retour à la bibliothèque soit propre).
 */
export function reinitialiserLancement(svgScene) {
  if (timeline) timeline.kill()
  timeline = null
  if (rotationDisque) gsap.ticker.remove(rotationDisque) // story 7.6 : le disque de l'animation arrête de tourner
  rotationDisque = null
  if (calque) calque.remove()
  calque = null
  if (vinyleCache) vinyleCache.style.visibility = ''
  vinyleCache = null
  svgScene.setAttribute('viewBox', CADRE_ACCUEIL.join(' '))
}
