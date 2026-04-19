// src/App.tsx
import React, { useState } from "react";
import Juego from "./components/Juego";
import "./index.css";
import NintendoSwitch from "./components/NintendoSwitch";

const App: React.FC = () => {
  // Guardamos el título (o un ID) del juego abierto. null = todos cerrados.
  const [juegoAbierto, setJuegoAbierto] = useState<string | null>(null);

  const juegos = [
    {
      titulo: "The Legend of Zelda Breath of the Wildadasdadadadad",
      imagen: "/zelda.jpg",
      platform: "switch",
      genres: ["aventura", "acción", "mundo abierto"],
            finished: true
    },
    {
      titulo: "Metroid Prime 4",
      imagen: "./metroid4.jpg",
      roja: true,
      platform: "switch2",
      genres: ["aventura", "acción", "FPS"],
            finished: true
    },
    {
      titulo: "Super Mario Wonder",
      imagen: "/mario.jpg",
      platform: "switch",
      genres: ["plataformas", "aventura"],
      finished: true
    },
  ];

  return (
    <div className="app">
      <NintendoSwitch juego={juegos.find((j) => j.titulo === juegoAbierto) as any}/>
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
    </div>
  );
};

export default App;
