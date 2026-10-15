// Si no hay GSAP o se reduce el movimiento, se muestra el estado final.
if (window.gsap && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const dDelgada = document.getElementById("tela-delgada").getAttribute("d");
  const dInflada = document.getElementById("tela-inflada").getAttribute("d");
  const dFinal = document.getElementById("tela-final").getAttribute("d");

  gsap.timeline({ defaults: { ease: "power3.inOut" } })
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
    // La cortina termina ajustada alrededor del reloj.
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

const visor3d = document.getElementById("modelo-3d");
if (visor3d) {
  
  const orbitaInicial = visor3d.getAttribute("camera-orbit");

  const botonAutoRotar = document.getElementById("boton-auto-rotar");
  botonAutoRotar?.addEventListener("click", () => {
    const activa = visor3d.hasAttribute("auto-rotate");
    visor3d.toggleAttribute("auto-rotate", !activa);
    botonAutoRotar.setAttribute("aria-pressed", String(!activa));
  });

  const botonResetVista = document.getElementById("boton-reset-vista");
  botonResetVista?.addEventListener("click", () => {
    visor3d.cameraOrbit = orbitaInicial;
    visor3d.jumpCameraToGoal();
  });
}
