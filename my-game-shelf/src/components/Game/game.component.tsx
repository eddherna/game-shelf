import { memo, useEffect, useRef, useState } from "react";
import scrollIntoView from "scroll-into-view-if-needed";
import "./game.component.css";
import { getPlatformColor } from "../../utils";

interface GameProps {
  title: string;
  image: string;
  platform: string;
  isOpen: boolean;
  onToggle: () => void;
  containerRef?: (element: HTMLDivElement | null) => void;
}

const GameComponent = memo(
  ({ title, image, platform, isOpen, onToggle, containerRef }: GameProps) => {
    const [isSpaced, setIsSpaced] = useState(false);
    const [canRotate, setCanRotate] = useState(false);
    const containerElementRef = useRef<HTMLDivElement | null>(null);
    const coverCloseZoneRef = useRef<HTMLDivElement | null>(null);
    const normalizedImage = image.trim();
    const [hasCoverImage, setHasCoverImage] = useState(
      normalizedImage.length > 0,
    );

    useEffect(() => {
      setHasCoverImage(normalizedImage.length > 0);
    }, [normalizedImage]);

    useEffect(() => {
      if (!isOpen || !containerElementRef.current) {
        return;
      }

      const ensureVisible = () => {
        const targetElement = coverCloseZoneRef.current ?? containerElementRef.current;
        if (!targetElement) {
          return;
        }

        const shelfBoundary = targetElement.closest(".shelf-scroll") ?? undefined;

        scrollIntoView(targetElement, {
          behavior: "smooth",
          scrollMode: "if-needed",
          block: "nearest",
          inline: "nearest",
          boundary: shelfBoundary,
        });
      };

      const rafId = window.requestAnimationFrame(ensureVisible);
      const settleTimer = window.setTimeout(ensureVisible, 430);

      return () => {
        window.cancelAnimationFrame(rafId);
        window.clearTimeout(settleTimer);
      };
    }, [isOpen, isSpaced, canRotate]);

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
        ref={(element) => {
          containerElementRef.current = element;
          containerRef?.(element);
        }}
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
            ref={coverCloseZoneRef}
            className="open-cover-close-zone"
            onClick={() => {
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

export default GameComponent;
