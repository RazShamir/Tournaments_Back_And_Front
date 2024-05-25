import {Outlet, Link, useLocation} from "react-router-dom";
import './tournaments.css'
import {useContext} from "react";
import {InfinitySpin} from "react-loader-spinner";
import {Context} from "../Context/Context";
import {useUserRegistrations} from "../Hooks";


const TournamentsLayout = () => {
    const location = useLocation()
    const {state:authState} = useContext(Context)
    const  registrationContext = useUserRegistrations(authState)
    return (
        <>
            <nav className='tournaments-select'>
                    <div>
                        <Link className={location.pathname === "/Tournaments/" || location.pathname === "/Tournaments" ? 'selected-link' :  'link'} to="/Tournaments/">Most relevant</Link>
                    </div>
                    <div>
                        <Link className={location.pathname === "/Tournaments/Completed" ? 'selected-link' :  'link'} to="/Tournaments/Completed">Completed</Link>
                    </div>
                    <div>
                        <Link className={location.pathname === "/Tournaments/Upcoming" ? 'selected-link' :  'link'} to="/Tournaments/Upcoming">Upcoming</Link>
                    </div>
                    <div>
                        <Link className={location.pathname === "/Tournaments/Ongoing" ? 'selected-link' :  'link'} to="/Tournaments/Ongoing">Ongoing</Link>
                    </div>
            </nav>

            <div className="App">
                <header className="App-header">
                    <div> {( registrationContext.registrations === undefined) ? <div style={{minHeight:'100%', display:'grid',placeItems:'center'}}>
                        <InfinitySpin
                            width='200'
                            color="#ffffff"
                        />
                    </div>  : <Outlet context={registrationContext} />} </div>
                </header>
            </div>
        </>
    )
}

export default TournamentsLayout;