// src/App.tsx
import React, {useEffect, useState} from "react";
import "./App.css";
import ShelfComponent from "./components/Shelf/shelf.component";
import GameDetailsPanel from "./components/GameDetailsPanel/game-details-panel.component";
import gameInfoService from "./service/game-info.service";
import {SearchInputComponent} from "./molecules/SearchInput/search-input.component.tsx";


import {Buffer} from 'buffer';
import type Shelf from "./models/Shelf.ts";
import {GenreComboBoxComponent} from "./molecules/GenreComboBox/genre-combo-box.component.tsx";

window.Buffer = window.Buffer || Buffer;

const App: React.FC = () => {
    const [openGame, setOpenGame] = useState<number | null>(null);
    const [shelf, setShelf] = useState<Shelf>({gamesInfo: [], genres: new Set<string>()} as Shelf);
    const selectedGame = shelf.gamesInfo.find((game) => game.id === openGame) ?? null;
    useEffect(() => {
        gameInfoService.getAll().then(setShelf);
    }, []);


    return (
        <div className={`app ${selectedGame ? "details-open" : ""}`}>
            <SearchInputComponent></SearchInputComponent>

            <GenreComboBoxComponent genres={shelf.genres} onGenresSelect={() => {}}></GenreComboBoxComponent>
            <ShelfComponent
                games={shelf.gamesInfo}
                openGame={openGame}
                onSetOpenGame={setOpenGame}
            />
            <GameDetailsPanel
                game={selectedGame}
                isOpen={selectedGame !== null}
                onClose={() => setOpenGame(null)}
            />
        </div>
    );
};

export default App;