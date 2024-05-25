import {useTournamentRoundTime, useUserRegistrations} from "./Hooks";
import React, {useCallback, useContext, useEffect, useMemo, useState} from "react";
import {Context} from "./Context/Context";
import {getTournament, getTournamentRounds, tournamentCheckIn} from "./Network/services";
import styled from "@emotion/styled";
import DateIcon from '@ant-design/icons/CalendarOutlined'
import TimeIcon from '@ant-design/icons/FieldTimeOutlined'
import Settings from '@ant-design/icons/SettingFilled'
import CheckIn from '@ant-design/icons/CheckOutlined'
import {Link} from "react-router-dom";
import {message} from "antd";
import {InfinitySpin} from "react-loader-spinner";


const RegistrationRow = styled.div`
    width:90%;
    background: whitesmoke;
    display: flex;
    flex-direction: column;
    padding:12px;
    h2 {
      font-size: 18px;
      color:black;
    }
    p {
      margin:0;
      padding:0;
      font-size: 20px;
    }

    .data {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      column-gap: 8px;
      
      .data-col {
        background:white;
        color:black;
        border-radius: 4px;
        row-gap: 8px;
        display: flex;
        padding: 8px;
        flex-direction: column;
        button {
          background:black;
          color:white;
          padding:4px;
          font-size: 20px;
          border: none;
          width: 90%;
          margin-inline: auto;
          border-radius: 4px;
          padding-block: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          column-gap: 6px;
          justify-content: center;
        }
        .checkin {
          background: orange;
          text-align: center;
        }
      } 
      .left {
        align-items: start;
        padding-inline: 16px;
        p {
          font-weight: bold;
        }
      }
      .check-in-indicator {
        display: flex;
        flex-direction: row;
        column-gap: 4px;
        align-items: center;
        font-size: 20px;
        justify-content: center;
      }
      a {
        font-size: 20px;
        color:navy;
        text-decoration: none;
      }
    }
`

const RegistrationRounds = styled.div`
    color:black;
    display: flex;
    flex-direction: column;
    align-items: start;
    width: 100%;
    margin-top: 8px;
    row-gap: 8px;
    overflow: hidden;
      .round {
        width: 97%;
        border: 1px solid lightgray;
        padding:8px;
        padding-inline: 16px;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        div {
            display: flex;
            flex-direction: column;
            align-items: start;
            justify-content: center;
            p {
              font-weight: bold;
            }
        }
      }
  .red {
    border:1px solid red;
     p{ color:red;
        font-weight: bold;}
  }
  .green {
    border:1px solid green;
    p{ color:green;
        font-weight: bold;}
  }
  .orange {
    border:1px solid orange;
    p{ color:orange;
       font-weight: bold;}
  }
`

const TournamentDate = ({start_time}) => {

    const time = useMemo(() =>new Date(start_time.getTime() - new Date().getTime()).getTime() ,[start_time])
    const hours = Math.floor(time / 1000 / 60 / 60)
    const minutes = Math.floor((time % 3600000) / 60000)
    return<div>
        <div className={'check-in-indicator'}><TimeIcon/> <span>{ hours + " hours, " + minutes +" minutes."}</span></div>
        <div className={'check-in-indicator'}><DateIcon/><span>{start_time.toDateString()}</span></div>
    </div>
}


const RoundRow = ({match,round_num, currentUserId}) => {

    const opponent = useMemo(() => {
            if(!match) return null
        if(match.participant_one.user == currentUserId) return match.participant_two
        return match.participant_one
    },[match,currentUserId])

    const isUserWinner = match.winner && (match.winner !== opponent.username)
    const isUserLoser =  match.winner && (match.winner === opponent.username)
    const isTie = match.tie
    return  <Link to={`/match/${match.match_id}`} className={'round' + (isUserLoser ? ' red' : isUserWinner ? ' green' : isTie ? ' orange' : '')}>
        <div>
            <p>round {round_num}</p>
            {opponent.username}
        </div>
        { isTie ? <p>{'T'}</p> : match.winner && (match.winner === opponent.username  ? <p>{'L'}</p> : <p>{'W'}</p>)}
    </Link>
}

const Rounds = ({rounds , currentUserId}) => {
    const userMatches = useMemo(() =>  {
        if(!rounds || !rounds.map) return []
        return rounds.map((round) => ({round_num:round.round_num ,match:round.matches.find(m => m.participant_one.user == currentUserId || m.participant_two.user ==currentUserId)}))
            .filter((userMatch) => userMatch.match)

    },[currentUserId, rounds])

    if(!rounds) return null
    return <RegistrationRounds>
        {React.Children.toArray( userMatches.map(({match, round_num}) => <RoundRow match={match} round_num={round_num} currentUserId={currentUserId}/> ))}
    </RegistrationRounds>
}

