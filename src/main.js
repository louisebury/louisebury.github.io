import './style.css'
import './projet.css' // styles des pages projet (US4.2)
import scene from './assets/scene-accueil.svg?raw'
import { activerEffetsDefilement } from './effets-defilement.js' // US4.5
import { preparerFondVinyle, demarrerFondVinyle, arreterFondVinyle, signalerWireframeVisible } from './fond-vinyle.js' // Stories 7.3 et 7.4
import { lancementPossible, lancementEnCours, jouerLancement, reinitialiserLancement, passerAnimation } from './animation/lancement.js' // Stories 7.5 et 7.7

// Insère le décor SVG directement dans la page, pour pouvoir cibler chaque calque en CSS et en JS
const decor = document.querySelector('#decor')
decor.innerHTML = scene

// Le décor est visuel, mais il contient le vinyle Connect, focusable au clavier (US4.1).
// On ne cache donc pas tout le SVG : on cache seulement ses textes décoratifs (noms d'albums).
decor.querySelector('svg').setAttribute('focusable', 'false')
decor.querySelectorAll('text').forEach((texte) => texte.setAttribute('aria-hidden', 'true'))

/* ---------------------------------------------------------
   US2 : survol des vinyles et info-bulle
   --------------------------------------------------------- */
const sceneEl = document.querySelector('.scene')
const infoBulle = document.querySelector('#info-bulle')
const infoBulleTitre = infoBulle.querySelector('.info-bulle__titre')
const vinyles = decor.querySelectorAll('.vinyle-cliquable')

const MARGE = 12 // écart minimal (en pixels) entre la bulle et le bord de la scène
const ECART = 14 // espace entre la bulle et le vinyle (la place de la flèche)
let minuteurMasquage = null

vinyles.forEach((vinyle) => {
  // La couleur du vinyle = celle de son rectangle plein (celui qui n'a pas de transparence).
  // On la range dans une variable CSS : le style.css s'en sert pour le halo.
  const rectPlein = vinyle.querySelector('rect:not([fill-opacity])')
  const couleur = rectPlein ? rectPlein.getAttribute('fill') : null
  if (couleur) vinyle.style.setProperty('--couleur-vinyle', couleur)

  vinyle.addEventListener('mouseenter', () => afficherInfoBulle(vinyle, couleur))
  vinyle.addEventListener('mouseleave', masquerInfoBulle)
})

function afficherInfoBulle(vinyle, couleur) {
  clearTimeout(minuteurMasquage) // annule un masquage en cours

  // 1. Remplir : titre et couleur du vinyle survolé
  infoBulleTitre.textContent = vinyle.dataset.titre
  if (couleur) infoBulle.style.setProperty('--couleur-vinyle', couleur)

  // 2. Rendre la bulle mesurable (sans « hidden », elle a une taille)
  infoBulle.hidden = false
  infoBulle.classList.remove('info-bulle--visible')

  // 3. Mesurer le vinyle et la bulle, par rapport à la scène
  const zoneScene = sceneEl.getBoundingClientRect()
  const zoneVinyle = vinyle.getBoundingClientRect()
  const largeurBulle = infoBulle.offsetWidth
  const hauteurBulle = infoBulle.offsetHeight
  const centreVinyle = zoneVinyle.left + zoneVinyle.width / 2 - zoneScene.left

  // 4. Horizontal : centrée sur le vinyle, puis bloquée dans les bords de la scène
  let gauche = centreVinyle - largeurBulle / 2
  gauche = Math.max(MARGE, Math.min(gauche, zoneScene.width - largeurBulle - MARGE))

  // 5. Vertical : au-dessus du vinyle, ou en dessous s'il n'y a pas la place
  let haut = zoneVinyle.top - zoneScene.top - hauteurBulle - ECART
  const dessous = haut < MARGE
  if (dessous) haut = zoneVinyle.bottom - zoneScene.top + ECART
  infoBulle.classList.toggle('info-bulle--dessous', dessous)

  infoBulle.style.left = `${gauche}px`
  infoBulle.style.top = `${haut}px`

  // 6. La flèche pointe toujours vers le centre du vinyle, même si la bulle a été décalée
  infoBulle.style.setProperty('--fleche-x', `${centreVinyle - gauche}px`)

  // 7. Faire apparaître (la lecture de offsetWidth plus haut garantit que la transition se joue)
  infoBulle.classList.add('info-bulle--visible')
}

