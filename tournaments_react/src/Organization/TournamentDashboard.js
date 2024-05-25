import {useNavigate, useOutletContext} from "react-router-dom";
import {message} from "antd";
import {useCallback, useContext, useEffect, useState} from "react";
import '../Match/match.css'
import {ConflictList, ConflictRow, LinkStyle, StartTournamentRowStyle} from "./styled_components";
import {Context} from "../Context/Context";
import {endTournament, getTournamentMaxRounds, startTournament, startTournamentNextRound} from "../Network/services";

const canStartTournament = (tournament) => {
    // @TODO : decide which properties are required, and constraints for properties
    if(!tournament.details || tournament.details.length < 6)
        return false
    return true
}


const useTournamentMaxRounds = (Tid) => {
    const [maxRounds,setMaxRounds] =  useState(0)
    useEffect(() => {
        getTournamentMaxRounds(Tid,setMaxRounds)
    }, []);
    return maxRounds
}
export default function TournamentDashboard() {
    const { tournament, setTournament, tournamentConflicts} = useOutletContext()
    const { state:authState } = useContext(Context)

    const nav = useNavigate()
    const maxRounds = useTournamentMaxRounds(tournament.id)
    const changeTournamentStatus = useCallback(async () => {
        if(!canStartTournament(tournament)) {
            message.error({content:"Cannot start tournament until all tournament details filled"})
        }
        else {
            // check tournament status
            if(!tournament.is_ongoing)  {
                const onData = data => {
                    if(!data.started) {
                        message.error({ content:"Tournament could not start, not enough participants", duration:2})
                        return false
                    }
                    message.success({
                        content:"Tournament started successfully",
                        duration:2
                    })
                    return true
                }
                const started = await startTournament(tournament.id, onData, authState.token)
                if(started) setTournament({...tournament, is_ongoing:true, round_num:1})
            } else if(tournament.round_num < maxRounds) {
                const onData = data => {
                    if(data.error) {
                        message.error({ content:data.error, duration:2})
                        return false
                    }
                    message.success({
                        content: data.message,
                        duration:2
                    })
                    return true
                }
                await startTournamentNextRound( tournament.id,onData, authState.token)
                setTournament({...tournament, round_num: tournament.round_num + 1})
            } else { // end tournament
                const onData = data => {
                    message.info(data)
                    window.location.reload()
                }
                await endTournament(tournament.id,onData,authState.token)

            }
        }
    },[tournament, authState,maxRounds])

    return <div>
        <div className={'match-header match-page-row'}>
            <StartTournamentRowStyle>
                <span>{tournament.is_ongoing ? "The tournament is started" : tournament.end_time ? (`The tournament has ended at ${new Date(tournament.end_time)}`) :  "The tournament has not started yet"}</span>
                { !tournament.end_time &&  <> <LinkStyle onClick={changeTournamentStatus}>
                    {maxRounds === tournament.round_num ? "End tournament" : tournament.is_ongoing ? "Start next round" : "Start tournament"}
                </LinkStyle>
                {tournament.is_ongoing && <p>Round: {tournament.round_num}</p>}
                </>}
            </StartTournamentRowStyle>

        </div>
        <div className={'match-header match-page-row'}>
            <ConflictList>
            <h4>{tournamentConflicts?.length > 0 ? "Conflicts" : "No Conflicts"}</h4>
            {tournamentConflicts?.map(({match}) => <ConflictRow>
                <span>-</span>
              <span>
                  {match.participant_one.username}
              </span>
                <span>vs</span>
                <span>
                  {match.participant_two.username}
                </span>
                <span className={"resolve"} onClick={() => nav(
                    `/admin/match/${match.match_id}`
                )}>
                    Resolve
                </span>
            </ConflictRow>)}
            </ConflictList>

        </div>

    </div>
}