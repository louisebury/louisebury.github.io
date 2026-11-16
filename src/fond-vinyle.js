/* ---------------------------------------------------------
   Story 7.3 : le disque en fond de la page projet
   - insère le disque (module de la story 7.2) dans sa couche de fond ;
   - lui donne la couleur du vinyle du projet ;
   - fait tourner l'étiquette dans le sens horaire, à 33 tours (1 tour en 1,8 s).
   Seule l'étiquette tourne : les sillons sont des cercles (leur rotation ne se verrait pas)
   et le reflet blanc reste fixe, comme un vrai reflet de lumière.

   Story 7.4 : le scratch au défilement (option A, « un seul passage »)
   Statut « à revoir » : la main est désactivée par MAIN_SCRATCH_ACTIVE (voir les réglages) ;
   seule la réaction du disque au défilement est active.
   - le disque tourne à la vitesse du défilement : vers le bas = horaire, vers le haut = anti-horaire.
     On ne crée pas de 2e animation : on change la vitesse (timeScale) de la rotation de 7.3 ;
   - au début d'un défilement, une main appuie sur le disque (pose « scratch » + pression).
     Elle est portée par un « bras » qui tourne autour du centre du disque, du même angle que lui :
     elle traverse ainsi la partie visible du disque, d'un bord à l'autre, puis se détend et disparaît.
     Elle ne revient qu'au prochain défilement, après un arrêt ;
   - 0,6 s après le dernier mouvement, le disque reprend doucement sa vitesse normale
     (et la main disparaît sur place si elle n'avait pas fini son passage).
   --------------------------------------------------------- */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { insererElement } from './animation/elements.js'
import { appliquerPose, appliquerPression, melangerPoses } from './animation/main-articulee.js'

gsap.registerPlugin(ScrollTrigger)

/* ---------- Réglages ---------- */
// true pour réactiver la main de scratch, à revoir (story 7.4 mise de côté, dernier état complet : commit 7b40788).
// Avec false : ni main ni bras ne sont créés, aucun calcul lié à la main ne tourne ;
// le disque réagit quand même au défilement (sens et vitesse, puis retour doux à la vitesse normale).
const MAIN_SCRATCH_ACTIVE = false

const DUREE_TOUR = 1.8 // secondes pour un tour complet du disque (33 tours par minute)

// Réglages du scratch (story 7.4) : modifiez ces valeurs pour changer le ressenti
const PIXELS_PAR_VITESSE = 400 // défiler à 400 px/s = vitesse normale du disque (× 1) ; 800 px/s = × 2…
const VITESSE_MAX = 3 // vitesse maximale du disque pendant le scratch (3 = trois fois la vitesse normale)
// Angles du bras, en degrés. 0° = la main à sa place de la maquette (en bas à droite du centre du disque).
// Un angle négatif la fait remonter le long du disque, un angle positif la fait descendre.
const ANGLE_DEPART = -90 // en haut de la partie visible : la main y apparaît quand on défile vers le bas
const ANGLE_ARRIVEE = 20 // en bas de la partie visible : la main y disparaît quand on défile vers le bas
// (Vers le haut, c'est l'inverse : la main apparaît à ANGLE_ARRIVEE et disparaît à ANGLE_DEPART.)
const DUREE_APPARITION = 0.15 // secondes pour que la main apparaisse (fondu)
const DUREE_DETENTE = 0.25 // secondes pour que la main se détende (scratch → ouverte) en disparaissant
const DELAI_ARRET = 0.6 // secondes sans défilement pour considérer que le visiteur s'est arrêté

const reduireAnimations = window.matchMedia('(prefers-reduced-motion: reduce)')
const ecranLarge = window.matchMedia('(min-width: 768px)') // sous 768 px : pas de scratch

/* ---------- État ---------- */
let rotation = null // l'animation GSAP du disque, créée une seule fois
let bras = null // boîte invisible de la taille du disque, qui tourne autour de son centre et porte la main
let main = null // le <svg> de la main du scratch
let tournerBras = null // fonction rapide qui change l'angle du bras (gsap.quickSetter)
let declencheur = null // le ScrollTrigger qui mesure la vitesse du défilement (actif sur la page projet)
let wireframeVisible = false // une animation de wireframe est à l'écran (signalé par main.js, US4.4)
let geste = null // l'animation de la main en cours (apparition ou détente), une seule à la fois

