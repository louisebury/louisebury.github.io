/* ---------------------------------------------------------
   Story 7.2 : les éléments dessinés de l'animation du vinyle
   On importe chaque SVG comme du texte (?raw), comme la scène de l'accueil :
   une fois collé dans la page, chaque calque peut être ciblé en CSS et en JS.
   Ce module ne fait rien tout seul : il sera appelé par l'animation (stories 7.3 à 7.7).
   --------------------------------------------------------- */
import main from '../assets/animation/main.svg?raw'
import disque from '../assets/animation/disque.svg?raw'
import pochette from '../assets/animation/pochette.svg?raw'
import vueDessus from '../assets/animation/vue-dessus.svg?raw'

const ELEMENTS = { main, disque, pochette, 'vue-dessus': vueDessus }

/**
 * Colle un élément dans un conteneur et renvoie son <svg>.
 * - nom : 'main', 'disque', 'pochette' ou 'vue-dessus'
 * - conteneur : l'élément HTML (ou SVG) qui le reçoit
 * - prefixe : texte ajouté devant chaque id, par exemple 'main-droite'
 *
 * Pourquoi un préfixe ? Un id doit être unique dans la page. Si on colle deux mains,
 * les <use href="#forme-main-dos"> de la 2e main recopieraient les doigts de la 1re :
 * les deux mains auraient toujours la même pose. Avec le préfixe, chaque copie a ses propres id.
 */
export function insererElement(nom, conteneur, prefixe = nom) {
  const source = ELEMENTS[nom]
  if (!source) throw new Error(`Élément inconnu : ${nom}`)

  const texte = source
    .replace(/\bid="([^"]+)"/g, `id="${prefixe}-$1"`) // id="x" → id="prefixe-x"
    .replace(/href="#([^"]+)"/g, `href="#${prefixe}-$1"`) // <use href="#x"> suit le nouvel id
    .replace(/url\(#([^)]+)\)/g, `url(#${prefixe}-$1)`) // dégradés, filtres : fill="url(#x)"

  // insertAdjacentHTML ajoute à la fin du conteneur sans effacer ce qu'il contient déjà
  conteneur.insertAdjacentHTML('beforeend', texte)
  const svg = conteneur.lastElementChild
  svg.setAttribute('aria-hidden', 'true') // purement décoratif
  svg.setAttribute('focusable', 'false')
  return svg
}
