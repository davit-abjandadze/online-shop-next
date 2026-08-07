import React from "react";
import * as S from "./style";

interface ErrorBoundaryProps {
  children: React.ReactNode;
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
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
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
            <S.Title>რაღაც არასწორად წავიდა</S.Title>
            <S.Text>გვერდზე მოულოდნელი შეცდომა მოხდა. გთხოვთ, სცადოთ გვერდის განახლება.</S.Text>
            <S.Button onClick={this.handleReload}>გვერდის განახლება</S.Button>
          </S.Card>
        </S.Wrapper>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
