import React, { FC, FormEventHandler, PropsWithChildren } from "react";
import * as S from "./style";

type FormProps = {
  onSubmit: FormEventHandler;
  isLoading: boolean;
};

const Form: FC<FormProps & PropsWithChildren> = ({
  children,
  onSubmit,
  isLoading,
}) => {
  return (
    <S.Form onSubmit={onSubmit} isLoading={isLoading}>
      {children}
    </S.Form>
  );
};

export default Form;
