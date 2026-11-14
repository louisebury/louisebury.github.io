/* ---------------------------------------------------------
   US4.5 : effets au défilement sur la page projet (GSAP ScrollTrigger)
   - les blocs apparaissent en fondu avec une petite montée, une seule fois ;
   - la carte question s'allume quand elle arrive au centre de l'écran ;
   - les barres « objectif → réel » se remplissent à leur arrivée.
   Règle d'or : sans JavaScript, ou avec « réduire les animations », tout est affiché.
   Rien n'est caché en CSS seul : c'est ce fichier qui masque les blocs, juste avant de les animer.
   --------------------------------------------------------- */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const reduireAnimations = window.matchMedia('(prefers-reduced-motion: reduce)')
let etat = 'eteint' // 'eteint' → 'actif' (effets créés) ou 'coupe' (le visiteur a demandé moins d'animations)
let blocs = []

// Appelée par main.js à chaque ouverture de la vue projet, une fois la vue affichée
export function activerEffetsDefilement() {
  if (reduireAnimations.matches || etat === 'coupe') return

  if (etat === 'actif') {
    // La vue projet était cachée (passage par l'accueil) : les positions mémorisées sont fausses.
    // refresh() les recalcule maintenant que la page est de nouveau visible.
    ScrollTrigger.refresh()
    return
  }

  etat = 'actif'
  gsap.registerPlugin(ScrollTrigger)
  // Cette classe « autorise » le CSS à préparer les effets (barres vides, voir projet.css)
  document.documentElement.classList.add('effets-defilement')

  creerFonduDesBlocs()
  creerHaloQuestion()
  creerRemplissageBarres()

  // Les polices Google arrivent parfois après : elles changent la hauteur des textes, on recalcule
  document.fonts.ready.then(() => ScrollTrigger.refresh())
}

// 1. Fondu + petite montée des cartes, au premier passage seulement
function creerFonduDesBlocs() {
  blocs = gsap.utils.toArray('.projet__section .carte, .projet__section .cadre-neon, .projet__section .bloc-animation')

  // On masque juste avant d'animer. Opacité seulement (pas « visibility ») :
  // un lecteur d'écran lit tout le texte, même avant l'apparition.
  gsap.set(blocs, { opacity: 0, y: 24 })

  // batch() regroupe les blocs qui entrent à l'écran en même temps, pour les faire apparaître en cascade
  ScrollTrigger.batch(blocs, {
    start: 'top 90%', // quand le haut du bloc atteint 90 % de la hauteur de l'écran
    once: true, // une seule fois : remonter puis redescendre ne rejoue rien
    onEnter: (lot) =>
      gsap.to(lot, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.08, overwrite: true }),
  })
}

// 2. La carte question s'allume (halo néon rose) quand son centre atteint le centre de l'écran
function creerHaloQuestion() {
  const carte = document.querySelector('.carte-question')
  if (!carte) return
  ScrollTrigger.create({
    trigger: carte,
    start: 'center center',
    once: true,
    onEnter: () => carte.classList.add('carte-question--allumee'), // le halo est une transition CSS
  })
}

// 3. Les barres se remplissent quand le bloc « Indicateurs » entre à l'écran.
//    Le remplissage est un ::before, que GSAP ne peut pas cibler : on ajoute une classe, le CSS anime.
function creerRemplissageBarres() {
  const indicateurs = document.querySelector('.indicateurs')
  if (!indicateurs) return
  ScrollTrigger.create({
    trigger: indicateurs,
    start: 'top 75%',
    once: true,
    onEnter: () => indicateurs.querySelectorAll('.barre').forEach((barre) => barre.classList.add('barre--remplie')),
  })
}

// Si le visiteur active « réduire les animations » pendant sa visite : on coupe tout et on affiche tout
reduireAnimations.addEventListener('change', () => {
  if (!reduireAnimations.matches || etat !== 'actif') return
  etat = 'coupe'
  ScrollTrigger.getAll().forEach((declencheur) => declencheur.kill())
  gsap.killTweensOf(blocs)
  gsap.set(blocs, { clearProps: 'opacity,transform' }) // retire les styles ajoutés par GSAP
  document.documentElement.classList.remove('effets-defilement') // les barres redeviennent pleines
})
