const tela = document.getElementById("tela");
const telaFinal = document.getElementById("tela-final");
const dFinalMovil = telaFinal.getAttribute("d");
const movimientoReducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let animacionEntrada;

function ajustarTelaAlReloj() {
  let dFinal = dFinalMovil;

  if (window.innerWidth > 767) {
    const rectTela = document.querySelector(".cortina").getBoundingClientRect();
    const rectReloj = document.getElementById("reloj").getBoundingClientRect();
    const escalaX = 1200 / rectTela.width;
    const escalaY = 800 / rectTela.height;
    const saliente = rectReloj.width * 0.03;
    // El WebP mide 800 × 1180; el brazalete visible ocupa las filas 152 a 920.
    const arriba = (rectReloj.top - rectTela.top + rectReloj.height * 152 / 1180 + saliente) * escalaY;
    const abajo = (rectReloj.top - rectTela.top + rectReloj.height * 920 / 1180 - saliente) * escalaY;
    const centro = (rectReloj.left + rectReloj.width / 2 - rectTela.left) * escalaX;
    const dx = centro - 876;
    const da = arriba - 215;
    const db = abajo - 565;
    const n = (valor) => Math.round(valor * 10) / 10;
    const x = (valor) => n(valor + dx);

    dFinal = `M -80 -20 C 200 -20 ${x(480)} -10 ${x(640)} ${n(55 + da * 0.3)}
      C ${x(745)} ${n(100 + da * 0.5)} ${x(810)} ${n(arriba)} ${n(centro)} ${n(arriba)}
      C ${x(940)} ${n(arriba)} ${x(995)} ${n(90 + da * 0.5)} 1280 -20
      L 1280 820 C ${x(995)} ${n(700 + db * 0.45)} ${x(940)} ${n(abajo)} ${n(centro)} ${n(abajo)}
      C ${x(810)} ${n(abajo)} ${x(745)} ${n(675 + db * 0.45)} ${x(640)} ${n(715 + db * 0.35)}
      C ${x(480)} ${n(770 + db * 0.1)} 200 760 -80 730 Z`;
  }

  telaFinal.setAttribute("d", dFinal);
  if (!animacionEntrada || !animacionEntrada.isActive()) tela.setAttribute("d", dFinal);
  return dFinal;
}

const dFinal = ajustarTelaAlReloj();
window.addEventListener("resize", ajustarTelaAlReloj, { passive: true });

if (window.gsap && !movimientoReducido) {
  const dDelgada = document.getElementById("tela-delgada").getAttribute("d");
  const dInflada = document.getElementById("tela-inflada").getAttribute("d");

  animacionEntrada = gsap.timeline({
    defaults: { ease: "power3.inOut" },
    onComplete: () => tela.setAttribute("d", telaFinal.getAttribute("d"))
  })
    .set("#tela", { attr: { d: dDelgada } })
    .set("#pliegues", { opacity: 0, scaleY: 0.25 })
    .fromTo(
      ".cortina",
      { scaleX: 0 },
      { scaleX: 1, duration: 0.75, ease: "power3.out" }
    )
    .fromTo(
      "#reloj",
      { scale: 1.22, opacity: 0, y: 35 },
      { scale: 1.06, opacity: 1, y: 0, duration: 0.7, ease: "power2.out" },
      "-=0.45"
    )
    .to("#tela", {
      duration: 0.85,
      attr: { d: dInflada },
      ease: "power2.out"
    })
    .to(
      "#tela",
      {
        duration: 1.1,
        attr: { d: dFinal },
        ease: "elastic.out(1, 0.55)"
      },
      "-=0.15"
    )
    .to(
      "#reloj",
      {
        scale: 1,
        duration: 0.9,
        ease: "back.out(1.6)"
      },
      "<"
    )
    .to(
      "#pliegues",
      {
        opacity: 1,
        scaleY: 1,
        duration: 0.8,
        ease: "power2.out"
      },
      "<0.1"
    )
    .fromTo(
      ".anim-texto",
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.65, stagger: 0.1, ease: "power2.out" },
      "-=0.8"
    );
}

