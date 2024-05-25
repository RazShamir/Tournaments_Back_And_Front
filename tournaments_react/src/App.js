import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import './App.css';
import Layout from './Auth/AuthPages/Layout';
import NoPage from './Auth/AuthPages/NoPage';
import ViewCompletedTournaments from './ViewTournaments/ViewCompletedTournaments';
import ViewOngoingTournaments from './ViewTournaments/ViewOngoingTournaments';
import ViewUpcomingTournaments from './ViewTournaments/ViewUpcomingTournaments';
import TournamentsLayout from './ViewTournaments/TournamentsLayout'
import ViewTournaments from './ViewTournaments/ViewTournaments';
import LoginPage from './Auth/AuthPages/LoginPage';
import SignupPage from './Auth/AuthPages/SignupPage';
import Logout from './Auth/AuthViews/Logout';
import React, {useContext, useEffect} from 'react';
import RegistrationPage from './ViewTournaments/TournamentPage/RegistrationPage';
import TournamentLayout from './ViewTournaments/TournamentPage/TournamentLayout';
import OrganizationTournamentsLayout from './Organization/OrganizationTournamentsLayout';
import OrganizationLayout from './Organization/OrganizationLayout';
import DetailsPage from './ViewTournaments/TournamentPage/DetailsPage';
import SchedualPage from './ViewTournaments/TournamentPage/SchedualPage';
import CreateOrgPage from './Organization/CreateOrgPage';
import OrgMiscPage from './Organization/OrgMiscPage';
import OrgProfilePage from './Organization/OrgProfilePage';
import OrgSeriesPage from './Organization/OrgSeriesPage';
import OrgTournamentsPage from './Organization/OrgTournamentsPage';
import OrgTournamentPage from "./Organization/OrgTournamentPage";
import EditTournamentLayout from "./Organization/EditTournament/EditTournamentLayout";
import EditTournamentGeneral from "./Organization/EditTournament/EditTournametGeneral";
import EditTournamentDesc from "./Organization/EditTournament/EditTournametDesc";
import EditTournamentRegistration from "./Organization/EditTournament/EditTournametRegistration";
import EditTournamentStaff from "./Organization/EditTournament/EditTournametStaff";
import EditTournamentPhases from "./Organization/EditTournament/EditTournametPhases";
import EditTournamentFormat from "./Organization/EditTournament/EditTournametFormat";
import TournamentRegistrations from "./ViewTournaments/TournamentPage/TournamentRegistrations";
import Pairings from "./ViewTournaments/TournamentPage/Pairings";
import Match from "./Match/Match";
import MatchLayout from "./Match/MatchLayout";
import Standings from "./ViewTournaments/TournamentPage/Standings";
import TournamentDashboard from "./Organization/TournamentDashboard";
import OrganizationTournamentPageLayout from "./Organization/OrganizationTournamentPageLayout";
import {Context} from "./Context/Context";
import MatchAdmin from "./Match/MatchAdmin";
import UserDashboard from "./UserDashboard";
import EditParticipants from "./Organization/EditTournament/EditParticipants";
import OrganizationStaff from "./Organization/OrganizationStaff";
import About from "./About/About";



function App(props) {

    const { state: authState,dispatch } = useContext(Context);

    useEffect(() => {
        if(!authState ||  !authState.isAuthenticated || authState.userDetails) return;
        else if(!authState.isAuthenticated) {
            dispatch({type:"SET_USER", payload:null})
        }
        const endpoint = `http://127.0.0.1:8000/api/auth/me`;
        fetch(endpoint,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': "Bearer " + authState.token
                },
            }).then(response => response.json())
            .then(data => {



                dispatch({type:"SET_USER", payload:data})
            })
            .catch(error => console.log(error))
    }, [authState]);

    return (
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Layout/>}>
                        <Route path="About" element={<About/>}/>
                        <Route path="Dashboard" element={<UserDashboard/>}/>
                        <Route index element={<Navigate to ="Tournaments"/>}/>
                        <Route path="Login" element={<LoginPage/>}/>
                        <Route path="Signup" element={<SignupPage/>}/>
                        <Route path="Logout" element={<Logout/>}/>
                        <Route path="org/new" element={<CreateOrgPage/>}/>
                        <Route path="org" element={<OrganizationTournamentsLayout/>}>
                            <Route index element={<OrganizationLayout/>}/>
                            <Route path={"admin/staff"} element={<OrganizationStaff/>}/>
                            <Route path = "admin/Tournaments/:mode">
                                <Route index element={<OrgTournamentsPage/>}/>
                            </Route>
                            <Route path={"admin/Tournaments"} element={<Navigate to="/org/admin/Tournaments/all"/>}/>
                            <Route path="admin/Series" element={<OrgSeriesPage/>}/>
                            <Route path="admin/Profile" element={<OrgProfilePage/>}/>
                            <Route path="admin/Misc." element={<OrgMiscPage/>}/>
                            <Route path={"admin/"} element={<Navigate to="/org/admin/Tournaments/all"/>}/>
                        </Route>
                        <Route path="Tournaments" element={<TournamentsLayout/>}>
                            <Route index element={<ViewTournaments mode=""/>}/>

                            {/* <Route path="Most Relevant" element={<ViewTournaments mode="most relevant" />}></Route> */}
                            <Route path="Completed" element={<ViewCompletedTournaments/>}></Route>
                            <Route path="Upcoming" element={<ViewUpcomingTournaments/>}></Route>
                            <Route path="Ongoing" element={<ViewOngoingTournaments/>}></Route>
                            <Route path="*" element={<NoPage/>}/>
                        </Route>

                        <Route path="match/:Mid" element={<MatchLayout/>}>
                            <Route index element={<Match/>}/>
                        </Route>
                        <Route path="admin/match/:Mid" element={<MatchLayout admin/>}>
                            <Route index element={<MatchAdmin/>}/>
                        </Route>
                        <Route path="Tournament/:Tid" element={<TournamentLayout/>}>
                            <Route path="details" element={<DetailsPage/>}></Route>
                            <Route path={"admin"} element={<OrganizationTournamentPageLayout/>}>
                                <Route index element={<OrgTournamentPage/>}/>
                                <Route path={"dashboard"} element={<TournamentDashboard/>}/>
                                <Route path={"edit-participants"} element={<EditParticipants />}/>
                                <Route path={"edit"} element={<EditTournamentLayout/>}>
                                    <Route path={"general"} element={<EditTournamentGeneral/>}></Route>
                                    <Route path={"desc"} element={<EditTournamentDesc/>}></Route>
                                    <Route path={"registration"} element={<EditTournamentRegistration/>}></Route>
                                    <Route path={"staff"} element={<EditTournamentStaff/>}></Route>
                                    <Route path={"phases"} element={<EditTournamentPhases/>}></Route>
                                    <Route path={"format"} element={<EditTournamentFormat/>}></Route>
                                </Route>
                            </Route>
                            <Route path="schedual" element={<SchedualPage/>}></Route>
                            <Route path="pairings" element={<Pairings/>}></Route>
                            <Route path="standings" element={<Standings/>}></Route>
                            <Route path="register" element={<RegistrationPage/>}></Route>
                            <Route path="registrations" element={<TournamentRegistrations/>}></Route>
                            <Route path="*" element={<NoPage/>}/>
                        </Route>
                        <Route path="*" element={<NoPage/>}/>
                    </Route>
                </Routes>
                <footer className={"footer-about"}>
                    <p>&copy; 2023 Our Tournament Universe</p>
                </footer>
            </BrowserRouter>
    );
}

export default App;
