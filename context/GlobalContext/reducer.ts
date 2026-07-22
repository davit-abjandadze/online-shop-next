import { setCookie } from "cookies-next";
import { GlobalContextState } from "./";
import {
  REMOVE_HIDDEN_APPLICATION,
  REMOVE_HIDDEN_USERS,
  SET_AUTH_OPEN,
  SET_HIDDEN_APPLICATION,
  SET_HIDDEN_USERS,
  SET_LOCATIONS,
  SET_PREFERRED_CURRENCY,
  SET_USER_PROFILE,
  SET_LISTING_VIEW_TYPE,
  SET_AUTH_WITH_PREMIUM_OPEN,
  SET_HAD_MEMBERSHIP_IN_PAST,
} from "./actionTypes";

type GlobalActionProps = {
  type: string;
  data?: any;
};

export default function locationReducer(
  state: GlobalContextState,
  action: GlobalActionProps
): GlobalContextState {
  switch (action.type) {
    case SET_LOCATIONS: {
      const stateToReturn = { ...state, locations: action.data };
      return stateToReturn;
    }
    case SET_PREFERRED_CURRENCY: {
      const stateToReturn = { ...state, preferredCurrency: action.data };
      setCookie("preferred-currency", action.data, {
        path: "/",
      });
      return stateToReturn;
    }
    case SET_HIDDEN_APPLICATION: {
      const stateToReturn = {
        ...state,
        hiddenApplications: [...state.hiddenApplications, action.data],
      };
      setCookie(
        "hidden-applications",
        JSON.stringify(stateToReturn.hiddenApplications),
        {
          path: "/",
        }
      );
      return stateToReturn;
    }
    case REMOVE_HIDDEN_APPLICATION: {
      const stateToReturn = {
        ...state,
        hiddenApplications: state.hiddenApplications.filter(
          (x) => x != action.data
        ),
      };
      setCookie(
        "hidden-applications",
        JSON.stringify(stateToReturn.hiddenApplications),
        {
          path: "/",
        }
      );
      return stateToReturn;
    }
    case SET_HIDDEN_USERS: {
      const stateToReturn = {
        ...state,
        hiddenUsers: [...state.hiddenUsers, action.data],
      };
      setCookie("hidden-users", JSON.stringify(stateToReturn.hiddenUsers), {
        path: "/",
      });
      return stateToReturn;
    }
    case REMOVE_HIDDEN_USERS: {
      const stateToReturn = {
        ...state,
        hiddenUsers: state.hiddenUsers.filter((x) => x != action.data),
      };
      setCookie("hidden-users", JSON.stringify(stateToReturn.hiddenUsers), {
        path: "/",
      });

      return stateToReturn;
    }
    case SET_AUTH_OPEN: {
      const stateToReturn = { ...state, authOpen: action.data };
      return stateToReturn;
    }
    case SET_AUTH_WITH_PREMIUM_OPEN: {
      const stateToReturn = { ...state, authWithPremiumOpen: action.data };
      return stateToReturn;
    }
    case SET_USER_PROFILE: {
      const stateToReturn = { ...state, userProfile: action.data };
      return stateToReturn;
    }
    case SET_LISTING_VIEW_TYPE: {
      const stateToReturn = { ...state, listingViewType: action.data };
      setCookie("listing-grid", action.data, {
        path: "/",
      });
      return stateToReturn;
    }
    case SET_HAD_MEMBERSHIP_IN_PAST: {
      const stateToReturn = { ...state, hadMembershipInPast: action.data };
      return stateToReturn;
    }
  }
  return state;
}