function masquerInfoBulle() {
  infoBulle.classList.remove('info-bulle--visible')
  // On attend la fin du fondu avant de retirer complètement la bulle
  minuteurMasquage = setTimeout(() => {
    infoBulle.hidden = true
  }, 200)
}

/* ---------------------------------------------------------
   US3 : la main néon remplace le curseur au-dessus de la bibliothèque
   --------------------------------------------------------- */
const mainCurseur = document.querySelector('.main-curseur')
// Le meuble et les vinyles sont deux groupes frères dans le SVG : on surveille la zone qui couvre les deux
const zonesBibliotheque = [decor.querySelector('#meuble'), decor.querySelector('#bibliotheque-vinyles')]

// Seulement avec une vraie souris (pas sur écran tactile)
const aUneSouris = window.matchMedia('(hover: hover) and (pointer: fine)').matches

if (aUneSouris) {
  sceneEl.addEventListener('pointermove', suivreSouris)
  sceneEl.addEventListener('pointerleave', cacherMain)

  // Pression au clic sur un vinyle (rien ne s'ouvre pour l'instant)
  sceneEl.addEventListener('pointerdown', (evenement) => {
    if (evenement.target.closest('.vinyle-cliquable')) {
      mainCurseur.classList.add('main-curseur--pression')
    }
  })
  window.addEventListener('pointerup', relacherPression)
}

// Vrai si la souris est dans le rectangle qui englobe le meuble ET les vinyles.
// Un seul grand rectangle : passer d'un casier à l'autre ne fait jamais disparaître la main.
function estSurBibliotheque(x, y) {
  const rects = zonesBibliotheque.filter(Boolean).map((zone) => zone.getBoundingClientRect())
  if (rects.length === 0) return false
  const gauche = Math.min(...rects.map((r) => r.left))
  const droite = Math.max(...rects.map((r) => r.right))
  const haut = Math.min(...rects.map((r) => r.top))
  const bas = Math.max(...rects.map((r) => r.bottom))
  return x >= gauche && x <= droite && y >= haut && y <= bas
}

function suivreSouris(evenement) {
  if (evenement.pointerType !== 'mouse') return cacherMain()

  if (!estSurBibliotheque(evenement.clientX, evenement.clientY)) return cacherMain()

  // Position de la souris par rapport au coin haut-gauche de la scène
  const zoneScene = sceneEl.getBoundingClientRect()
  mainCurseur.style.setProperty('--x', `${evenement.clientX - zoneScene.left}px`)
  mainCurseur.style.setProperty('--y', `${evenement.clientY - zoneScene.top}px`)

  mainCurseur.hidden = false
  sceneEl.classList.add('scene--main-visible') // cache la flèche
}

function cacherMain() {
  mainCurseur.hidden = true
  sceneEl.classList.remove('scene--main-visible') // la flèche revient
  relacherPression()
}

function relacherPression() {
  mainCurseur.classList.remove('main-curseur--pression')
}

/* ---------------------------------------------------------
   US4.1 : ouvrir la page projet Connect, et en revenir
   L'adresse décide de la vue affichée :
   - …/#connect → la vue projet
   - sinon      → l'accueil (la bibliothèque)
   --------------------------------------------------------- */
const vueProjet = document.querySelector('.vue-projet')
const titreProjet = document.querySelector('#connect-titre')
// Deux boutons de retour : en haut de la page projet et dans le pied de page (US4.2)
const boutonsRetour = document.querySelectorAll('.bouton-retour')
const vinyleConnect = decor.querySelector('#vinyle-connect')

const DUREE_FONDU = 250 // en millisecondes, identique à la transition du style.css
// Story 7.6 : après l'animation de lancement, le contenu de la page projet apparaît en 300 ms
// (même durée que la transition de .vue-projet--apparition dans projet.css)
const DUREE_APPARITION_CONTENU = 300
const reduireAnimations = window.matchMedia('(prefers-reduced-motion: reduce)')
let vueActuelle = 'accueil' // au chargement, c'est l'accueil qui est visible
let minuteurFondu = null