// Où en est la main :
// 'repos'   = cachée, prête pour le prochain défilement ;
// 'passage' = sur le disque, elle le suit ;
// 'termine' = passage fini (ou interrompu par un wireframe) : elle attend que le défilement s'arrête.
let etat = 'repos'
let angleDebut = 0 // angle du bras au début du passage en cours
let angleFin = 0 // angle du bras où le passage se termine
let tempsPrise = 0 // où en était la rotation du disque quand la main l'a saisi

// Ouverture de la main : 0 = pose « scratch », 1 = pose « ouverte ».
// Les changements de pose passent par cette seule valeur : la main ne saute jamais d'une pose à l'autre.
const ouverture = { t: 0 }
const dessinerPose = () => appliquerPose(main, melangerPoses('scratch', 'ouverte', ouverture.t))

// La vitesse du disque passe par un petit objet que GSAP fait varier en douceur.
// quickTo crée UNE animation, réutilisée à chaque appel : c'est très léger, même
// appelé des dizaines de fois par seconde pendant le défilement.
const vitesse = { valeur: 1 }
const reglerVitesse = gsap.quickTo(vitesse, 'valeur', {
  duration: 0.2,
  ease: 'power2.out',
  onUpdate: () => rotation && rotation.timeScale(vitesse.valeur),
})

// Le minuteur de l'arrêt, lui aussi créé une seule fois : chaque défilement le relance à zéro
const minuteurArret = gsap.delayedCall(DELAI_ARRET, arreterScratch).pause()

/**
 * Prépare le disque et la main. Appelée une fois au chargement par main.js.
 * - couleur : la couleur du vinyle du projet (par exemple '#FF4FA0' pour Connect)
 */
export function preparerFondVinyle(couleur) {
  const conteneur = document.querySelector('.fond-vinyle__disque')
  if (!conteneur) return

  // Préfixe « fond-disque » : l'étiquette devient #fond-disque-etiquette (ids uniques dans la page)
  insererElement('disque', conteneur, 'fond-disque')

  // La variable CSS est posée sur le bloc de fond : l'étiquette du SVG l'utilise (var(--couleur-vinyle))
  if (couleur) conteneur.parentElement.style.setProperty('--couleur-vinyle', couleur)

  const etiquette = conteneur.querySelector('#fond-disque-etiquette')
  if (!etiquette) return

  // Le disque est dessiné autour du point (0, 0) : on tourne autour de ce point (svgOrigin).
  // repeat: -1 = sans fin ; ease: 'none' = vitesse constante. On crée l'animation en pause.
  rotation = gsap.to(etiquette, {
    rotation: 360, // en degrés ; un angle qui augmente = sens horaire à l'écran
    svgOrigin: '0 0',
    duration: DUREE_TOUR,
    ease: 'none',
    repeat: -1,
    paused: true,
  })
  // Story 7.4 : on avance la tête de lecture de 1 000 tours. Ça ne se voit pas (un tour complet
  // ramène l'étiquette au même endroit), mais le scratch vers le haut peut reculer sans jamais
  // « buter » contre le début de l'animation.
  rotation.totalTime(DUREE_TOUR * 1000)

  // Story 7.4 : la main du scratch, dans sa couche (entre le disque et le fondu noir).
  // Elle est portée par le « bras » : tourner le bras = faire tourner la main autour du disque.
  // Seulement si l'interrupteur MAIN_SCRATCH_ACTIVE est allumé.
  const coucheMain = document.querySelector('.fond-vinyle__main')
  if (MAIN_SCRATCH_ACTIVE && coucheMain) {
    bras = document.createElement('div')
    bras.className = 'fond-vinyle__bras'
    coucheMain.append(bras)
    main = insererElement('main', bras, 'fond-main')
    tournerBras = gsap.quickSetter(bras, 'rotation', 'deg')
    remettreAuRepos() // cachée, en pose « scratch », bras à 0°
  }
}

/**
 * Story 7.6 : où est le disque de fond à l'écran ? Utilisée par l'animation de lancement,
 * pour que son disque finisse exactement à cette place (pas de saut à l'échange).
 * On MESURE la vraie place (au lieu de recopier les règles de projet.css) : si le CSS change,
 * l'animation suit toute seule. La page projet est cachée : on l'affiche le temps de la mesure,
 * mais invisible (visibility: hidden). Tout se passe avant que le navigateur ne redessine : rien ne clignote.
 * Renvoie { x, y, rayon } en pixels de l'écran et l'opacité du disque, ou null s'il n'y a pas de disque.
 */
