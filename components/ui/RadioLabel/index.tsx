import React from "react";
import * as S from "./style";
import RadioOn from "../../../public/icons/radio-on.svg";
import RadioOff from "../../../public/icons/radio-off.svg";
import { motion } from "framer-motion";

type RadioLabelProps = {
  stretch?: boolean;
  title?: string;
  active?: boolean;
  onClick: React.MouseEventHandler;
  icon?: string;
  iconFilled?: boolean;
  dir?: "left" | "right";
  className?: string;
};

const RadioLabel: React.FC<RadioLabelProps> = ({
  onClick,
  active,
  title,
  stretch,
  icon,
  iconFilled = false,
  dir = "left",
  className,
}) => {
  return (
    <S.Wrapper
      onClick={onClick}
      dir={dir}
      active={active}
      stretch={stretch}
      className={className}
    >
      {active ? (
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.7, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <RadioOn />
        </motion.div>
      ) : (
        <RadioOff />
      )}
      <span>{title}</span>
      {icon && <span className={`icon-${icon}${iconFilled ? "-fill" : ""}`} />}
    </S.Wrapper>
  );
};

export default RadioLabel;