// Story 7.3 : le disque en fond de la page projet prend la couleur du vinyle Connect
// (posée plus haut sur le vinyle, dans la variable --couleur-vinyle)
preparerFondVinyle(vinyleConnect ? vinyleConnect.style.getPropertyValue('--couleur-vinyle') : null)

// 1. Le vinyle Connect devient un lien utilisable au clavier
if (vinyleConnect) {
  vinyleConnect.setAttribute('tabindex', '0') // Tab peut s'y arrêter
  vinyleConnect.setAttribute('role', 'link') // annoncé comme un lien par les lecteurs d'écran
  vinyleConnect.setAttribute('aria-label', vinyleConnect.dataset.titre) // … avec son titre

  vinyleConnect.addEventListener('click', ouvrirProjet)
  vinyleConnect.addEventListener('keydown', (evenement) => {
    if (evenement.key === 'Enter') {
      // Story 7.7 : preventDefault empêche cette touche Entrée d'« appuyer » aussi
      // sur le bouton « Passer », qui reçoit le focus au début de l'animation
      evenement.preventDefault()
      ouvrirProjet()
    }
  })

  // Au clavier, l'info-bulle s'affiche aussi (pas lors d'un focus donné par la souris)
  vinyleConnect.addEventListener('focus', () => {
    if (vinyleConnect.matches(':focus-visible')) {
      afficherInfoBulle(vinyleConnect, vinyleConnect.style.getPropertyValue('--couleur-vinyle'))
    }
  })
  vinyleConnect.addEventListener('blur', masquerInfoBulle)
}

async function ouvrirProjet() {
  // Story 7.5 : un clic pendant l'animation est ignoré (pas de double lancement)
  if (lancementEnCours()) return

  // Story 7.5 : l'animation de lancement se joue d'abord (sauf avec « réduire les animations »)
  // (story 7.7 : ni sous 768 px)
  const avecLancement = lancementPossible()
  let animationPassee = false
  if (avecLancement) {
    cacherMain()
    masquerInfoBulle()
    // Efface nom, poste, consigne et bouton son, et bloque la souris sur la scène (style.css)
    sceneEl.classList.add('scene--lancement')
    activerPasser() // story 7.7
    // await : on attend la fin de l'animation (ou qu'elle soit passée) avant de passer à la suite
    const resultat = await jouerLancement(decor.querySelector('svg'), vinyleConnect)
    animationPassee = resultat.passee
    desactiverPasser()
  }

  // pushState change l'adresse et crée une entrée dans l'historique (le retour navigateur marche).
  // On y note qu'on vient de l'accueil : le bouton « ← Bibliothèque » s'en servira.
  history.pushState({ depuisAccueil: true }, '', '#connect')
  // Story 7.6 : après l'animation, pas de fondu de toute la vue (le disque est déjà à sa place de fond).
  // Story 7.7 : si elle a été passée, le disque n'est pas à sa place : simple fondu.
  afficherVue({ apresLancement: avecLancement && !animationPassee })
}

/* ---------------------------------------------------------
   Story 7.7 : passer l'animation
   Pendant une animation, on peut la passer par :
   - le bouton « Passer » (souris, ou Tab puis Entrée) ;
   - la touche Échap ;
   - un clic n'importe où dans la page.
   --------------------------------------------------------- */
const boutonPasser = document.querySelector('.bouton-passer')
let minuteurEcoutePasser = null

function activerPasser() {
  boutonPasser.hidden = false
  // Le focus va sur le bouton : au clavier, Entrée suffit pour passer
  boutonPasser.focus({ preventScroll: true })
  document.addEventListener('keydown', passerAuClavier)
  // Le clic qui vient de lancer l'animation est encore en train de « remonter » la page
  // (du vinyle jusqu'au document). Si on écoutait le document tout de suite, ce même clic
  // y arriverait et passerait l'animation aussitôt. setTimeout(…, 0) attend qu'il ait fini.
  minuteurEcoutePasser = setTimeout(() => document.addEventListener('click', passerAnimation), 0)
}

