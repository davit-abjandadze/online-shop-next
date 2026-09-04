import styled from "styled-components";

/* Footer-ს განზრახ აქვს ფიქსირებული მუქი ფონი, თემისგან დამოუკიდებელი — ეს
   ბრენდის ვიზუალური "წამყვანი" ელემენტია, არა light/dark რეჟიმზე მორგებადი
   ზედაპირი. ფერები ლოგოს ციან-ლურჯი ნეონისფერი პალიტრიდან: ფონის კიდე #0F1A28
   და ფონის ცენტრი #2A3F55. */
export const FooterWrapper = styled.footer`
  width: 100%;
  background: linear-gradient(160deg, #0f1a28 0%, #2a3f55 140%);
  margin-top: 40px;
`;

export const Container = styled.div`
  max-width: 1320px;
  margin: 0 auto;
  padding: 56px 24px 0;
`;

export const Top = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
  justify-content: space-between;
  padding-bottom: 40px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`;

export const BrandColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 300px;
`;

export const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const BrandBadge = styled.div`
  display: flex;
  align-items: center;

  img {
    height: 40px;
    width: auto;
    object-fit: contain;
    filter: brightness(0) invert(1);
  }
`;

export const BrandSubtitle = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.5);
`;

export const SocialRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 4px;
`;

export const SocialBadge = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
`;

export const LinksGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 32px 48px;
`;

export const LinkColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 13px;
`;

export const LinkColumnTitle = styled.span`
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #ffffff;
  margin-bottom: 6px;
`;

export const FooterLink = styled.a`
  font-size: 13.5px;
  color: rgba(255, 255, 255, 0.55);
  cursor: pointer;
  transition: color 0.15s ease;

  &:hover {
    color: #ffffff;
  }
`;

export const NewsletterText = styled.p`
  margin: 0;
  max-width: 220px;
  font-size: 13px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.5);
`;

export const NewsletterForm = styled.form`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 6px 6px 6px 12px;
  color: rgba(255, 255, 255, 0.5);
  max-width: 260px;
`;

export const NewsletterInput = styled.input`
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: none;
  font-size: 13px;
  color: #ffffff;
  font-family: inherit;

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

export const NewsletterButton = styled.button`
  flex-shrink: 0;
  padding: 8px 14px;
  border: none;
  border-radius: 8px;
  background: var(--ref-primary);
  color: #ffffff;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: var(--ref-primary-hover);
  }
`;

export const Bottom = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 22px 0 26px;
`;

export const Copyright = styled.span`
  font-size: 12.5px;
  color: rgba(255, 255, 255, 0.4);
`;

export const MadeWith = styled.span`
  font-size: 12.5px;
  color: rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  gap: 6px;
`;

