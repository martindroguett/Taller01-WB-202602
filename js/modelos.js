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
  const relojCompleto = cara && manecillaHora && manecillaMinuto && manecillaSegundo;

  const RUTA_VIVO = "assets/reloj-vivo/";
  const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function seleccionar(opcion) {
    const modelo = opcion.dataset.modelo;

    opciones.forEach((alternativa) => {
      const activa = alternativa === opcion;
      alternativa.classList.toggle("activa", activa);
      alternativa.setAttribute("aria-pressed", String(activa));
    });

    paneles.forEach((panel) => {
      panel.hidden = panel.dataset.modelo !== modelo;
    });

    insignia?.classList.toggle("visible", "insignia" in opcion.dataset);

    if (relojCompleto) {
      cara.src = RUTA_VIVO + opcion.dataset.base;
      const manecillas = opcion.dataset.manecillas;
      manecillaHora.src = `${RUTA_VIVO}horario${manecillas}.webp`;
      manecillaMinuto.src = `${RUTA_VIVO}minutero${manecillas}.webp`;
      manecillaSegundo.src = `${RUTA_VIVO}segundero${manecillas}.webp`;
    }
  }

  opciones.forEach((opcion) => {
    opcion.addEventListener("click", () => seleccionar(opcion));
    opcion.addEventListener("focus", () => {
      if (opcion.matches(":focus-visible")) {
        opcion.scrollIntoView({ block: "nearest", inline: "center", behavior: "instant" });
      }
    });
  });

  if (relojCompleto) {
    const actualizarReloj = () => {
      const ahora = new Date();
      const segundos = ahora.getSeconds() + ahora.getMilliseconds() / 1000;
      const minutos = ahora.getMinutes() + segundos / 60;
      const horas = (ahora.getHours() % 12) + minutos / 60;

      manecillaSegundo.style.transform = `rotate(${segundos * 6}deg)`;
      manecillaMinuto.style.transform = `rotate(${minutos * 6}deg)`;
      manecillaHora.style.transform = `rotate(${horas * 30}deg)`;
    };

    let idCuadro = 0;
    let idIntervalo = 0;
    let visible = false;

    function cuadro() {
      actualizarReloj();
      idCuadro = requestAnimationFrame(cuadro);
    }

    function sincronizar() {
      if (visible && !document.hidden) {
        if (idCuadro || idIntervalo) return;
        actualizarReloj();
        if (reducido) idIntervalo = setInterval(actualizarReloj, 1000);
        else idCuadro = requestAnimationFrame(cuadro);
      } else {
        cancelAnimationFrame(idCuadro);
        clearInterval(idIntervalo);
        idCuadro = idIntervalo = 0;
      }
    }

    new IntersectionObserver(([entrada]) => {
      visible = entrada.isIntersecting;
      sincronizar();
    }).observe(cara.closest(".modelos_vivo"));
    document.addEventListener("visibilitychange", sincronizar);
    actualizarReloj();
  }

  if (!reducido && "IntersectionObserver" in window) {
    opciones.forEach((opcion, i) => opcion.style.setProperty("--i", i));
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