function desactiverPasser() {
  clearTimeout(minuteurEcoutePasser)
  document.removeEventListener('click', passerAnimation)
  document.removeEventListener('keydown', passerAuClavier)
  boutonPasser.hidden = true
}

function passerAuClavier(evenement) {
  if (evenement.key === 'Escape') passerAnimation()
}

// Le clic sur le bouton remonte aussi jusqu'au document : passerAnimation() est alors appelée
// deux fois, mais la seconde ne fait rien (il n'y a plus d'animation en cours).
boutonPasser.addEventListener('click', passerAnimation)

// 2. Boutons « ← Bibliothèque » : forEach pose le même écouteur sur chacun
boutonsRetour.forEach((bouton) => bouton.addEventListener('click', revenirALaBibliotheque))

function revenirALaBibliotheque() {
  if (history.state && history.state.depuisAccueil) {
    // On vient de l'accueil : on recule d'un pas, exactement comme le bouton retour du navigateur
    history.back()
  } else {
    // On est arrivé directement sur …/#connect : on retire le #connect de l'adresse
    history.pushState(null, '', location.pathname + location.search)
    afficherVue()
  }
}

// 3. Bouton retour / suivant du navigateur, ou adresse modifiée à la main
window.addEventListener('popstate', afficherVue)
window.addEventListener('hashchange', afficherVue)

// 4. Au chargement : si l'adresse est déjà …/#connect, on affiche le projet tout de suite
afficherVue({ instantane: true })

function afficherVue({ instantane = false, apresLancement = false } = {}) {
  const vueVoulue = location.hash === '#connect' ? 'projet' : 'accueil'
  if (vueVoulue === vueActuelle) return // déjà la bonne vue : rien à faire
  vueActuelle = vueVoulue

  const versProjet = vueVoulue === 'projet'
  const depart = versProjet ? sceneEl : vueProjet
  const arrivee = versProjet ? vueProjet : sceneEl

  // En quittant l'accueil, on range la main-curseur et l'info-bulle :
  // au retour, la bibliothèque est propre et la main revient dès que la souris bouge.
  if (versProjet) {
    cacherMain()
    masquerInfoBulle()
  }

  basculer(depart, arrivee, instantane, apresLancement, () => {
    // La page projet peut défiler, l'accueil non (voir .mode-projet dans style.css)
    document.documentElement.classList.toggle('mode-projet', versProjet)
    window.scrollTo(0, 0) // la vue s'ouvre toujours en haut
    // US4.5 : la vue projet est maintenant affichée et mesurable : on lance (ou recalcule) les effets
    if (versProjet) activerEffetsDefilement()
    // Story 7.3 : le disque tourne seulement quand la page projet est visible
    // (story 7.4 : le scratch au défilement démarre et s'arrête avec lui)
    if (versProjet) demarrerFondVinyle()
    else arreterFondVinyle()

    // Story 7.5 : la scène est maintenant cachée : on la remet dans son état d'accueil
    // (caméra au large, textes visibles), pour un retour à la bibliothèque propre
    if (versProjet) {
      reinitialiserLancement(decor.querySelector('svg'))
      sceneEl.classList.remove('scene--lancement')
    }

    if (instantane) return // ouverture directe : on ne déplace pas le focus
    // Focus : sur le titre du projet à l'ouverture, sur le vinyle Connect au retour
    const cible = versProjet ? titreProjet : vinyleConnect
    if (cible) cible.focus({ preventScroll: true })
  })
}

