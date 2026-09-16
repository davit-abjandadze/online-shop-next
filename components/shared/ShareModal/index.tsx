import React from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import useTranslation from "next-translate/useTranslation";
import { CloseIcon, CopyIcon, FacebookIcon, MapPinIcon, MessengerIcon, TagIcon } from "@/components/ui/RefIcons";
import { useIsMobileDevice } from "@/hooks/useIsMobileDevice";
import MobilePopup from "@/components/ui/MobilePopup";
import * as S from "./style";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
  price?: string;
  imageSrc?: string;
  description?: string;
  address?: string;
}

// გვერდის/ბარათის "გაზიარების" პოპაპი — პროდუქტის მინი-პრევიუ (სურათი, ფასი,
// აღწერა, მისამართი) და სამი მოქმედება: ბმულის კოპირება, Facebook-ზე და
// Messenger-ში გაზიარება. AuthModal-ის overlay/MobilePopup შაბლონის მიბაძვით.
export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  url,
  title,
  price,
  imageSrc,
  description,
  address,
}) => {
  const { t } = useTranslation("common");
  const isMobile = useIsMobileDevice();

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(`${t("share-copy-success")}`);
    } catch {
      // clipboard API მიუწვდომელია (მაგ. http/ძველი ბრაუზერი) — ჩუმად ვტოვებთ
    }
  };

  const handleFacebookShare = () => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer,width=600,height=600");
  };

  const handleMessengerShare = () => {
    const fbAppId = process.env.NEXT_PUBLIC_FB_APP_ID;
    const encodedUrl = encodeURIComponent(url);
    if (fbAppId) {
      const shareUrl = `https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=${fbAppId}&redirect_uri=${encodedUrl}`;
      window.open(shareUrl, "_blank", "noopener,noreferrer,width=600,height=600");
      return;
    }
    // FB App ID არაა კონფიგურირებული — მობილურზე პირდაპირ Messenger აპის გახსნას ვცდით
    window.location.href = `fb-messenger://share/?link=${encodedUrl}`;
  };

  const content = (
    <>
      <S.ModalHeader>
        <S.Title>{t("share-modal-title")}</S.Title>
        <S.CloseButton onClick={onClose} aria-label={t("share-close-aria")}>
          <CloseIcon size={16} />
        </S.CloseButton>
      </S.ModalHeader>

      <S.Preview>
        <S.PreviewImageWrap>
          {imageSrc ? <img src={imageSrc} alt={title} /> : <TagIcon size={28} />}
        </S.PreviewImageWrap>
        <S.PreviewInfo>
          {price && <S.PreviewPrice>{price}</S.PreviewPrice>}
          {description && <S.PreviewDescription>{description}</S.PreviewDescription>}
          {address && (
            <S.PreviewAddress>
              <MapPinIcon size={12} color="currentColor" /> {address}
            </S.PreviewAddress>
          )}
        </S.PreviewInfo>
      </S.Preview>

      <S.Actions>
        <S.ActionButton type="button" onClick={handleCopyLink}>
          <S.ActionIconWrap>
            <CopyIcon size={20} />
          </S.ActionIconWrap>
          {t("share-copy-link")}
        </S.ActionButton>
        <S.ActionButton type="button" onClick={handleFacebookShare}>
          <S.ActionIconWrap>
            <FacebookIcon size={26} />
          </S.ActionIconWrap>
          {t("share-facebook")}
        </S.ActionButton>
        <S.ActionButton type="button" onClick={handleMessengerShare}>
          <S.ActionIconWrap>
            <MessengerIcon size={26} />
          </S.ActionIconWrap>
          {t("share-messenger")}
        </S.ActionButton>
      </S.Actions>
    </>
  );

  // document.body-ში portal-ით ვრენდერავთ — წინააღმდეგ შემთხვევაში, თუ ღილაკი
  // slider-ის/carousel-ის შიგნიდან იხსნება (მაგ. CSS transform-ზე დაფუძნებული
  // slide ანიმაცია მშობელზე), `position: fixed` overlay ekranis nacvlad
  // ტრანსფორმირებული წინაპრის კონტეინერით შემოიფარგლება.
  if (typeof document === "undefined") return null;

  if (isMobile) {
    return createPortal(
      <MobilePopup onClose={onClose} overflowScroll>
        {content}
      </MobilePopup>,
      document.body
    );
  }

  return createPortal(
    <S.Overlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <S.ModalContainer onClick={(e) => e.stopPropagation()}>{content}</S.ModalContainer>
    </S.Overlay>,
    document.body
  );
};

export default ShareModal;
