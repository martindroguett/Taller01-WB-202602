(() => {
  const selector = document.querySelector(".modelos_selector");
  if (!selector) return;

  const opciones = [...selector.querySelectorAll(".modelo_opcion")];
  const paneles = [...document.querySelectorAll(".modelo_info")];
  const insignia = document.getElementById("insignia-modelo");
  const cara = document.getElementById("reloj-vivo-cara");
  const manecillaHora = document.getElementById("reloj-vivo-hora");
  const manecillaMinuto = document.getElementById("reloj-vivo-minuto");
  const manecillaSegundo = document.getElementById("reloj-vivo-segundo");

  const RUTA_VIVO = "assets/reloj-vivo/";
  const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function seleccionar(opcion) {
    const modelo = opcion.dataset.modelo;

    opciones.forEach((o) => {
      const activa = o === opcion;
      o.classList.toggle("activa", activa);
      o.setAttribute("aria-pressed", String(activa));
    });

    paneles.forEach((panel) => {
      panel.hidden = panel.dataset.modelo !== modelo;
    });

    insignia?.classList.toggle("visible", "insignia" in opcion.dataset);

    if (cara) {
      cara.src = RUTA_VIVO + opcion.dataset.base;
      const manecillas = opcion.dataset.manecillas;
      manecillaHora.src = `${RUTA_VIVO}horario${manecillas}.png`;
      manecillaMinuto.src = `${RUTA_VIVO}minutero${manecillas}.png`;
      manecillaSegundo.src = `${RUTA_VIVO}segundero${manecillas}.png`;
    }
  }

  opciones.forEach((opcion) => {
    opcion.addEventListener("click", () => seleccionar(opcion));
  });

  if (cara && manecillaHora && manecillaMinuto && manecillaSegundo) {
    const actualizarReloj = () => {
      const ahora = new Date();
      const segundos = ahora.getSeconds() + ahora.getMilliseconds() / 1000;
      const minutos = ahora.getMinutes() + segundos / 60;
      const horas = (ahora.getHours() % 12) + minutos / 60;

      manecillaSegundo.style.transform = `rotate(${segundos * 6}deg)`;
      manecillaMinuto.style.transform = `rotate(${minutos * 6}deg)`;
      manecillaHora.style.transform = `rotate(${horas * 30}deg)`;
    };

    if (reducido) {
      actualizarReloj();
      setInterval(actualizarReloj, 1000);
    } else {
      const cuadro = () => {
        actualizarReloj();
        requestAnimationFrame(cuadro);
      };
      requestAnimationFrame(cuadro);
    }
  }

  if (!reducido && "IntersectionObserver" in window) {
    opciones.forEach((o, i) => o.style.setProperty("--i", i));
    selector.classList.add("preparada");
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          selector.classList.add("visible");
          observador.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observador.observe(selector);
  }
})();
