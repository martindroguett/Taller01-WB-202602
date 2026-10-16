// Sección "La colección": animaciones por evento, sin librerías.
// 1) Entrada escalonada: las tarjetas aparecen una tras otra cuando la sección entra en pantalla.
// 2) Inclinación 3D: con el mouse, el reloj gira siguiendo la posición del puntero dentro de la tarjeta.
// 3) Toque/clic: activa la tarjeta (halo del color del bisel y detalle). Pensado para celular, donde no hay hover.

(() => {
  const lista = document.querySelector(".modelos_lista");
  if (!lista) return;

  const tarjetas = [...lista.querySelectorAll(".modelo")];
  const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const conMouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // ---------- 1) entrada escalonada ----------
  tarjetas.forEach((t, i) => t.style.setProperty("--i", i));

  if (!reducido && "IntersectionObserver" in window) {
    lista.classList.add("preparada");
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          lista.classList.add("visible");
          observador.disconnect(); // solo la primera vez
        }
      },
      { threshold: 0.2 }
    );
    observador.observe(lista);
  }

  // ---------- 2) inclinación 3D con el mouse ----------
  const MAX_GIRO = 10; // grados

  if (conMouse && !reducido) {
    tarjetas.forEach((tarjeta) => {
      tarjeta.addEventListener("pointermove", (e) => {
        const r = tarjeta.getBoundingClientRect();
        // posición del puntero dentro de la tarjeta: -0.5 (izquierda/arriba) a 0.5 (derecha/abajo)
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

  // ---------- 3) toque / clic / teclado: una tarjeta activa a la vez ----------
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
