
import './edit-tournament.css'
import {Link, Outlet, useLocation, useOutletContext, useParams} from "react-router-dom";
import {useContext} from "react";
import {InfinitySpin} from "react-loader-spinner";
import HistoryNavbar from "../../HistoryNavbar/HistoryNavbar";
import {Context} from "../../Context/Context";

export default function EditTournamentLayout() {
    const {Tid} = useParams()
    const location = useLocation()
    const {state: authState} = useContext(Context)

    const context = useOutletContext()
    const getElementSubClass = (type) => {
        if(location.pathname.includes(type)) return "selected_edit"
        return ""
    }

    return <div className={'edit-tournament-layout'}>
            <div className={'side-menu-edit-tournament'}>
                <Link className={getElementSubClass("general")} to={`/Tournament/${Tid}/admin/edit/general`}>General</Link>
                <Link className={getElementSubClass("desc")} to={`/Tournament/${Tid}/admin/edit/desc`}>Description</Link>
                <Link className={getElementSubClass("phases")} to={`/Tournament/${Tid}/admin/edit/phases`}>Phases</Link>
                <Link className={getElementSubClass("staff")} to={`/Tournament/${Tid}/admin/edit/staff`}>Staff</Link>
            </div>

            <div> { context.tournament === undefined ? <div style={{minHeight:'100%', display:'grid',placeItems:'center'}}>
                <InfinitySpin
                    width='200'
                    color="#ffffff"
                />
            </div>  : <>
                <HistoryNavbar excluded_path/>
                <Outlet context={context} />
            </>} </div>
    </div>
}