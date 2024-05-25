import HistoryNavbar from "../HistoryNavbar/HistoryNavbar";
import {Outlet, useOutletContext, useParams} from "react-router-dom";
import {useContext, useEffect, useState} from "react";
import {Context} from "../Context/Context";
import {getTournamentConflicts} from "../Network/services";

export default function OrganizationTournamentPageLayout() {
    const context = useOutletContext()
    const { Tid} = useParams()
    const { state : authState} = useContext(Context)

    const [tournamentConflicts, setTournamentConflicts] = useState()


    useEffect(() => {
        if(tournamentConflicts || !authState.token || !authState.userDetails.organization
        || !authState.userDetails.isTournamentAdmin(Tid))
            return
        const fetchConflicts = async () => {
            await getTournamentConflicts(Tid, setTournamentConflicts,authState.token)
        }
        fetchConflicts()
    },[authState])

    if(authState.userDetails === undefined) {
        return null
    } else if(authState.userDetails === null) {
        return <div className={"center spaced"}>No Authorization to view this page</div>
    } else if(!authState.userDetails.organization)
        return <div className={"center spaced"}>No Authorization to view this page</div>
    else if(!authState.userDetails.isTournamentAdmin(Tid)) {
        return <div className={"center spaced"}>No Authorization to view this page</div>
    }

    return <>
       <HistoryNavbar/>
       <Outlet context={{...context,tournamentConflicts}}/>
   </>
}