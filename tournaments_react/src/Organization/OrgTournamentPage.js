

import {Outlet, Link, useParams, useOutletContext} from "react-router-dom";
import './organization.css'
import {useContext} from "react";
import {Context} from "../Context/Context";

const OrgTournamentPage = () => {
    const { Tid} = useParams()
    const { state : authState} = useContext(Context)
    const context = useOutletContext()

    if(authState.userDetails === undefined) {
        return null
    } else if(authState.userDetails === null) {
        return <div>No Authorization to view this page</div>
    } else if(!authState.userDetails.organization)
        return <div>No Authorization to view this page</div>
    else if(!authState.userDetails.isTournamentAdmin(Tid)) {
        return <div>No Authorization to view this page</div>
    }


    const hasConflicts = () => context.tournamentConflicts && context.tournamentConflicts.length > 0
    return (
        <>
            <nav className={'organization-select'}>
                    <Link to={`/Tournament/${Tid}/admin/dashboard`}>
                        {hasConflicts() && <span className={"conflicts-indicator"}>
                            {context.tournamentConflicts.length}
                        </span>}
                        Dashboard
                    </Link>
                    <Link to={`/Tournament/${Tid}/admin/edit/general`}>Edit tournament</Link>
                    <div className={"full-row"}>
                        <Link to={`/Tournament/${Tid}/admin/edit-participants`}>Edit participants</Link>
                    </div>
            </nav>
            <div className="App">
                <header className="App-header">
                    <Outlet context={context} />
                </header>
            </div>
        </>
    )
}

export default OrgTournamentPage;