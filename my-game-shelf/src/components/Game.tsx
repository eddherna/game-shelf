import { useState, useEffect, memo } from "react";
import "./Game.css";

interface GameProps {
  title: string;
  image: string;
  platform: string;
  isOpen: boolean;
  onToggle: () => void;
}

interface PlatformInfo {
  color: string;
  logo: string;
}

const platformStyles: Map<string, PlatformInfo> = new Map<string, PlatformInfo>([
  ["switch", { color: "#e60012", logo: "logo-s1" }],
  ["switch2", { color: "#000", logo: "logo-s2" }],
]);

const Game = memo(({ title, image, platform, isOpen, onToggle }: GameProps) => {
  const [isSpaced, setIsSpaced] = useState(false);
  const [canRotate, setCanRotate] = useState(false);
  const [zIndex, setZIndex] = useState(1);

  useEffect(() => {
    let spacingTimer: ReturnType<typeof setTimeout>;
    let rotationTimer: ReturnType<typeof setTimeout>;

    if (isOpen) {
      setZIndex(1000);
      setIsSpaced(true);
      rotationTimer = setTimeout(() => {
        setCanRotate(true);
      }, 400);
    } else {
      setCanRotate(false);
      spacingTimer = setTimeout(() => {
        setIsSpaced(false);
        rotationTimer = setTimeout(() => setZIndex(1), 400);
      }, 500);
    }

    return () => {
      clearTimeout(spacingTimer);
      clearTimeout(rotationTimer);
    };
  }, [isOpen]);

  return (
    <div
      className={`game-container ${isSpaced ? "open-space" : ""} ${canRotate ? "rotated" : ""}`}
      onClick={onToggle}
      style={{ zIndex }}
    >
      <div className="game-card">
        <div
          className={`spine ${platform === "switch2" ? "red-variant" : ""}`}
          style={{ backgroundColor: platformStyles.get(platform)?.color }}
        >
          <div className="spine-content">
            <div className="spine-platform-icon">
              <div className="icon-svg logo-s1"></div>
              {platform === "switch2"
                ? <div className="spine-platform-badge"></div>
                : <div className="spine-platform-spacer"></div>
              }
            </div>
            <div className="spine-text">
              <h1 className="spine-title">{title}</h1>
            </div>
          </div>
        </div>
        <div className="cover">
          <img src={image} alt={title} loading="lazy" />
        </div>
      </div>
    </div>
  );
});

export default Game;
