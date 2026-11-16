// TEMPORAIRE (story 7.2) : script de test-poses.html. À supprimer avec elle.
import { gsap } from 'gsap'
import { insererElement } from './src/animation/elements.js'
import { appliquerPose, melangerPoses, POSES } from './src/animation/main-articulee.js'

const grille = document.querySelector('#grille')

// Crée une case avec sa légende, y colle une main, et renvoie la main
function caseAvecMain(legende, prefixe) {
  const figure = document.createElement('figure')
  grille.append(figure)
  const main = insererElement('main', figure, prefixe)
  const texte = document.createElement('figcaption')
  texte.textContent = legende
  figure.append(texte)
  return main
}

// 1. Les 5 poses, une par case
Object.keys(POSES).forEach((nom) => {
  const main = caseAvecMain(nom, `main-${nom}`)
  appliquerPose(main, nom)
})

// 2. La transition « tient → ouverte », en boucle aller-retour.
// GSAP fait varier progres.t de 0 à 1 ; à chaque image on recalcule la pose intermédiaire.
const mainAnimee = caseAvecMain('tient → ouverte (GSAP, en boucle)', 'main-animee')
const progres = { t: 0 }
appliquerPose(mainAnimee, 'tient')

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  gsap.to(progres, {
    t: 1,
    duration: 0.8,
    ease: 'power1.inOut',
    yoyo: true, // revient en arrière
    repeat: -1, // à l'infini
    repeatDelay: 0.4,
    onUpdate: () => appliquerPose(mainAnimee, melangerPoses('tient', 'ouverte', progres.t)),
  })
}
