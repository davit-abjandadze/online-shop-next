import { useEffect, useState } from "react";

/**
 * Hook to detect if the viewport width is less than 960px
 * SSR-safe: Returns false during server-side rendering and hydration,
 * then updates to the actual value after mount
 * @returns boolean - true if viewport width is less than 960px, false otherwise
 */
export const useIsMobileDevice = (): boolean => {
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    const checkWidth = () => {
      setIsMobileDevice(window.innerWidth < 960);
    };

    // Check initial width
    checkWidth();

    // Add resize listener
    window.addEventListener("resize", checkWidth);

    // Cleanup
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  return isMobileDevice;
};
