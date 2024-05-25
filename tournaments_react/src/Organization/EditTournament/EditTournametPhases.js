import {useOutletContext, useParams} from "react-router-dom";
import {useContext, useMemo, useState} from "react";
import {Context} from "../../Context/Context";
import {message, TimePicker} from "antd";
import {editTournament} from "../../Network/services";
import styled from "@emotion/styled";



const extractMinutes = (e) => {
    if(!e )return 0
    const time = {
        hours: ("0" +  e['$H']).slice(-2),
        minutes:("0" +  e['$m']).slice(-2),
        seconds: ("0" + e['$s']).slice(-2)
    }

    return `${time.hours}:${time.minutes}:${time.seconds}`
}


const RoundEstimate = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 16px;
  width:fit-content;
  margin-inline: auto;
  p {
    padding:0;
    margin:0;
  }
  button {
    align-self: inherit;
    margin-left: 0;
  }
  
`
export default function EditTournamentPhases() {

    const { Tid} = useParams()
    const {state : authState} = useContext(Context)
    const { tournament, setTournament } = useOutletContext()
    const [durationEstimate, setDurationEstimate] = useState(0)
    const updateRoundDurationEstimate = async () => {

        if(durationEstimate <=0) {
            message.info("Duration estimate must be a positive duration")
            return
        }
        if (durationEstimate == tournament.round_time_estimate) {
            message.info("No updates were submitted")
            return
        }
        try {
            const onData = (data) => {
                message.success("Tournament round duration estimate updated successfully")
            }
            const result = await editTournament(Tid, {round_time_estimate: durationEstimate},onData,authState.token)
            setTournament({...tournament, round_time_estimate:durationEstimate })
        } catch(e) {
          message.error(e.message)
        }
    }
    const format = 'HH:mm:ss';
    return <div>
        <h1>Phases</h1>
        <RoundEstimate>
            <p>Round duration estimate</p>
            <p>Current time estimate: {tournament.round_time_estimate}</p>
            <TimePicker onChange={(e) => setDurationEstimate(extractMinutes(e))} format={format}/>
            <button className={'save-button'} onClick={updateRoundDurationEstimate}>Submit estimate</button>
        </RoundEstimate>
    </div>
}