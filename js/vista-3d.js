(() => {
  const visor3d = document.getElementById("modelo-3d");
  if (!visor3d) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    visor3d.removeAttribute("auto-rotate");
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
})();
