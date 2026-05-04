import "./genre-combo-box.component.css";
import React from "react";

interface GenreComboBoxProps {
    genres: Set<string>;
    onGenreSelect: (genre: string) => void;
    selectedGenre?: string;
}

export const GenreComboBoxComponent: React.FC<GenreComboBoxProps> = ({
    genres,
    onGenreSelect,
    selectedGenre = "",
}) => {
    const sortedGenres = Array.from(genres).sort();

    return (
        <div className="genreComboBoxWrapper">
            <input
                className="genreComboBox"
                name="genres"
                id="genres"
                list="genres-list"
                value={selectedGenre}
                onChange={(e) => onGenreSelect(e.target.value)}
                placeholder="Todos los generos"
                autoComplete="off"
            />
            <datalist id="genres-list">
                {sortedGenres.map((genre) => (
                    <option key={genre} value={genre} />
                ))}
            </datalist>
        </div>
    );
};
