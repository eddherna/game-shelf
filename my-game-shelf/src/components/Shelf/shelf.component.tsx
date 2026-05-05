import { useRef } from "react";
import GameComponent from "../Game/game.component";

import "./shelf.component.css";
import type GameInfo from "../../models/GameInfo";

interface ShelfProps {
  games: GameInfo[];
  openGame: number | null;
  onSetOpenGame: (id: number | null) => void;
}

const ShelfComponent = ({ games, openGame, onSetOpenGame: _onSetOpenGame }: ShelfProps) => {
  const gameRefs = useRef<(HTMLDivElement | null)[]>([]);

  return (
    <div className="shelf-scroll">
      <div className="shelf">
        {games.map((game, index) => (
          <GameComponent
            key={game.id}
            containerRef={(element) => {
              gameRefs.current[index] = element;
            }}
            title={game.title}
            image={game.image}
            platform={game.platform}
            isOpen={openGame === game.id}
            onToggle={() => {
              console.log("toggle", game.id);
              _onSetOpenGame(openGame === game.id ? null : game.id);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ShelfComponent;
