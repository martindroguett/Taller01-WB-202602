(() => {
  const visor3d = document.getElementById("modelo-3d");
  if (!visor3d) return;
  const contenedor = visor3d.closest(".visor-3d");
  const control = contenedor.querySelector(".visor-3d_control");
  const vistaAncha = window.matchMedia("(min-width: 768px)");
  const campoVisionInicial = visor3d.getAttribute("field-of-view");
  let orbitaInicial;

  const actualizarEncuadre = () => {
    orbitaInicial = `135deg 75deg ${vistaAncha.matches ? 100 : 105}%`;
    visor3d.setAttribute("camera-orbit", orbitaInicial);
    visor3d.setAttribute("field-of-view", campoVisionInicial);
    visor3d.setAttribute("max-camera-orbit", `auto auto ${vistaAncha.matches ? 100 : 105}%`);
  };
  actualizarEncuadre();
  vistaAncha.addEventListener("change", actualizarEncuadre);

  const cambiarInteraccion = (activa) => {
    if (activa === (control.getAttribute("aria-pressed") === "true")) return;
    contenedor.classList.toggle("visor-3d--activo", activa);
    visor3d.toggleAttribute("camera-controls", activa);
    visor3d.toggleAttribute("disable-zoom", !activa);
    control.setAttribute("aria-pressed", String(activa));
    if (!activa) {
      visor3d.setAttribute("camera-orbit", orbitaInicial);
      visor3d.setAttribute("field-of-view", campoVisionInicial);
    }
  };

  control.addEventListener("click", () => {
    cambiarInteraccion(control.getAttribute("aria-pressed") !== "true");
  });
  document.addEventListener("pointerdown", (evento) => {
    if (!contenedor.contains(evento.target)) cambiarInteraccion(false);
  });
  document.addEventListener("focusin", (evento) => {
    if (!contenedor.contains(evento.target)) cambiarInteraccion(false);
  });
  contenedor.addEventListener("keydown", (evento) => {
    if (evento.key !== "Escape") return;
    cambiarInteraccion(false);
    control.focus();
  });

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    visor3d.removeAttribute("auto-rotate");
    visor3d.setAttribute("interpolation-decay", "0");
  }

  const mostrarError3d = () => {
    visor3d.querySelector(".visor-3d_carga").textContent =
      "No se pudo cargar el modelo. Recarga la página para intentarlo de nuevo.";
  };
  visor3d.addEventListener("error", mostrarError3d);

  const observadorVisor = new IntersectionObserver(([entrada]) => {
    if (!entrada.isIntersecting) return;
    observadorVisor.disconnect();
    import("https://cdn.jsdelivr.net/npm/@google/model-viewer@4.1.0/dist/model-viewer.min.js")
      .catch(mostrarError3d);
  }, { rootMargin: "1000px 0px" });
  observadorVisor.observe(visor3d);

  const observadorInteraccion = new IntersectionObserver(([entrada]) => {
    if (!entrada.isIntersecting) cambiarInteraccion(false);
  });
  observadorInteraccion.observe(visor3d);
})();
