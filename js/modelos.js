(() => {
  const lista = document.querySelector(".modelos_lista");
  if (!lista) return;

  const tarjetas = [...lista.querySelectorAll(".modelo")];
  const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const conMouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  tarjetas.forEach((t, i) => t.style.setProperty("--i", i));

  if (!reducido && "IntersectionObserver" in window) {
    lista.classList.add("preparada");
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          lista.classList.add("visible");
          observador.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observador.observe(lista);
  }

  const MAX_GIRO = 10;

  if (conMouse && !reducido) {
    tarjetas.forEach((tarjeta) => {
      tarjeta.addEventListener("pointermove", (e) => {
        const r = tarjeta.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        tarjeta.style.setProperty("--ry", (px * MAX_GIRO * 2).toFixed(2) + "deg");
        tarjeta.style.setProperty("--rx", (-py * MAX_GIRO * 2).toFixed(2) + "deg");
        tarjeta.classList.add("siguiendo");
      });

      tarjeta.addEventListener("pointerleave", () => {
        tarjeta.style.setProperty("--rx", "0deg");
        tarjeta.style.setProperty("--ry", "0deg");
        tarjeta.classList.remove("siguiendo");
      });
    });
  }

  function activar(tarjeta) {
    const yaActiva = tarjeta.classList.contains("activa");
    tarjetas.forEach((t) => {
      t.classList.remove("activa");
      t.setAttribute("aria-expanded", "false");
    });
    if (!yaActiva) {
      tarjeta.classList.add("activa");
      tarjeta.setAttribute("aria-expanded", "true");
    }
    lista.classList.toggle("hay-seleccion", !yaActiva);
  }

  tarjetas.forEach((tarjeta) => {
    tarjeta.addEventListener("click", () => activar(tarjeta));
    tarjeta.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        activar(tarjeta);
      }
    });
  });
})();