export function mesurerDisqueDeFond() {
  const conteneur = document.querySelector('.fond-vinyle__disque')
  const svg = conteneur && conteneur.querySelector('svg')
  if (!svg) return null
  const vue = conteneur.closest('.vue-projet')
  const etaitCachee = vue.hidden
  vue.style.visibility = 'hidden'
  vue.hidden = false
  const boite = svg.getBoundingClientRect()
  const opacite = Number(getComputedStyle(conteneur).opacity)
  vue.hidden = etaitCachee
  vue.style.visibility = ''
  // disque.svg fait 400 de côté (viewBox -200 -200 400 400) et le disque a un rayon de 196
  return {
    x: boite.left + boite.width / 2,
    y: boite.top + boite.height / 2,
    rayon: (boite.width / 2) * (196 / 200),
    opacite,
  }
}

/**
 * Story 7.6 : place l'étiquette du disque de fond à un angle donné (en degrés, sens horaire),
 * pour qu'elle reprenne exactement là où l'animation de lancement l'a laissée.
 * On garde l'avance de 1 000 tours (voir preparerFondVinyle) et on ajoute la fraction de tour.
 */
export function calerRotationFondVinyle(angle) {
  if (!rotation) return
  const fraction = (((angle % 360) + 360) % 360) / 360 // entre 0 et 1, même si l'angle est négatif
  rotation.totalTime(DUREE_TOUR * (1000 + fraction))
}

/**
 * Story 7.7 : l'angle actuel de l'étiquette du disque de fond (en degrés, entre 0 et 360, sens horaire).
 * L'animation de retour part de cet angle : la rotation continue sans à-coup.
 * progress() = où en est le tour en cours (entre 0 et 1).
 */
export function lireRotationFondVinyle() {
  return rotation ? rotation.progress() * 360 : 0
}

// Appelée par main.js quand la page projet s'affiche
export function demarrerFondVinyle() {
  if (rotation && !reduireAnimations.matches) rotation.play()
  activerScratch()
}

// Appelée par main.js quand on revient à l'accueil : inutile de tourner sans être vu
export function arreterFondVinyle() {
  if (rotation) rotation.pause()
  couperScratch()
}

/**
 * Appelée par main.js (observateur des wireframes, US4.4) quand une animation de wireframe
 * apparaît ou disparaît. Pendant qu'elle est visible, la main n'apparaît pas (le disque, lui,
 * continue de réagir au défilement). Si la main était en plein passage, elle disparaît
 * et ne reviendra qu'après un arrêt du défilement.
 */
export function signalerWireframeVisible(visible) {
  wireframeVisible = visible
  if (main && visible && etat === 'passage') {
    etat = 'termine'
    detendreMain()
  }
}

/* ---------- Le scratch ---------- */

// Le scratch n'existe que sur la page projet, sur grand écran, sans « réduire les animations ».
// Il ne dépend pas de la main : sans elle, le disque réagit quand même au défilement.
function scratchAutorise() {
  return rotation && ecranLarge.matches && !reduireAnimations.matches
}

function activerScratch() {
  if (!scratchAutorise() || declencheur) return
  // Un ScrollTrigger sans élément déclencheur couvre toute la page. Il ne fait rien d'autre
  // que nous prévenir à chaque image où la page a bougé, avec sa vitesse (getVelocity).
  declencheur = ScrollTrigger.create({ onUpdate: pendantDefilement })
  // Le « métronome » de GSAP appelle suivreDisque à chaque image (environ 60 fois par seconde),
  // seulement s'il y a une main à faire suivre
  if (main) gsap.ticker.add(suivreDisque)
}

// Coupe tout et remet le disque dans son état normal (vitesse 1, sans main)
function couperScratch() {
  if (declencheur) declencheur.kill()
  declencheur = null
  gsap.ticker.remove(suivreDisque)
  minuteurArret.pause()
  if (geste) geste.kill()
  etat = 'repos'
  if (main) remettreAuRepos()
  reglerVitesse.tween.pause()
  vitesse.valeur = 1
  if (rotation) rotation.timeScale(1)
}

// Appelée à chaque image pendant le défilement : seulement quelques opérations simples
function pendantDefilement(self) {
  // Vitesse en pixels par seconde : positive vers le bas, négative vers le haut.
  // On la convertit en vitesse de rotation (positive = horaire), bornée par VITESSE_MAX.
  const cible = gsap.utils.clamp(-VITESSE_MAX, VITESSE_MAX, self.getVelocity() / PIXELS_PAR_VITESSE)
  reglerVitesse.tween.duration(0.2) // réaction rapide pendant le geste
  reglerVitesse(cible)

  // self.direction : 1 = vers le bas, -1 = vers le haut
  if (main && etat === 'repos' && !wireframeVisible) commencerPassage(self.direction)
  minuteurArret.restart(true) // true : on repart pour DELAI_ARRET secondes complètes
}

