import { RefObject, useEffect, useMemo, useState } from "react";

export default function useOnScreen(ref: RefObject<HTMLElement>) {
  const [isIntersecting, setIntersecting] = useState(false);

  const observer = useMemo(() => {
    if (typeof window === "undefined") return;

    return new IntersectionObserver(([entry]) =>
      setIntersecting(entry.isIntersecting)
    );
  }, [ref]);

  useEffect(() => {
    if (ref.current && observer) {
      observer.observe(ref.current);
      return () => observer.disconnect();
    }
  }, []);

  return isIntersecting;
}
