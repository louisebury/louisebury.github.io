/* ---------------------------------------------------------
   Story 7.2 : la main articulée (portage en JavaScript de maquettes/animation/mains.py)

   Une pose = 5 doigts (index, majeur, annulaire, auriculaire, pouce).
   Un doigt = [base x, base y, phalange 1, phalange 2, largeur, angle, courbure, repli]
     - angle    : orientation du doigt (0 = vers le haut, + = vers la droite)
     - courbure : la 2e phalange s'incline sur le côté
     - repli    : 0 = tendu, 90 = replié vers la paume (il paraît plus court)

   Les doigts sont dessinés une seule fois, dans les <defs> de main.svg.
   Des <use> les recopient en plusieurs calques (halo, néon, trait foncé, remplissage).
   On modifie donc seulement les doigts des <defs> : tous les calques suivent.
   --------------------------------------------------------- */
import donnees from '../assets/animation/poses-main.json'

// Les 5 poses (pince, tient, ouverte, pointe, scratch). Le pouce y est déjà ajusté :
// on ne refait pas l'ajustement de la fin de mains.py.
export const POSES = donnees.poses

const NOMS = ['index', 'majeur', 'annulaire', 'auriculaire', 'pouce']
const SVG = 'http://www.w3.org/2000/svg'
const FONCE = '#2A0E5A' // couleur des plis (DARK dans mains.py)
const rad = (degres) => (degres * Math.PI) / 180
const f1 = (nombre) => nombre.toFixed(1) // un chiffre après la virgule, comme {:.1f} en Python

// Une pose peut être donnée par son nom ('tient') ou directement par ses 5 doigts
function doigtsDe(pose) {
  return typeof pose === 'string' ? POSES[pose] : pose
}

// Longueurs visibles des deux phalanges : un doigt replié paraît plus court (_longueurs dans mains.py)
function longueurs([, , l1, l2, , , , repli]) {
  const k = rad(repli)
  return [l1 * (1 - 0.3 * Math.sin(k)), l2 * Math.max(0.22, Math.cos(k))]
}

/**
 * Pose intermédiaire entre deux poses : t = 0 donne poseA, t = 1 donne poseB.
 * Chaque valeur avance en ligne droite de A vers B (melange() dans mains.py).
 * GSAP fait varier t de 0 à 1 : on obtient une transition souple.
 */
export function melangerPoses(poseA, poseB, t) {
  const a = doigtsDe(poseA)
  const b = doigtsDe(poseB)
  return a.map((doigtA, i) => doigtA.map((x, j) => x + (b[i][j] - x) * t))
}

/**
 * Applique une pose à une main insérée dans la page (main.svg, ou une partie : #main-tenue…).
 * Elle redessine chaque doigt présent dans ses <defs>, puis les plis des doigts repliés.
 */
export function appliquerPose(elementMain, pose) {
  const doigts = doigtsDe(pose)

  elementMain.querySelectorAll('defs .doigt[data-doigt]').forEach((groupe) => {
    const d = doigts[NOMS.indexOf(groupe.dataset.doigt)]
    if (!d) return
    const [bx, by, , , w, angle, courbure, repli] = d
    const [v1, v2] = longueurs(d)
    // Doigt replié : l'articulation paraît plus large
    const w2 = w * (0.92 + 0.1 * Math.sin(rad(repli)))

    // 1re phalange : le groupe du doigt est placé à sa base, puis tourné
    groupe.setAttribute('transform', `translate(${f1(bx)} ${f1(by)}) rotate(${f1(angle)})`)
    const rect1 = groupe.querySelector(':scope > rect')
    rect1.setAttribute('x', f1(-w / 2))
    rect1.setAttribute('y', f1(-v1))
    rect1.setAttribute('width', f1(w))
    rect1.setAttribute('height', f1(v1 + 16))
    rect1.setAttribute('rx', f1(w / 2))

    // 2e phalange : placée au bout de la 1re, puis inclinée de la « courbure »
    const phalange = groupe.querySelector('.phalange')
    phalange.setAttribute('transform', `translate(0 ${f1(-v1)}) rotate(${f1(courbure)})`)
    const rect2 = phalange.querySelector('rect')
    rect2.setAttribute('x', f1(-w2 / 2))
    rect2.setAttribute('y', f1(-v2))
    rect2.setAttribute('width', f1(w2))
    rect2.setAttribute('height', f1(v2 + w2 / 2))
    rect2.setAttribute('rx', f1(w2 / 2))
  })

  dessinerPlis(elementMain, doigts)
}

// Plis des phalanges repliées (repli > 35), comme dans main_svg() de mains.py.
// Ils se placent juste après le calque de remplissage (le dernier <use>), sous la ligne de la paume.
function dessinerPlis(elementMain, doigts) {
  elementMain.querySelectorAll('defs').forEach((defs) => {
    // Seulement pour le « dos » de la main (paume + 4 doigts), pas pour le pouce seul
    if (!defs.querySelector('.doigt[data-doigt="index"]')) return
    const parent = defs.parentNode

    let plis = parent.querySelector(':scope > g.plis')
    if (!plis) {
      plis = document.createElementNS(SVG, 'g')
      plis.setAttribute('class', 'plis')
      const uses = parent.querySelectorAll(':scope > use')
      uses[uses.length - 1].after(plis)
    }

    let chemins = ''
    doigts.slice(0, 4).forEach((d) => {
      const [bx, by, , , w, angle, , repli] = d
      if (repli <= 35) return
      const [v1] = longueurs(d)
      const r = rad(angle)
      const jx = bx + v1 * Math.sin(r) // position de l'articulation
      const jy = by - v1 * Math.cos(r)
      const ux = Math.cos(r)
      const uy = Math.sin(r)
      chemins +=
        `<path d="M${f1(jx - w * 0.3 * ux)} ${f1(jy - w * 0.3 * uy + 2)} Q${f1(jx)} ${f1(jy + 5)} ${f1(jx + w * 0.3 * ux)} ${f1(jy + w * 0.3 * uy + 2)}" ` +
        `fill="none" stroke="${FONCE}" stroke-opacity="0.4" stroke-width="2" stroke-linecap="round"/>`
    })
    plis.innerHTML = chemins
  })
}
