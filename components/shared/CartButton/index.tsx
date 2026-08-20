import React from "react";
import { useRouter } from "next/router";
import { useCart } from "@/context/Cart";
import { CartIcon } from "@/components/ui/RefIcons";
import * as S from "./style";

// Header-ში ჩასასმელი კალათის ხატულა + ჩანართების რაოდენობის ბეჯი.
export const CartButton: React.FC = () => {
  const router = useRouter();
  const { itemCount } = useCart();

  return (
    <S.Wrapper type="button" aria-label="კალათა" title="კალათა" onClick={() => router.push("/cart")}>
      <CartIcon size={20} />
      {itemCount > 0 && <S.Badge>{itemCount > 99 ? "99+" : itemCount}</S.Badge>}
    </S.Wrapper>
  );
};

export default CartButton;
