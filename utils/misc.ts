import { HouseProjectDetails } from "@/API_Client/client";
import { Translate } from "next-translate";

export const formatNum = (value?: null | number | string) => {
  if (!value) {
    return null;
  }

  return value.toLocaleString();
};

export const m2 = (value?: null | number | string, t?: Translate) => {
  if (!value) {
    return null;
  }

  return `${formatNum(value)} ${t?.("m2") ?? ""}`;
};

export const getValuePairString = (
  val1?: null | number | string,
  val2?: null | number | string,
) => {
  if (val1 === val2) {
    return `${formatNum(val1)}`;
  } else if (val1 && val2) {
    return `${formatNum(val1)} — ${formatNum(val2)}`;
  } else if (val1) {
    return `${formatNum(val1)}`;
  } else if (val2) {
    return `${formatNum(val2)}`;
  }

  return null;
};

export const generateAboutComplexParameters = (
  data?: HouseProjectDetails,
  t?: Translate,
):
  | {
      showIf: boolean;
      icon: string;
      label: string;
      value: string | null;
    }[]
  | null => {
  if (!data || !t) {
    return null;
  }

  const res = [
    {
      showIf: !!data.apartmentCount,
      icon: "/icons/house/apartments_icon.svg",
      label: t("ApartmentCount"),
      value: formatNum(data.apartmentCount),
    },
    {
      showIf: !!data.blockCount,
      icon: "/icons/house/blocks_icon.svg",
      label: t("BuildingNumber"),
      value: formatNum(data.blockCount),
    },
    {
      showIf: !!data.houseCount,
      icon: "/icons/house/home.svg",
      label: t("HouseCount"),
      value: formatNum(data.houseCount),
    },
    {
      showIf:
        data.plotAreaFrom === data.plotAreaTo
          ? !!data.plotAreaFrom
          : !!(data.plotAreaFrom || data.plotAreaTo),
      icon: "/icons/house/blocks_icon.svg",
      label: t("PlotArea"),
      value: `${getValuePairString(data.plotAreaFrom, data.plotAreaTo)} ${t(
        "m2",
      )}`,
    },
    {
      showIf: !!data.roofType?.length,
      icon: "/icons/house/roof.svg",
      label: t("RoofType"),
      value: data.roofType?.map((id) => t(`RoofType-${id}`)).join(", ") ?? null,
    },
    {
      showIf: !!data.roofingType?.length,
      icon: "/icons/house/roof.svg",
      label: t("RoofingType"),
      value:
        data.roofingType?.map((id) => t(`RoofingType-${id}`)).join(", ") ??
        null,
    },
    {
      showIf: !!data.foundationType?.length,
      icon: "/icons/house/foundation.svg",
      label: t("FoundationType"),
      value:
        data.foundationType
          ?.map((id) => t(`FoundationType-${id}`))
          .join(", ") ?? null,
    },
    {
      showIf:
        data.areaFrom === data.areaTo
          ? !!data.areaFrom && data.areaFrom !== "0"
          : !!(data.areaFrom || data.areaTo),
      icon: "/icons/house/area_icon.svg",
      label: t("Area"),
      value: `${getValuePairString(data.areaFrom, data.areaTo)} ${t("m2")}`,
    },
    {
      showIf: !!data.height,
      icon: "/icons/house/height_icon.svg",
      label: t("Height"),
      value: `${formatNum(data.height)} ${t("m")}`,
    },
    {
      showIf: !!(data.flooringFrom || data.flooringTo),
      icon: "/icons/house/flooring_icon.svg",
      label: t("Flooring"),
      value: getValuePairString(data.flooringFrom, data.flooringTo),
    },
    {
      showIf: !!data.constructionType?.length,
      icon: "/icons/house/construction_icon.svg",
      label: t("ConstructionType"),
      value:
        data.constructionType
          ?.map((id) => t(`ConstructionType-${id}`))
          .join(", ") ?? null,
    },
    {
      showIf: !!data.parkingTypes?.length,
      icon: "/icons/house/parking_icon.svg",
      label: t("ParkingTypes"),
      value:
        data.parkingTypes?.map((id) => t(`ParkingTypes-${id}`)).join(", ") ??
        null,
    },
    {
      showIf: !!data.securityTypes?.length,
      icon: "/icons/house/security_icon.svg",
      label: t("SecurityTypes"),
      value:
        data.securityTypes?.map((id) => t(`SecurityTypes-${id}`)).join(", ") ??
        null,
    },
    {
      showIf: !!data.rooms,
      icon: "/icons/house/area_icon.svg",
      label: t("Rooms"),
      value: formatNum(data.rooms),
    },
    {
      showIf: !!data.deliveryConditionType?.length,
      icon: "/icons/house/building_condition.svg",
      label: t("DeliveryConditionType"),
      value:
        data.deliveryConditionType
          ?.map((id) => t(`DeliveryConditionType-${id}`))
          .join(", ") ?? null,
    },
  ];

  if (
    res?.some((element) => {
      return element.showIf === true;
    })
  ) {
    return res;
  } else {
    return null;
  }
};

