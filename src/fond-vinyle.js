/* ---------------------------------------------------------
   Story 7.3 : le disque en fond de la page projet
   - insère le disque (module de la story 7.2) dans sa couche de fond ;
   - lui donne la couleur du vinyle du projet ;
   - fait tourner l'étiquette dans le sens horaire, à 33 tours (1 tour en 1,8 s).
   Seule l'étiquette tourne : les sillons sont des cercles (leur rotation ne se verrait pas)
   et le reflet blanc reste fixe, comme un vrai reflet de lumière.
   En 7.4, le scratch pilotera la vitesse et le sens de cette même animation (timeScale).
   --------------------------------------------------------- */
import { gsap } from 'gsap'
import { insererElement } from './animation/elements.js'

const DUREE_TOUR = 1.8 // secondes pour un tour complet (33 tours par minute)
const reduireAnimations = window.matchMedia('(prefers-reduced-motion: reduce)')

let rotation = null // l'animation GSAP, créée une seule fois

/**
 * Prépare le disque. Appelée une fois au chargement par main.js.
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
}

// Appelée par main.js quand la page projet s'affiche
export function demarrerFondVinyle() {
  if (rotation && !reduireAnimations.matches) rotation.play()
}

// Appelée par main.js quand on revient à l'accueil : inutile de tourner sans être vu
export function arreterFondVinyle() {
  if (rotation) rotation.pause()
}

// Si le visiteur active « réduire les animations » pendant sa visite, le disque s'immobilise.
// S'il le désactive, le disque repart (seulement si la page projet est affichée).
reduireAnimations.addEventListener('change', () => {
  if (!rotation) return
  if (reduireAnimations.matches) rotation.pause()
  else if (!document.querySelector('.vue-projet').hidden) rotation.play()
})
