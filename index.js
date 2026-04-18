function toggleJuego(elemento) {
  const estaGirado = elemento.classList.contains('girado');
  const tiempoEspacio = 400; // coincide con --vel-espacio

  if (!estaGirado) {
    // Cerrar otros
    document.querySelectorAll('.juego-container').forEach(j => {
      j.classList.remove('girado', 'espacio-abierto');
      j.style.zIndex = "1";
    });

    // Subimos el z-index inmediatamente
    elemento.style.zIndex = "1000";
    
    // Primero abrimos el hueco
    elemento.classList.add('espacio-abierto');

    // Después del delay, giramos
    setTimeout(() => {
      elemento.classList.add('girado');
    }, tiempoEspacio);

  } else {
    // Primero quitamos el giro
    elemento.classList.remove('girado');

    // Esperamos a que termine de girar para cerrar el hueco
    setTimeout(() => {
      elemento.classList.remove('espacio-abierto');
      setTimeout(() => { 
        if(!elemento.classList.contains('espacio-abierto')) elemento.style.zIndex = "1"; 
      }, tiempoEspacio);
    }, 500); // coincide con --vel-giro
  }
}