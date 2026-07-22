import React, { useState, useEffect, useRef, ReactNode } from "react";
import * as S from "./style";
import { AnimatePresence, useSpring } from "framer-motion";
import Icon from "../Icon";
import Hidden from "@/components/shared/Hidden";

let immediete = false;
let startX = 0;
let startY = 0;
let lastDelta = 0;

type CarouselProps = {
  children: ReactNode;
  pageIndex?: number;
  onChange?: (_page: number) => void;
  showArrows?: boolean;
  showRightArrows?: boolean;
};

const Carousel = ({
  children,
  pageIndex = 0,
  onChange,
  showArrows,
  showRightArrows,
}: CarouselProps) => {
  const containerRef: any = useRef(null);
  const pointerRef: any = useRef(null);
  const [page, setPage] = useState(0);
  const [panning, setPanning] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [hovering, setHovering] = useState(false);
  const dragX = useSpring(0, {
    stiffness: immediete ? 10000 : 400,
    damping: immediete ? 500 : 40,
    mass: immediete ? 0.1 : 1,
  });
  useEffect(() => {
    setPage(pageIndex);
    dragX.set(-containerWidth * pageIndex);
  }, [pageIndex]);
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setContainerWidth(rect.width);
      containerRef.current.addEventListener("touchstart", handleTouchStart);
      containerRef.current.addEventListener("touchmove", handleTouchMove);
      containerRef.current.addEventListener("touchend", handleTouchEnd);
    }
    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener(
          "touchstart",
          handleTouchStart
        );
        containerRef.current.removeEventListener("touchmove", handleTouchMove);
        containerRef.current.removeEventListener("touchend", handleTouchEnd);
      }
    };
  }, [containerRef.current, panning, scrolling, page]);

  const handleTouchStart = (e: any) => {
    pointerRef.current = true;
    startX = e.touches[0].clientX - dragX.get();
    startY = e.touches[0].clientY;
    setPanning(false);
    setScrolling(false);
  };

  const handleTouchMove = (e: any) => {
    if (!pointerRef.current) return;
    const delta = e.touches[0].clientX - startX;
    const deltaScroll = e.touches[0].clientY - startY;
    if (!scrolling && Math.abs(delta - dragX.get()) > 8) {
      setPanning(true);
      e.preventDefault();
    } else if (!panning && Math.abs(deltaScroll) > 8) {
      setScrolling(true);
    }
    if (panning && !scrolling) {
      e.preventDefault();
      dragX.set(delta);
    }
    lastDelta = delta;
  };

  const handleTouchEnd = (e: any) => {
    if (!pointerRef.current) return;
    pointerRef.current = false;
    const nextDirection = lastDelta - dragX.get() > 0 ? -1 : 1;
    if (Math.abs(lastDelta + containerWidth * page) > 70 && panning) {
      let pageToSet = Math.max(page + (nextDirection > 0 ? 1 : -1), 0);
      pageToSet = Math.min(
        pageToSet,
        React.Children.toArray(children).length - 1
      );
      setPage(pageToSet);
      dragX.set(-containerWidth * pageToSet);
    } else {
      dragX.set(-containerWidth * page);
    }
    setPanning(false);
    setScrolling(false);
  };

  useEffect(() => {
    dragX.set(-containerWidth * page);
    setPanning(false);
    setScrolling(false);
    if (onChange) {
      onChange(page);
    }
  }, [page]);

  return (
    <>
      <S.Container
        onHoverStart={() => {
          setHovering(true);
          const rect = containerRef.current.getBoundingClientRect();
          setContainerWidth(rect.width);
        }}
        onHoverEnd={() => {
          setHovering(false);
        }}
      >
        {showArrows &&
          showRightArrows &&
          React.Children.toArray(children).length > 1 && (
            <S.ArrowRight
              className="arrow-btn"
              initial={{ opacity: 0 }}
              animate={{ opacity: hovering ? 1 : 0 }}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setPage((x) =>
                  x == React.Children.toArray(children).length - 1 ? 0 : x + 1
                );
              }}
            >
              <Icon name="chevron_right" />
            </S.ArrowRight>
          )}
        {showArrows && React.Children.toArray(children).length > 1 && (
          <S.ArrowLeft
            className="arrow-btn"
            initial={{ opacity: 0 }}
            animate={{ opacity: hovering ? 1 : 0 }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setPage((x) =>
                x == 0 ? React.Children.toArray(children).length - 1 : x - 1
              );
            }}
          >
            <Icon name="chevron_left" />
          </S.ArrowLeft>
        )}
        <S.Wrapper ref={containerRef}>
          <S.ItemWrapper
            style={{
              x: dragX,
            }}
          >
            {children}
          </S.ItemWrapper>
          <Hidden md lg xl xl2 xxl xxxl>
            {React.Children.toArray(children).length > 1 && (
              <S.BulletContainer>
                {[...new Array(React.Children.toArray(children).length)].map(
                  (x, i) => {
                    let isActive = i === page;
                    return (
                      <S.BulletItem key={`wrapper-${i}`} active={isActive}>
                        •
                      </S.BulletItem>
                    );
                  }
                )}
              </S.BulletContainer>
            )}
          </Hidden>
        </S.Wrapper>
      </S.Container>
    </>
  );
};

export default Carousel;
