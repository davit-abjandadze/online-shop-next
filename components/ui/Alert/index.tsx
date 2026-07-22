import React, {
  PropsWithChildren,
  useEffect,
  FC,
  ReactNode,
  useState,
} from "react";
import { createPortal } from "react-dom";
import * as S from "./style";
import { motion, AnimatePresence } from "framer-motion";
import Icon from "../Icon";
import { H5 } from "../Text";
import { useTheme } from "styled-components";
import { v4 as uuidv4 } from "uuid";

type AlertProps = {
  lightCloseIcon?: boolean;
  lightHeader?: boolean;
  showAlert: boolean;
  shrinked?: boolean;
  title?: string;
  onClose: () => void;
  onScroll?: (e: React.UIEvent<HTMLElement>) => void;
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  center?: boolean;
  scroll?: boolean;
  footer?: ReactNode;
  cancelBtnType?: "square";
  hideCloseBtn?: boolean;
  grayBgHeader?: boolean;
  lowerCaseTitle?: boolean;
  nonCloseable?: boolean;
};

const Alert: FC<AlertProps & PropsWithChildren> = ({
  lightCloseIcon,
  lightHeader,
  showAlert,
  onClose,
  onScroll,
  shrinked,
  title,
  width,
  minWidth,
  maxWidth,
  center,
  children,
  scroll = true,
  footer,
  cancelBtnType,
  hideCloseBtn,
  grayBgHeader,
  lowerCaseTitle,
  nonCloseable,
}) => {
  const theme = useTheme();
  // const alertRef = useRef<HTMLDivElement>(null);
  const [isSSR, setIsSSR] = useState(true);
  const [exited, setExited] = useState<boolean | null>(null);

  const removeBodyScroll = () => {
    document.body.style.overflow = "hidden";
    if (document.querySelectorAll("body > div[id^='alert-']").length === 0) {
      document.body.style.removeProperty("overflow");
    }
  };

  const handleAlertClose = () => {
    removeBodyScroll();
    onClose();
  };

  useEffect(() => {
    if (showAlert) {
      document.body.style.overflow = "hidden";
    } else {
      removeBodyScroll();
    }

    return () => {
      removeBodyScroll();
    };
  }, [showAlert]);

  useEffect(() => {
    if (typeof window != "undefined") {
      setIsSSR(false);
    }

    //   const clickOutsideHandler = (event: Event) => {
    //     event.stopPropagation();
    //     if (
    //       alertRef.current &&
    //       !alertRef.current.contains(event.target as Element)
    //     ) {
    //       handleAlertClose();
    //     }
    //   };

    //   document.addEventListener("pointerdown", clickOutsideHandler);
    //   return () => {
    //     document.removeEventListener("pointerdown", clickOutsideHandler);
    //   };
  }, []);

  useEffect(() => {
    if (exited !== null) {
      removeBodyScroll();
    }
  }, [exited]);

  if (isSSR) {
    return <></>;
  }

  return createPortal(
    <AnimatePresence
      onExitComplete={() => {
        setExited(exited === null ? true : !exited);
      }}
    >
      {showAlert && (
        <S.AlertBackground
          id={`alert-${uuidv4()}`}
          as={motion.div}
          initial={{ background: "rgba(0,0,0,0)" }}
          animate={{ background: "rgba(0,0,0,0.66)" }}
          exit={{ background: "rgba(0,0,0,0)" }}
          transition={{ ease: "easeInOut" }}
          onPointerDown={() => {
            if (!nonCloseable) {
              handleAlertClose();
            }
          }}
          style={
            center
              ? {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }
              : {}
          }
        >
          <S.Alert
            as={motion.div}
            // ref={alertRef}
            onPointerDown={(e) => e.stopPropagation()}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ ease: "easeInOut" }}
            style={{ width: width, minWidth: minWidth, maxWidth: maxWidth }}
            shrinked={shrinked}
          >
            {!title ? (
              <>
                {hideCloseBtn ? null : (
                  <>
                    {cancelBtnType == "square" ? (
                      <S.quareCloseBtn
                        variant="blank"
                        square
                        btnSize="md"
                        icon="close"
                        iconColor={theme.colors.text.strong}
                        onClick={() => {
                          handleAlertClose();
                        }}
                      />
                    ) : (
                      <>
                        {nonCloseable ? null : (
                          <S.HeadlessCloseBtn
                            variant="blank"
                            square
                            btnSize="md"
                            icon="close"
                            iconColor={
                              lightCloseIcon
                                ? "white"
                                : theme.colors.text.strong
                            }
                            onClick={() => {
                              handleAlertClose();
                            }}
                          />
                        )}
                      </>
                    )}
                  </>
                )}
              </>
            ) : (
              <S.Header grayBgHeader={grayBgHeader} lightHeader={lightHeader}>
                <H5 bold caps={!lightHeader && !lowerCaseTitle}>
                  {title}
                </H5>
                {hideCloseBtn ? null : (
                  <S.CloseBtn
                    onClick={() => {
                      handleAlertClose();
                    }}
                  >
                    <Icon
                      name={
                        lightHeader || cancelBtnType == "square"
                          ? "close"
                          : "cancel"
                      }
                      filled
                    />
                  </S.CloseBtn>
                )}
              </S.Header>
            )}
            <S.Content onScroll={onScroll} scroll={scroll}>
              {children}
            </S.Content>
            {footer ? <S.AlertFooter>{footer}</S.AlertFooter> : null}
          </S.Alert>
        </S.AlertBackground>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Alert;
