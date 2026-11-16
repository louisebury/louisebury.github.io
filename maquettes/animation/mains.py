"""Main néon v3 : gant blanc, contour néon rose. Paume + 5 doigts à 2 phalanges (articulés), pouce au premier plan.
Une pose = un dictionnaire de doigts ; deux poses se mélangent (melange) pour des transitions souples."""
import math

INK = "#F5F3FF"; PINK = "#FF4FA0"; DARK = "#2A0E5A"
NOMS = ["index", "majeur", "annulaire", "auriculaire", "pouce"]
# doigt : (base x, base y, phalange 1, phalange 2, largeur, angle, courbure, repli)
#   angle    : orientation du doigt (0 = vers le haut, + = vers la droite)
#   courbure : la 2e phalange s'incline sur le côté (doigts qui se rejoignent, pince)
#   repli    : 0 = doigt tendu, 90 = doigt replié vers la paume (il paraît plus court, l'articulation se marque)
POSES = {
    "ouverte": [(84, 124, 40, 34, 20, -16, -5, 10), (106, 118, 44, 38, 20, -5, -2, 8), (128, 122, 42, 34, 19, 6, 4, 10),
                (148, 132, 32, 28, 17, 18, 8, 14), (76, 168, 32, 30, 24, -62, -12, 0)],
    "pince":   [(84, 126, 40, 32, 20, -30, -42, 15), (106, 118, 42, 34, 20, -8, -16, 45), (127, 121, 40, 30, 19, 2, -10, 55),
                (147, 131, 32, 24, 17, 10, -6, 60), (74, 170, 34, 32, 24, -72, 52, 0)],
    "tient":   [(86, 124, 42, 34, 20, -4, 0, 72), (106, 118, 46, 36, 20, 0, 0, 74), (126, 122, 42, 32, 19, 5, 0, 76),
                (145, 132, 34, 26, 17, 10, 2, 78), (76, 164, 36, 32, 24, -36, 34, 8)],
    "pointe":  [(86, 124, 52, 46, 20, -3, 0, 0), (106, 120, 44, 30, 20, 6, 0, 86), (127, 124, 40, 28, 19, 10, 0, 86),
                (146, 134, 32, 24, 17, 14, 0, 86), (78, 166, 30, 28, 24, -44, 54, 15)],
    "scratch": [(84, 124, 40, 32, 20, -18, -8, 0), (106, 118, 44, 36, 20, -5, -5, 0), (128, 122, 42, 32, 19, 8, 3, 0),
                (148, 132, 32, 26, 17, 22, 6, 0), (76, 168, 32, 28, 24, -66, -14, 0)],
}
# pouce : plus court et plus fin, rattaché plus près du poignet (plus naturel)
for _p in POSES.values():
    bx, by, l1, l2, w, ang, c, rep = _p[4]
    _p[4] = (bx + 3, by + 4, l1 * 0.82, l2 * 0.8, 21, ang, c, rep)

PAUME = "M70 122 Q64 168 78 200 L84 222 H146 L152 200 Q166 168 156 124 Q112 106 70 122 Z"
_UID = [0]


def melange(p1, p2, t):
    """Pose intermédiaire entre deux poses (0 = p1, 1 = p2) : c'est ce que GSAP fera en continu."""
    a, b = POSES[p1], POSES[p2]
    return [tuple(x + (y - x) * t for x, y in zip(fa, fb)) for fa, fb in zip(a, b)]


def _doigts(pose):
    return POSES[pose] if isinstance(pose, str) else pose


def _longueurs(f):
    bx, by, l1, l2, w, a, c, rep = f
    k = math.radians(rep)
    return l1 * (1 - 0.3 * math.sin(k)), l2 * max(0.22, math.cos(k))


def bout(f):
    bx, by, l1, l2, w, a, c, rep = f
    v1, v2 = _longueurs(f)
    r1, r2 = math.radians(a), math.radians(a + c)
    jx, jy = bx + v1 * math.sin(r1), by - v1 * math.cos(r1)
    return jx + v2 * math.sin(r2), jy - v2 * math.cos(r2)


def doigt(nom, f):
    bx, by, l1, l2, w, a, c, rep = f
    v1, v2 = _longueurs(f)
    w2 = w * (0.92 + 0.1 * math.sin(math.radians(rep)))   # doigt replié : l'articulation paraît plus large
    return (f'<g class="doigt" data-doigt="{nom}" transform="translate({bx:.1f} {by:.1f}) rotate({a:.1f})">'
            f'<rect x="{-w/2:.1f}" y="{-v1:.1f}" width="{w:.1f}" height="{v1+16:.1f}" rx="{w/2:.1f}"/>'
            f'<g class="phalange" transform="translate(0 {-v1:.1f}) rotate({c:.1f})">'
            f'<rect x="{-w2/2:.1f}" y="{-v2:.1f}" width="{w2:.1f}" height="{v2+w2/2:.1f}" rx="{w2/2:.1f}"/></g></g>')


