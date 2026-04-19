import { useEffect, useRef, useState } from "react";
import Game from "./Game";
import "./Shelf.css";

interface GameItem {
  title: string;
  image: string;
  platform: string;
}

interface ShelfProps {
  games: GameItem[];
  openGame: string | null;
  onToggleGame: (title: string) => void;
}

const Shelf = ({ games, openGame, onToggleGame }: ShelfProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const dragOffsetRef = useRef(0);
  const [thumbWidth, setThumbWidth] = useState(0);
  const [thumbOffset, setThumbOffset] = useState(0);

  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

  const syncFromScroll = () => {
    const element = scrollRef.current;
    if (!element) {
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = element;
    const maxScroll = scrollWidth - clientWidth;

    if (maxScroll <= 0) {
      setThumbWidth(100);
      setThumbOffset(0);
      return;
    }

    const nextThumbWidth = Math.max((clientWidth / scrollWidth) * 100, 16);
    const travel = 100 - nextThumbWidth;
    const nextThumbOffset = (scrollLeft / maxScroll) * travel;

    setThumbWidth(nextThumbWidth);
    setThumbOffset(nextThumbOffset);
  };

  const scrollToRatio = (ratio: number) => {
    const element = scrollRef.current;
    if (!element) {
      return;
    }

    const maxScroll = element.scrollWidth - element.clientWidth;
    if (maxScroll <= 0) {
      element.scrollLeft = 0;
      return;
    }

    element.scrollLeft = clamp(ratio, 0, 1) * maxScroll;
  };

  useEffect(() => {
    syncFromScroll();
    window.addEventListener("resize", syncFromScroll);

    return () => {
      window.removeEventListener("resize", syncFromScroll);
    };
  }, [games.length]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!draggingRef.current) {
        return;
      }

      const track = progressRef.current;
      if (!track) {
        return;
      }

      const rect = track.getBoundingClientRect();
      const thumbPx = (thumbWidth / 100) * rect.width;
      const maxThumbX = Math.max(rect.width - thumbPx, 0);
      if (maxThumbX <= 0) {
        scrollToRatio(0);
        return;
      }

      const nextX = clamp(event.clientX - rect.left - dragOffsetRef.current, 0, maxThumbX);
      scrollToRatio(nextX / maxThumbX);
    };

    const stopDragging = () => {
      draggingRef.current = false;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopDragging);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopDragging);
    };
  }, [thumbWidth]);

  return (
    <div
      ref={scrollRef}
      className="shelf-scroll"
      onScroll={syncFromScroll}
    >
      <div className="shelf">
        {games.map((game) => (
          <Game
            key={game.title}
            title={game.title}
            image={game.image}
            platform={game.platform}
            isOpen={openGame === game.title}
            onToggle={() => onToggleGame(game.title)}
          />
        ))}
      </div>
      <div
        ref={progressRef}
        className="shelf-progress"
        aria-hidden="true"
        onPointerDown={(event) => {
          const track = progressRef.current;
          if (!track) {
            return;
          }

          const rect = track.getBoundingClientRect();
          const thumbPx = (thumbWidth / 100) * rect.width;
          const maxThumbX = Math.max(rect.width - thumbPx, 0);
          if (maxThumbX <= 0) {
            scrollToRatio(0);
            return;
          }

          const nextX = clamp(event.clientX - rect.left - thumbPx / 2, 0, maxThumbX);
          scrollToRatio(nextX / maxThumbX);
        }}
      >
        <div
          className="shelf-progress-thumb"
          style={{
            width: `${thumbWidth}%`,
            left: `${thumbOffset}%`,
          }}
          onPointerDown={(event) => {
            event.stopPropagation();
            const thumb = event.currentTarget;
            const rect = thumb.getBoundingClientRect();
            dragOffsetRef.current = event.clientX - rect.left;
            draggingRef.current = true;
          }}
        />
      </div>
    </div>
  );
};

export default Shelf;
