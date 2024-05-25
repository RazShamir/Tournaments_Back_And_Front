import React, {useCallback, useContext, useEffect, useMemo, useState} from "react";
import {useLocation, useParams} from "react-router-dom";
import ViewTournamentStructure from "../ViewTournaments/ViewTournamentStructure";
import {Context} from "../Context/Context";
import {useOrganizationTournaments} from "../Hooks";
import axios from "axios";


const OrgTournamentsPage = () => {

    const { mode} = useParams()
    const { state : authState } = useContext(Context)
    const { tournaments} = useOrganizationTournaments(authState?.userDetails?.organization?.id, mode)


    const [completedTournaments, setCompletedTournaments] = useState([])
    const [ongoingTournaments, setOngoingTournaments] = useState([])

    const location = useLocation()


    const isMostRelevant = useMemo(() => {
        return location.pathname.toLowerCase() === '/org/admin/tournaments/all' || location.pathname === '/org/admin/tournaments/all/'
    },[location])

    const isCompleted = useMemo(() => {
        return location.pathname.toLowerCase() === '/org/admin/tournaments/completed'
    },[location])

    const isOngoing = useMemo(() => {
        return location.pathname.toLowerCase() === '/org/admin/tournaments/ongoing'
    },[location])
    useEffect(() => {
        let tours = tournaments
        if(isMostRelevant) {
            setCompletedTournaments(tournaments.filter(tournament => tournament.end_time && !tournament.is_ongoing))
            tours = tournaments.filter(tournament => !tournament.end_time)
        }
        setOngoingTournaments(tours)
    }, [tournaments,isMostRelevant]);


    const TournamentTable = useCallback(({tournaments, completedTable}) => {
        return  <table className={'tournaments-table'} cellPadding={0} cellSpacing={0}>
            <thead>
            <tr className={'tournaments-header-row'}>
                <th key="tournamentName">Name</th>
                <th key="type">Type</th>
                <th key="start_time">Start Time</th>
                <th key="organization">Organization</th>
                <th key="players">Players</th>
                {(!completedTable && !isCompleted && !isOngoing) && <th key="registrasion">Registrasion</th>}
                {(completedTable || isCompleted) && <th key="winner">Winner</th>}
            </tr>
            </thead>
            <tbody>
            {React.Children.toArray( tournaments.map((tournament,index) => <ViewTournamentStructure {...tournament}
                                                                                                    ongoing_page={isOngoing}
                                                                                                    completed={isCompleted || completedTable || tournament.end_time}
                                                                                                    index={index}/>))}
            </tbody>
        </table>
    },[])

    if(authState.userDetails === undefined) return null
    if(!authState.userDetails) {
        return <div>Not authorized</div>
    }



    return ( <div>

    <br/>

        {isMostRelevant && <h2>Upcoming Tournaments</h2>}
        <TournamentTable tournaments = {ongoingTournaments}/>
        {isMostRelevant &&<>
            <br/>
            <h2>Completed Tournaments</h2>
            <TournamentTable tournaments={completedTournaments} completedTable/>
        </>}
    </div>)

}
export default OrgTournamentsPage