// Fondu : la vue de départ s'efface, puis la vue d'arrivée apparaît.
// « ensuite » est appelé au moment où la vue d'arrivée devient visible.
function basculer(depart, arrivee, instantane, apresLancement, ensuite) {
  clearTimeout(minuteurFondu) // si on change d'avis en plein fondu

  // Story 7.6 : fin de l'animation de lancement. Le disque de l'animation est exactement à la place
  // du disque de fond : on échange les deux vues d'un coup (sans fondu), puis seuls le contenu
  // et le fondu noir apparaissent (projet.css, .vue-projet--arrivee et .vue-projet--apparition).
  if (apresLancement) {
    arrivee.classList.add('vue-projet--arrivee', 'vue-projet--apparition') // contenu à l'opacité 0, transition prête
    depart.hidden = true
    arrivee.hidden = false
    ensuite()
    void arrivee.offsetWidth // force le navigateur à « voir » l'opacité 0 avant de la changer
    arrivee.classList.remove('vue-projet--arrivee') // … le contenu remonte à 1 en fondu
    // La transition finie, on retire la classe : elle ne gêne pas les autres effets de la page
    minuteurFondu = setTimeout(() => arrivee.classList.remove('vue-projet--apparition'), DUREE_APPARITION_CONTENU)
    return
  }

  if (instantane || reduireAnimations.matches) {
    depart.hidden = true
    depart.classList.remove('vue--effacee')
    arrivee.classList.remove('vue--effacee')
    arrivee.hidden = false
    ensuite()
    return
  }

  depart.classList.add('vue--effacee') // opacité 0, avec transition (style.css)
  minuteurFondu = setTimeout(() => {
    depart.hidden = true
    arrivee.classList.add('vue--effacee') // part de l'opacité 0…
    arrivee.hidden = false
    ensuite()
    void arrivee.offsetWidth // force le navigateur à « voir » l'opacité 0 avant de la changer
    arrivee.classList.remove('vue--effacee') // … et remonte à 1 en fondu
  }, DUREE_FONDU)
}

/* ---------------------------------------------------------
   US4.3 : barre du haut et sommaire de la page projet
   --------------------------------------------------------- */
const sommaireLiens = document.querySelectorAll('.sommaire a')
const sectionsProjet = [...document.querySelectorAll('.projet__section')]
const piedProjet = document.querySelector('.projet__pied')
const lienConnect = document.querySelector('.projets__lien[aria-current="page"]')
const boutonProjets = document.querySelector('.projets__bouton')
const listeProjets = document.querySelector('#liste-projets')

// Défilement en douceur, sauf si le visiteur a demandé de réduire les animations
function modeDefilement() {
  return reduireAnimations.matches ? 'auto' : 'smooth'
}

// 1. Clic dans le sommaire : on défile jusqu'au titre de la section.
//    preventDefault() empêche le navigateur de changer l'adresse (#connect-contexte…) :
//    afficherVue() croirait alors qu'on quitte la page projet.
sommaireLiens.forEach((lien) => {
  lien.addEventListener('click', (evenement) => {
    evenement.preventDefault()
    const titre = document.querySelector(lien.getAttribute('href'))
    if (!titre) return
    titre.scrollIntoView({ behavior: modeDefilement(), block: 'start' })
    // Le focus suit : au clavier, la touche Tab repart de cette section
    titre.focus({ preventScroll: true })
  })
})

// 2. « Connect » dans la barre : c'est la page affichée, on remonte simplement en haut
if (lienConnect) {
  lienConnect.addEventListener('click', (evenement) => {
    evenement.preventDefault()
    fermerMenuProjets()
    window.scrollTo({ top: 0, behavior: modeDefilement() })
    titreProjet.focus({ preventScroll: true })
  })
}

// 3. Section active du sommaire, avec IntersectionObserver.
//    La « zone de lecture » est une bande en haut de l'écran : de 150 px (sous les barres)
//    jusqu'à 55 % de la hauteur. La section qui la traverse est celle qu'on lit.
const sectionsVisibles = new Set()
let finDePageAtteinte = false

const observateurSections = new IntersectionObserver(
  (entrees) => {
    entrees.forEach((entree) => {
      if (entree.isIntersecting) sectionsVisibles.add(entree.target)
      else sectionsVisibles.delete(entree.target)
    })
    mettreAJourSommaire()
  },
  { rootMargin: '-150px 0px -55% 0px' }
)
sectionsProjet.forEach((section) => observateurSections.observe(section))

// Quand le pied de page apparaît, on est tout en bas : « Résultats » s'allume,
// même si la section est trop courte pour atteindre la zone de lecture.
if (piedProjet) {
  new IntersectionObserver(([entree]) => {
    finDePageAtteinte = entree.isIntersecting
    mettreAJourSommaire()
  }).observe(piedProjet)
}

