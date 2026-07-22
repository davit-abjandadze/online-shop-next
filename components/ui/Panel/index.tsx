import React, {
  PropsWithChildren,
  ReactNode,
  useEffect,
  useState,
} from "react";
import * as S from "./style";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";

type PanelProps = {
  header: ReactNode;
  isOpen: boolean;
};

const Panel: React.FC<PanelProps & PropsWithChildren> = ({
  header,
  isOpen,
  children,
}) => {
  const [isSSR, setIsSSR] = useState(true);

  useEffect(() => {
    if (typeof window != "undefined") {
      setIsSSR(false);
    }
  }, []);

  const [showPanel, setShowPanel] = useState(false);

  const panelShowHide = {
    open: { x: 0 },
    closed: { x: "-100%" },
  };

  const bgAnimation = {
    open: { background: "rgba(0,0,0,0.8)" },
    closed: { background: "rgba(0,0,0,0)" },
  };

  if (isSSR) {
    return <></>;
  }
  return createPortal(
    <>
      {showPanel && (
        <S.PanelBackground
          as={motion.div}
          initial={showPanel}
          animate={isOpen ? "open" : "closed"}
          transition={{ ease: "easeOut" }}
          variants={bgAnimation}
        />
      )}
      <S.PanelBackground
        as={motion.div}
        style={{ display: showPanel ? "block" : "none" }}
        initial={showPanel}
        animate={isOpen ? "open" : "closed"}
        transition={{ ease: "easeOut" }}
        variants={panelShowHide}
        onAnimationStart={() => isOpen && setShowPanel(true)}
        onAnimationComplete={() => !isOpen && setShowPanel(false)}
      >
        {showPanel && (
          <S.Panel>
            <S.Header>{header}</S.Header>
            <S.Content>{children}</S.Content>
          </S.Panel>
        )}
      </S.PanelBackground>
    </>,
    document.body
  );
};

export default Panel;
