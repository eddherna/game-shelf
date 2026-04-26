import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, RefObject } from "react";
import "./shelf-scrollbar.css";

const MIN_THUMB_WIDTH_PERCENT = 16;

interface ShelfScrollbarProps {
  scrollRef: RefObject<HTMLDivElement | null>;
  itemsCount: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const getMaxScroll = (scrollWidth: number, clientWidth: number) => Math.max(scrollWidth - clientWidth, 0);

const getThumbMetrics = (trackWidth: number, widthPercent: number) => {
  const thumbPx = (widthPercent / 100) * trackWidth;
  const maxThumbX = Math.max(trackWidth - thumbPx, 0);
  return { thumbPx, maxThumbX };
};

const ShelfScrollbar = ({ scrollRef, itemsCount }: ShelfScrollbarProps) => {
  const progressTrackRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef(0);
  const [thumbWidthPercent, setThumbWidthPercent] = useState(0);
  const [thumbOffsetPercent, setThumbOffsetPercent] = useState(0);

  const updateProgressThumb = (scrollLeft: number, scrollWidth: number, clientWidth: number) => {
    const maxScroll = getMaxScroll(scrollWidth, clientWidth);

    if (maxScroll <= 0) {
      setThumbWidthPercent(100);
      setThumbOffsetPercent(0);
      return;
    }

    const nextThumbWidth = Math.max((clientWidth / scrollWidth) * 100, MIN_THUMB_WIDTH_PERCENT);
    const travel = 100 - nextThumbWidth;
    const nextThumbOffset = (scrollLeft / maxScroll) * travel;

    setThumbWidthPercent(nextThumbWidth);
    setThumbOffsetPercent(nextThumbOffset);
  };

  const syncFromScroll = () => {
    const element = scrollRef.current;
    if (!element) {
      return;
    }

    updateProgressThumb(element.scrollLeft, element.scrollWidth, element.clientWidth);
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
    widthPercent: number,
    rect: DOMRect,
    clientX: number,
    dragOffset: number
  ) => {
    const { maxThumbX } = getThumbMetrics(rect.width, widthPercent);
    if (maxThumbX <= 0) {
      scrollToRatio(0);
      return;
    }

    const nextX = clamp(clientX - rect.left - dragOffset, 0, maxThumbX);
    scrollToRatio(nextX / maxThumbX);
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (!isDraggingRef.current) {
      return;
    }

    const track = progressTrackRef.current;
    if (!track) {
      return;
    }

    calculateDragPosition(
      thumbWidthPercent,
      track.getBoundingClientRect(),
      event.clientX,
      dragOffsetRef.current
    );
  };

  const stopDragging = () => {
    isDraggingRef.current = false;
  };

  const handleTrackPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const track = progressTrackRef.current;
    if (!track) {
      return;
    }

    const rect = track.getBoundingClientRect();
    const { thumbPx, maxThumbX } = getThumbMetrics(rect.width, thumbWidthPercent);
    if (maxThumbX <= 0) {
      scrollToRatio(0);
      return;
    }

    const nextX = clamp(event.clientX - rect.left - thumbPx / 2, 0, maxThumbX);
    scrollToRatio(nextX / maxThumbX);
  };

  const handleThumbPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const thumbRect = event.currentTarget.getBoundingClientRect();
    dragOffsetRef.current = event.clientX - thumbRect.left;
    isDraggingRef.current = true;
  };

  useEffect(() => {
    const element = scrollRef.current;
    syncFromScroll();

    if (!element) {
      return;
    }

    element.addEventListener("scroll", syncFromScroll);
    window.addEventListener("resize", syncFromScroll);

    return () => {
      element.removeEventListener("scroll", syncFromScroll);
      window.removeEventListener("resize", syncFromScroll);
    };
  }, [scrollRef, itemsCount]);

  useEffect(() => {
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopDragging);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopDragging);
    };
  }, [thumbWidthPercent]);

  return (
    <div
      ref={progressTrackRef}
      className="shelf-progress"
      aria-hidden="true"
      onPointerDown={handleTrackPointerDown}
    >
      <div
        className="shelf-progress-thumb"
        style={{
          width: `${thumbWidthPercent}%`,
          left: `${thumbOffsetPercent}%`,
        }}
        onPointerDown={handleThumbPointerDown}
      />
    </div>
  );
};

export default ShelfScrollbar;
