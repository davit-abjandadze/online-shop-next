import React, { HTMLAttributes } from "react";

type IconProps = {
  name: string;
  filled?: boolean;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler;
  id?: string;
};

const Icon: React.FC<IconProps> = ({ name, filled, style, onClick, id }) => {
  return (
    <span
      id={id}
      onClick={onClick}
      style={{
        ...style,
        maxWidth: "1em",
        overflow: "hidden",
      }}
      className={`icon-${name}${filled ? "-fill" : ""}`}
    />
  );
};

export default Icon;
