import { AnimatePresence, motion } from "framer-motion";
import useTranslation from "next-translate/useTranslation";
import React, { forwardRef, useEffect, useRef, useState } from "react";
import { useTheme } from "styled-components";
import Button from "../Button";
import * as S from "./style";
import { Sizes } from "@/components/pages/real-estate-application/shared/data/enums";

type CommentProps = {
  onChange?: (text: string) => void;
  onSubmit?: (text: string) => void;
  onCancel?: () => void;
  onFocus?: () => void;
  value?: string;
  initialValue?: string;
  placeholder?: string;
  focus?: boolean | null;
  setFocus?: any;
  noMenu?: boolean;
  height?: number;
  maxLength?: number;
  invalid?: boolean;
  errorMessage?: string;
  isLoading?: boolean;
  menuDisabled?: boolean;
  editMod?: boolean;
  id?: string;
};

const Comment: React.FC<CommentProps> = ({
  onChange,
  onCancel,
  onSubmit,
  onFocus,
  value,
  initialValue,
  placeholder,
  focus = null,
  setFocus,
  noMenu,
  height,
  maxLength,
  invalid,
  errorMessage,
  isLoading = false,
  menuDisabled = false,
  editMod = false,
  id,
}) => {
  const commentRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const { t } = useTranslation("common");
  const theme = useTheme();

  const [isFocused, setIsFocused] = useState(focus);
  // const [text, setText] = useState(initialValue ?? value ?? "");

  useEffect(() => {
    if (focus !== null) {
      textAreaRef.current?.focus();
      setFocus && setFocus(false);
    }
  }, [focus]);

  // useEffect(() => {
  //   setFocus && setFocus(isFocused);
  // }, [isFocused]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // if (
      //   commentRef.current &&
      //   !commentRef.current.contains(event.target as Node)
      // ) {
      //   setIsFocused(false);
      // } else {
      //   setIsFocused(true);
      // }

      setIsFocused(
        !(
          commentRef.current &&
          !commentRef.current.contains(event.target as Node)
        )
      );
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [commentRef]);

  // useEffect(() => {
  // if (!!text || !!value) {
  //   setIsFocused(true);
  //   setFocus(true);
  // }
  // }, [text, value]);

  // useEffect(() => {
  //   if (!isFocused) {
  //     if (!!value) {
  //       setIsFocused(true);
  //     } else {
  //       setIsFocused(false);
  //     }
  //   }
  // }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e.target.value?.trimStart());
    }
    // setText(e.target.value);
    // setIsFocused(true);
  };

  const handleFocus = () => {
    onFocus && onFocus();
    setIsFocused(true);
  };

  // const handleBlur = () => {
  // setFocused(false);
  // if (!text && !value) {
  //   setIsFocused(false);
  // }
  // };

  const handleCancelClick = () => {
    if (onCancel) {
      onCancel();
    }
    // if (onChange) {
    //   onChange("");
    // }
    // setText("");
    setIsFocused(false);
  };

  const handleSubmitClick = () => {
    if (onSubmit) {
      onSubmit(textAreaRef.current?.value ?? "");
    }
    // if (onChange) {
    //   onChange("");
    // }
    // setText("");
    setIsFocused(false);
  };

  return (
    <>
      <S.Wrapper
        ref={commentRef}
        id={id}
        isFocused={isFocused ?? false}
        isInvalid={invalid}
        isLoading={isLoading}
        hightlighted={editMod}
      >
        <S.TextArea
          ref={textAreaRef}
          as={motion.textarea}
          animate={{ marginBottom: !noMenu && isFocused ? 40 : 0 }}
          value={value}
          onChange={handleTextChange}
          onFocus={handleFocus}
          // onBlur={handleBlur}
          placeholder={placeholder}
          style={{ height: height || 80 }}
          maxLength={maxLength}
          disabled={isLoading}
        />
        <AnimatePresence>
          {!noMenu && isFocused && (
            <S.ActionWrapper
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-100%", opacity: 0 }}
            >
              <Button
                btnSize={Sizes.xs}
                variant="blank"
                style={{
                  color: menuDisabled
                    ? theme.colors.text.disabled
                    : theme.colors.text.soft,
                  padding: "7px 8px",
                }}
                onClick={handleCancelClick}
                disabled={menuDisabled}
              >
                {t("cancel")}
              </Button>
              <Button
                btnSize={Sizes.xs}
                variant="blank"
                style={{ padding: "7px 8px" }}
                onClick={handleSubmitClick}
                disabled={menuDisabled}
              >
                {editMod ? t("editing") : t("save")}
              </Button>
            </S.ActionWrapper>
          )}
        </AnimatePresence>
      </S.Wrapper>
      {invalid ? <S.ErrorMessage>{errorMessage ?? ""}</S.ErrorMessage> : null}
    </>
  );
};

export default Comment;
