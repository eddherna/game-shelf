// src/components/GameSheet.tsx
import "./GameSheet.css";

interface GameSheetProps {
  game: { title: string; platform: string; genres: string[]; finished: boolean } | null;
  onClose: () => void;
}

const GameSheet = ({ game, onClose }: GameSheetProps) => {
  return (
    <>
      <div
        className={`game-sheet-backdrop ${game ? "game-sheet-backdrop--visible" : ""}`}
        onClick={onClose}
      />
      <div className={`game-sheet ${game ? "game-sheet--open" : ""}`}>
        <div className="game-sheet-handle" />
        {game ? (
          <div className="game-sheet-content">
            <div className="game-sheet-meta">
              <span className="game-sheet-platform">
                {game.platform === "switch2" ? "Nintendo Switch 2" : "Nintendo Switch"}
              </span>
              <span className={`game-sheet-status ${game.finished ? "game-sheet-status--done" : ""}`}>
                {game.finished ? "Terminado" : "Pendiente"}
              </span>
            </div>
            <h2 className="game-sheet-title">{game.title}</h2>
            <div className="game-sheet-genres">
              {game.genres.map((g) => (
                <span key={g} className="game-sheet-genre">{g}</span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
};

export default GameSheet;
