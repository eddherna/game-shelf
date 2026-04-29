// src/App.tsx
import React, {useState} from "react";
import "./App.css";
import ShelfComponent from "./components/Shelf/shelf.component";
import gameInfoService from "./service/game-info.service";
import {SearchInputComponent} from "./molecules/SearchInput/search-input.component.tsx";


import {Buffer} from 'buffer';
import type Shelf from "./models/Shelf.ts";

window.Buffer = window.Buffer || Buffer;

const App: React.FC = () => {
    const [openGame, setOpenGame] = useState<number | null>(null);
    const [shelf, setShelf] = useState<Shelf>({gamesInfo: [], genres: new Set<String>()} as Shelf);
    React.useEffect(() => {
        gameInfoService.getAll().then(setShelf);
    }, []);


    return (
        <div className="app">
            <SearchInputComponent></SearchInputComponent>
            <ShelfComponent
                games={shelf.gamesInfo}
                openGame={openGame}
                onSetOpenGame={setOpenGame}
            />
        </div>
    );
};

export default App;