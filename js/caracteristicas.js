(() => {
  const seccion = document.getElementById("caracteristicas");
  if (!seccion) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const capas = [...seccion.querySelectorAll(".capa[data-a]")];
  const items = [...seccion.querySelectorAll(".carac_lista li")];

  const limitar = (t) => Math.min(1, Math.max(0, t));

  // Smoothstep suaviza el inicio y el final del movimiento.
  const suavizar = (t) => t * t * (3 - 2 * t);
  let visible = false;
  let ultimoProgreso = -1;
  let ultimoActivo = -1;

  function progresoScroll() {
    const rect = seccion.getBoundingClientRect();
    const recorrido = seccion.offsetHeight - window.innerHeight; 
    return limitar(-rect.top / recorrido);
  }

  function actualizar() {
    const p = progresoScroll();
    if (p === ultimoProgreso) return;
    ultimoProgreso = p;

    capas.forEach((capa) => {
      const a = Number(capa.dataset.a);
      const b = Number(capa.dataset.b);
      capa.style.setProperty("--q", suavizar(limitar((p - a) / (b - a))).toFixed(4));
    });

    let activo = 0;
    items.forEach((li, i) => {
      if (p >= Number(li.dataset.desde)) activo = i;
    });
    if (activo !== ultimoActivo) {
      items.forEach((li, i) => li.classList.toggle("activa", i === activo));
      ultimoActivo = activo;
    }

    seccion.style.setProperty("--p", p.toFixed(4));
  }

  let pendiente = false;
  function alScroll() {
    if (!visible || pendiente) return;
    pendiente = true;
    requestAnimationFrame(() => {
      actualizar();
      pendiente = false;
    });
  }

  window.addEventListener("scroll", alScroll, { passive: true });
  window.addEventListener("resize", alScroll);
  new IntersectionObserver(([entrada]) => {
    visible = entrada.isIntersecting;
    if (visible) alScroll();
  }).observe(seccion);
})();
