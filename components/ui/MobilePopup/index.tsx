import React, { useRef, useEffect } from "react";
import * as S from "./style";
import { useSpring, motion } from "framer-motion";

let startY = 0;
const MobilePopup = ({
  children,
  onClose,
  stretch = false,
  minimized = false,
  overflowScroll = false,
  maxHeight,
}: {
  children: React.ReactNode;
  onClose: Function;
  stretch?: boolean;
  minimized?: boolean;
  overflowScroll?: boolean;
  maxHeight?: number;
}) => {
  const anotherOpenBeforeMeRef = useRef<boolean>();

  useEffect(() => {
    // if (typeof window === "undefined") return;

    const offsetY = window.pageYOffset;
    if (
      document.body.style.overflow == "hidden" &&
      document.body.style.position == "fixed"
    ) {
      anotherOpenBeforeMeRef.current = true;
    }
    document.body.style.top = `${-offsetY}px`;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    return () => {
      if (
        !anotherOpenBeforeMeRef.current &&
        document.querySelectorAll("body > .mobile-popup-container")?.length ===
          0
      ) {
        const offsetY = Math.abs(parseInt(document.body.style.top || "0", 10));
        document.body.style.removeProperty("overflow");
        document.body.style.removeProperty("position");
        document.body.style.removeProperty("top");
        window.scrollTo(0, offsetY || 0);
      }
    };
  }, []);
  const prevMinimizedRef: any = useRef(minimized);
  useEffect(() => {
    prevMinimizedRef.current = minimized;
  }, [minimized]);
  const popupRef: any = useRef(null);
  const dragY = useSpring(0, {
    mass: 0.1,
    stiffness: 70,
    damping: 10,
  });

  const handleClose = () => {
    onClose();
  };

  return (
    <S.Container key="mobilePopup" className="mobile-popup-container">
      <S.Backdrop
        key="mobilePopupBackdrop"
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        exit={{
          opacity: 0,
          transition: {
            type: "spring",
            mass: 2,
            stiffness: 300,
            damping: 45,
          },
        }}
        onClick={handleClose}
      />
      <S.Wrapper
        key="mobilePopupWrapper"
        maxHeight={maxHeight}
        initial={{
          y: "100%",
          scale: 1,
        }}
        animate={{
          y: minimized ? 50 : 0,
          scale: minimized ? 0.9 : 1,
        }}
        exit={{
          y: "100%",
          scale: 1,
          transition: {
            type: "spring",
            mass: 2,
            stiffness: 300,
            damping: 45,
            delay: 0,
          },
        }}
        transition={{
          type: "spring",
          mass: 2,
          stiffness: 350,
          damping: 45,
        }}
        stretch={stretch}
      >
        <motion.div
          onClick={handleClose}
          style={{
            width: 90,
            height: 45,
            userSelect: "none",
            transform: "none",
            position: "absolute",
            top: -33,
            left: "calc(50% - 45px)",
            background: "tranparent",
            zIndex: 2,
            y: dragY,
          }}
          dragConstraints={{ top: -20 }}
          onTouchStart={(e) => {
            startY = e.touches[0].clientY - dragY.get();
          }}
          onTouchMove={(e) => {
            const delta = e.touches[0].clientY - startY;
            if (delta < 0) {
              const valueToSet = delta / 5;
              if (valueToSet < -60) {
                dragY.set(-60);
                return;
              }
              dragY.set(valueToSet);
              return;
            }
            dragY.set(delta);
          }}
          onTouchEnd={(e) => {
            const { height } = popupRef.current.getBoundingClientRect();
            if (
              dragY.getVelocity() > 300 ||
              (dragY.get() > height / 2 && dragY.getVelocity() > 30)
            ) {
              if (popupRef.current) {
                handleClose();
              }
            } else {
              dragY.set(0);
            }
          }}
        />
        <S.Handle
          style={{
            y: dragY,
          }}
        />
        <S.Content
          key="mobilePopupContent"
          stretch={stretch}
          autoScroll={overflowScroll}
          ref={popupRef}
          style={{
            y: dragY,
          }}
        >
          {children}
        </S.Content>
      </S.Wrapper>
    </S.Container>
  );
};

export default MobilePopup;
