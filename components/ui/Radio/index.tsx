import { motion } from "framer-motion";
import styled from "styled-components";

type CheckboxProps = {
  checked?: boolean;
  isNegative?: boolean;
  onClick?: React.MouseEventHandler;
};

const Radio: React.FC<CheckboxProps> = ({ checked, isNegative, onClick }) => {
  return <RadioWrapper active={checked} onClick={onClick} />;
};

export default Radio;

const RadioWrapper = styled("div")<{ active?: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 100%;
  transition: all 0.1s;
  border: ${({ theme, active }) =>
    active
      ? `6px solid ${theme.colors.primary}`
      : `2px solid ${theme.colors.base._30}`};
  background: transparent;
  cursor: pointer;
  background: white;
`;
