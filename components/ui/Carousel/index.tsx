import React, { useState, useEffect, useRef, ReactNode } from "react";
import * as S from "./style";
import { useSpring } from "framer-motion";
import Icon from "../Icon";
import Hidden from "@/components/shared/Hidden";

type CarouselProps = {
  children: ReactNode;
  pageIndex?: number;
  onChange?: (_page: number) => void;
  showArrows?: boolean;
  showRightArrows?: boolean;
};

// swipe-ის ზღვარი (px) — ამაზე ნაკლები გადაწევა მიმდინარე გვერდზე აბრუნებს
const SWIPE_THRESHOLD = 70;
// რამდენი px-ის შემდეგ ვწყვეტთ, ჰორიზონტალური swipe-ია თუ ვერტიკალური scroll
const GESTURE_LOCK_THRESHOLD = 8;

const Carousel = ({ children, pageIndex = 0, onChange, showArrows, showRightArrows }: CarouselProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [page, setPage] = useState(pageIndex);
  const [containerWidth, setContainerWidth] = useState(0);
  const [hovering, setHovering] = useState(false);
  const dragX = useSpring(0, { stiffness: 400, damping: 40, mass: 1 });

  const count = React.Children.toArray(children).length;

  // touch-ის მდგომარეობა ref-ებშია — ადრე module-level ცვლადები იყო და
  // გვერდზე ორი Carousel ერთმანეთის startX/lastDelta-ს გადაწერდა; state-ში
  // მყოფი panning/scrolling კი listener-ების ყოველ render-ზე ხელახლა მიბმას
  // იწვევდა (და ძველ closure-ებს).
  const gestureRef = useRef({ active: false, startX: 0, startY: 0, lastDelta: 0, panning: false, scrolling: false });
  // listener-ები ერთხელ მიებმება — მიმდინარე მნიშვნელობებს ref-იდან კითხულობენ
  const latestRef = useRef({ page, containerWidth, count });
  latestRef.current = { page, containerWidth, count };
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // კონტეინერის სიგანე ცოცხლად — ადრე მხოლოდ mount-ზე/hover-ზე იზომებოდა და
  // ფანჯრის ზომის/ორიენტაციის შეცვლის შემდეგ სლაიდები არასწორად იწეოდა.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    const measure = () => setContainerWidth(el.getBoundingClientRect().width);
    measure();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // გარედან მართული გვერდი
  useEffect(() => {
    setPage(pageIndex);
  }, [pageIndex]);

  // გვერდის ან სიგანის ცვლილებისას პოზიცია ხელახლა ითვლება
  useEffect(() => {
    dragX.set(-containerWidth * page);
  }, [page, containerWidth, dragX]);

  const isFirstRenderRef = useRef(true);
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    onChangeRef.current?.(page);
  }, [page]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    const gesture = gestureRef.current;

    const handleTouchStart = (e: TouchEvent) => {
      gesture.active = true;
      gesture.startX = e.touches[0].clientX - dragX.get();
      gesture.startY = e.touches[0].clientY;
      gesture.lastDelta = dragX.get();
      gesture.panning = false;
      gesture.scrolling = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!gesture.active) return;
      const delta = e.touches[0].clientX - gesture.startX;
      const deltaScroll = e.touches[0].clientY - gesture.startY;
      if (!gesture.panning && !gesture.scrolling) {
        if (Math.abs(delta - dragX.get()) > GESTURE_LOCK_THRESHOLD) gesture.panning = true;
        else if (Math.abs(deltaScroll) > GESTURE_LOCK_THRESHOLD) gesture.scrolling = true;
      }
      if (gesture.panning) {
        e.preventDefault();
        dragX.set(delta);
      }
      gesture.lastDelta = delta;
    };

    const handleTouchEnd = () => {
      if (!gesture.active) return;
      gesture.active = false;
      const { page: current, containerWidth: width, count: total } = latestRef.current;
      const offset = gesture.lastDelta + width * current;
      if (gesture.panning && Math.abs(offset) > SWIPE_THRESHOLD) {
        const next = Math.min(Math.max(current + (offset < 0 ? 1 : -1), 0), total - 1);
        setPage(next);
        dragX.set(-width * next);
      } else {
        dragX.set(-width * current);
      }
      gesture.panning = false;
      gesture.scrolling = false;
    };

    // passive: false — touchmove-ში preventDefault (გვერდის scroll-ის შეჩერება) რომ იმუშაოს
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd);
    el.addEventListener("touchcancel", handleTouchEnd);
    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
      el.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [dragX]);

  return (
    <S.Container onHoverStart={() => setHovering(true)} onHoverEnd={() => setHovering(false)}>
      {showArrows && showRightArrows && count > 1 && (
        <S.ArrowRight
          className="arrow-btn"
          initial={{ opacity: 0 }}
          animate={{ opacity: hovering ? 1 : 0 }}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setPage((x) => (x === count - 1 ? 0 : x + 1));
          }}
        >
          <Icon name="chevron_right" />
        </S.ArrowRight>
      )}
      {showArrows && count > 1 && (
        <S.ArrowLeft
          className="arrow-btn"
          initial={{ opacity: 0 }}
          animate={{ opacity: hovering ? 1 : 0 }}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setPage((x) => (x === 0 ? count - 1 : x - 1));
          }}
        >
          <Icon name="chevron_left" />
        </S.ArrowLeft>
      )}
      <S.Wrapper ref={containerRef}>
        <S.ItemWrapper style={{ x: dragX }}>{children}</S.ItemWrapper>
        <Hidden md lg xl xl2 xxl xxxl>
          {count > 1 && (
            <S.BulletContainer>
              {Array.from({ length: count }).map((_, i) => (
                <S.BulletItem key={`wrapper-${i}`} active={i === page}>
                  •
                </S.BulletItem>
              ))}
            </S.BulletContainer>
          )}
        </Hidden>
      </S.Wrapper>
    </S.Container>
  );
};

export default Carousel;
