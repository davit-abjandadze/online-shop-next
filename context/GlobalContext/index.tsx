import React, { Dispatch } from "react";
import globalReducer from "./reducer";

export type GlobalContextState = {
  locations: GetLocationChainResponse;
  credentialsToken: string;
  preferredCurrency: "usd" | "gel" | undefined;
  hiddenApplications: number[];
  hiddenUsers: string[];
  userProfile: UserProfileModel;
  authOpen: boolean;
  authWithPremiumOpen: boolean;
  listingViewType: "large" | "small";
  hadMembershipInPast: boolean;
  premiumPrice: number;
};

const initialState: GlobalContextState = {
  locations: {},
  credentialsToken: "",
  preferredCurrency: undefined,
  hiddenApplications: [],
  hiddenUsers: [],
  userProfile: {},
  authOpen: false,
  authWithPremiumOpen: false,
  listingViewType: "large",
  hadMembershipInPast: false,
  premiumPrice: 0,
};

const GlobalStateContext = React.createContext(initialState);
const GlobalDispatchContext = React.createContext<
  Dispatch<{ type: string; data?: any }>
>(undefined!);

function GlobalProvider({
  children,
  _initialState,
}: {
  children: JSX.Element;
  _initialState?: GlobalContextState;
}) {
  const [state, dispatch] = React.useReducer(
    globalReducer,
    _initialState ?? initialState
  );
  return (
    <GlobalStateContext.Provider value={state}>
      <GlobalDispatchContext.Provider value={dispatch}>
        {children}
      </GlobalDispatchContext.Provider>
    </GlobalStateContext.Provider>
  );
}

function useGlobalState() {
  const context = React.useContext(GlobalStateContext);
  if (context === undefined) {
    throw new Error("useGlobalState must be used within a GlobalProvider");
  }
  return context;
}
function useGlobalDispatch() {
  const context = React.useContext(GlobalDispatchContext);
  if (context === undefined) {
    throw new Error("useGlobalDispatch must be used within a GlobalProvider");
  }
  return context;
}

export { GlobalProvider, useGlobalState, useGlobalDispatch };
