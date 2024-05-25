import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import AdbIcon from '@mui/icons-material/Adb';
import {Link, useNavigate} from "react-router-dom";
import {Children, useCallback, useContext, useReducer} from "react";
import {Context} from "./Context/Context";
import {isOrganizationAdministrator} from "./Context/Reducer";
import {message, Modal} from "antd";
import userProfileIcon from "./icons8-male-user-48.png"
import logoUrl from './pngwing.com.png'
const pages = [{name:'Tournaments', href:'Tournaments'}, {name:'About', href:'About'}];


const settings = [
    {destination: 'Login', authenticated:false},
    {destination:'Signup',authenticated: false},
    {destination:'Dashboard', authenticated:true},
    {destination:'Logout', authenticated:true}
]

function ResponsiveAppBar(props) {


    const { state: authState,dispatch } = useContext(Context);
    const nav = useNavigate()
    const [anchorElNav, setAnchorElNav] = React.useState(null);
    const [anchorElUser, setAnchorElUser] = React.useState(null);
    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    /*
     @TODO: add custom action to menu buttons
      Modal.confirm({
                    content:"Would you like to log out",
                    title:"Log out!",
                    cancelText:"No ! quit",
                    okText:"Yes log out!",
                    onOk:() => { alert("Logged out") }
                })
     */

    const OrganizationButton = useCallback(() =>{
        if(authState.isAuthenticated && authState.userDetails) {
            if(!authState.userDetails.organization && authState.userDetails.is_staff) {
                return  <div  className={'menu-item'} key={"/CreateOrg"} onClick={() => { handleCloseUserMenu(); nav("/org/new");}}>
                    <div  style={{textDecoration: "none", color: "black"}}>{"Create Organization"}</div>
                </div>
            } else if(authState.userDetails.organization) {
                return  <div onClick={() => {   handleCloseUserMenu(); nav("/Org"); }} className={'menu-item'}  key={"/Org"}>
                    <div   style={{textDecoration: "none", color: "black"}}>{authState.userDetails.organization.organization_name}</div>
                </div>
            }
        }
        return null
    },[authState,authState.userDetails])

    const OrganizationAdministrationListButton = useCallback(() => {
        const userDetails = authState.userDetails
        if(!isOrganizationAdministrator(userDetails) || userDetails.administration.length < 2) return null
        return <div className={'menu-item b-bottom'} key={"/CreateOrg"} onClick={() => {
            handleCloseUserMenu();
            let modal = Modal.info({
                title: "My organizations",
                icon:null,
                okText:"Cancel",
                content: <div>
                    <ul className={"list"}>
                        {Children.toArray(userDetails.administration.map(a => <li
                            onClick={() => {
                                if(a.organization.id != userDetails.organization.id) {
                                    dispatch({type: "SET_ORGANIZATION", payload: a.organization} )
                                    modal.destroy()
                                    message.success(`Managing ${a.organization.organization_name}`)
                                } else {
                                    message.info(`Selected organization is already currently selected`)
                                }
                            }}
                        >
                            {a.organization.organization_name}
                        </li>))}
                    </ul>
                </div>
            })
        }}>
            <div style={{textDecoration: "none", color: "orangered",fontWeight:'bold'}}>{"Switch organization"}</div>
        </div>
    },[authState])

    const MenuItems = useCallback(() => {
        return <>
            {[<OrganizationButton key={"orgbtn"}/>,
                <OrganizationAdministrationListButton key={"administration-list-btn"}/>,
                ...settings.map((setting) => {
                    if(setting.authenticated && !authState.isAuthenticated) {
                        return null;
                    } else if(!setting.authenticated && authState.isAuthenticated) {
                        return null;
                    } else {
                        return <div className={'menu-item'} key={setting.destination} onClick={() =>  { handleCloseUserMenu(); nav(setting.destination); }} >
                            <div style={{textDecoration: "none", color: "black"}}>{setting.destination}</div>
                        </div>
                    }
                })]}</>
    },[authState])


    return (<Toolbar disableGutters className={"toolbar"}>

            <div className={"left"}>
                <img onClick={() => nav("/")} src={logoUrl} alt={"LOGO"}/>
                {Children.toArray(pages.map(({name, href}) => <Link style={{textDecoration:'none'}} to={href}>{name}</Link>))}
            </div>

                    <Box sx={{ flexGrow: 0 }} className={"right"}>
                        <Tooltip title="Open settings">
                            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                {authState.userDetails &&<p style={{color:'white', paddingInline:'8px', fontSize:'16px'}}>
                                    {authState.userDetails?.username}
                                </p>}
                                <img src={userProfileIcon} style={{filter: "invert(100%)", width:'40px', height:'40px'}}/>
                            </IconButton>
                        </Tooltip>
                        <Menu
                            sx={{ mt: '45px' }}
                            id="menu-appbar"
                            anchorEl={anchorElUser}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorElUser)}
                            onClose={handleCloseUserMenu}
                        >
                            <MenuItems/>
                        </Menu>

                    </Box>
                </Toolbar>
    );
}
export default ResponsiveAppBar;


