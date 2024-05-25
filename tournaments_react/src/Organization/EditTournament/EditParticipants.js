import {useOutletContext} from "react-router-dom";
import {Children, useContext, useMemo, useState} from "react";
import {BYE} from "../../Constants/utils";
import styled from "@emotion/styled";
import {message, Modal} from "antd";
import {unregisterParticipantsFromTournament} from "../../Network/services";
import './edit-tournament.css'
import {Context} from "../../Context/Context";

const ParticipantGrid = styled.div`
  display: grid;
  margin-inline:auto;
  grid-template-columns: repeat(4,1fr); /* Responsive columns with a minimum of 100px and maximum of 1 fractional unit (1fr) */
  max-width: 70%;
  margin-block:32px;
  gap: 20px; /* Adds a gap between grid items */
  div {
    background:purple;
    color:white;
    font-size: 20px;
    padding:8px;
    cursor:pointer;
  }
  
  .selected {
    background: brown;
  }
`

export default function EditParticipants() {
    const {state: authState} = useContext(Context)
    const {tournament,setTournament} = useOutletContext()
    const participants = useMemo(() => tournament.participants.filter(p => p.username !== BYE),[tournament])
    const [selected,setSelected] = useState(new Set())

    const selectParticipant = (participant_id) => {
        const newMap = selected
        newMap.add(participant_id)
        setSelected(new Set(newMap.keys()))
    }
    const deselectParticipant = (participant_id) => {
        const newMap = selected
        newMap.delete(participant_id)
        setSelected(new Set(newMap.keys()))
    }

    const toggleParticipant = (participant_id) => {
        if(isSelected(participant_id))
            deselectParticipant(participant_id)
        else
            selectParticipant(participant_id)
    }

    const isSelected = (participant_id) => selected.has(participant_id)


    const openRemoveDialog = () => {
        Modal.confirm({
            content: `Are you sure you want to remove ${selected.size} participants?`,
            onOk: async () => {
                if(selected.size < 1) {
                    return message.info("No participant was selected")
                }
                const onData = data => {
                    if(data.message === 'Tournament already started' || data.message ==='Tournament already ended') {
                        message.error(data.message)
                    } else {
                        message.info(data.message)
                        setTournament({...tournament,participants:tournament.participants.filter(p => !selected.has(p.id))})
                        setSelected(new Set())
                    }
                }
                await unregisterParticipantsFromTournament(tournament.id,{participants_ids:[...selected]},onData,authState.token)
            }
        })
    }

    return <div>
        Participants
        <ParticipantGrid>
            {Children.toArray( participants.map((participant) => {
                return <div
                    className={isSelected(participant.id) ? "selected" : "deselected"}
                    onClick={() => toggleParticipant(participant.id)}>
                    {participant.username}
                </div>
            }))}
        </ParticipantGrid>
        {selected.size >0 &&  <div style={{fontSize:'16px'}}>{selected.size} participants selected</div>}
        <br/>
        <button
            disabled={tournament.is_ongoing || tournament.end_time}
            className={'save-button' + ((tournament.is_ongoing || tournament.end_time) ? " disabled" : "")} style={{marginInline:'auto'}} onClick={openRemoveDialog}>Remove selected</button>
    </div>
}