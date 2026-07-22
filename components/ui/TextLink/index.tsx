import React from "react";
import * as S from "./style";

export type StyledTextLink = {
  caps?: boolean;
};

type TextLinkProps = StyledTextLink & {
  target?: "_blank" | "_top" | "_self" | "_parent";
  href?: string;
  content: string;
};

const TextLink: React.FC<TextLinkProps> = ({
  href,
  target,
  content,
  caps = false,
}) => {
  return (
    <S.TextLink href={href} caps={caps} target={target}>
      <strong>{content}</strong>
      <span className="icon-east" />
    </S.TextLink>
  );
};

export default TextLink;
