import {useContext, useEffect, useState} from "react";
import {message} from "antd";
import {Context} from "../Context/Context";
import {useLocation, useNavigate} from "react-router-dom";
import {
    getTournamentParticipants,
    getTournamentRounds,
    getTournamentsByOrganization, getUserTournamentRegistrations,
    tournamentCheckIn
} from "../Network/services";


export const useMatch = (authState, Mid) => {
    const [match, setMatch] = useState(undefined)
    const [errorMessage,setErrorMessage] = useState(undefined)
    const nav = useNavigate()
    useEffect(() => {
        if(!authState || !authState.token || match) return
        const endpoint = `http://127.0.0.1:8000/api/match/${Mid}`
        fetch(endpoint,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': "Bearer " + authState.token
                },
            }).then(response => response.json())
            .then(data => {
                if(data.message) {
                    setErrorMessage(data.message)
                    return;
                }
                setMatch(data)
            })
            .catch(error => { setMatch(null)})

    }, [authState, Mid]);
    return {match, errorMessage,setErrorMessage}
}


export const useOrganizationTournaments = (orgId, mode) => {
    const [tournaments, setTournaments] = useState([])
    const { state : authState } = useContext(Context)
    const location = useLocation()
    useEffect(() => {
        if(!orgId || !authState) return
        getTournamentsByOrganization(orgId, mode,data => {
            setTournaments(data)
        })
    }, [authState,location,orgId])
    return {tournaments,setTournaments}
}

export const useTournamentRounds = (Tid,authState) => {
    const [rounds,setRounds] = useState(undefined)
    useEffect(() => {
        if(rounds) return
        const fetchRounds = async () => {
            const onData = data => {
                if(data.error) {
                    //message.error({ content:data.error, duration:2})
                    return null
                }
                return data
            }
            const rounds = await getTournamentRounds(Tid,onData, authState.token)
            setRounds(rounds)
        }
        fetchRounds()
    },[Tid,authState])
    return rounds
}


export const useParticipants = (Tid, registration_status) => {
    const [participants,setParticipants] = useState()
    useEffect(() => {
        getTournamentParticipants(Tid,setParticipants)
    }, [Tid, registration_status]);
    return participants
}



export const useRegistrationStatus = (Tid, authState,registrationContext) => {
    const [registration_status,setRegistrationStatus] = useState({
            registered:false,
            checked_in:false})

    useEffect(()=> {
        if(!authState || !authState.token || !Tid || !registrationContext.registrations)
            return;
        setRegistrationStatus({
            registered:registrationContext.isRegistered(Tid),
            checked_in:registrationContext.isCheckedIn(Tid)})
    },[authState,Tid, registrationContext.registrations])


    const checkIn = () => {
        if(!authState || !authState.token || !Tid) return
        const onData = data => {
            if(data.message && data.message === "Checked in successfully") {
                setRegistrationStatus({...registration_status,checked_in:true})
                message.success(data.message)
            }else {
                message.error("Unknown error occurred")
            }
        }
        tournamentCheckIn(Tid,onData,authState.token)
    }
    return {registration_status,checkIn}
}

export const useUserRegistrations = (authState) => {
    const [registrations, setRegistrations] = useState([])
    useEffect(() => {
        if(!authState || !authState.token || registrations.length > 0)
            return;
        getUserTournamentRegistrations((registrations) => {
            if(registrations?.length)
                setRegistrations(registrations)
            else
                setRegistrations([])
        },authState.token)
    }, [authState]);

    const register = (registration) => {
        setRegistrations([...registrations,registration])
    }
    const unregister = (tournament_id) => {
        setRegistrations(registrations?.filter((r) => r.tournament !== tournament_id))
    }

    const isRegistered = (tournament_id) => {
        return registrations && registrations.find(r => r.tournament === tournament_id)
    }

    const isCheckedIn = (tournament_id) => {
        const registration = registrations?.find(r => r.tournament === tournament_id)
        return registration && registration.checked_in
    }
    const checkIn = (tournament_id) => {
        const registrationIndex = registrations?.findIndex(r => r.tournament === tournament_id)
        if(registrationIndex !== -1) {
            const newRegistrations = registrations
            newRegistrations[registrationIndex].checked_in = true
            setRegistrations([...newRegistrations])
        }
    }

    return {registrations,register,unregister,isRegistered,isCheckedIn,checkIn}
}

export const useQueryParams = (defaultParams = {}) => {
    const location = useLocation()
    const [params,setParams] = useState(defaultParams)
    useEffect(() => {
        setParams(Object.fromEntries(new URLSearchParams(location.search).entries()))
    }, [location]);
    return params
}


export const useTournamentRoundTime = ({tournament, match }) => {
    const [timeLeft,setTimeLeft] = useState("00:00")

    useEffect(() => {
        if(!tournament || !match) {
            return
        }
        const round_startAt = new Date(match.rounds.start_at);
        const [hh, mm, ss] = tournament.round_time_estimate.split(":")
        const [h,m,s] = [parseInt(hh), parseInt(mm), parseInt(ss)]
        const estimateInMin = h * 60 + m + (s / 60)
        let inter = 0

        if(!tournament.is_ongoing || match.rounds.end_at) {
            setTimeLeft("00:00");
            return;
        }
        const calc = () => {
            const timeNow = new Date();
            const elapsed = timeNow.getTime() - round_startAt.getTime();
            const inMin = elapsed / 1000 / 60;
            let left = estimateInMin - inMin;

            if (left <= 0) {
                clearInterval(inter); // Stop the interval when time is up
                setTimeLeft("00:00");
                return;
            }

            if (left < 0) {
                left = 0; // Prevent negative values
            }

            let leftSeconds = Math.floor((left - Math.floor(left)) * 60); // Calculate seconds
            let leftMinutes = Math.floor(left);
            let leftHours = Math.floor(leftMinutes / 60);
            leftMinutes %= 60;

            leftSeconds = ("0" + leftSeconds ).slice(-2)
            leftMinutes = ("0" + leftMinutes ).slice(-2)
            leftHours = ("0" + leftHours ).slice(-2)

            // Format the time
            const formattedTime = `${leftHours}:${leftMinutes}:${leftSeconds}`
            setTimeLeft(formattedTime);
        }
        calc()
        inter = setInterval(calc, 1000); // Update every second
        return () => {
            clearInterval(inter)
        }
    },[tournament ,match])

    return timeLeft
}
