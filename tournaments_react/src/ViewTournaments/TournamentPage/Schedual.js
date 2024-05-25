import {useCallback, useContext, useMemo} from "react";

import './tournamentpage.css'
import {useOutletContext} from "react-router-dom";
import {useTournamentRounds} from "../../Hooks";
import {Context} from "../../Context/Context";
import {BYE, getSwissRounds} from "../../Constants/utils";



const Schedual = () => {
    const {tournament} = useOutletContext()
    const SchedualHeaders = () => {
        return (
            <tr>
                <th key="phase 2">phase 2</th>
                <th key="top cut">top cut</th>
            </tr>
        )
    }

    const phase1Date = new Date()
    const schedules = [{time:new Date()},{time:new Date()},{time:new Date()},{time:new Date()}]
    const { state: authState } = useContext(Context)
    const rounds = useTournamentRounds(tournament.id, authState)
    const scheduleing = useMemo(() => {
        let no_bye_participants_length = tournament.participants.filter(p => p.username !== BYE).length
        if(no_bye_participants_length  < 4) return null
        const numRounds = getSwissRounds(no_bye_participants_length)
        const [hh, mm, ss] = tournament.round_time_estimate.split(":")
        const [h,m,s] = [parseInt(hh), parseInt(mm), parseInt(ss)]
        const millisAddition = (h * 60 * 60 * 1000) + ( m * 60 * 1000) + (s * 1000)
        return new Array(numRounds).fill(0,0,numRounds).map((_,index) => ({
            start_time: new Date( new Date( tournament.start_time ).getTime() + index * millisAddition)
        }))
    },[tournament])

    const Phase = useCallback(({phase,schedules,date}) =>{
        if(!schedules) return <div className={'center'}>Not enough participants for scheduling</div>
        return <div className={'schedule-table'}>
            <div>
                <h4>phase {phase}</h4>
                <div className={'date-header-schedule'}>
                    {date.toDateString()}
                </div>
            </div>
            <div>
                {schedules.map(({start_time},index) => {
                    return <div className={'schedule-table-row'}>
                        <div className={'details'}>
                            <div className={'num'}>{index + 1}</div>
                            <div>{start_time.toLocaleTimeString()}</div>
                        </div>
                        {index < schedules.length - 1 && <div className={'hr'}/>}
                    </div>
                })}
            </div>
        </div>
    },[])


    return (
        <div className={'phases'}>
            <Phase phase={1} schedules={scheduleing} date={new Date(tournament.start_time)}/>
        </div>
    )
}


export default Schedual