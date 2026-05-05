import "./genre-combo-box.component.css";
import React, { useState } from "react";

interface GenreComboBoxProps {
    genres: Set<string>;
    onGenresSelect: (genres: Set<string>) => void;
}

export const GenreComboBoxComponent: React.FC<GenreComboBoxProps> = ({
    genres,
    onGenresSelect,
}) => {
    const [selectedGenres, setSelectedGenres] = useState<Set<string>>(new Set());
    const [inputValue, setInputValue] = useState("");
    const sortedGenres = Array.from(genres).sort();

    const handleGenreToggle = (genre: string) => {
        const updated = new Set(selectedGenres);
        if (updated.has(genre)) {
            updated.delete(genre);
        } else {
            updated.add(genre);
        }
        setSelectedGenres(updated);
        onGenresSelect(updated);
        setInputValue("");
    };

    const handleRemoveGenre = (genre: string) => {
        const updated = new Set(selectedGenres);
        updated.delete(genre);
        setSelectedGenres(updated);
        onGenresSelect(updated);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);

        if (sortedGenres.includes(value)) {
            handleGenreToggle(value);
        }
    };

    const filteredGenres = sortedGenres.filter((g) =>
        g.toLowerCase().includes(inputValue.toLowerCase()) && !selectedGenres.has(g)
    );

    return (
        <div className="genreComboBoxWrapper">
            <div className="genreComboBoxInputWrapper">
                <input
                className="genreComboBox"
                name="genres"
                id="genres"
                list="genres-list"
                value={inputValue}
                onChange={handleInputChange}
                placeholder={selectedGenres.size > 0 ? "Agregar más..." : "Seleccionar géneros..."}
                autoComplete="off"
                />
                <datalist id="genres-list">
                    {filteredGenres.map((genre) => (
                        <option key={genre} value={genre} />
                    ))}
                </datalist>
            </div>
            <div className="genreTagsContainer">
                {Array.from(selectedGenres).sort().map((genre) => (
                    <div key={genre} className="genreTag">
                        <span>{genre}</span>
                        <button
                            className="genreTagRemove"
                            onClick={() => handleRemoveGenre(genre)}
                            aria-label={`Remover ${genre}`}
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