const seccionesNavegacion = ["inicio", "caracteristicas", "vista-3d", "modelos"]
  .map((id) => document.getElementById(id))
  .filter(Boolean);
const navegacion = document.querySelector(".site-nav");
const botonMenu = navegacion.querySelector(".site-nav-toggle");
const listaNavegacion = navegacion.querySelector(".site-nav-links");
const seccionMenu = navegacion.querySelector(".site-nav-current");
const vistaMovil = window.matchMedia("(max-width: 767px)");
const enlacesNavegacion = [...navegacion.querySelectorAll("a[href^='#']")];
const destinoInicial = seccionesNavegacion.find((seccion) => `#${seccion.id}` === window.location.hash);
let navegacionLista = !destinoInicial;
let cuadroScrollPendiente = 0;
let temporizadorNavegacion = 0;
let navegacionPorTeclado = false;
let menuAbierto = false;

function cambiarMenuNavegacion(abrir, devolverFoco = false) {
  menuAbierto = vistaMovil.matches && abrir;
  botonMenu.setAttribute("aria-expanded", String(menuAbierto));
  navegacion.classList.toggle("is-open", menuAbierto);
  listaNavegacion.inert = vistaMovil.matches && !menuAbierto;

  if (menuAbierto) {
    window.clearTimeout(temporizadorNavegacion);
    temporizadorNavegacion = 0;
    mostrarNavegacion(true);
  }
  if (devolverFoco) botonMenu.focus({ preventScroll: true });
}

function ajustarMenuMovil() {
  const focoEnBoton = document.activeElement === botonMenu;
  const focoEnLista = listaNavegacion.contains(document.activeElement);
  botonMenu.hidden = !vistaMovil.matches;
  navegacion.classList.toggle("is-collapsible", vistaMovil.matches);
  cambiarMenuNavegacion(false);

  if (vistaMovil.matches && focoEnLista) botonMenu.focus({ preventScroll: true });
  else if (!vistaMovil.matches && focoEnBoton) {
    navegacion.querySelector("a[aria-current]")?.focus({ preventScroll: true });
  }
}

function paginaDesplazada() {
  return window.scrollY > 0;
}

function mostrarNavegacion(mostrar) {
  const flotante = paginaDesplazada();
  navegacion.classList.toggle("is-floating", flotante);
  navegacion.classList.toggle("is-visible", flotante && mostrar);
  navegacion.inert = flotante && !mostrar;
}

function alScrollNavegacion() {
  window.clearTimeout(temporizadorNavegacion);
  temporizadorNavegacion = 0;
  if (menuAbierto) {
    cambiarMenuNavegacion(false, navegacionPorTeclado && listaNavegacion.contains(document.activeElement));
  }

  if (!paginaDesplazada()) {
    mostrarNavegacion(false);
  } else if (navegacionPorTeclado && navegacion.contains(document.activeElement)) {
    mostrarNavegacion(true);
  } else {
    navegacionPorTeclado = false;
    mostrarNavegacion(false);
    temporizadorNavegacion = window.setTimeout(() => {
      temporizadorNavegacion = 0;
      if (paginaDesplazada()) mostrarNavegacion(true);
    }, 220);
  }

  programarActualizacionSeccion();
}

function actualizarIndicadorNavegacion() {
  const enlace = navegacion.querySelector("a[aria-current]");
  if (!enlace) return;

  listaNavegacion.style.setProperty("--indicador-x", `${enlace.offsetLeft}px`);
  listaNavegacion.style.setProperty("--indicador-y", `${enlace.offsetTop}px`);
  listaNavegacion.style.setProperty("--indicador-ancho", `${enlace.offsetWidth}px`);
  listaNavegacion.style.setProperty("--indicador-alto", `${enlace.offsetHeight}px`);
  listaNavegacion.classList.add("has-indicator");
}