def couches(uid, color, plis=()):
    """Contour sous remplissage commun : aucun trait parasite aux jointures."""
    j = 'stroke-linejoin="round" stroke-linecap="round"'
    return (f'<use href="#{uid}" fill="none" stroke="{color}" stroke-opacity="0.13" stroke-width="30" {j}/>'
            f'<use href="#{uid}" fill="none" stroke="{color}" stroke-opacity="0.35" stroke-width="17" {j}/>'
            f'<use href="#{uid}" fill="none" stroke="{color}" stroke-width="10" {j}/>'
            f'<use href="#{uid}" fill="none" stroke="{DARK}" stroke-width="5" {j}/>'
            f'<use href="#{uid}" fill="{INK}" stroke="none"/>')


def main_svg(pose, color=PINK, partie="tout", pression=False):
    """partie = "tout" | "dos" (paume + 4 doigts, à mettre DERRIÈRE l'objet tenu) | "pouce" (à mettre DEVANT)."""
    f = _doigts(pose)
    _UID[0] += 1; u = _UID[0]
    pouce = doigt("pouce", f[4])
    dos = f'<path id="paume" d="{PAUME}"/>' + "".join(doigt(n, d) for n, d in zip(NOMS[:4], f[:4])) + (pouce if partie == "tout" else "")
    s = ""
    if partie in ("tout", "dos"):
        s += f'<defs><g id="main-dos-{u}">{dos}</g></defs>'
        if not pression:
            s += f'<ellipse cx="112" cy="130" rx="96" ry="112" fill="{color}" fill-opacity="0.06"/>'
        s += couches(f"main-dos-{u}", color)
        # plis des phalanges repliées (seulement là où le doigt est vraiment plié)
        for d in f[:4]:
            if d[7] > 35:
                bx, by, l1, l2, w, a, c, rep = d
                v1, _ = _longueurs(d)
                r = math.radians(a); jx, jy = bx + v1 * math.sin(r), by - v1 * math.cos(r)
                ux, uy = math.cos(r), math.sin(r)
                s += (f'<path d="M{jx - w*0.3*ux:.1f} {jy - w*0.3*uy + 2:.1f} Q{jx:.1f} {jy + 5:.1f} {jx + w*0.3*ux:.1f} {jy + w*0.3*uy + 2:.1f}" '
                      f'fill="none" stroke="{DARK}" stroke-opacity="0.4" stroke-width="2" stroke-linecap="round"/>')
        s += f'<path d="M94 178 Q112 188 132 176" fill="none" stroke="{DARK}" stroke-opacity="0.45" stroke-width="2.2" stroke-linecap="round"/>'
        s += (f'<g id="bracelet"><rect x="80" y="208" width="72" height="26" rx="7" fill="{color}"/>'
              f'<path d="M86 221 H146" stroke="{INK}" stroke-opacity="0.8" stroke-width="2" stroke-linecap="round"/></g>')
    if partie == "pouce":
        j = 'stroke-linejoin="round" stroke-linecap="round"'
        s += (f'<defs><g id="main-pouce-{u}">{pouce}</g></defs>'
              f'<use href="#main-pouce-{u}" fill="none" stroke="{DARK}" stroke-width="5" {j}/>'
              f'<use href="#main-pouce-{u}" fill="{INK}" stroke="none"/>')
    if pression and partie in ("tout", "dos"):
        # traits de pression autour du bout des doigts et de la paume
        for d in f[:4]:
            tx, ty = bout(d)
            s += f'<path d="M{tx-12:.1f} {ty-14:.1f} Q{tx:.1f} {ty-22:.1f} {tx+12:.1f} {ty-14:.1f}" fill="none" stroke="{INK}" stroke-opacity="0.85" stroke-width="3" stroke-linecap="round"/>'
        s += f'<path d="M52 150 Q44 170 52 190 M172 150 Q180 170 172 190" fill="none" stroke="{INK}" stroke-opacity="0.85" stroke-width="3" stroke-linecap="round"/>'
    if pression:
        s = f'<g transform="translate(112 222) scale(1.07 0.9) translate(-112 -222)">{s}</g>'
    return s


def point_prise(pose, nom=None):
    f = _doigts(pose); nom = nom or (pose if isinstance(pose, str) else "")
    if nom in ("pince",):
        (ix, iy), (tx, ty) = bout(f[0]), bout(f[4]); return (ix + tx) / 2, (iy + ty) / 2
    if nom == "pointe":
        return bout(f[0])
    if nom == "tient":
        (mx, my), (tx, ty) = bout(f[1]), bout(f[4]); return (mx + tx) / 2, (my + ty) / 2
    if nom == "scratch":
        return 112, 150
    mx, my = bout(f[1]); return mx, my + 34


def main(P, pose="pince", s=0.3, rot=0, gauche=False, op=1, color=PINK, partie="tout", pression=False, prise=None):
    """Place la main pour que son point de prise tombe sur P."""
    px, py = point_prise(pose, prise)
    a = math.radians(rot); dx, dy = px - 110, py - 130
    rx, ry = 110 + dx * math.cos(a) - dy * math.sin(a), 130 + dx * math.sin(a) + dy * math.cos(a)
    x, y = P[0] - s * rx, P[1] - s * ry
    r = f" rotate({rot} 110 130)" if rot else ""
    h = f'<g class="main" opacity="{op}" transform="translate({x:.1f} {y:.1f}) scale({s}){r}">{main_svg(pose, color, partie, pression)}</g>'
    if gauche:
        h = f'<g transform="translate({P[0]} {P[1]}) scale(-1 1) translate({-P[0]} {-P[1]})">{h}</g>'
    return h
