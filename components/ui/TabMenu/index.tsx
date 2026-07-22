import { useState } from "react";
import * as S from "./style";

type TabNavItemData = {
  id: string;
  content: string;
  scrollSpy?: boolean;
};

type TabNavProps = {
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  tabs: TabNavItemData[];
  scrollSpy?: boolean;
  offset?: number;
  bottomBorder?: boolean;
  lowerCase?: boolean;
};

const TabNav: React.FC<TabNavProps> = ({
  tabs,
  lowerCase,
  activeTab,
  onTabChange,
  scrollSpy = false,
  offset = 0,
  bottomBorder = true,
}) => {
  const [selectedTab, setSelectedTab] = useState(() => {
    return activeTab ? activeTab : tabs[0].id;
  });

  const handleClick = (tabId: string) => {
    setSelectedTab(tabId);
    onTabChange && onTabChange(tabId);
  };

  return (
    <S.TabNav bottomBorder={bottomBorder}>
      {tabs.map((tab, index) =>
        scrollSpy ? (
          <S.SCLink
            key={tab.id}
            activeClass="active"
            to={tab.id}
            spy={true}
            smooth={true}
            offset={offset}
            duration={500}
          >
            <S.TabNavItem key={tab.id} lowerCase isActive={false}>
              {tab.content}
            </S.TabNavItem>
          </S.SCLink>
        ) : (
          <S.TabNavItem
            key={tab.id}
            lowerCase={Boolean(lowerCase)}
            isActive={selectedTab === tab.id}
            onClick={() => handleClick(tab.id)}
          >
            {tab.content}
          </S.TabNavItem>
        )
      )}
    </S.TabNav>
  );
};

export default TabNav;
