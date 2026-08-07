import Button from "@/components/ui/Button";
import { H2, H6, H7, P4 } from "@/components/ui/Text";
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
    
      {/* <ToOldSSLink /> */}
    </>
  );
};

export default Footer;
