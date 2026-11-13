import './style.css'
import scene from './assets/scene-accueil.svg?raw'

// Insère le décor SVG directement dans la page, pour pouvoir cibler chaque calque en CSS et en JS
const decor = document.querySelector('#decor')
decor.innerHTML = scene

// Le décor est purement visuel : on le cache aux lecteurs d'écran
decor.querySelector('svg').setAttribute('aria-hidden', 'true')

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
