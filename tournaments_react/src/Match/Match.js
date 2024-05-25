import {Link, Navigate, useOutletContext} from "react-router-dom";
import {useCallback, useContext, useEffect, useMemo, useState} from "react";
import {message} from "antd";
import {getTournament, submitMatchResults} from "../Network/services";
import {Context} from "../Context/Context";
import {useTournamentRoundTime} from "../Hooks";

const IsOneGame = (match) => {
    return match.match_type === 1 || match.match_type === 2
}

const isParticipantOne = (match,currentUserId) => {
    return match.participant_one.user === currentUserId
}
const isParticipantTwo = (match,currentUserId) => {
    return match.participant_two.user === currentUserId
}

const submitResults = async (authState,match,results, onConflict) => {
    const formattedJsonString = JSON.stringify(results).replace(/"([^"]+)":/g, '"$1":');
    const body = {match_result:formattedJsonString}
    const onData = data => {
        if (!data.message) {
            return
        }
        if(data.result === 'conflict') {
            onConflict()
        }
        message.success({
            content: data.message,
            duration: 2
        })
    }
     await submitMatchResults(match.match_id, body, onData, authState.token)
}
export default function Match() {

    const {state:authState} = useContext(Context)
    const {match : contextMatch} = useOutletContext()

    const [match,setMatch] = useState(contextMatch)
    const [tournament,setTournament] = useState(undefined)
    useEffect(() => {
        if(!match || !match.tournament_id || tournament)  return
        getTournament(match.tournament_id,setTournament, () => setTournament(null))
    }, [authState])

    const isNotCurrentUserParticipant = () => {
        return (authState.userDetails.id !== match.participant_one.user && authState.userDetails.id !== match.participant_two.user)
    }
    const opponent = useMemo(() =>  {
        if(!authState.userDetails || !match) return null
        if(isNotCurrentUserParticipant()) return null
        if(authState.userDetails.id === match.participant_one.user)
            return match.participant_two
        return match.participant_one
    },[match, authState])


    const winner = useMemo(() => {
        if(!match?.results || !match || match.status === 2) return null
        const results = JSON.parse(match.match_result)
        if(IsOneGame(match)) {
            if(results.game_one === match.participant_one?.username) {
                return match.participant_one
            }
            return match.participant_two
        } else {
             const winners = {};
             for(let [round,winner] of Object.entries(results)) {
                 winners[winner] = winners[winner] ? (winners[winner] + 1) : 1
             }

             let total_winner = null
             let winnings = 0
            for(let [player,wins] of Object.entries(winnings)) {
                if(wins > winnings)  {
                    total_winner = player;
                    winnings = wins
                }
            }
            if(total_winner === match.participant_one?.username) {
                return match.participant_one
            }
            return match.participant_two
        }
    },[authState, match])

    const [results,setResults] = useState(!match?.match_result ? {} : JSON.parse(match.match_result))
    const [submitted,setSubmitted] = useState(true)

    useEffect(() => {
        if(match) {
            if(match.status !== 2) {
                setResults(JSON.parse(match.match_result))
                setSubmitted(true)
                return
            }

            const submittedAndP1 = match.participant_one_submitted && isParticipantOne(match, authState.userDetails.id)
            const submittedAndP2 = match.participant_two_submitted && isParticipantTwo(match, authState.userDetails.id)

            if(match.match_result) {
                if(submittedAndP1 || submittedAndP2)
                    setResults(JSON.parse(match.match_result))
                else
                    setResults({})
            }

            setSubmitted(
                match.match_result
                && (submittedAndP1 || submittedAndP2)
            )
        }
    },[match])

    const isGameWon = (game) => {
        console.log(results)
        console.log(results && results[game] && results[game] === authState.userDetails?.username)
        return results && results[game] && results[game] === authState.userDetails?.username
    }
    const isGameLost = (game) => {
        return results && results[game] && results[game] === opponent?.username
    }

    const disableGameThree = useMemo(() => {
        const autoWin = isGameWon("game_one") && isGameWon("game_two")
        const autoLose = isGameLost("game_one") && isGameLost("game_two")
        return autoWin || autoLose
    },[results, opponent])


    const isSubmittable = useMemo(() => {
        return  !submitted && (Object.entries(results).length === 3 || disableGameThree ||
            (Object.entries(results).length === 1 && IsOneGame(match) ))
            || (match.rounds.end_at === undefined || match.rounds.end_at === null);
    },[results,submitted])


    const timeLeft = useTournamentRoundTime({tournament,match})

    const isConflict = () => {
        return match.status == 3
    }


    const Games = useCallback(() => {
        if(IsOneGame(match)) { // one game
            const firstGameWon = isGameWon("game_one")
            const firstGameLost = isGameLost("game_one")
            return <div className={'results'}>
                <div className={'game-row'}>
                <div className={'game' + (submitted ? ' no-pointer' : '')}>
                    <h4 className={firstGameWon ? 'header-win' : firstGameLost  ? 'header-lose' : ''}>Game 1</h4>
                    <div className={'indicators'}>
                        <div onClick={() => markGameResult("game_one",true)} className={firstGameWon ? 'selected-result won' : 'selected-result'}>Win</div>
                        <div onClick={() => markGameResult("game_one",false)} className={firstGameLost ? 'selected-result lost' : 'selected-result'}>Lose</div>
                    </div>
                </div>
            </div>
                <div>
                    {isConflict() && <div className={"conflict"}> <b>CONFLICT!</b> Wait for admin intervention </div>  }
                </div>
                <button onClick={ () =>  submitResults(authState, match, results,() => setMatch({...match, status: 3}) )} className={!isSubmittable ? 'disabled-button' : ''} disabled={!isSubmittable}>Submit</button>
            </div>
        } else { // 3 games
            const firstGameWon = isGameWon("game_one")
            const secondGameWon = isGameWon("game_two")
            const thirdGameWon = isGameWon("game_three")

            const firstGameLost = isGameLost("game_one")
            const secondGameLost = isGameLost("game_two")
            const thirdGameLost = isGameLost("game_three")

            return <div className={'results'}>
                <div className={'game-row'}>
                <div className={'game' + (submitted ? ' no-pointer' : '')}>
                    <h4 className={firstGameWon ? 'header-win' : firstGameLost  ? 'header-lose' : ''}>Game 1</h4>
                    <div className={'indicators'}>
                        <div onClick={() => markGameResult("game_one",true)} className={firstGameWon ? 'selected-result won' : 'selected-result'}>Win</div>
                        <div onClick={() => markGameResult("game_one",false)} className={firstGameLost ? 'selected-result lost' : 'selected-result'}>Lose</div>
                    </div>
                </div>
                <div className={'game' + (submitted ? ' no-pointer' : '')}>
                    <h4 className={secondGameWon ? 'header-win' : secondGameLost  ? 'header-lose' : ''}>Game 2</h4>
                    <div className={'indicators'}>
                        <div  onClick={() => markGameResult("game_two",true)} className={secondGameWon ? 'selected-result won' : 'selected-result'}>Win</div>
                        <div  onClick={() => markGameResult("game_two",false)} className={secondGameLost ? 'selected-result lost' : 'selected-result'}>Lose</div>
                    </div>
                </div>
                <div className={'game' +  (disableGameThree ?  " disabled-game no-pointer"  :"") + (submitted ? ' no-pointer' : '')}>
                    <h4 className={thirdGameWon ? 'header-win' : thirdGameLost  ? 'header-lose' : ''}>Game 3</h4>
                    <div className={'indicators'}>
                        <div  onClick={() => markGameResult("game_three",true)} className={thirdGameWon ? 'selected-result won' : 'selected-result'}>Win</div>
                        <div  onClick={() => markGameResult("game_three",false)} className={thirdGameLost ? 'selected-result lost' : 'selected-result'}>Lose</div>
                    </div>
                </div>
            </div>
                <div>
                    {isConflict() && <div className={"conflict"}> <b>CONFLICT!</b> Wait for admin intervention </div>  }
                </div>
                <button onClick={ () =>  submitResults(authState, match, results,() => setMatch({...match, status: 3}))} className={!isSubmittable ? 'disabled-button' : ''} disabled={!isSubmittable}>Submit</button>
            </div>
        }
    },[authState, match, opponent, results, submitted,isSubmittable])


    const markGameResult = (game_name, currentUserWin) => {
        const winner_name = currentUserWin ? authState.userDetails?.username : opponent?.username
        setResults({...results, [game_name]:winner_name  })
    }

    if(!authState.userDetails) return <div>You are not authorized to view this page</div>

    if(isNotCurrentUserParticipant()) {
        if (authState.userDetails.is_staff|| (authState.userDetails.isTournamentAdmin && authState.userDetails.isTournamentAdmin(match.tournament_id))) {
            return <Navigate to={`/admin/match/${match.match_id}`}/>
        }
        return <div>You are not authorized to view this page</div>
    }

    return <div>
        <div className={'match-header match-page-row'}>
            <div className={'opponent-name'}>
                <p>You are playing against <br/><b>{opponent?.username}</b></p>
                <span>Points: {opponent?.player_stats.score}</span>
                <br/>
                <span>{opponent?.player_stats.match_balance.current.wins }-{opponent?.player_stats.match_balance.current.ties }-{opponent?.player_stats.match_balance.current.loses }</span>
            </div>
            <div className={'timer-header'}>
                Timer :
                <div className={'match-timer'}>{timeLeft}</div>
            </div>

            <p>Screen name<br/> <b className={'copy'} onClick={(e)=> {
                // Get the text to copy
                const textToCopy = e.target.textContent;
                // Create a temporary input element to copy the text to the clipboard
                const input = document.createElement('input');
                input.setAttribute('value', textToCopy);
                document.body.appendChild(input);

                // Select and copy the text
                input.select();
                document.execCommand('copy');
                document.body.removeChild(input);

                // Alert the user that the text has been copied
                message.info({content: 'Text copied to clipboard',duration:2});
            }}>{opponent?.game_username}</b></p>
        </div>
        {/* Enter Results */}
        <div className={'match-header match-page-row'}>
            <Games/>
        </div>

        { winner && <div className={'match-header match-page-row'}>
            {opponent.participant_id === winner.participant_id ?
            "You have lost this match" : "You have won this match"}
        </div>}

    </div>
}