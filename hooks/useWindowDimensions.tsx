import React, { useState, useEffect } from "react";

const useWindowDimensions = () => {
  const isSSR = typeof window === "undefined";

  const [windowDimensions, setWindowDimensions] = useState({
    width: isSSR ? 0 : window.innerWidth,
    height: isSSR ? 0 : window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowDimensions;
};

export default useWindowDimensions;
