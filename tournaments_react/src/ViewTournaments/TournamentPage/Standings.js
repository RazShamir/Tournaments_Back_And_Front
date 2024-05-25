import {useOutletContext} from "react-router-dom";
import {Children, useContext} from "react";
import {useParticipants} from "../../Hooks";
import {Context} from "../../Context/Context";

const ParticipantRow = ({participant,index}) => {
    return <tr className={'standings-row_' + (index % 2 === 0 ? 'even' : 'odd')} key={"row" + index}>
        <td>{index}</td>
        <td>{participant.username}</td>
        <td>{participant.player_stats.score}</td>
        <td>
            {participant.player_stats.match_balance.current.wins}-{participant.player_stats.match_balance.current.ties}-{participant.player_stats.match_balance.current.loses}
        </td>
    </tr>
}

export default function Standings() {
    const { tournament } = useOutletContext()
    const {state :authState} = useContext(Context)
    const participants = useParticipants(tournament.id,false)
    console.log(participants)
    if(!participants) return null
    return <div>
        <table className={'standings'}>
            <thead><tr>
                <th>Place</th>
                <th>Name</th>
                <th>Points</th>
                <th>Record</th>
            </tr></thead>
            <tbody>
            {Children.toArray(participants.map((participant,index) =>
                <ParticipantRow participant = {participant} index={index+1}/>))}
            </tbody>
        </table>
    </div>

}

