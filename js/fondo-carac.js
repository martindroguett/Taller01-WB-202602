// Animación de fondo de "Características": burbujas que suben (canvas) y un profundímetro de 0 a 300 m.
// Es animación propia, sin librerías: cada burbuja tiene posición, tamaño y velocidad, y se redibuja en cada cuadro.
// El scroll le da un impulso extra a las burbujas, como si te sumergieras.

(() => {
  const seccion = document.getElementById("caracteristicas");
  const lienzo = seccion?.querySelector(".carac_fondo");
  if (!lienzo) return;

  const ctx = lienzo.getContext("2d");
  const metros = seccion.querySelector(".carac_metros");
  const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let ancho = 0;
  let alto = 0;
  let burbujas = [];

  const azar = (min, max) => min + Math.random() * (max - min);

  // Una burbuja nueva. Al inicio se reparten por toda la altura; después nacen bajo el borde inferior.
  function crearBurbuja(enCualquierAltura) {
    const r = azar(1.5, 7);
    return {
      x: azar(0, ancho),
      y: enCualquierAltura ? azar(0, alto) : alto + r + azar(0, 60),
      r,
      vel: azar(14, 30) * (0.6 + r / 10), // px por segundo: las grandes suben más rápido
      fase: azar(0, Math.PI * 2),
      amp: azar(4, 14),                    // cuánto se balancea de lado
      frec: azar(0.5, 1.4)                 // qué tan rápido se balancea
    };
  }

  function redimensionar() {
    const rect = lienzo.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // nítido en pantallas retina, sin exagerar el costo
    ancho = rect.width;
    alto = rect.height;
    lienzo.width = Math.round(ancho * dpr);
    lienzo.height = Math.round(alto * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // cantidad según el área: pocas en celular, más en pantallas grandes
    const cantidad = Math.round(Math.min(60, (ancho * alto) / 22000));
    burbujas = Array.from({ length: cantidad }, () => crearBurbuja(true));

    // Sin animación: las burbujas se dibujan una sola vez, quietas.
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

    // brillo en la esquina superior izquierda
    ctx.beginPath();
    ctx.arc(x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.28, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.fill();
  }

  // ---------- impulso por scroll ----------
  // Bajar la página empuja las burbujas hacia arriba; subirla las frena. El impulso se disipa solo.
  let ultimoScroll = window.scrollY;
  let impulso = 0;

  // ---------- profundímetro ----------
  // El progreso de la sección (--p, de 0 a 1) lo escribe caracteristicas.js; aquí se convierte en metros.
  let ultimosMetros = -1;
  function actualizarMetros() {
    if (!metros) return;
    const p = parseFloat(seccion.style.getPropertyValue("--p")) || 0;
    const m = Math.round(p * 300);
    if (m !== ultimosMetros) {
      metros.textContent = m;
      ultimosMetros = m;
    }
  }

  // ---------- bucle de animación ----------
  let anterior = 0;
  let idCuadro = 0;
  let corriendo = false;

  function cuadro(t) {
    const dt = anterior ? Math.min(0.05, (t - anterior) / 1000) : 0; // segundos desde el cuadro anterior
    anterior = t;

    const delta = window.scrollY - ultimoScroll;
    ultimoScroll = window.scrollY;
    impulso = Math.max(-20, Math.min(40, impulso * 0.9 + delta * 0.08));

    ctx.clearRect(0, 0, ancho, alto);

    for (const b of burbujas) {
      b.y -= b.vel * dt + impulso * (0.15 + b.r * 0.03);
      if (b.y < -b.r - 10) Object.assign(b, crearBurbuja(false)); // salió por arriba: renace abajo
      if (b.y > alto + 80) b.y = -b.r;                             // si el scroll la empujó abajo, vuelve arriba

      const x = b.x + Math.sin((t / 1000) * b.frec + b.fase) * b.amp;
      dibujarBurbuja(b, x);
    }

    actualizarMetros();
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

  // Solo se anima mientras la sección está en pantalla y la pestaña visible (ahorra batería).
  let visible = false;
  new IntersectionObserver(([entrada]) => {
    visible = entrada.isIntersecting;
    visible && !document.hidden ? iniciar() : detener();
  }).observe(seccion);

  document.addEventListener("visibilitychange", () => {
    visible && !document.hidden ? iniciar() : detener();
  });
})();
