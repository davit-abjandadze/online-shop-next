import { useState, useEffect, useRef } from "react";
import scrollIntoView from "scroll-into-view-if-needed";
import classNames from "classnames";
import * as S from "./style";
import Icon from "../Icon";
import useTranslation from "next-translate/useTranslation";

function CustomComponentSelect({
  options: initialOptions,
  value,
  onChange,
  customOption,
  placeholder = "",
  className = "",
  classNamePrefix = "select",
  withCheck,
  withSearch,
  searchInputPlaceholder,
  maxWidth,
  dropDownLeft,
}: {
  options: { [key: string]: string };
  value?: string | any[];
  onChange: (event: any) => any;
  customOption?: (value: string, label: string) => any;
  placeholder?: string;
  className?: string;
  classNamePrefix?: string;
  withCheck?: "multiple" | "single";
  withSearch?: boolean;
  searchInputPlaceholder?: string;
  maxWidth?: number;
  dropDownLeft?: boolean;
}) {
  const { t } = useTranslation("common");

  const [dropDownOn, setDropDownOn] = useState(false);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState(initialOptions);
  const [selected, setSelected] = useState(
    Array.isArray(value) ? value : [value]
  );
  const [selectedItems, setSelectedItems] = useState(!value ? placeholder : "");
  const [highlightedOption, setHighlightedOption] = useState("");

  const selectRef = useRef<HTMLDivElement>(null);
  const selectButtonRef = useRef<any>(null);

  const handleChange = (value: string) => {
    let newSelected = [...selected];
    selectButtonRef.current?.focus();

    if (withCheck === "single") {
      newSelected = selected[0] !== value ? [value] : [];
      setDropDownOn(false);
    } else if (withCheck === "multiple") {
      if (newSelected.includes(value)) {
        newSelected.splice(newSelected.indexOf(value), 1);
      } else {
        newSelected.push(value);
      }
    } else if (!withCheck) {
      setDropDownOn(false);
      newSelected = [value];
    }

    setSelected(newSelected);

    onChange(
      newSelected.length > 1 || withCheck === "multiple"
        ? newSelected
        : newSelected.length === 0
        ? ""
        : newSelected[0]
    );
  };

  const onBlur = (event: React.FocusEvent) => {
    if (
      event.relatedTarget &&
      !selectRef.current?.contains(event.relatedTarget)
    ) {
      setDropDownOn(false);
    }
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleChange(highlightedOption);
    } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      let value;
      let currentIndex = Object.keys(options).indexOf(highlightedOption);
      let index = currentIndex;
      let lastIndex = Object.keys(options).length - 1;

      if (event.key === "ArrowUp") {
        index = currentIndex - 1;
      } else if (event.key === "ArrowDown") {
        index = currentIndex + 1;
      }

      if (index < 0) {
        index = lastIndex;
      } else if (index > lastIndex) {
        index = 0;
      }

      value = Object.keys(options)[index];

      if (selectRef.current?.querySelector) {
        scrollIntoView(
          selectRef.current?.querySelector(
            `.${classNamePrefix}__menu #${value}`
          ) as Element,
          {
            scrollMode: "if-needed",
            block: "nearest",
            inline: "nearest",
          }
        );
      }
      setHighlightedOption(value);
    }
  };

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setDropDownOn(false);
      }
    };

    document.addEventListener("click", onClickOutside, true);
    return () => {
      document.removeEventListener("click", onClickOutside, true);
    };
  }, []);

  useEffect(() => {
    setSearch("");

    if (dropDownOn && selectRef.current?.querySelector !== undefined) {
      scrollIntoView(
        selectRef.current?.querySelector(
          `.${classNamePrefix}__menu .${classNamePrefix}__menu-item--highlighted`
        ) as Element,
        {
          scrollMode: "if-needed",
          block: "nearest",
          inline: "nearest",
        }
      );
    }
  }, [dropDownOn, classNamePrefix]);

  useEffect(() => {
    setSelectedItems(
      selected.length
        ? selected.map((value) => initialOptions[value]).join(", ")
        : placeholder
    );
  }, [selected, initialOptions, placeholder, withCheck]);

  useEffect(() => {
    let searchResults: { [key: string]: string } = {};

    for (const [value, label] of Object.entries(initialOptions)) {
      if (label.toLowerCase().includes(search.toLowerCase())) {
        searchResults[value] = label;
      }
    }

    setHighlightedOption(Object.keys(searchResults)[0]);
    setOptions(searchResults);
  }, [search, initialOptions]);

  const generateOptions = () => {
    const optionsList = Object.keys(options);
    if (!optionsList.length) {
      return (
        <div className={`${classNamePrefix}__no-res`}>
          <span>{t("nothing-found")}</span>
        </div>
      );
    }

    return optionsList.map((value, index) => {
      const label = options[value];

      return (
        <div
          key={index}
          id={value}
          className={classNames({
            [`${classNamePrefix}__menu-item`]: true,
            [`${classNamePrefix}__menu-item--highlighted`]:
              value === highlightedOption,
            [`${classNamePrefix}__menu-item--selected`]:
              selected.includes(value),
          })}
          onMouseEnter={() => setHighlightedOption(value)}
          onClick={(e) => {
            e.stopPropagation();
            handleChange(value);
          }}
        >
          {customOption ? customOption(value, label) : <span>{label}</span>}
        </div>
      );
    });
  };

  const selectButton = () => (
    <div
      ref={selectButtonRef}
      tabIndex={0}
      className={`${classNamePrefix}__button`}
      onClick={() => setDropDownOn(!dropDownOn)}
      onKeyDown={(event) => {
        if (dropDownOn) {
          onKeyDown(event);
        } else {
          event.key === "Enter" && setDropDownOn(!dropDownOn);
        }
      }}
      onBlur={onBlur}
    >
      <div className={`${classNamePrefix}__value`}>
        <span>{selectedItems || placeholder}</span>
      </div>
      <div className={`${classNamePrefix}__arrow`}>
        <span
          className={`${classNamePrefix}__icon ${classNamePrefix}__icon--arrow-down`}
        >
          <Icon name={dropDownOn ? "expand_less" : "expand_more"} />
        </span>
      </div>
    </div>
  );

  const selectSearch = () => (
    <div className={`${classNamePrefix}__button`}>
      <div className={`${classNamePrefix}__search-block`}>
        <Icon name="search" />
        <input
          ref={selectButtonRef}
          type="text"
          className={`${classNamePrefix}__search`}
          autoFocus
          value={search}
          placeholder={searchInputPlaceholder}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => onKeyDown(event)}
          onFocus={() => setDropDownOn(true)}
          onBlur={onBlur}
        />
      </div>
      <div className={`${classNamePrefix}__arrow`}>
        <button
          className={`${classNamePrefix}__btn`}
          onClick={() => {
            setSelected([]);
            setDropDownOn(false);
          }}
          onKeyDown={(event) => {
            event.key === "Enter" && setSelected([]);
            setDropDownOn(false);
          }}
          onBlur={onBlur}
        >
          <span
            className={`${classNamePrefix}__icon ${classNamePrefix}__icon--clear`}
          >
            <Icon name="close" />
          </span>
        </button>
        <button
          className={`${classNamePrefix}__btn`}
          onClick={() => setDropDownOn(false)}
          onKeyDown={(event) => event.key === "Enter" && setDropDownOn(false)}
          onBlur={onBlur}
        >
          <span
            className={`${classNamePrefix}__icon ${classNamePrefix}__icon--x`}
          >
            <Icon name="expand_less" />
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <S.Select
      ref={selectRef}
      dropDownLeft={Boolean(dropDownLeft)}
      maxWidth={maxWidth ?? 260}
      className={`${classNamePrefix} ${className}`}
    >
      {dropDownOn ? (
        <>
          {withSearch ? selectSearch() : selectButton()}
          <div className={`${classNamePrefix}__menu`}>{generateOptions()}</div>
        </>
      ) : (
        selectButton()
      )}
    </S.Select>
  );
}

export default CustomComponentSelect;
