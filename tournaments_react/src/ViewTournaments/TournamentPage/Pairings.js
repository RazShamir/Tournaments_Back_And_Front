


import './tournamentpage.css'
import {Children, useCallback, useContext, useEffect, useState} from "react";
import {Link, useLocation, useNavigate, useOutletContext, useParams} from "react-router-dom";
import {InfinitySpin} from "react-loader-spinner";
import {useQueryParams, useTournamentRounds, useTournamentRoundTime} from "../../Hooks";
import {Context} from "../../Context/Context";

const B01 = (match) =>  {
    return match.match_type === 1 || match.match_type === 2
}

const notFinished = (match_status) => {
    return match_status !== 1
}

const extractLoserWins = (match, player) => {
    if(!match.match_result || B01(match)) return 0
    if(match.match_result["game_one"] === player &&  match.match_result["game_two"] === player)
       return 0
    return 1
}

const extractWinnerWins = (match) => {
    if(B01(match)) return 1
    return 2
}
const ongoingMatchAddition = (match_status) => {
    if(notFinished(match_status)) return 1
    return 0
}
const PairingRow = ({index, match, is_current_user_match,nav }) => {
    const participant_one_winner = match.winner === match.participant_one.username
    const participant_two_winner = match.winner === match.participant_two.username
    const tie = match.tie
    const [
        p_1_win_add,
        p_1_tie_add,
        p_1_lose_add,

        p_2_win_add,
        p_2_tie_add,
        p_2_lose_add
    ] = [
        match.participant_one.player_stats?.match_balance.upcoming.wins,
        match.participant_one.player_stats?.match_balance.upcoming.ties,
        match.participant_one.player_stats?.match_balance.upcoming.loses,

        match.participant_two.player_stats?.match_balance.upcoming.wins,
        match.participant_two.player_stats?.match_balance.upcoming.ties,
        match.participant_two.player_stats?.match_balance.upcoming.loses

    ]
    return <div className={'pairing-row' + (is_current_user_match ? " current_user_match" : "")}>
        <div>{index}<br/> {is_current_user_match && <button
            onClick={() => {
                nav(`/match/${match.match_id}`)
            }}
            className={'view-match-button'}> view </button>}</div>

        <div className={'pairing-player ' + (tie ? 'tie' : participant_one_winner ? 'win' : 'lose')}>
            <span>{match.participant_one.username}</span>
            <span>{p_1_win_add}-{p_1_tie_add}-{p_1_lose_add}</span>
        </div>
        <div className={'pairing-score' + ((participant_one_winner || tie) ? ' bold' : '')}>{match.status === 2 ? 0 : ((participant_one_winner) ? extractWinnerWins(match) : tie ? 1 : extractLoserWins(match,match.participant_one.username))}</div>
        <div className={'pairing-score'+ ((participant_two_winner || tie) ? ' bold' : '')}>{match.status === 2  ? 0 :  ((participant_two_winner) ? extractWinnerWins(match) : tie ? 1 : extractLoserWins(match,match.participant_two.username))}</div>
        <div className={'pairing-player ' + (tie ? 'tie' : participant_two_winner ? 'win' : 'lose')}>
            <div>
                <span> {match.participant_two.username}</span>
                <span>{p_2_win_add}-{p_2_tie_add}-{p_2_lose_add}</span>
            </div>
        </div>
    </div>
}

export default function Pairings() {
    const { round } = useQueryParams()
    const { Tid} = useParams()
    const {state: authState} = useContext(Context)

    const {tournament} = useOutletContext()
    const rounds = useTournamentRounds(Tid, authState)
    const nav = useNavigate()
    const [match,setMatch] = useState()
    const timer = useTournamentRoundTime({tournament,match})

    useEffect(() => {
        const m = rounds ? rounds[round ? Math.max(0, (round-1)) : rounds.length- 1].matches[0] : undefined
        setMatch(m)
    }, [round,rounds]);
    const isCurrentUserMatch = (match) => {
        return authState.userDetails
            && ((authState.userDetails.id == match.participant_one.user || authState.userDetails.id == match.participant_two.user)
                || authState.userDetails.is_staff || authState.userDetails.isTournamentAdmin && authState.userDetails.isTournamentAdmin(Tid))
    }

    const Paging = useCallback(() => {
        if(!rounds || rounds.length < 1) return null
        return <div className={'rounds'}>
            <b>Round</b>
            {rounds.map(round => round.round_num).map(r => <Link className={'round' + (r == (round ?? rounds.length) ? " selected_round" : '')} key={r} to ={`/Tournament/${Tid}/pairings?round=${r}`}>{r}</Link>)}
        </div>
    },[round, rounds])

    const Timer = useCallback(() =>  <div className={'pairing-timer'}>Timer: {timer}</div>,[timer])

    if(rounds === undefined) {
        return <div className={'pairing-page'}>
            <InfinitySpin
                width='200'
                color="#ffffff"
            />
        </div>
    } else if(rounds === null) {
        return <div>No rounds for this tournament</div>
    }


    return <div className={'pairing-page'}>
            <Timer/>
        <div className={'pairings'}>
            <Paging/>
            <div className={'pairing-row header'}>
                <div>Player 1</div>
                <div>Player 2</div>
            </div>
            {Children.toArray(rounds[round ? Math.max(0, (round-1)) : rounds.length- 1].matches.map((match,index) =>
                <PairingRow nav={nav} match={match} index={index+1} is_current_user_match={isCurrentUserMatch(match)}/> ))}
        </div>
    </div>
}