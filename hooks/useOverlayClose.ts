import { useCallback, useRef } from "react";

/**
 * მოდალის overlay-ზე დახურვის ჰენდლერების გენერატორი.
 *
 * პრობლემა: თუ overlay-ს უბრალო `onClick`-ით ვხურავთ, მოდალი დაიხურება მაშინაც,
 * როცა მომხმარებელი ველში ტექსტს ირჩევს (mousedown ველში იწყება) და მაუსს
 * ათრევს overlay-მდე — mouseup/click ხდება overlay-ზე, თუმცა ეს არ არის
 * overlay-ზე დაწკაპუნების განზრახვა. ამიტომ ვხურავთ მხოლოდ მაშინ, თუ ორივე
 * mousedown-იც და click-იც უშუალოდ overlay-ზე მოხდა (არა შვილ ელემენტზე).
 */
export const useOverlayCloseHandlers = () => {
  const mouseDownOnOverlay = useRef(false);

  const getOverlayProps = useCallback(
    (onClose: () => void) => ({
      onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => {
        mouseDownOnOverlay.current = e.target === e.currentTarget;
      },
      onClick: (e: React.MouseEvent<HTMLDivElement>) => {
        if (mouseDownOnOverlay.current && e.target === e.currentTarget) {
          onClose();
        }
        mouseDownOnOverlay.current = false;
      },
    }),
    []
  );

  return { getOverlayProps };
};
