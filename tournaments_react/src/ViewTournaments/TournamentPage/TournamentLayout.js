import {Outlet, Link, useLocation, Navigate} from "react-router-dom";
import { useParams } from "react-router-dom";
import '../tournaments.css'
import {useCallback, useContext, useEffect, useState} from "react";
import {InfinitySpin} from "react-loader-spinner";
import {getTournament} from "../../Network/services";
import {useRegistrationStatus, useUserRegistrations} from "../../Hooks";
import {Context} from "../../Context/Context";

const TournamentLayout = () => {
    const { Tid} = useParams()
    const location = useLocation()
    const { state : authState } = useContext(Context)
    const [tournament,setTournament] = useState()
    const registrationsContext = useUserRegistrations(authState) // registrations of the current user
    const {registration_status,checkIn} = useRegistrationStatus(Tid,authState,registrationsContext) // also only for current user

    useEffect(() => {
        if(!Tid || tournament)  return
        getTournament(Tid,setTournament, () => setTournament(null))
    }, [authState, location])


    const AdminButton = useCallback(() => {
        if( authState.userDetails && tournament && authState.userDetails.organization &&
            authState.userDetails.organization.id === tournament.organization) {
            return  <Link className={location.pathname.includes('admin') ?  'selected-link'  : 'link'} to={"/Tournament/" + Tid + "/admin"}>admin</Link>
        }
        return null
    },[tournament, authState, location])

    const showRegistrationButton = () => {
        let show = !location.pathname.includes("register") && !location.pathname.includes("admin") && (tournament && !tournament.is_ongoing)
        show = show && (registration_status && !registration_status.registered) && (!tournament.end_time)
        return show
    }
    const showCheckInButton = () => {
       return (registration_status && registration_status.registered && !registration_status.checked_in)
    }

    const TournamentOngoingButtons = useCallback(() => {
        if(!tournament) return null
        if(!tournament.is_ongoing && !tournament.end_time) return null

        return <>
            <Link className={location.pathname.includes('pairings') ?  'selected-link'  : 'link'} to={"/Tournament/" + Tid + "/pairings"}>Pairings</Link>
            <Link className={location.pathname.includes('standings') ?  'selected-link'  : 'link'} to={"/Tournament/" + Tid + "/standings"}>Standings</Link>
        </>
    },[tournament,location])

    const TournamentUpcomingButtons = useCallback(() => {
        if(!tournament) return null
        if(tournament.is_ongoing || tournament.end_time) return null

        return <>
            <Link className={location.pathname.includes('registrations') ?  'selected-link'  : 'link'} to={"/Tournament/" + Tid + "/registrations"}>Registrations</Link>
        </>
    })

    const isLoading = () => {

        return  tournament === undefined
            || registration_status === undefined
            || registrationsContext.registrations === undefined
    }


    return (
        <>

            <nav className='tournaments-select'>
                        <Link className={location.pathname.includes('details') ?  'selected-link'  : 'link'} to={"/Tournament/" + Tid + "/details"}>details</Link>
                        {!tournament?.end_time&& <Link className={location.pathname.includes('schedual') ?  'selected-link'  : 'link'} to={"/Tournament/" + Tid + "/schedual"}>schedule</Link>}
                        <TournamentOngoingButtons/>
                        <TournamentUpcomingButtons/>
                        <AdminButton/>
            </nav>
            {showRegistrationButton() ? <div className={'register-link'}>
                <span>Registrations are open!</span>
                <Link to={"/Tournament/" + Tid + "/register"}>Registration</Link>
            </div> : showCheckInButton() ? <div className={'register-link'}>
                <span>You are registered to this tournament!</span>
                <a onClick={checkIn} style={{cursor:'pointer'}}>Check-in</a>
            </div> : null}

            <div className="App">
                <header className="App-header">
                    <div> {isLoading() ? <div style={{minHeight:'100%', display:'grid',placeItems:'center'}}>
                        <InfinitySpin
                            width='200'
                            color="#ffffff"
                        />
                    </div> : tournament === null ? <Navigate to={"/not-found"}/>  : <Outlet context={{tournament,setTournament, registration_status,registrationsContext}} />} </div>
                </header>
            </div>
        </>
    )
}

export default TournamentLayout