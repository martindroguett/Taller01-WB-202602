(() => {
  const navegacion = document.querySelector(".site-nav");
  const botonMenu = navegacion.querySelector(".site-nav-toggle");
  const listaNavegacion = navegacion.querySelector(".site-nav-links");
  const seccionMenu = navegacion.querySelector(".site-nav-current");
  const vistaMovil = window.matchMedia("(max-width: 767px)");
  const enlacesNavegacion = [...navegacion.querySelectorAll("a[href^='#']")];
  const seccionesNavegacion = enlacesNavegacion
    .map((enlace) => document.getElementById(enlace.hash.slice(1)))
    .filter(Boolean);
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
})();
