import { useEffect, useRef, useState } from "react";
import Game from "../Game/Game";
import "./Shelf.css";
import type GameInfo from "../../models/GameInfo";

interface ShelfProps {
  games: GameInfo[];
  openGame: number | null;
  onSetOpenGame: (id: number | null) => void;
}

const Shelf = ({ games, openGame, onSetOpenGame }: ShelfProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const gameRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pendingOpenIdRef = useRef<number | null>(null);
  const pendingOpenSettleTimeoutRef = useRef<number | null>(null);
  const pendingOpenFallbackTimeoutRef = useRef<number | null>(null);
  const pendingCloseThenOpenTimeoutRef = useRef<number | null>(null);
  const draggingRef = useRef(false);
  const dragOffsetRef = useRef(0);
  const [thumbWidth, setThumbWidth] = useState(0);
  const [thumbOffset, setThumbOffset] = useState(0);

  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

  // --- Refactored Functions ---
  
  // Progress thumb update logic
  const updateProgressThumb = (scrollLeft: number, scrollWidth: number, clientWidth: number) => {
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

  // Pending open operations handling
  const handlePendingOpenOperations = () => {
    if (pendingOpenIdRef.current !== null) {
      if (pendingOpenSettleTimeoutRef.current !== null) {
        window.clearTimeout(pendingOpenSettleTimeoutRef.current);
      }

      pendingOpenSettleTimeoutRef.current = window.setTimeout(() => {
        const pendingId = pendingOpenIdRef.current;
        pendingOpenIdRef.current = null;

        if (pendingOpenFallbackTimeoutRef.current !== null) {
          window.clearTimeout(pendingOpenFallbackTimeoutRef.current);
          pendingOpenFallbackTimeoutRef.current = null;
        }

        if (pendingId !== null) {
          onSetOpenGame(pendingId);
        }
      }, 140);
    }
  };

  // Main scroll sync function
  const syncFromScroll = () => {
    const element = scrollRef.current;
    if (!element) {
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = element;
    updateProgressThumb(scrollLeft, scrollWidth, clientWidth);
    handlePendingOpenOperations();
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

  // Refactored timeout clearing logic
  const clearPendingOpen = () => {
    pendingOpenIdRef.current = null;

    if (pendingOpenSettleTimeoutRef.current !== null) {
      window.clearTimeout(pendingOpenSettleTimeoutRef.current);
      pendingOpenSettleTimeoutRef.current = null;
    }

    if (pendingOpenFallbackTimeoutRef.current !== null) {
      window.clearTimeout(pendingOpenFallbackTimeoutRef.current);
      pendingOpenFallbackTimeoutRef.current = null;
    }

    if (pendingCloseThenOpenTimeoutRef.current !== null) {
      window.clearTimeout(pendingCloseThenOpenTimeoutRef.current);
      pendingCloseThenOpenTimeoutRef.current = null;
    }
  };

  // Overflow checking logic
  const checkCoverOverflow = (gameIndex: number) => {
    const container = scrollRef.current;
    const gameElement = gameRefs.current[gameIndex];
    if (!container || !gameElement) {
      return false;
    }

    const containerRect = container.getBoundingClientRect();
    const gameRect = gameElement.getBoundingClientRect();
    const estimatedCoverWidth = 365;
    const horizontalPadding = 20;

    const projectedRight = gameRect.left + estimatedCoverWidth + horizontalPadding;
    const projectedLeft = gameRect.left - horizontalPadding;

    return projectedRight > containerRect.right || projectedLeft < containerRect.left;
  };

  // Centering logic
  const centerGameIfNeeded = (gameIndex: number) => {
    const container = scrollRef.current;
    const gameElement = gameRefs.current[gameIndex];
    if (!container || !gameElement) {
      return 0;
    }

    const maxScroll = container.scrollWidth - container.clientWidth;
    if (maxScroll <= 0) {
      return 0;
    }

    const gameCenter = gameElement.offsetLeft + gameElement.offsetWidth / 2;
    const viewportCenter = container.clientWidth / 2;
    const targetScrollLeft = clamp(gameCenter - viewportCenter, 0, maxScroll);
    const distance = Math.abs(targetScrollLeft - container.scrollLeft);

    if (distance < 1) {
      return 0;
    }

    container.scrollTo({ left: targetScrollLeft, behavior: "smooth" });
    return distance;
  };

  // Timeout setup for open operations
  const setupPendingOpenTimeouts = (gameId: number) => {
    pendingOpenIdRef.current = gameId;

    if (pendingOpenSettleTimeoutRef.current !== null) {
      window.clearTimeout(pendingOpenSettleTimeoutRef.current);
    }

    pendingOpenSettleTimeoutRef.current = window.setTimeout(() => {
      const pendingId = pendingOpenIdRef.current;
      pendingOpenIdRef.current = null;

      if (pendingOpenFallbackTimeoutRef.current !== null) {
        window.clearTimeout(pendingOpenFallbackTimeoutRef.current);
        pendingOpenFallbackTimeoutRef.current = null;
      }

      if (pendingId !== null) {
        onSetOpenGame(pendingId);
      }
    }, 140);

    pendingOpenFallbackTimeoutRef.current = window.setTimeout(() => {
      const pendingId = pendingOpenIdRef.current;
      pendingOpenIdRef.current = null;

      if (pendingOpenSettleTimeoutRef.current !== null) {
        window.clearTimeout(pendingOpenSettleTimeoutRef.current);
        pendingOpenSettleTimeoutRef.current = null;
      }

      if (pendingId !== null) {
        onSetOpenGame(pendingId);
      }
    }, 900);
  };

  // Main open with optional centering logic
  const openWithOptionalCentering = (gameId: number, gameIndex: number) => {
    if (!checkCoverOverflow(gameIndex)) {
      onSetOpenGame(gameId);
      return;
    }

    const scrolledDistance = centerGameIfNeeded(gameIndex);
    if (scrolledDistance <= 0) {
      onSetOpenGame(gameId);
      return;
    }

    setupPendingOpenTimeouts(gameId);
  };

  const handleGameToggle = (gameId: number, gameIndex: number) => {
    clearPendingOpen();

    if (openGame === gameId) {
      onSetOpenGame(null);
      return;
    }

    if (openGame !== null && openGame !== gameId) {
      onSetOpenGame(null);
      pendingCloseThenOpenTimeoutRef.current = window.setTimeout(() => {
        openWithOptionalCentering(gameId, gameIndex);
        pendingCloseThenOpenTimeoutRef.current = null;
      }, 560);
      return;
    }

    openWithOptionalCentering(gameId, gameIndex);
  };

  // Drag handling logic
  const calculateDragPosition = (
    thumbWidth: number, 
    rect: DOMRect, 
    clientX: number, 
    dragOffset: number
  ) => {
    const thumbPx = (thumbWidth / 100) * rect.width;
    const maxThumbX = Math.max(rect.width - thumbPx, 0);
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

  useEffect(() => {
    return () => {
      clearPendingOpen();
    };
  }, []);

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
