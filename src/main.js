import './style.css'
import scene from './assets/scene-accueil.svg?raw'

// Insère le décor SVG directement dans la page, pour pouvoir cibler chaque calque en CSS et en JS
const decor = document.querySelector('#decor')
decor.innerHTML = scene

// Le décor est purement visuel : on le cache aux lecteurs d'écran
decor.querySelector('svg').setAttribute('aria-hidden', 'true')
