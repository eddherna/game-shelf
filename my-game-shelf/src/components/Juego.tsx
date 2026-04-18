// src/Juego.tsx
import React, { useState, useEffect, memo } from 'react';

interface JuegoProps {
  titulo: string;
  imagen: string;
  platform: string;
  estaAbierto: boolean;
  onToggle: () => void;
}

interface PlataformaInfo {
  color: string;
  logo: string;
}

let platforms: Map<String, PlataformaInfo>= new Map<String, PlataformaInfo>([
  ["switch",{color: "#e60012",logo: "logo-s1"}], 
  ["switch2", {color: "#000",logo: "logo-s2"}]
]);
  
const Juego = memo(({ 
  titulo, imagen, platform, estaAbierto, onToggle 
}: JuegoProps) => {
  const [isSpaced, setIsSpaced] = useState(false); // Controla el ancho (espacio)
  const [canRotate, setCanRotate] = useState(false); // Controla el giro
  const [zIndex, setZIndex] = useState(1);

  useEffect(() => {
    let timerEspacio: ReturnType<typeof setTimeout>;
    let timerGiro: ReturnType<typeof setTimeout>;

    if (estaAbierto) {
      setZIndex(1000);
      setIsSpaced(true);
      timerGiro = setTimeout(() => {
        setCanRotate(true);
      }, 400); 

    } else {
      setCanRotate(false); 
      timerEspacio = setTimeout(() => {
        setIsSpaced(false);
        timerGiro = setTimeout(() => setZIndex(1), 400);
      }, 500);
    }

    return () => {
      clearTimeout(timerEspacio);
      clearTimeout(timerGiro);
    };
  }, [estaAbierto]);

  return (
    <div 
      className={`juego-container ${isSpaced ? 'espacio-abierto' : ''} ${canRotate ? 'girado' : ''}`}
      onClick={onToggle}
      style={{ zIndex }}
    >
      <div className="juego">
        <div className={`lomo ${platform==='switch2' ? 'es-variante-roja' : ''}`} style={{ backgroundColor: platforms.get(platform)?.color }}>
          <div className="lomo-contenido">
            <div className="lomo-plataforma-icono">
               <div className={`icon-svg ${platforms.get(platform)?.logo}`}></div> 
            </div>
            <div className="lomo-texto">
              <h1 className="lomo-titulo">{titulo}</h1>
            </div>
          </div>
        </div>
        <div className="tapa">
          <img src={imagen} alt={titulo} loading="lazy" />
        </div>
      </div>
    </div>
  );
});

export default Juego;