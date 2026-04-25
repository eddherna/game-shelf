import { useEffect, useRef } from "react";
import type { MutableRefObject } from "react";

const PENDING_OPEN_DELAY_MS = 150;
const CLOSE_THEN_OPEN_DELAY_MS = 560;
const ESTIMATED_COVER_WIDTH_PX = 365;
const COVER_HORIZONTAL_PADDING_PX = 20;
const MIN_SCROLL_DISTANCE_PX = 1;

type TogglePlan =
  | { kind: "close-only" }
  | { kind: "close-then-open"; gameId: number; gameIndex: number }
  | { kind: "open"; gameId: number; gameIndex: number };

interface UseShelfOpenFlowParams {
  openGame: number | null;
  onSetOpenGame: (id: number | null) => void;
  scrollRef: MutableRefObject<HTMLDivElement | null>;
  gameRefs: MutableRefObject<(HTMLDivElement | null)[]>;
}

interface UseShelfOpenFlowResult {
  handleGameToggle: (gameId: number, gameIndex: number) => void;
  handleOpenFlowScroll: () => void;
}

// Geometry helpers are kept together so the interaction flow reads top-to-bottom.
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const getMaxScroll = (scrollWidth: number, clientWidth: number) => Math.max(scrollWidth - clientWidth, 0);
const getProjectedCoverBounds = (gameLeft: number) => {
  const projectedRight = gameLeft + ESTIMATED_COVER_WIDTH_PX + COVER_HORIZONTAL_PADDING_PX;
  const projectedLeft = gameLeft - COVER_HORIZONTAL_PADDING_PX;
  return { projectedLeft, projectedRight };
};

const getTargetScrollLeft = (gameElement: HTMLDivElement, clientWidth: number, maxScroll: number) => {
  const gameCenter = gameElement.offsetLeft + gameElement.offsetWidth / 2;
  const viewportCenter = clientWidth / 2;
  return clamp(gameCenter - viewportCenter, 0, maxScroll);
};

const clearTimer = (timerRef: MutableRefObject<number | null>) => {
  if (timerRef.current !== null) {
    window.clearTimeout(timerRef.current);
    timerRef.current = null;
  }
};

const useShelfOpenFlow = ({
  openGame,
  onSetOpenGame,
  scrollRef,
  gameRefs,
}: UseShelfOpenFlowParams): UseShelfOpenFlowResult => {
  const pendingGameIdToOpenRef = useRef<number | null>(null);
  const pendingOpenTimerRef = useRef<number | null>(null);
  const closeThenOpenTimerRef = useRef<number | null>(null);

  const getTrackedElements = (gameIndex: number) => {
    const container = scrollRef.current;
    const gameElement = gameRefs.current[gameIndex];
    if (!container || !gameElement) {
      return null;
    }

    return { container, gameElement };
  };

  const clearPendingOpenFlow = () => {
    pendingGameIdToOpenRef.current = null;
    clearTimer(pendingOpenTimerRef);
    clearTimer(closeThenOpenTimerRef);
  };

  const schedulePendingOpen = (gameId: number) => {
    pendingGameIdToOpenRef.current = gameId;
    clearTimer(pendingOpenTimerRef);
    pendingOpenTimerRef.current = window.setTimeout(() => {
      const gameIdToOpen = pendingGameIdToOpenRef.current;
      pendingGameIdToOpenRef.current = null;
      pendingOpenTimerRef.current = null;
      if (gameIdToOpen !== null) {
        onSetOpenGame(gameIdToOpen);
      }
    }, PENDING_OPEN_DELAY_MS);
  };

  const doesCoverOverflowViewport = (gameIndex: number) => {
    const elements = getTrackedElements(gameIndex);
    if (!elements) {
      return false;
    }

    const { container, gameElement } = elements;

    const containerRect = container.getBoundingClientRect();
    const gameRect = gameElement.getBoundingClientRect();

    const { projectedLeft, projectedRight } = getProjectedCoverBounds(gameRect.left);

    return projectedRight > containerRect.right || projectedLeft < containerRect.left;
  };

  const centerGameInViewportIfNeeded = (gameIndex: number) => {
    const elements = getTrackedElements(gameIndex);
    if (!elements) {
      return 0;
    }

    const { container, gameElement } = elements;

    const maxScroll = getMaxScroll(container.scrollWidth, container.clientWidth);
    if (maxScroll <= 0) {
      return 0;
    }

    const targetScrollLeft = getTargetScrollLeft(gameElement, container.clientWidth, maxScroll);
    const distance = Math.abs(targetScrollLeft - container.scrollLeft);

    if (distance < MIN_SCROLL_DISTANCE_PX) {
      return 0;
    }

    container.scrollTo({ left: targetScrollLeft, behavior: "smooth" });
    return distance;
  };

  const openGameUsingViewportRules = (gameId: number, gameIndex: number) => {
    if (!doesCoverOverflowViewport(gameIndex)) {
      onSetOpenGame(gameId);
      return;
    }

    const scrolledDistance = centerGameInViewportIfNeeded(gameIndex);
    if (scrolledDistance <= 0) {
      onSetOpenGame(gameId);
      return;
    }

    schedulePendingOpen(gameId);
  };

  const buildTogglePlan = (gameId: number, gameIndex: number): TogglePlan => {
    if (openGame === gameId) {
      return { kind: "close-only" };
    }

    if (openGame !== null) {
      return { kind: "close-then-open", gameId, gameIndex };
    }

    return { kind: "open", gameId, gameIndex };
  };

  const runTogglePlan = (plan: TogglePlan) => {
    if (plan.kind === "close-only") {
      onSetOpenGame(null);
      return;
    }

    if (plan.kind === "close-then-open") {
      onSetOpenGame(null);
      // Keep the reopen delay aligned with the close animation to avoid visual jumps.
      closeThenOpenTimerRef.current = window.setTimeout(() => {
        openGameUsingViewportRules(plan.gameId, plan.gameIndex);
        closeThenOpenTimerRef.current = null;
      }, CLOSE_THEN_OPEN_DELAY_MS);
      return;
    }

    openGameUsingViewportRules(plan.gameId, plan.gameIndex);
  };

  const handleGameToggle = (gameId: number, gameIndex: number) => {
    clearPendingOpenFlow();
    const plan = buildTogglePlan(gameId, gameIndex);
    runTogglePlan(plan);
  };

  const handleOpenFlowScroll = () => {
    // While smooth scrolling is running, keep extending the timer and open once motion settles.
    if (pendingGameIdToOpenRef.current !== null) {
      schedulePendingOpen(pendingGameIdToOpenRef.current);
    }
  };

  useEffect(() => {
    return () => {
      clearPendingOpenFlow();
    };
  }, []);

  return {
    handleGameToggle,
    handleOpenFlowScroll,
  };
};

export default useShelfOpenFlow;
