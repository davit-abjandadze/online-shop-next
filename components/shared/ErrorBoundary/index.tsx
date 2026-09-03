import React from "react";
import useTranslation from "next-translate/useTranslation";
import * as S from "./style";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryInnerProps extends ErrorBoundaryProps {
  // React-ის Error Boundary-ები მხოლოდ class კომპონენტებში მუშაობს, ამიტომ
  // hook-ით მიღებული თარგმანები props-ის სახით გადმოაქვს გარე function
  // კომპონენტს (იხ. ქვემოთ ErrorBoundary).
  title: string;
  text: string;
  buttonText: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * გლობალური Error Boundary — იჭერს render-ტაიმის JS შეცდომებს ნებისმიერ
 * გვერდზე, რათა თეთრი ეკრანის ("white screen of death") ნაცვლად მომხმარებელმა
 * დაინახოს გასაგები შეტყობინება და შეძლოს გვერდის განახლება.
 *
 * React-ის Error Boundary-ები მხოლოდ class კომპონენტებით შეიძლება
 * (getDerivedStateFromError / componentDidCatch ჰუკებად ჯერ არ არსებობს).
 */
class ErrorBoundaryClass extends React.Component<ErrorBoundaryInnerProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryInnerProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("Unhandled render error:", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <S.Wrapper>
          <S.Card>
            <S.Title>{this.props.title}</S.Title>
            <S.Text>{this.props.text}</S.Text>
            <S.Button onClick={this.handleReload}>{this.props.buttonText}</S.Button>
          </S.Card>
        </S.Wrapper>
      );
    }

    return this.props.children;
  }
}

// Hook-ის (useTranslation) გამოსაყენებლად საჭირო function-wrapper —
// თარგმანებს ქვემოთ class კომპონენტს props-ის სახით გადასცემს.
export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children }) => {
  const { t } = useTranslation("common");

  return (
    <ErrorBoundaryClass
      title={t("error-boundary-title")}
      text={t("error-boundary-text")}
      buttonText={t("error-boundary-button")}
    >
      {children}
    </ErrorBoundaryClass>
  );
};

export default ErrorBoundary;
