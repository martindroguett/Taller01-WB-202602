(() => {
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
})();