// Début d'un défilement : la main apparaît au bord de la partie visible et saisit le disque
function commencerPassage(direction) {
  etat = 'passage'
  const versLeBas = direction > 0
  angleDebut = versLeBas ? ANGLE_DEPART : ANGLE_ARRIVEE
  angleFin = versLeBas ? ANGLE_ARRIVEE : ANGLE_DEPART

  if (geste) geste.kill() // si elle était encore en train de disparaître
  ouverture.t = 0
  dessinerPose()
  appliquerPression(main, true)
  tournerBras(angleDebut)
  tempsPrise = rotation.totalTime() // la main suit le disque dès son apparition
  geste = gsap.to(main, { autoAlpha: 1, duration: DUREE_APPARITION, ease: 'power2.out' })
}

/**
 * Appelée à chaque image : pendant un passage, le bras prend le même angle que le disque.
 * Angle parcouru par le disque depuis la prise = (temps écoulé dans l'animation / durée d'un tour) × 360°.
 * Avec un timeScale négatif, le temps recule : l'angle parcouru devient négatif (sens anti-horaire).
 */
function suivreDisque() {
  if (etat !== 'passage') return
  const parcouru = ((rotation.totalTime() - tempsPrise) / DUREE_TOUR) * 360
  const sens = Math.sign(angleFin - angleDebut) // +1 si la main doit descendre, -1 si elle doit monter
  const avance = parcouru * sens // chemin fait vers l'arrivée (négatif = le disque est reparti en arrière)

  if (avance <= 0) {
    // Le visiteur a changé de sens : la main reste au bord de départ, sans sortir de sa zone.
    // On reprend la mesure à partir d'ici, pour qu'elle reparte dès que le disque revient dans le bon sens.
    tournerBras(angleDebut)
    tempsPrise = rotation.totalTime()
  } else if (avance >= Math.abs(angleFin - angleDebut)) {
    // Arrivée au bord opposé : fin du passage, la main ne reviendra qu'après un arrêt
    tournerBras(angleFin)
    etat = 'termine'
    detendreMain()
  } else {
    tournerBras(angleDebut + parcouru)
  }
}

// La main relâche le disque : elle se détend (scratch → ouverte) en disparaissant, là où elle est
function detendreMain() {
  appliquerPression(main, false)
  if (geste) geste.kill()
  geste = gsap
    .timeline({ onComplete: remettreAuRepos })
    .to(ouverture, { t: 1, duration: DUREE_DETENTE, ease: 'power1.out', onUpdate: dessinerPose }, 0)
    .to(main, { autoAlpha: 0, duration: DUREE_DETENTE, ease: 'power1.in' }, 0)
}

// DELAI_ARRET sans défilement : le disque reprend doucement ; la main disparaît si elle était encore là
function arreterScratch() {
  reglerVitesse.tween.duration(0.8) // retour en douceur
  reglerVitesse(1)
  if (main && etat === 'passage') detendreMain()
  etat = 'repos' // prête pour le prochain défilement
}

// Main cachée, pose « scratch » sans pression, bras à 0° : prête pour le prochain passage
function remettreAuRepos() {
  appliquerPression(main, false)
  ouverture.t = 0
  dessinerPose()
  tournerBras(0)
  gsap.set(main, { autoAlpha: 0 })
}

// Si le visiteur active « réduire les animations » pendant sa visite, le disque s'immobilise
// et le scratch est coupé. S'il le désactive, tout repart (seulement si la page projet est affichée).
reduireAnimations.addEventListener('change', () => {
  if (!rotation) return
  const pageProjetVisible = !document.querySelector('.vue-projet').hidden
  if (reduireAnimations.matches) {
    rotation.pause()
    couperScratch()
  } else if (pageProjetVisible) {
    demarrerFondVinyle()
  }
})

// Passage sous 768 px (ou retour au-dessus) pendant la visite : on coupe ou on relance le scratch
ecranLarge.addEventListener('change', () => {
  if (!ecranLarge.matches) couperScratch()
  else if (!document.querySelector('.vue-projet').hidden) activerScratch()
})
