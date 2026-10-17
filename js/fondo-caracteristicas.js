(() => {
  const seccion = document.getElementById("caracteristicas");
  const lienzo = seccion?.querySelector(".carac_fondo");
  if (!lienzo) return;

  const ctx = lienzo.getContext("2d");
  if (!ctx) return;
  const escenario = lienzo.closest(".carac_escenario");
  const hero = document.getElementById("inicio");
  const lienzoHero = hero?.querySelector(".hero-burbujas");
  const ctxHero = lienzoHero?.getContext("2d");
  const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Las burbujas viven en una sola columna de agua: arriba el hero y abajo el escenario de características.
  // y = 0 es el borde superior del hero; y = altoHero es donde empieza el escenario.
  // Cada lienzo dibuja solo su tramo, así una burbuja que sale por arriba de características sigue subiendo por el hero.
  let ancho = 0;
  let alto = 0;
  let altoHero = 0;
  let total = 0;
  let burbujas = [];

  const azar = (min, max) => min + Math.random() * (max - min);

  function crearBurbuja(enCualquierAltura) {
    const r = azar(1.5, 7);
    return {
      x: azar(0, ancho),
      y: enCualquierAltura ? azar(0, total) : total + r + azar(0, 60),
      r,
      vel: azar(14, 30) * (0.6 + r / 10),
      fase: azar(0, Math.PI * 2),
      amp: azar(4, 14),
      frec: azar(0.5, 1.4)
    };
  }

  function ajustarLienzo(elemento, contexto) {
    const rect = elemento.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    elemento.width = Math.round(rect.width * dpr);
    elemento.height = Math.round(rect.height * dpr);
    contexto.setTransform(dpr, 0, 0, dpr, 0, 0);
    return rect;
  }

  function redimensionar() {
    const rect = ajustarLienzo(lienzo, ctx);
    ancho = rect.width;
    alto = rect.height;
    altoHero = ctxHero ? ajustarLienzo(lienzoHero, ctxHero).height : 0;
    total = altoHero + alto;

    // misma densidad que antes en características, repartida en toda la columna
    const cantidad = Math.round(Math.min(60, (ancho * alto) / 22000) * (total / Math.max(alto, 1)));
    burbujas = Array.from({ length: cantidad }, () => crearBurbuja(true));

    if (reducido) dibujarTodas(0);
  }

  function dibujarBurbuja(contexto, x, y, r) {
    contexto.beginPath();
    contexto.arc(x, y, r, 0, Math.PI * 2);
    contexto.fillStyle = "rgba(255, 255, 255, 0.35)";
    contexto.fill();
    contexto.lineWidth = 1;
    contexto.strokeStyle = "rgba(29, 79, 143, 0.3)";
    contexto.stroke();

    contexto.beginPath();
    contexto.arc(x - r * 0.35, y - r * 0.35, r * 0.28, 0, Math.PI * 2);
    contexto.fillStyle = "rgba(255, 255, 255, 0.85)";
    contexto.fill();
  }

  function dibujarTodas(t) {
    ctx.clearRect(0, 0, ancho, alto);
    ctxHero?.clearRect(0, 0, ancho, altoHero);

    for (const b of burbujas) {
      const x = b.x + Math.sin((t / 1000) * b.frec + b.fase) * b.amp;
      if (ctxHero && b.y < altoHero + b.r) dibujarBurbuja(ctxHero, x, b.y, b.r);
      if (b.y > altoHero - b.r) dibujarBurbuja(ctx, x, b.y - altoHero, b.r);
    }
  }

  let ultimoScroll = window.scrollY;
  let impulso = 0;

  let anterior = 0;
  let idCuadro = 0;
  let corriendo = false;

  function cuadro(t) {
    const dt = anterior ? Math.min(0.05, (t - anterior) / 1000) : 0;
    anterior = t;

    const delta = window.scrollY - ultimoScroll;
    ultimoScroll = window.scrollY;
    impulso = Math.max(-20, Math.min(40, impulso * 0.9 + delta * 0.08));

    // Con el escenario fijo en pantalla el hero ya quedó fuera de la vista: ahí el scroll empuja las burbujas
    // de características (como si el buzo bajara) y las que salen por arriba vuelven a entrar por abajo.
    const fijo = escenario.getBoundingClientRect().top <= 0;

    for (const b of burbujas) {
      const enEscenario = b.y > altoHero - b.r;
      b.y -= b.vel * dt + (fijo && enEscenario ? impulso * (0.15 + b.r * 0.03) : 0);

      if (b.y < -b.r - 10) {
        Object.assign(b, crearBurbuja(false));
        // mientras el hero está fuera de la vista, sigue recibiendo burbujas desde abajo para no quedar vacío
        if (fijo) b.y = altoHero - b.r - azar(1, 60);
      } else if (fijo && enEscenario && b.y < altoHero - b.r - 10) {
        Object.assign(b, crearBurbuja(false));
      }
      if (b.y > total + 80) b.y = altoHero - b.r;
    }

    dibujarTodas(t);
    idCuadro = requestAnimationFrame(cuadro);
  }

  function iniciar() {
    if (corriendo) return;
    corriendo = true;
    anterior = 0;
    ultimoScroll = window.scrollY;
    idCuadro = requestAnimationFrame(cuadro);
  }

  function detener() {
    corriendo = false;
    cancelAnimationFrame(idCuadro);
  }

  redimensionar();
  const observadorTamano = new ResizeObserver(redimensionar);
  observadorTamano.observe(lienzo);
  if (lienzoHero) observadorTamano.observe(lienzoHero);

  if (reducido) return;

  // Se anima mientras se vea el hero o características, y la pestaña esté visible.
  let caracVisible = false;
  let heroVisible = false;
  function sincronizar() {
    seccion.classList.toggle("en-pantalla", caracVisible && !document.hidden);
    (caracVisible || heroVisible) && !document.hidden ? iniciar() : detener();
  }

  const observadorVista = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.target === seccion) caracVisible = entrada.isIntersecting;
      else heroVisible = entrada.isIntersecting;
    });
    sincronizar();
  });
  observadorVista.observe(seccion);
  if (lienzoHero) observadorVista.observe(hero);

  document.addEventListener("visibilitychange", sincronizar);
})();


(() => {
  const hero = document.getElementById("inicio");
  const escenario = document.querySelector(".carac_escenario");
  const tituloEm = hero?.querySelector("#hero-title em");
  if (!escenario || !tituloEm) return;

  function topeEnDocumento(el) {
    let y = 0;
    for (let n = el; n; n = n.offsetParent) y += n.offsetTop;
    return y;
  }

  function medir() {
    const desdeArriba = topeEnDocumento(tituloEm) - topeEnDocumento(hero);
    const distancia = Math.max(0, Math.round(hero.offsetHeight - desdeArriba));
    hero.style.setProperty("--extra-top", `${hero.offsetHeight - distancia}px`);
    hero.style.setProperty("--extra-alto", `${distancia}px`);
    hero.style.setProperty("--carac-alto", `${escenario.offsetHeight}px`);
  }

  medir();
  const observador = new ResizeObserver(medir);
  observador.observe(hero);
  observador.observe(escenario);
  document.fonts?.ready.then(medir);
})();
