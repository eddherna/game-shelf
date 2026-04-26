import { memo, useEffect, useState } from "react";
import "./Game.css";
import { getPlatformColor } from "../../utils";

interface GameProps {
  title: string;
  image: string;
  platform: string;
  isOpen: boolean;
  onToggle: () => void;
  containerRef?: (element: HTMLDivElement | null) => void;
}

const Game = memo(
  ({ title, image, platform, isOpen, onToggle, containerRef }: GameProps) => {
    const [isSpaced, setIsSpaced] = useState(false);
    const [canRotate, setCanRotate] = useState(false);
    const normalizedImage = image.trim();
    const [hasCoverImage, setHasCoverImage] = useState(
      normalizedImage.length > 0,
    );

    useEffect(() => {
      setHasCoverImage(normalizedImage.length > 0);
    }, [normalizedImage]);

    useEffect(() => {
      let spacingTimer: ReturnType<typeof setTimeout>;
      let rotationTimer: ReturnType<typeof setTimeout>;

      if (isOpen) {
        setIsSpaced(true);
        rotationTimer = setTimeout(() => {
          setCanRotate(true);
        }, 400);
      } else {
        setCanRotate(false);
        spacingTimer = setTimeout(() => {
          setIsSpaced(false);
        }, 500);
      }

      return () => {
        clearTimeout(spacingTimer);
        clearTimeout(rotationTimer);
      };
    }, [isOpen]);

    return (
      <div
        ref={containerRef}
        className={`game-container ${isSpaced ? "open-space" : ""} ${
          canRotate ? "rotated" : ""
        }`}
        onClick={() => {
          if (!isOpen) {
            onToggle();
          }
        }}
      >
        {isOpen && canRotate && (
          <div
            className="open-cover-close-zone"
            onClick={(event) => {
              onToggle();
            }}
          />
        )}
        <div className="game-card">
          <div
            className={`spine ${platform === "switch2" ? "red-variant" : ""}`}
            style={{ backgroundColor: getPlatformColor(platform) }}
            onClick={() => isOpen? onToggle() : null}
          >
            <div className="spine-content">
              <div className="spine-platform-icon">
                <div className="icon-svg logo-s1"></div>
                {platform === "switch2"
                  ? <div className="spine-platform-badge"></div>
                  : <div className="spine-platform-spacer"></div>}
              </div>
              <div className="spine-text">
                <h1 className="spine-title">{title}</h1>
              </div>
            </div>
          </div>
          <div className={`cover ${hasCoverImage ? "" : "cover-no-image"}`}>
            {hasCoverImage && (
              <img
                src={normalizedImage}
                alt={title}
                loading="lazy"
                onError={() => {
                  setHasCoverImage(false);
                }}
              />
            )}
          </div>
        </div>
      </div>
    );
  },
);

export default Game;
