/* ---------------------------------------------------------
   Story 7.5 : animation de lancement, partie 1 (vue de face)
   Référence : maquettes/animation/storyboard-lancement-vinyle.svg, images 1 à 4.

   Au clic sur un vinyle, une timeline GSAP joue la séquence, puis main.js
   affiche la page projet par son fondu habituel.

   Palier 1 : la caméra (zoom accueil → prise → sortie → demi-tour).
   Palier 2 : la main droite pince la tranche et la tire hors du casier (trou sombre).
   Palier 3 : la tranche devient la pochette, la main gauche la tient, la main droite sort le disque.
   Palier 4 : demi-tour du disque tenu par les deux mains, pochette posée contre la platine.
   --------------------------------------------------------- */
import { gsap } from 'gsap'
import { insererElement } from './elements.js'
import { appliquerPose, melangerPoses } from './main-articulee.js'

/* ---------- Réglages : modifiez ces valeurs pour changer le rythme ---------- */
// Durées en secondes (storyboard : 0 → 0,4 s, 0,4 → 0,9 s, 0,9 → 1,2 s)
const DUREE_PRISE = 0.4 // image 1 → 2 : zoom vers la bibliothèque, la main pince et tire la tranche
const DUREE_SORTIE = 0.5 // image 2 → 3 : pochette, main gauche, sortie du disque
const DUREE_DEMI_TOUR = 0.3 // image 3 → 4 : demi-tour du disque
const PAUSE_FIN = 0.15 // on reste un instant sur l'image 4 avant le fondu vers la page projet
const RALENTI = 1 // 1 = vitesse normale ; 0.25 = 4 fois plus lent (pratique pour observer)

// Cadres de la caméra = le viewBox du SVG de la scène : [x, y, largeur, hauteur]
// Ils ont tous le rapport 1,6 de la scène (1440 / 900) : le zoom ne déforme rien.
const CADRE_ACCUEIL = [0, 0, 1440, 900]
const CADRE_PRISE = [250, 370, 600, 375]
const CADRE_SORTIE = [380, 330, 560, 350]
const CADRE_DEMI_TOUR = [575, 330, 330, 206]

// Image 2 : la prise de la tranche
const PART_APPROCHE = 0.6 // part de DUREE_PRISE où la main arrive et se ferme ; le reste = le tirage
const TIRAGE = 46 // de combien la tranche monte hors du casier (storyboard : y 570 → 524)
const DEPART_MAIN = 150 // la main droite arrive d'en bas : elle part 150 unités plus bas que sa place

// Image 3 : la sortie du disque
const PART_POCHETTE = 0.45 // part de DUREE_SORTIE où la tranche devient pochette ; le reste = le disque sort

// Image 4 : le demi-tour du disque
const APLATISSEMENT_MIN = 0.25 // largeur du disque au milieu du demi-tour (0.25 = un quart ; storyboard : 13,5 / 54)

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

const reduireAnimations = window.matchMedia('(prefers-reduced-motion: reduce)')
let timeline = null // l'animation en cours (null = aucune)
let calque = null // le groupe <g> qui contient tout ce que l'animation ajoute à la scène
let vinyleCache = null // le vinyle d'origine, caché pendant l'animation

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

    // Ordre d'empilement, du fond vers l'avant :
    // trou, doigts des deux mains, disque, tranche et pochette, pouces des deux mains.
    // Les doigts passent donc derrière la pochette et le disque, les pouces devant.
    calque.append(trou, mainGauche.dos, mainDroite.dos, disque, tranche, pochette, mainGauche.pouce, mainDroite.pouce)

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

    // Une « animation vide » = une pause sur la dernière image
    timeline.to({}, { duration: PAUSE_FIN }, debutDemiTour + DUREE_DEMI_TOUR)

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
  if (calque) calque.remove()
  calque = null
  if (vinyleCache) vinyleCache.style.visibility = ''
  vinyleCache = null
  svgScene.setAttribute('viewBox', CADRE_ACCUEIL.join(' '))
}