function actualizarSeccionNavegacion() {
  cuadroScrollPendiente = 0;
  const referencia = window.scrollY + window.innerHeight * 0.35;
  let actual = seccionesNavegacion[0];

  seccionesNavegacion.forEach((seccion) => {
    const inicio = seccion.getBoundingClientRect().top + window.scrollY;
    if (inicio <= referencia) actual = seccion;
  });

  if (!actual) return;

  const fragmento = `#${actual.id}`;
  if (window.location.hash !== fragmento) {
    const url = new URL(window.location.href);
    url.hash = actual.id;
    window.history.replaceState(window.history.state, "", url);
  }

  enlacesNavegacion.forEach((enlace) => {
    if (enlace.hash === fragmento) {
      enlace.setAttribute("aria-current", "location");
      seccionMenu.textContent = enlace.textContent;
    } else enlace.removeAttribute("aria-current");
  });
  actualizarIndicadorNavegacion();
}

function programarActualizacionSeccion() {
  if (!navegacionLista) return;
  if (!cuadroScrollPendiente) {
    cuadroScrollPendiente = window.requestAnimationFrame(actualizarSeccionNavegacion);
  }
}

ajustarMenuMovil();
new ResizeObserver(actualizarIndicadorNavegacion).observe(listaNavegacion);
vistaMovil.addEventListener("change", ajustarMenuMovil);
botonMenu.addEventListener("click", () => cambiarMenuNavegacion(!menuAbierto));
listaNavegacion.addEventListener("click", (evento) => {
  if (menuAbierto && evento.target.closest("a")) cambiarMenuNavegacion(false, true);
});
navegacion.addEventListener("focusout", (evento) => {
  if (menuAbierto && !navegacion.contains(evento.relatedTarget)) cambiarMenuNavegacion(false);
});
window.addEventListener("scroll", alScrollNavegacion, { passive: true });
window.addEventListener("resize", alScrollNavegacion);
window.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape" && menuAbierto) {
    evento.preventDefault();
    cambiarMenuNavegacion(false, true);
  }
  if (evento.key === "Tab") {
    navegacionPorTeclado = true;
    if (paginaDesplazada()) {
      window.clearTimeout(temporizadorNavegacion);
      temporizadorNavegacion = 0;
      mostrarNavegacion(true);
    }
  }
});
window.addEventListener("pointerdown", (evento) => {
  navegacionPorTeclado = false;
  if (menuAbierto && !navegacion.contains(evento.target)) cambiarMenuNavegacion(false);
}, { passive: true });
window.addEventListener("pageshow", () => {
  // Conservar los enlaces directos antes de sincronizar el hash con el scroll.
  if (!navegacionLista) {
    navegacionLista = true;
    destinoInicial.scrollIntoView({ behavior: "instant" });
  }
  mostrarNavegacion(true);
  programarActualizacionSeccion();
});

const visor3d = document.getElementById("modelo-3d");
if (visor3d) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    visor3d.removeAttribute("auto-rotate");
  }

  const mostrarError3d = () => {
    visor3d.querySelector(".visor-3d_carga").textContent =
      "No se pudo cargar el modelo. Recarga la página para intentarlo de nuevo.";
  };
  visor3d.addEventListener("error", mostrarError3d);

  // Descargar la librería y preparar el 3D al acercarse, después del hero.
  const observadorVisor = new IntersectionObserver(([entrada]) => {
    if (!entrada.isIntersecting) return;
    observadorVisor.disconnect();
    import("https://cdn.jsdelivr.net/npm/@google/model-viewer@4.1.0/dist/model-viewer.min.js")
      .catch(mostrarError3d);
  }, { rootMargin: "1000px 0px" });
  observadorVisor.observe(visor3d);

  const botonAutoRotar = document.getElementById("boton-auto-rotar");
  botonAutoRotar?.addEventListener("click", () => {
    const activa = visor3d.hasAttribute("auto-rotate");
    visor3d.toggleAttribute("auto-rotate", !activa);
    botonAutoRotar.setAttribute("aria-pressed", String(!activa));
  });
}
