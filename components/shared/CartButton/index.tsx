import React from "react";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";
import { useCart } from "@/context/Cart";
import { CartIcon } from "@/components/ui/RefIcons";
import * as S from "./style";

// Header-ში ჩასასმელი კალათის ხატულა + ჩანართების რაოდენობის ბეჯი.
// "header" namespace-ია, რადგან ეს ღილაკი Header-ში/productDetail-ში ყოველ
// გვერდზეა ჩასმული, header კი i18n.json-ის "*" წესის მიხედვით ყოველთვისაა ჩატვირთული.
export const CartButton: React.FC = () => {
  const { t } = useTranslation("header");
  const router = useRouter();
  const { itemCount } = useCart();

  return (
    <S.Wrapper
      type="button"
      aria-label={t("cart-button-aria-label")}
      title={t("cart-button-aria-label")}
      onClick={() => router.push("/cart")}
    >
      <CartIcon size={20} />
      {itemCount > 0 && <S.Badge>{itemCount > 99 ? "99+" : itemCount}</S.Badge>}
    </S.Wrapper>
  );
};

export default CartButton;
