import styled from "styled-components";
import Icon from "../Icon";
import { transparentize } from "polished";

type CheckboxProps = {
  name: string;
  number: number;
  additionalInformation?: boolean;
  checked?: boolean;
  styles?: React.CSSProperties;
  onClick?: React.MouseEventHandler;
};

const CreateCheckbox: React.FC<CheckboxProps> = ({
  name,
  checked,
  additionalInformation,
  onClick,
  styles
}) => {
  return (
    <>
      {additionalInformation ? (
        <>
          <AdditionalCheckboxWrapper
            className={checked ? "active" : ""}
            onClick={onClick}
            style={styles}
          >
            <p>{name}</p>
            <Icon
              filled={checked}
              name={checked ? "check_circle" : "add_circle"}
            />
          </AdditionalCheckboxWrapper>
        </>
      ) : (
        <>
          <CheckboxWrapper
            className={checked ? "active" : ""}
            onClick={onClick}
          >
            <p>{name}</p>
          </CheckboxWrapper>
        </>
      )}
    </>
  );
};

export default CreateCheckbox;

const CheckboxWrapper = styled("div")`
  height: 44px;
  min-width: 44px;
  width: fit-content;
  border-radius: 48px;
  padding: 0 16px;
  transition: all 0.15s;
  border: 1px solid ${({ theme }) => theme.colors.base._20};
  background-color: ${({ theme }) => theme.colors.base._2};
  flex: unset !important;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  p {
    font-size: 12px;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.text.soft};
    margin: initial;

    @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
      font-size: 14px;
    }
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    height: 48px;
    min-width: 48px;
  }

  &.active {
    background-color: ${({ theme }) => theme.colors.primary};
    border: 1px solid ${({ theme }) => theme.colors.primary};

    p {
      color: white;
    }
  }
`;

const AdditionalCheckboxWrapper = styled(CheckboxWrapper)`
  border-radius: 6px;
  height: 56px;
  width: 100%;
  justify-content: space-between;
  gap: 10px;

  &.active {
    background-color: ${({ theme }) =>
      transparentize(0.9, theme.colors.primary)};

    & > p {
      color: ${({ theme }) => theme.colors.primary};
    }

    & > span {
      color: ${({ theme }) => theme.colors.primary};
    }
  }
  & > p {
    flex-grow: 1;

    min-width: 0;
    overflow: hidden;
  }
  & > span {
    font-size: 24px;
    flex-shrink: 0;
  }
`;
