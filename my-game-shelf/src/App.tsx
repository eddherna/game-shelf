// src/App.tsx
import React, { useState } from "react";
import "./App.css";
import ShelfComponent from "./components/Shelf/shelf.component";
import type GameInfo from "./models/GameInfo";
import gameInfoService from "./service/game-info.service";
import {SearchBoxComponent} from "./components/SearchBox/search-box.component.tsx";


import { Buffer } from 'buffer';
window.Buffer = window.Buffer || Buffer;

const App: React.FC = () => {
  const [openGame, setOpenGame] = useState<number | null>(null);
  const [games, setGames] = useState<GameInfo[]>([]);

  React.useEffect(() => {
    gameInfoService.getAll().then(setGames);
  }, []);


  return (
    <div className="app">
        <SearchBoxComponent></SearchBoxComponent>
      <ShelfComponent
        games={games}
        openGame={openGame}
        onSetOpenGame={setOpenGame}
      />
    </div>
  );
};

export default App;