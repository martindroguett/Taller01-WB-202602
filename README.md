# Taller 1 · Web Móvil

## Integrantes
- Martín Droguett
- Catalina Galleguillos
- Gael Ortega

Prototipo de una página de presentación de producto desarrollado para el curso de Web Móvil. Elegimos el Rolex Submariner porque es un reloj de buceo, y eso nos dio un hilo para toda la página: tela que se despliega al entrar, agua y burbujas en el fondo, y un descenso hasta los 300 metros mientras se baja por la página.

## Tecnologías

La página está hecha con HTML, CSS y JavaScript sin frameworks, separados en una carpeta para estilos (`css/`) y otra para scripts (`js/`). Además usamos dos librerías:

- **GSAP** (guardada en `js/vendor/`): solo para la animación de entrada del inicio, porque nos permite encadenar varios pasos en una línea de tiempo.
- **model-viewer** de Google: para mostrar el modelo 3D del reloj. Se carga desde un CDN recién cuando el usuario se acerca a esa sección, para no hacer más lenta la carga inicial.

Las fuentes son Bodoni Moda (títulos) y Manrope (texto), incluidas en `assets/fonts/` junto a sus licencias. El modelo 3D está en formato `.glb` y las imágenes en `.webp` para que pesen poco en el celular.

## Animaciones

Todas las animaciones, menos la línea de tiempo del inicio (GSAP) y el giro del modelo 3D (model-viewer), las programamos nosotros con CSS y JavaScript.

### Entrada (`js/inicio.js`)
Al cargar la página, una tela azul se abre de lado a lado, el reloj aparece desde un poco más grande y la tela se infla y se ajusta alrededor del brazalete con un pequeño rebote. Después aparecen los pliegues de la tela y los textos suben uno tras otro. La forma final de la tela se calcula en JavaScript según dónde quedó el reloj en la pantalla, así que calza bien en cualquier tamaño de ventana.

### Fondo
- **Burbujas** (`js/fondo-caracteristicas.js`): en la sección de detalles dibujamos burbujas en un `<canvas>`. Cada una sube a su propia velocidad y se mueve de lado a lado con una onda seno. Cuando el usuario hace scroll, reciben un empujón, como si el agua se moviera.
- **Olas y luz** (`css/caracteristicas.css`): dos olas que se desplazan en sentidos contrarios y un reflejo de luz que va y viene, hechos solo con `@keyframes`.
- **Oleaje del pie de página** (`css/pie.css`): tres capas de olas que avanzan a distinta velocidad.

### Scroll (`js/caracteristicas.js`)
La sección de detalles queda fija mientras se baja. Calculamos cuánto se ha recorrido (de 0 a 1) y con eso:
- el cristal y el bisel se van separando del reloj, cada uno en su propio tramo, con una curva suave (`t² · (3 − 2t)`) para que no partan ni frenen de golpe;
- un contador baja de 0 a 300 metros de profundidad;
- cambia la característica que se muestra, que entra con un pequeño deslizamiento.

En la colección, las tarjetas de los modelos aparecen una tras otra cuando la sección entra en pantalla.

### Eventos
- **Navegación** (`js/navegacion.js`): al bajar, el menú se esconde y reaparece flotando cuando el usuario deja de hacer scroll. Un indicador se desliza hasta la sección en que estás. En el celular el menú se abre como una lista desplegable.
- **Selector de modelos** (`js/modelos.js`): al elegir un modelo cambia la esfera y su información. Las manecillas marcan la hora real, calculada con `Date`.
- **Vista 3D** (`js/vista-3d.js`): el reloj gira solo. Con el botón se activa el control para rotarlo y hacer zoom. Al salir de la sección vuelve a su posición inicial. Al pasar el mouse, la burbuja de agua que rodea al reloj se inclina levemente.
- Los botones y tarjetas tienen pequeños efectos al pasar el mouse y al presionarlos.

### Cuidado del rendimiento y accesibilidad
- Las animaciones continuas (burbujas, reloj) se pausan cuando su sección no está en pantalla o la pestaña está oculta, usando `IntersectionObserver` y `visibilitychange`.
- Si el usuario tiene activada la opción del sistema de reducir el movimiento (`prefers-reduced-motion`), la página muestra todo sin animaciones.

## Archivos principales

- `index.html`: contenido y estructura de la página.
- `css/styles.css`: fuentes y estilos compartidos.
- `css/inicio.css` y `js/inicio.js`: presentación principal y animación de entrada.
- `css/navegacion.css` y `js/navegacion.js`: menú y navegación entre secciones.
- `css/caracteristicas.css`, `js/caracteristicas.js` y `js/fondo-caracteristicas.js`: animación de capas, scroll y burbujas.
- `css/vista-3d.css` y `js/vista-3d.js`: presentación y carga del modelo 3D.
- `css/modelos.css` y `js/modelos.js`: selector de modelos y reloj.
- `css/pie.css`: estilos del pie de página.
- `assets/`: imágenes, fuentes y modelos 3D utilizados por la página.
- `assets/seda-reflejos.webp`: luces y sombras de la tela del hero.