function mettreAJourSommaire() {
  let active = finDePageAtteinte
    ? sectionsProjet[sectionsProjet.length - 1]
    : sectionsProjet.find((section) => sectionsVisibles.has(section)) // la 1re dans l'ordre de la page

  if (!active) {
    // Aucune section dans la zone : soit on est au-dessus de « Contexte » (sur l'en-tête),
    // et « Contexte » s'allume, comme sur la maquette ; soit on est entre deux sections,
    // et on garde celle qui était allumée.
    const auDessus = sectionsProjet[0] && sectionsProjet[0].getBoundingClientRect().top > 150
    if (!auDessus) return
    active = sectionsProjet[0]
  }

  sommaireLiens.forEach((lien) => {
    // Chaque section porte aria-labelledby = l'id de son titre, celui que vise le lien
    const estActif = active && lien.getAttribute('href') === '#' + active.getAttribute('aria-labelledby')
    if (estActif) lien.setAttribute('aria-current', 'true') // annoncé « actuel » par les lecteurs d'écran
    else lien.removeAttribute('aria-current')
  })
}

// 4. Menu « Projets » (écrans de moins de 1180 px)
if (boutonProjets && listeProjets) {
  boutonProjets.addEventListener('click', () => {
    const ouvert = boutonProjets.getAttribute('aria-expanded') === 'true'
    if (ouvert) fermerMenuProjets()
    else ouvrirMenuProjets()
  })

  // Échap ferme le menu et rend le focus au bouton
  document.addEventListener('keydown', (evenement) => {
    if (evenement.key === 'Escape' && menuProjetsOuvert()) {
      fermerMenuProjets()
      boutonProjets.focus()
    }
  })

  // Un clic ailleurs que dans le menu le ferme
  document.addEventListener('click', (evenement) => {
    if (menuProjetsOuvert() && !evenement.target.closest('.projets')) fermerMenuProjets()
  })
}

function menuProjetsOuvert() {
  return boutonProjets && boutonProjets.getAttribute('aria-expanded') === 'true'
}

function ouvrirMenuProjets() {
  boutonProjets.setAttribute('aria-expanded', 'true') // annoncé « développé » par les lecteurs d'écran
  listeProjets.classList.add('est-ouvert')
}

function fermerMenuProjets() {
  if (!boutonProjets) return
  boutonProjets.setAttribute('aria-expanded', 'false')
  listeProjets.classList.remove('est-ouvert')
}

/* ---------------------------------------------------------
   US4.4 : animations de wireframes (dans des iframes)
   Elles jouent seulement quand elles sont visibles à l'écran.
   La page envoie un message « lecture » ou « pause » à chaque iframe ;
   le fichier de l'animation l'écoute (voir public/wireframes/).
   --------------------------------------------------------- */
const iframesAnimation = document.querySelectorAll('.bloc-animation__iframe')
const iframesVisibles = new Set() // les iframes actuellement à l'écran

function envoyerEtat(iframe) {
  // Pas de « lecture » si le visiteur a demandé de réduire les animations :
  // le fichier affiche déjà son image finale.
  const message = iframesVisibles.has(iframe) && !reduireAnimations.matches ? 'lecture' : 'pause'
  // contentWindow = la fenêtre de l'iframe ; location.origin = on ne parle qu'à notre propre site
  if (iframe.contentWindow) iframe.contentWindow.postMessage(message, location.origin)
}

// L'observateur prévient quand une iframe est visible à au moins 25 %, ou ne l'est plus.
// Quand on revient à la bibliothèque, la page projet est cachée : les iframes « sortent » et se mettent en pause.
const observateurAnimations = new IntersectionObserver(
  (entrees) => {
    entrees.forEach((entree) => {
      if (entree.isIntersecting) iframesVisibles.add(entree.target)
      else iframesVisibles.delete(entree.target)
      envoyerEtat(entree.target)
    })
    // Story 7.4 : la main du scratch reste cachée tant qu'une animation est à l'écran
    signalerWireframeVisible(iframesVisibles.size > 0)
  },
  { threshold: 0.25 }
)

iframesAnimation.forEach((iframe) => {
  observateurAnimations.observe(iframe)
  // L'iframe peut finir de charger après être devenue visible : le premier message serait perdu.
  // On le renvoie donc une fois le chargement terminé.
  iframe.addEventListener('load', () => envoyerEtat(iframe))
})
