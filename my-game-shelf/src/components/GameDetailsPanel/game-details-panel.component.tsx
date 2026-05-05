import type React from "react";
import type GameInfo from "../../models/GameInfo";
import "./game-details-panel.component.css";

interface GameDetailsPanelProps {
  game: GameInfo | null;
  isOpen: boolean;
  onClose: () => void;
}

const GameDetailsPanel: React.FC<GameDetailsPanelProps> = ({ game, isOpen, onClose }) => {
  return (
    <aside className={`game-details-panel ${isOpen ? "open" : ""}`} aria-hidden={!isOpen}>
      <div className="game-details-content">
        <button className="game-details-close" type="button" onClick={onClose} aria-label="Cerrar">
          x
        </button>
        {game && (
          <>
            <div className="game-details-main">
              <div className="game-details-cover">
                {game.image.trim().length > 0
                  ? <img src={game.image} alt={game.title} loading="lazy" />
                  : <div className="game-details-cover-fallback">Sin portada</div>}
              </div>
              <div className="game-details-text">
                <h2>{game.title}</h2>
                <p><strong>Plataforma:</strong> {game.platform}</p>
                <p><strong>Estado:</strong> {game.finished ? "Finalizado" : "Pendiente"}</p>
                <div className="game-details-genres">
                  {game.genres.map((genre) => (
                    <span key={`${game.id}-${genre}`} className="game-details-genre-chip">{genre}</span>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
};

export default GameDetailsPanel;