export const generateInfrastructureParameters = (
  data?: HouseProjectDetails,
  t?: Translate,
):
  | {
      showIf: boolean;
      icon: string;
      label: string;
      value: string | null;
    }[]
  | null => {
  if (!data || !t) {
    return null;
  }

  const otherInfrastructure = () => {
    if (!data.otherInfrastructures) {
      return [];
    }

    return data.otherInfrastructures.map((val: any, index) => {
      return {
        showIf: true,
        icon: "/icons/house/other_infrastructure.svg",
        label: val.Title,
        value: val.Description,
      };
    });
  };

  const res = [
    {
      showIf: !!data.restaurantTypes?.length,
      icon: "/icons/house/restaurant_icon.svg",
      label: t("RestaurantTypes"),
      value:
        data.restaurantTypes
          ?.map((id) => t(`RestaurantTypes-${id}`))
          .join(", ") ?? null,
    },
    {
      showIf: !!data.swimmingPoolTypes?.length,
      icon: "/icons/house/pool_icon.svg",
      label: t("SwimmingPoolTypes"),
      value:
        data.swimmingPoolTypes
          ?.map((id) => t(`SwimmingPoolTypes-${id}`))
          .join(", ") ?? null,
    },
    {
      showIf: !!data.sportTypes?.length,
      icon: "/icons/house/gym_icon.svg",
      label: t("SportTypes"),
      value:
        data.sportTypes?.map((id) => t(`SportTypes-${id}`)).join(", ") ?? null,
    },
    {
      showIf: !!data.elevatorTypes?.length,
      icon: "/icons/house/paper_icon.svg",
      label: t("ElevatorTypes"),
      value:
        data.elevatorTypes?.map((id) => t(`ElevatorTypes-${id}`)).join(", ") ??
        null,
    },
    {
      showIf: !!data.slagbaumTypes?.length,
      icon: "/icons/house/slagbaum.svg",
      label: t("SlagbaumTypes"),
      value:
        data.slagbaumTypes?.map((id) => t(`SlagbaumTypes-${id}`)).join(", ") ??
        null,
    },
    {
      showIf: !!data.conciergeTypes?.length,
      icon: "/icons/house/ConciergeTypes.svg",
      label: t("ConciergeTypes"),
      value:
        data.conciergeTypes
          ?.map((id) => t(`ConciergeTypes-${id}`))
          .join(", ") ?? null,
    },
    {
      showIf: !!data.playgroundTypes?.length,
      icon: "/icons/house/PlaygroundTypes.svg",
      label: t("PlaygroundTypes"),
      value:
        data.playgroundTypes
          ?.map((id) => t(`PlaygroundTypes-${id}`))
          .join(", ") ?? null,
    },
    ...otherInfrastructure(),
  ];

  if (
    res?.some((element) => {
      return element.showIf === true;
    })
  ) {
    return res;
  } else {
    return null;
  }
};
