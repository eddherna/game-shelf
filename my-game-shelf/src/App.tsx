// src/App.tsx
import React, { useState } from 'react';
import Juego from './components/Juego';
import './index.css';

const App: React.FC = () => {
  // Guardamos el título (o un ID) del juego abierto. null = todos cerrados.
  const [juegoAbierto, setJuegoAbierto] = useState<string | null>(null);

  const juegos = [
    { titulo: "The Legend of Zelda Breath of the Wild", imagen: "/zelda.jpg", color: "#e60012", logo: "logo-s1" , platform: "switch"},
    { titulo: "Metroid Prime 4", imagen: "./metroid4.jpg", color: "#000", logo: "logo-s2", roja: true , platform: "switch2"},
    { titulo: "Super Mario Wonder", imagen: "/mario.jpg", color: "#e60012", logo: "logo-s1", platform: "switch" },
  ];

  return (
    <div className="estanteria">
      {juegos.map((j) => (
        <Juego 
          key={j.titulo}
          titulo={j.titulo}
          imagen={j.imagen}
          platform={j.platform}
          // El juego sabe si está abierto comparando su título con el estado global
          estaAbierto={juegoAbierto === j.titulo}
          // Función para avisar al padre que este juego quiere abrirse
          onToggle={() => {
            if (juegoAbierto === j.titulo) {
              setJuegoAbierto(null); // Si hago click en el ya abierto, lo cierro
            } else {
              setJuegoAbierto(j.titulo); // Abro este (y por ende cierra el anterior)
            }
          }}
        />
      ))}
    </div>
  );
};

export default App;