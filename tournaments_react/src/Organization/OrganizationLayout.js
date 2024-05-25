import {Outlet, Link, useLocation, Navigate, useNavigate} from "react-router-dom";
import './organization.css'
import {useContext} from "react";
import {Context} from "../Context/Context";
const OrganizationLayout = () => {
    const {state} = useContext(Context)

    return (
        <>
            <nav className={'organization-select'}>
                        <Link to="/org/admin/">Tournaments</Link>
                        <Link to="/org/admin/staff">Staff</Link>
            </nav>
            <div className="App">
                <header className="App-header">
                    <Outlet />
                </header>
            </div>
        </>
    )
}

export default OrganizationLayout;