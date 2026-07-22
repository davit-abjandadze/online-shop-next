import Button from "@/components/ui/Button";
import { H2, H6, H7, P4 } from "@/components/ui/Text";
import routePathings from "@/routePathings";
import useTranslation from "next-translate/useTranslation";
import Link from "next/link";
import Script from "next/script";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Container } from "react-grid-system";
import Hidden from "../Hidden";
import * as S from "./style";
import setLanguage from "next-translate/setLanguage";
import { Sizes } from "@/components/pages/real-estate-application/shared/data/enums";
import ToOldSSLink from "../ToOldSSLink";
import { OLD_BASEPATH } from "@/constants";

const Footer = () => {
  const { t, lang } = useTranslation("common");

  const router = useRouter();
  const isThisPage = router.pathname === "/real-estate/[slug]";

  const handleChangeLang = (lang: string) => {
    setLanguage(lang).then(() => {
      window.location.reload();
    });
  };

  return (
    <>
      <S.Footer isDetails={isThisPage}>
        <S.Container>
          <S.Wrapper>
            <Hidden lg xl xxl xxxl>
              <S.Main>
                <S.SubMain>
                  <S.LangMenu>
                    <span>{t("languages")}</span>
                    <div>
                      <S.LangLink
                        isActive={lang === "ka"}
                        variant="secondary"
                        rounded
                        btnSize={Sizes.sm}
                        square
                        onClick={() => handleChangeLang("ka")}
                      >
                        <img src="/icons/georgia.svg" />
                      </S.LangLink>
                      <S.LangLink
                        isActive={lang === "en"}
                        variant="secondary"
                        rounded
                        btnSize={Sizes.sm}
                        square
                        onClick={() => handleChangeLang("en")}
                      >
                        <img src="/icons/england.svg" />
                      </S.LangLink>
                      <S.LangLink
                        isActive={lang === "ru"}
                        variant="secondary"
                        rounded
                        btnSize={Sizes.sm}
                        square
                        onClick={() => handleChangeLang("ru")}
                      >
                        <img src="/icons/russia.svg" />
                      </S.LangLink>
                    </div>
                  </S.LangMenu>
                  <S.SideBlockSubMenu>
                    <Link
                      href="https://adline.ge/advertisements/internet?filter%5Bid%5D=4&filter%5Bstart_age%5D=&filter%5Bend_age%5D=&filter%5Bsex%5D=&filter%5Binterest%5D=&filter%5Bregions%5D="
                      target="_blank"
                    >
                      <H7 as="span" caps>
                        {t("ad")}
                      </H7>
                    </Link>
                    <Link href={`${OLD_BASEPATH}/${lang}/home/help`}>
                      <H7 as="span" caps>
                        {t("help")}
                      </H7>
                    </Link>
                  </S.SideBlockSubMenu>
                </S.SubMain>
                <Link href={`/${lang}/privacy-policy`}>
                  {t("privacy-policy")}
                </Link>

                <S.SubMain>
                  <S.BottomMenu>
                    <S.Owner
                      href="https://lemondo.ge"
                      hoverImage="/icons/lemondo-business-monochrome-hover.svg"
                      target="_blank"
                    >
                      <img src="/icons/lemondo-business-monochrome.svg" />
                    </S.Owner>
                    <S.Owner
                      href="http://palitra.ge"
                      hoverImage="/icons/palitramedia-monochrome-hover.svg"
                      target="_blank"
                    >
                      <img src="/icons/palitramedia-monochrome.svg" />
                    </S.Owner>
                  </S.BottomMenu>
                  <S.HotLine>
                    <span>{t("hotline")}</span>
                    <strong>
                      <a href="tel:0322121661">0322121661</a>
                    </strong>
                  </S.HotLine>
                </S.SubMain>
              </S.Main>
              <S.Bottom>
                <P4>© SS.ge {t("all-rights-reserved")}</P4>
                <S.TopGEPlaceholder />
              </S.Bottom>
            </Hidden>
            <Hidden xs sm md>
              <S.Main>
                <S.List>
                  <H2 as="span" caps>
                    {t("for-sale")}
                  </H2>
                  <S.ListBlock>
                    <Link
                      href={`/${routePathings[lang]["real-estate"]}/l/${routePathings[lang]["real-estate-type"][5]}/${routePathings[lang]["real-estate-deal-type"][4]}?rooms=1`}
                      as={`/${routePathings[lang]["real-estate"]}/l/${routePathings[lang]["real-estate-type"][5]}/${routePathings[lang]["real-estate-deal-type"][4]}?rooms=1`}
                    >
                      <H2 as="span">{t("1-room-appartment-for-sale")}</H2>
                    </Link>
                    <Link
                      href={`/${routePathings[lang]["real-estate"]}/l/${routePathings[lang]["real-estate-type"][5]}/${routePathings[lang]["real-estate-deal-type"][4]}?rooms=2`}
                      as={`/${routePathings[lang]["real-estate"]}/l/${routePathings[lang]["real-estate-type"][5]}/${routePathings[lang]["real-estate-deal-type"][4]}?rooms=2`}
                    >
                      <H2 as="span">{t("2-room-appartment-for-sale")}</H2>
                    </Link>
                    <Link
                      href={`/${routePathings[lang]["real-estate"]}/l/${routePathings[lang]["real-estate-type"][5]}/${routePathings[lang]["real-estate-deal-type"][4]}?rooms=3`}
                      as={`/${routePathings[lang]["real-estate"]}/l/${routePathings[lang]["real-estate-type"][5]}/${routePathings[lang]["real-estate-deal-type"][4]}?rooms=3`}
                    >
                      <H2 as="span">{t("3-room-appartment-for-sale")}</H2>
                    </Link>
                    <Link
                      href={`/${routePathings[lang]["real-estate"]}/l/${routePathings[lang]["real-estate-type"][5]}/${routePathings[lang]["real-estate-deal-type"][4]}?rooms=4`}
                      as={`/${routePathings[lang]["real-estate"]}/l/${routePathings[lang]["real-estate-type"][5]}/${routePathings[lang]["real-estate-deal-type"][4]}?rooms=4`}
                    >
                      <H2 as="span">{t("4-room-appartment-for-sale")}</H2>
                    </Link>
                    <Link
                      href={`/${routePathings[lang]["real-estate"]}/l/${routePathings[lang]["real-estate-type"][4]}/${routePathings[lang]["real-estate-deal-type"][4]}`}
                      as={`/${routePathings[lang]["real-estate"]}/l/${routePathings[lang]["real-estate-type"][4]}/${routePathings[lang]["real-estate-deal-type"][4]}`}
                    >
                      <H2 as="span">{t("private-house-for-sale")}</H2>
                    </Link>
                    <Link
                      href={`/${routePathings[lang]["real-estate"]}/l/${routePathings[lang]["real-estate-type"][1]}/${routePathings[lang]["real-estate-deal-type"][4]}`}
                      as={`/${routePathings[lang]["real-estate"]}/l/${routePathings[lang]["real-estate-type"][1]}/${routePathings[lang]["real-estate-deal-type"][4]}`}
                    >
                      <H2 as="span">{t("summer-cottage-for-sale")}</H2>
                    </Link>
                    <Link
                      href={`/${routePathings[lang]["real-estate"]}/l/${routePathings[lang]["real-estate-type"][6]}/${routePathings[lang]["real-estate-deal-type"][4]}`}
                      as={`/${routePathings[lang]["real-estate"]}/l/${routePathings[lang]["real-estate-type"][6]}/${routePathings[lang]["real-estate-deal-type"][4]}`}
                    >
                      <H2 as="span">{t("commercial-real-estate-for-sale")}</H2>
                    </Link>
                  </S.ListBlock>
                </S.List>
                <S.List>
                  <H2 as="span" caps>
                    {t("for-rent")}
                  </H2>
                  <S.ListBlock>
                    <Link
                      href={`/${routePathings[lang]["real-estate"]}/l/${routePathings[lang]["real-estate-type"][5]}/${routePathings[lang]["real-estate-deal-type"][1]}?rooms=1`}
                      as={`/${routePathings[lang]["real-estate"]}/l/${routePathings[lang]["real-estate-type"][5]}/${routePathings[lang]["real-estate-deal-type"][1]}?rooms=1`}
                    >
                      <H2 as="span">{t("1-room-appartment-for-rent")}</H2>
                    </Link>
                    <Link
                      href={`/${routePathings[lang]["real-estate"]}/l/${routePathings[lang]["real-estate-type"][5]}/${routePathings[lang]["real-estate-deal-type"][1]}?rooms=2`}
                      as={`/${routePathings[lang]["real-estate"]}/l/${routePathings[lang]["real-estate-type"][5]}/${routePathings[lang]["real-estate-deal-type"][1]}?rooms=2`}
                    >
                      <H2 as="span">{t("2-room-appartment-for-rent")}</H2>
                    </Link>
                    <Link
                      href={`/${routePathings[lang]["real-estate"]}/l/${routePathings[lang]["real-estate-type"][5]}/${routePathings[lang]["real-estate-deal-type"][1]}?rooms=3`}
                      as={`/${routePathings[lang]["real-estate"]}/l/${routePathings[lang]["real-estate-type"][5]}/${routePathings[lang]["real-estate-deal-type"][1]}?rooms=3`}
                    >
                      <H2 as="span">{t("3-room-appartment-for-rent")}</H2>
                    </Link>
                    <Link
                      href={`/${routePathings[lang]["real-estate"]}/l/${routePathings[lang]["real-estate-type"][5]}/${routePathings[lang]["real-estate-deal-type"][1]}?rooms=4`}
                      as={`/${routePathings[lang]["real-estate"]}/l/${routePathings[lang]["real-estate-type"][5]}/${routePathings[lang]["real-estate-deal-type"][1]}?rooms=4`}
                    >
                      <H2 as="span">{t("4-room-appartment-for-rent")}</H2>
                    </Link>
                    <Link
                      href={`/${routePathings[lang]["real-estate"]}/l/${routePathings[lang]["real-estate-type"][4]}/${routePathings[lang]["real-estate-deal-type"][1]}`}
                      as={`/${routePathings[lang]["real-estate"]}/l/${routePathings[lang]["real-estate-type"][4]}/${routePathings[lang]["real-estate-deal-type"][1]}`}
                    >
                      <H2 as="span">{t("private-house-for-rent")}</H2>
                    </Link>
                    <Link
                      href={`/${routePathings[lang]["real-estate"]}/l/${routePathings[lang]["real-estate-type"][1]}/${routePathings[lang]["real-estate-deal-type"][1]}`}
                      as={`/${routePathings[lang]["real-estate"]}/l/${routePathings[lang]["real-estate-type"][1]}/${routePathings[lang]["real-estate-deal-type"][1]}`}
                    >
                      <H2 as="span">{t("summer-cottage-for-rent")}</H2>
                    </Link>
                    <Link
                      href={`/${routePathings[lang]["real-estate"]}/l/${routePathings[lang]["real-estate-type"][6]}/${routePathings[lang]["real-estate-deal-type"][1]}`}
                      as={`/${routePathings[lang]["real-estate"]}/l/${routePathings[lang]["real-estate-type"][6]}/${routePathings[lang]["real-estate-deal-type"][1]}`}
                    >
                      <H2 as="span">{t("commercial-real-estate-for-rent")}</H2>
                    </Link>
                    <Link
                      href={`/${routePathings[lang]["real-estate"]}/l/${routePathings[lang]["real-estate-deal-type"][3]}`}
                      as={`/${routePathings[lang]["real-estate"]}/l/${routePathings[lang]["real-estate-deal-type"][3]}`}
                    >
                      <H2 as="span">{t("for-rent-daily")}</H2>
                    </Link>
                  </S.ListBlock>
                </S.List>
                <S.List>
                  <H2 as="span" caps>
                    {t("appartments")}
                  </H2>
                  <S.ListBlock>
                    <Link
                      href={`/${routePathings[lang]["real-estate"]}/l/${routePathings[lang]["real-estate-type"][5]}?cityIdList=95&subdistrictIds=3`}
                      as={`/${routePathings[lang]["real-estate"]}/l/${routePathings[lang]["real-estate-type"][5]}?cityIdList=95&subdistrictIds=3`}
                    >
                      <H2 as="span">{t("appartments-in-saburtalo")}</H2>
                    </Link>
                    <Link
                      href={`/${routePathings[lang]["real-estate"]}/l/${routePathings[lang]["real-estate-type"][5]}?cityIdList=95&subdistrictIds=47`}
                      as={`/${routePathings[lang]["real-estate"]}/l/${routePathings[lang]["real-estate-type"][5]}?cityIdList=95&subdistrictIds=47`}
                    >
                      <H2 as="span">{t("appartments-in-vake")}</H2>
                    </Link>
                    <Link
                      href={`/${routePathings[lang]["real-estate"]}/l/${routePathings[lang]["real-estate-type"][5]}?cityIdList=95&subdistrictIds=28,45,46,4`}
                      as={`/${routePathings[lang]["real-estate"]}/l/${routePathings[lang]["real-estate-type"][5]}?cityIdList=95&subdistrictIds=28,45,46,4`}
                    >
                      <H2 as="span">{t("appartments-in-dighomi")}</H2>
                    </Link>
                    <Link
                      href={`/${routePathings[lang]["real-estate"]}/l/${routePathings[lang]["real-estate-type"][5]}?cityIdList=95&subdistrictIds=33`}
                      as={`/${routePathings[lang]["real-estate"]}/l/${routePathings[lang]["real-estate-type"][5]}?cityIdList=95&subdistrictIds=33`}
                    >
                      <H2 as="span">{t("appartments-in-gldani")}</H2>
                    </Link>
                    <Link
                      href={`/${routePathings[lang]["real-estate"]}/l/${routePathings[lang]["real-estate-type"][5]}?cityIdList=95&subdistrictIds=9`}
                      as={`/${routePathings[lang]["real-estate"]}/l/${routePathings[lang]["real-estate-type"][5]}?cityIdList=95&subdistrictIds=9`}
                    >
                      <H2 as="span">{t("appartments-in-varketili")}</H2>
                    </Link>
                    <Link
                      href={`/${routePathings[lang]["real-estate"]}/l/${routePathings[lang]["real-estate-type"][5]}?cityIdList=95&subdistrictIds=31`}
                      as={`/${routePathings[lang]["real-estate"]}/l/${routePathings[lang]["real-estate-type"][5]}?cityIdList=95&subdistrictIds=31`}
                    >
                      <H2 as="span">{t("appartments-in-chugureti")}</H2>
                    </Link>
                    <Link
                      href={`/${routePathings[lang]["real-estate"]}/l/${routePathings[lang]["real-estate-type"][5]}?cityIdList=95&subdistrictIds=20,21,22,23,51,52`}
                      as={`/${routePathings[lang]["real-estate"]}/l/${routePathings[lang]["real-estate-type"][5]}?cityIdList=95&subdistrictIds=20,21,22,23,51,52`}
                    >
                      <H2 as="span">{t("appartments-in-old-tbilisi")}</H2>
                    </Link>
                  </S.ListBlock>
                </S.List>
                <S.List>
                  <H6 as="span" caps>
                    {t("useful-links")}
                  </H6>
                  <S.ListBlock>
                    <Link href={`${OLD_BASEPATH}/${lang}/home/help?index=13`}>
                      {t("rules-for-placing-a-post")}
                    </Link>
                    <Link href={`${OLD_BASEPATH}/${lang}/home/help?index=0`}>
                      {t("how-to-place-a-post")}
                    </Link>
                    <Link href={`${OLD_BASEPATH}/${lang}/home/help?index=1`}>
                      {t("how-to-sign-up")}
                    </Link>
                    <Link href={`${OLD_BASEPATH}/${lang}/home/help?index=6`}>
                      {t("how-to-fill-balance")}
                    </Link>
                    <Link href={`${OLD_BASEPATH}/${lang}/home/help?index=2`}>
                      {t("paind-services")}
                    </Link>
                    <Link href={`/privacy-policy`}>{t("privacy-policy")}</Link>
                  </S.ListBlock>
                </S.List>
                <S.SideBlock>
                  <S.SideBlockMain>
                    <S.SideBlockSubMenu>
                      <Link
                        href={`https://adline.ge/advertisements/internet?filter%5Bid%5D=4&filter%5Bstart_age%5D=&filter%5Bend_age%5D=&filter%5Bsex%5D=&filter%5Binterest%5D=&filter%5Bregions%5D=`}
                        target="_blank"
                      >
                        <H6 as="span" caps>
                          {t("ad")}
                        </H6>
                      </Link>
                      <Link href={`${OLD_BASEPATH}/${lang}/home/help`}>
                        <H6 as="span" caps>
                          {t("help")}
                        </H6>
                      </Link>
                    </S.SideBlockSubMenu>
                    <S.HotLine>
                      <span>{t("hotline")}</span>
                      <strong>
                        <a href="tel:0322121661">0322121661</a>
                      </strong>
                    </S.HotLine>
                  </S.SideBlockMain>
                  <S.ButtonGroups>
                    <S.ButtonGroup>
                      <S.LangLink
                        isActive={lang === "ka"}
                        disabled={lang === "ka"}
                        variant="secondary"
                        onClick={() => handleChangeLang("ka")}
                      >
                        <img src="/icons/georgia.svg" />
                      </S.LangLink>
                      <S.LangLink
                        isActive={lang === "en"}
                        disabled={lang === "en"}
                        variant="secondary"
                        onClick={() => handleChangeLang("en")}
                      >
                        <img src="/icons/england.svg" />
                      </S.LangLink>
                      <S.LangLink
                        isActive={lang === "ru"}
                        disabled={lang === "ru"}
                        variant="secondary"
                        onClick={() => handleChangeLang("ru")}
                      >
                        <img src="/icons/russia.svg" />
                      </S.LangLink>
                    </S.ButtonGroup>
                    <S.ButtonGroup>
                      <Link
                        href="https://www.facebook.com/ads.ss.ge/"
                        target="_blank"
                      >
                        <Button square variant="secondary">
                          <img src="/icons/Facebook.svg" />
                        </Button>
                      </Link>
                      <Link
                        href="https://www.instagram.com/home_ss.ge/?hl=en"
                        target="_blank"
                      >
                        <Button square variant="secondary">
                          <img src="/icons/Instagram.svg" />
                        </Button>
                      </Link>
                    </S.ButtonGroup>
                  </S.ButtonGroups>
                </S.SideBlock>
              </S.Main>
              <S.Bottom>
                <S.BottomMenu>
                  <S.Owner
                    href="https://lemondo.ge"
                    hoverImage="/icons/lemondo-business-monochrome-hover.svg"
                    target="_blank"
                  >
                    <img src="/icons/lemondo-business-monochrome.svg" />
                  </S.Owner>
                  <S.Owner
                    href="http://palitra.ge"
                    hoverImage="/icons/palitramedia-monochrome-hover.svg"
                    target="_blank"
                  >
                    <img src="/icons/palitramedia-monochrome.svg" />
                  </S.Owner>
                  <S.TopGEPlaceholder />
                </S.BottomMenu>
                <S.BottomMenu>
                  <P4>
                    <Link href={`${OLD_BASEPATH}/${lang}/home/help?index=13`}>
                      {t("terms-and-conditions")}
                    </Link>
                  </P4>
                  <P4>© SS.ge {t("all-rights-reserved")}</P4>
                </S.BottomMenu>
              </S.Bottom>
            </Hidden>
            {/* TOP.GE ASYNC COUNTER CODE */}
            <div id="top-ge-counter-container" data-site-id="12025"></div>
            <Script async src="/js/counter.js" />
            {/* / END OF TOP.GE COUNTER CODE */}
          </S.Wrapper>
        </S.Container>
      </S.Footer>
      {/* <ToOldSSLink /> */}
    </>
  );
};

export default Footer;
