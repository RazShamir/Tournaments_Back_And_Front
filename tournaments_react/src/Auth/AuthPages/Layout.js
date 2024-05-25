import { Outlet, Link } from "react-router-dom";
import React, { useContext } from "react";
import ResponsiveAppBar from "../../ResponsiveAppBar";
import { Context } from "../../Context/Context";

const Layout = () => {
    const { state: authState } = useContext(Context);
    return (
        <>
            <ResponsiveAppBar authstate={authState}></ResponsiveAppBar>
            <Outlet />
        </>
    )
};

export default Layout;