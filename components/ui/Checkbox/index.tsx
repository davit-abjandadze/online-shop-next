import { motion } from "framer-motion";
import styled from "styled-components";

type CheckboxProps = {
  checked?: boolean;
  isNegative?: boolean;
  onClick?: React.MouseEventHandler;
};

const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  isNegative,
  onClick,
}) => {
  return (
    <CheckboxWrapper active={checked} onClick={onClick}>
      <motion.svg viewBox="0 0 20 20">
        <motion.line
          x1="4"
          y1="10"
          x2="16"
          y2="10"
          strokeLinecap="round"
          strokeWidth={2}
          stroke="#fff"
          initial={{
            x1: checked && !isNegative ? 3 : 4,
            y1: checked && !isNegative ? 10 : 10,
            x2: checked && !isNegative ? 8 : 16,
            y2: checked && !isNegative ? 14 : 10,
            pathLength: checked || isNegative ? 1 : 0,
          }}
          animate={{
            x1: checked && !isNegative ? 3 : 4,
            y1: checked && !isNegative ? 10 : 10,
            x2: checked && !isNegative ? 8 : 16,
            y2: checked && !isNegative ? 14 : 10,
            pathLength: checked || isNegative ? 1 : 0,
            transition: { duration: 0.15 },
          }}
        />
        <motion.line
          x1="17"
          y1="5"
          x2="8"
          y2="14"
          strokeLinecap="round"
          strokeWidth={2}
          stroke="#fff"
          initial={{
            x1: checked && !isNegative ? 17 : 4,
            y1: checked && !isNegative ? 5 : 10,
            x2: checked && !isNegative ? 8 : 16,
            y2: checked && !isNegative ? 14 : 10,
            pathLength: checked && !isNegative ? 1 : 0,
          }}
          animate={{
            x1: checked && !isNegative ? 17 : 4,
            y1: checked && !isNegative ? 5 : 10,
            x2: checked && !isNegative ? 8 : 16,
            y2: checked && !isNegative ? 14 : 10,
            pathLength: checked && !isNegative ? 1 : 0,
            transition: { duration: 0.15 },
          }}
        />
      </motion.svg>
    </CheckboxWrapper>
  );
};

export default Checkbox;

const CheckboxWrapper = styled("div")<{ active?: boolean }>`
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  transition: all 0.15s;
  border: 2px solid
    ${({ theme, active }) =>
      active ? theme.colors.primary : theme.colors.base._30};
  background: ${({ theme, active }) =>
    active ? theme.colors.primary : theme.colors.base._0};
  cursor: pointer;
  > svg {
    width: 100%;
    height: 100%;
  }
`;
