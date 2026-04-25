import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import Game from "../Game/Game";
import "./Shelf.css";
import type GameInfo from "../../models/GameInfo";
import useShelfOpenFlow from "./useShelfOpenFlow";

const MIN_THUMB_WIDTH_PERCENT = 16;

interface ShelfProps {
  games: GameInfo[];
  openGame: number | null;
  onSetOpenGame: (id: number | null) => void;
}

const Shelf = ({ games, openGame, onSetOpenGame }: ShelfProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const gameRefs = useRef<(HTMLDivElement | null)[]>([]);
  const draggingRef = useRef(false);
  const dragOffsetRef = useRef(0);
  const [thumbWidth, setThumbWidth] = useState(0);
  const [thumbOffset, setThumbOffset] = useState(0);

  const { handleGameToggle, handleScrollTick } = useShelfOpenFlow({
    openGame,
    onSetOpenGame,
    scrollRef,
    gameRefs,
  });

  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
  const getMaxScroll = (scrollWidth: number, clientWidth: number) => Math.max(scrollWidth - clientWidth, 0);

  const getThumbMetrics = (trackWidth: number, widthPercent: number) => {
    const thumbPx = (widthPercent / 100) * trackWidth;
    const maxThumbX = Math.max(trackWidth - thumbPx, 0);
    return { thumbPx, maxThumbX };
  };

  const updateProgressThumb = (scrollLeft: number, scrollWidth: number, clientWidth: number) => {
    const maxScroll = getMaxScroll(scrollWidth, clientWidth);

    if (maxScroll <= 0) {
      setThumbWidth(100);
      setThumbOffset(0);
      return;
    }

    const nextThumbWidth = Math.max((clientWidth / scrollWidth) * 100, MIN_THUMB_WIDTH_PERCENT);
    const travel = 100 - nextThumbWidth;
    const nextThumbOffset = (scrollLeft / maxScroll) * travel;

    setThumbWidth(nextThumbWidth);
    setThumbOffset(nextThumbOffset);
  };

  const syncFromScroll = () => {
    const element = scrollRef.current;
    if (!element) {
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = element;
    updateProgressThumb(scrollLeft, scrollWidth, clientWidth);
    handleScrollTick();
  };

  const scrollToRatio = (ratio: number) => {
    const element = scrollRef.current;
    if (!element) {
      return;
    }

    const maxScroll = getMaxScroll(element.scrollWidth, element.clientWidth);
    if (maxScroll <= 0) {
      element.scrollLeft = 0;
      return;
    }

    element.scrollLeft = clamp(ratio, 0, 1) * maxScroll;
  };

  const calculateDragPosition = (
    thumbWidthPercent: number,
    rect: DOMRect,
    clientX: number,
    dragOffset: number
  ) => {
    const { maxThumbX } = getThumbMetrics(rect.width, thumbWidthPercent);
    if (maxThumbX <= 0) {
      scrollToRatio(0);
      return;
    }

    const nextX = clamp(clientX - rect.left - dragOffset, 0, maxThumbX);
    scrollToRatio(nextX / maxThumbX);
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (!draggingRef.current) {
      return;
    }

    const track = progressRef.current;
    if (!track) {
      return;
    }

    calculateDragPosition(thumbWidth, track.getBoundingClientRect(), event.clientX, dragOffsetRef.current);
  };

  const stopDragging = () => {
    draggingRef.current = false;
  };

  const handleTrackPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const track = progressRef.current;
    if (!track) {
      return;
    }

    const rect = track.getBoundingClientRect();
    const { thumbPx, maxThumbX } = getThumbMetrics(rect.width, thumbWidth);
    if (maxThumbX <= 0) {
      scrollToRatio(0);
      return;
    }

    const nextX = clamp(event.clientX - rect.left - thumbPx / 2, 0, maxThumbX);
    scrollToRatio(nextX / maxThumbX);
  };

  const handleThumbPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    const thumb = event.currentTarget;
    const rect = thumb.getBoundingClientRect();
    dragOffsetRef.current = event.clientX - rect.left;
    draggingRef.current = true;
  };

  useEffect(() => {
    syncFromScroll();
    window.addEventListener("resize", syncFromScroll);

    return () => {
      window.removeEventListener("resize", syncFromScroll);
    };
  }, [games.length]);

  useEffect(() => {
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
        {games.map((game, index) => (
          <Game
            key={game.id}
            containerRef={(element) => {
              gameRefs.current[index] = element;
            }}
            title={game.title}
            image={game.image}
            platform={game.platform}
            isOpen={openGame === game.id}
            onToggle={() => handleGameToggle(game.id, index)}
          />
        ))}
      </div>
      <div
        ref={progressRef}
        className="shelf-progress"
        aria-hidden="true"
        onPointerDown={handleTrackPointerDown}
      >
        <div
          className="shelf-progress-thumb"
          style={{
            width: `${thumbWidth}%`,
            left: `${thumbOffset}%`,
          }}
          onPointerDown={handleThumbPointerDown}
        />
      </div>
    </div>
  );
};

export default Shelf;
