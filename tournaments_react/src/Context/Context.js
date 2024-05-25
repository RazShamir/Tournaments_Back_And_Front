import React from "react";
import Reducer from "./Reducer";

const ContextInitialState = {
    isAuthenticated: !!localStorage.getItem("accessToken"),
    user: localStorage.getItem("username"),
    userDetails: undefined,
    token: localStorage.getItem("accessToken"),
};


export const Context = React.createContext(ContextInitialState);

export const ContextProvider = ({children}) => {
    const [state, dispatch] = React.useReducer(Reducer, ContextInitialState);

    return <Context.Provider
        value={{
            state,
            dispatch
        }}
    >
        {children}
    </Context.Provider>
}

