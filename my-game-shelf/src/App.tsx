// src/App.tsx
import React, {useState} from "react";
import "./App.css";
import ShelfComponent from "./components/Shelf/shelf.component";
import gameInfoService from "./service/game-info.service";
import {SearchInputComponent} from "./molecules/SearchInput/search-input.component.tsx";


import {Buffer} from 'buffer';
import type Shelf from "./models/Shelf.ts";
import {GenreComboBoxComponent} from "./molecules/GenreComboBox/genre-combo-box.component.tsx";

window.Buffer = window.Buffer || Buffer;

const App: React.FC = () => {
    const [openGame, setOpenGame] = useState<number | null>(null);
    const [selectedGenre, setSelectedGenre] = useState<string>("");
    const [shelf, setShelf] = useState<Shelf>({gamesInfo: [], genres: new Set<string>()} as Shelf);
    React.useEffect(() => {
        gameInfoService.getAll().then(setShelf);
    }, []);

    const normalizedGenreFilter = selectedGenre.trim().toLowerCase();
    const filteredGames = normalizedGenreFilter
        ? shelf.gamesInfo.filter((game) =>
            game.genres.some((genre) => genre.toLowerCase().includes(normalizedGenreFilter))
        )
        : shelf.gamesInfo;

    return (
        <div className="app">
            <SearchInputComponent></SearchInputComponent>
            <GenreComboBoxComponent
                genres={shelf.genres}
                onGenreSelect={setSelectedGenre}
                selectedGenre={selectedGenre}
            ></GenreComboBoxComponent>
            <ShelfComponent
                games={filteredGames}
                openGame={openGame}
                onSetOpenGame={setOpenGame}
            />
        </div>
    );
};

export default App;