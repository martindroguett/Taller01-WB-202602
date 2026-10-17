(() => {
  const seccion = document.getElementById("caracteristicas");
  const lienzo = seccion?.querySelector(".carac_fondo");
  if (!lienzo) return;

  const ctx = lienzo.getContext("2d");
  if (!ctx) return;
  const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let ancho = 0;
  let alto = 0;
  let burbujas = [];

  const azar = (min, max) => min + Math.random() * (max - min);

  function crearBurbuja(enCualquierAltura) {
    const r = azar(1.5, 7);
    return {
      x: azar(0, ancho),
      y: enCualquierAltura ? azar(0, alto) : alto + r + azar(0, 60),
      r,
      vel: azar(14, 30) * (0.6 + r / 10),
      fase: azar(0, Math.PI * 2),
      amp: azar(4, 14),
      frec: azar(0.5, 1.4)
    };
  }

  function redimensionar() {
    const rect = lienzo.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    ancho = rect.width;
    alto = rect.height;
    lienzo.width = Math.round(ancho * dpr);
    lienzo.height = Math.round(alto * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cantidad = Math.round(Math.min(60, (ancho * alto) / 22000));
    burbujas = Array.from({ length: cantidad }, () => crearBurbuja(true));

    if (reducido) burbujas.forEach((b) => dibujarBurbuja(b, b.x));
  }

  function dibujarBurbuja(b, x) {
    ctx.beginPath();
    ctx.arc(x, b.y, b.r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(29, 79, 143, 0.3)";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.28, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.fill();
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

    ctx.clearRect(0, 0, ancho, alto);

    for (const b of burbujas) {
      b.y -= b.vel * dt + impulso * (0.15 + b.r * 0.03);
      if (b.y < -b.r - 10) Object.assign(b, crearBurbuja(false));
      if (b.y > alto + 80) b.y = -b.r;

      const x = b.x + Math.sin((t / 1000) * b.frec + b.fase) * b.amp;
      dibujarBurbuja(b, x);
    }

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
  new ResizeObserver(redimensionar).observe(lienzo);

  if (reducido) return;

  let visible = false;
  function sincronizar() {
    const activa = visible && !document.hidden;
    seccion.classList.toggle("en-pantalla", activa);
    activa ? iniciar() : detener();
  }

  new IntersectionObserver(([entrada]) => {
    visible = entrada.isIntersecting;
    sincronizar();
  }).observe(seccion);

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