const Registration = ({tournament, registration, isCheckedIn, checkIn, rounds, currentUserId}) => {
    const [match,setMatch] = useState()
    const timer = useTournamentRoundTime({tournament, match})
    useEffect(() => {
        const m = rounds && rounds.length > 0 ? rounds[rounds.length- 1].matches[0] : undefined
        setMatch(m)
    }, [rounds]);
    if(!tournament || !registration) {
        return null
    }

    return <RegistrationRow>
        <h2>{tournament.name}</h2>
        <div className={'data'}>
            <div className={'data-col'}>
                {tournament.is_ongoing ? timer : <TournamentDate start_time={new Date(tournament.start_time)}/>}
                {isCheckedIn && <div className={'check-in-indicator'}><CheckIn style={{color:'green'}}/><span>{"You have checked in to this tournament"}</span></div>}
            </div>
            <div className={'data-col left'}>
                <p>Links</p>
                <Link to={`/Tournament/${tournament.id}/details`}>Details</Link>
                {!tournament.is_ongoing && <Link to={`/Tournament/${tournament.id}/registrations`}>Registrations</Link>}
                <Link to={`/Tournament/${tournament.id}/schedual`}>Schedule</Link>
            </div>
            <div className={'data-col'}>
                {!isCheckedIn && <button onClick={() => checkIn(tournament.id)} className={'checkin'}><CheckIn/>Check in</button>}
                <Link to={`/Tournament/${tournament.id}/register`}><button><Settings/> Edit registration</button></Link>
            </div>
        </div>
        <Rounds rounds={rounds} tournament={tournament} currentUserId={currentUserId}/>
        <br/><br/>
    </RegistrationRow>
}

const UserRegistrationsLayout = styled.div`
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width:90%;
  margin-block:32px;
`
export default function UserDashboard() {
    const {state: authState} = useContext(Context)
    const  registrationContext = useUserRegistrations(authState)
    const [registrationTournamentMapping, setRegistrationTournamentMapping] = useState(undefined)
    const [tournamentRoundsMapping, setTournamentRoundsMapping] = useState(undefined)
    const [ongoingRegistrations,setOnGoingRegistrations]  = useState([])
    const [loading,setLoading] = useState()


    useEffect(() => {
        setLoading(true)
        const registrations = []
        const getUserRegistrationData = async () => {
            const tournamentsMap = new Map()
            const roundsMap = new Map()
            for (let registration of registrationContext?.registrations) {
                if (!registration.tournament) continue

                await getTournament(registration.tournament, tournament => {
                    if (!tournament.end_time) {
                        tournamentsMap.set(registration.id, tournament)
                        registrations.push(registration)
                    }
                }, (e) => {
                })
                await getTournamentRounds(registration.tournament, pairings => {

                    roundsMap.set(registration.id, pairings)
                },authState.token)
            }
            setOnGoingRegistrations(registrations)
            setTournamentRoundsMapping(roundsMap)
            setRegistrationTournamentMapping(tournamentsMap)
            setLoading(false)
        }
        getUserRegistrationData()

    }, [registrationContext.registrations])
    const checkIn = (tournament_id) => {
        const onData = data => {
            if(data.message && data.message === "Checked in successfully") {
                registrationContext.checkIn(tournament_id)
                message.success(data.message)
            }else {
                message.error("Unknown error occurred")
            }
        }
        tournamentCheckIn(tournament_id,onData,authState.token)
    }

    if( loading ) {
        return <div className={"center"} >
                <InfinitySpin
                    width='200'
                    color="#ffffff"/>
        </div>
    }

    if (ongoingRegistrations.length === 0) {
        return <div className={"center spaced"}>
            You're not registered to any tournaments
        </div>
    }

    return  <UserRegistrationsLayout>
        { React.Children.toArray(
            registrationContext.registrations.map((registration) =><Registration
                registration={registration}
                checkIn={checkIn}
                currentUserId={authState?.userDetails?.id}
                rounds={tournamentRoundsMapping.get(registration.id)}
                isCheckedIn={registrationContext.isCheckedIn(registration.tournament)}
                tournament={registrationTournamentMapping.get(registration.id)}
            />)
        )}
    </UserRegistrationsLayout>
}