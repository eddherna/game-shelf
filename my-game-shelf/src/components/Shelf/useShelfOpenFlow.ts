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
  handleScrollTick: () => void;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const getMaxScroll = (scrollWidth: number, clientWidth: number) => Math.max(scrollWidth - clientWidth, 0);
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
  const pendingOpenIdRef = useRef<number | null>(null);
  const pendingOpenTimeoutRef = useRef<number | null>(null);
  const pendingCloseThenOpenTimeoutRef = useRef<number | null>(null);

  const getContainerAndGame = (gameIndex: number) => {
    const container = scrollRef.current;
    const gameElement = gameRefs.current[gameIndex];
    if (!container || !gameElement) {
      return null;
    }

    return { container, gameElement };
  };

  const clearPendingOpen = () => {
    pendingOpenIdRef.current = null;
    clearTimer(pendingOpenTimeoutRef);
    clearTimer(pendingCloseThenOpenTimeoutRef);
  };

  const schedulePendingOpen = (gameId: number) => {
    pendingOpenIdRef.current = gameId;
    clearTimer(pendingOpenTimeoutRef);
    pendingOpenTimeoutRef.current = window.setTimeout(() => {
      const pendingId = pendingOpenIdRef.current;
      pendingOpenIdRef.current = null;
      pendingOpenTimeoutRef.current = null;
      if (pendingId !== null) {
        onSetOpenGame(pendingId);
      }
    }, PENDING_OPEN_DELAY_MS);
  };

  const checkCoverOverflow = (gameIndex: number) => {
    const elements = getContainerAndGame(gameIndex);
    if (!elements) {
      return false;
    }

    const { container, gameElement } = elements;

    const containerRect = container.getBoundingClientRect();
    const gameRect = gameElement.getBoundingClientRect();

    const projectedRight = gameRect.left + ESTIMATED_COVER_WIDTH_PX + COVER_HORIZONTAL_PADDING_PX;
    const projectedLeft = gameRect.left - COVER_HORIZONTAL_PADDING_PX;

    return projectedRight > containerRect.right || projectedLeft < containerRect.left;
  };

  const centerGameIfNeeded = (gameIndex: number) => {
    const elements = getContainerAndGame(gameIndex);
    if (!elements) {
      return 0;
    }

    const { container, gameElement } = elements;

    const maxScroll = getMaxScroll(container.scrollWidth, container.clientWidth);
    if (maxScroll <= 0) {
      return 0;
    }

    const gameCenter = gameElement.offsetLeft + gameElement.offsetWidth / 2;
    const viewportCenter = container.clientWidth / 2;
    const targetScrollLeft = clamp(gameCenter - viewportCenter, 0, maxScroll);
    const distance = Math.abs(targetScrollLeft - container.scrollLeft);

    if (distance < MIN_SCROLL_DISTANCE_PX) {
      return 0;
    }

    container.scrollTo({ left: targetScrollLeft, behavior: "smooth" });
    return distance;
  };

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

    schedulePendingOpen(gameId);
  };

  const getTogglePlan = (gameId: number, gameIndex: number): TogglePlan => {
    if (openGame === gameId) {
      return { kind: "close-only" };
    }

    if (openGame !== null) {
      return { kind: "close-then-open", gameId, gameIndex };
    }

    return { kind: "open", gameId, gameIndex };
  };

  const executeTogglePlan = (plan: TogglePlan) => {
    if (plan.kind === "close-only") {
      onSetOpenGame(null);
      return;
    }

    if (plan.kind === "close-then-open") {
      onSetOpenGame(null);
      pendingCloseThenOpenTimeoutRef.current = window.setTimeout(() => {
        openWithOptionalCentering(plan.gameId, plan.gameIndex);
        pendingCloseThenOpenTimeoutRef.current = null;
      }, CLOSE_THEN_OPEN_DELAY_MS);
      return;
    }

    openWithOptionalCentering(plan.gameId, plan.gameIndex);
  };

  const handleGameToggle = (gameId: number, gameIndex: number) => {
    clearPendingOpen();
    const plan = getTogglePlan(gameId, gameIndex);
    executeTogglePlan(plan);
  };

  const handleScrollTick = () => {
    if (pendingOpenIdRef.current !== null) {
      schedulePendingOpen(pendingOpenIdRef.current);
    }
  };

  useEffect(() => {
    return () => {
      clearPendingOpen();
    };
  }, []);

  return {
    handleGameToggle,
    handleScrollTick,
  };
};

export default useShelfOpenFlow;
