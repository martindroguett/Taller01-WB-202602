// Animación propia de la sección "Características": el bisel y el cristal suben según el scroll.
// No usa librerías: convierte el scroll en un número p (0 a 1) y, con p, calcula cuánto sube cada capa.
// El CSS convierte ese número en movimiento (variable --q de cada capa).

(() => {
  const seccion = document.getElementById("caracteristicas");
  if (!seccion) return;

  // Con "reducir movimiento" el CSS ya muestra el estado final, así que no se anima nada.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const capas = [...seccion.querySelectorAll(".capa[data-a]")];
  const items = [...seccion.querySelectorAll(".carac_lista li")];

  // Mantiene t dentro de [0, 1]
  const limitar = (t) => Math.min(1, Math.max(0, t));

  // smoothstep: arranca y termina suave en vez de moverse a velocidad constante
  const suavizar = (t) => t * t * (3 - 2 * t);

  // p = progreso del scroll dentro de la sección: 0 al entrar, 1 al salir
  function progresoScroll() {
    const rect = seccion.getBoundingClientRect();
    const recorrido = seccion.offsetHeight - window.innerHeight; 
    return limitar(-rect.top / recorrido);
  }

  function actualizar() {
    const p = progresoScroll();

    capas.forEach((capa) => {
      const a = Number(capa.dataset.a);
      const b = Number(capa.dataset.b);
      capa.style.setProperty("--q", suavizar(limitar((p - a) / (b - a))).toFixed(4));
    });

    // La característica activa es la última cuyo umbral (data-desde) ya se alcanzó
    let activo = 0;
    items.forEach((li, i) => {
      if (p >= Number(li.dataset.desde)) activo = i;
    });
    items.forEach((li, i) => li.classList.toggle("activa", i === activo));

    seccion.style.setProperty("--p", p.toFixed(4));
  }

  // requestAnimationFrame: como mucho un cálculo por cuadro, aunque el scroll dispare muchos eventos
  let pendiente = false;
  function alScroll() {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(() => {
      actualizar();
      pendiente = false;
    });
  }

  window.addEventListener("scroll", alScroll, { passive: true });
  window.addEventListener("resize", alScroll);
  actualizar();
})();
