import React, {useCallback, useEffect, useMemo, useState} from "react"
import axios from 'axios'

import ViewTournamentStructure from "./ViewTournamentStructure";

import './tournaments.css'
import {useLocation} from "react-router-dom";
const URL = "http://127.0.0.1:8000/api/tournaments/"

const ViewTournaments = (props) => {
    const [tournamentArray, setTournamentArray] = useState([])
    const [tournamentsCompleted, setTournamentsCompleted] = useState([])

    const location = useLocation()


    const isMostRelevant = useMemo(() => {
        return location.pathname === '/Tournaments/' || location.pathname === '/Tournaments'
    },[location])

    const isCompleted = useMemo(() => {
       return location.pathname === '/Tournaments/Completed'
    },[location])

    const isOngoing = useMemo(() => {
            return location.pathname === '/Tournaments/Ongoing'
    },[location])

    useEffect(() => {
        const showTournaments = async () => {
            try {
                const response = await axios.get(URL + ( props.mode === 'all' ? '' : props.mode))
                let tournaments = response.data
                if(isMostRelevant) {
                    setTournamentsCompleted(tournaments.filter(tournament => tournament.end_time && !tournament.is_ongoing && tournament.published))
                    tournaments = tournaments.filter(tournament => !tournament.end_time && tournament.published && tournament.round_num === 0)
                }
                setTournamentArray(tournaments)
            } catch(e)   {    }
        }
        showTournaments()
    }, [props.mode])



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




    return (
        <>
            {isMostRelevant && <h2>Upcoming Tournaments</h2>}
            <TournamentTable tournaments = {tournamentArray}/>
            {isMostRelevant &&<>
                <br/>
                <h2>Completed Tournaments</h2>
                <TournamentTable tournaments={tournamentsCompleted} completedTable/>
            </>}
        </>
    )

}

export default ViewTournaments;