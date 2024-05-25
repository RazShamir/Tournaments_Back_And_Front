import {Link, useOutletContext} from "react-router-dom"
import './tournaments.css'
import {useCallback, useMemo} from "react";
import {BYE} from "../Constants/utils";
const TournamentStructer = ({id, name, type, start_time, ongoing_page,completed, organization,organization_name, participants, registrasion, winner, index,admin = false}) => {

    const {isRegistered,registrations} = useOutletContext()

    const RegisterButton = useCallback(() => {
            if(!isRegistered(id)) {
                return <Link style={{background: 'white',width:'100px',display:'block',marginInline:'auto'}} to={"/Tournament/"+ id +"/register"}>{
                    "registration"
                }</Link>
            }

            return <Link style={{background: 'green',color:'white',width:'100px',display:'block',marginInline:'auto'}} to={"/Tournament/"+ id +"/register"}>{
                "registered"
            }</Link>
    },[id, registrations])

    const participantsLength = useMemo(() => {
        return participants?.filter(p => p.username !== BYE).length
    },[participants])
    return (
        <tr className={'tournament-row_' + (index % 2 === 0 ? 'even' : 'odd')} key={"row" + index}>
            <td key={"name" + index} className="name">
                <Link className={'link'} to={admin ? ('/Tournament/' + id + "/admin")  : '/Tournament/' + id + "/details"}>{name}</Link>
            </td>
            <td key={"type" + index} className="type">
                {
                    type === 1 ? "BO1" : type === 3 ? "BO3" : type
                }
            </td>
            <td key={"start_time" + index} className="start_time">
                <Link className={'link'} to={ '/Tournament/' + id + "/schedual"}>{new Date(start_time).toDateString()}</Link>
            </td>
            <td key={"organization" + index} className="organization">
                <Link className={'link'} to={"#"}>{organization_name}</Link>
            </td>
            <td key={"players" + index} className="players">
                <Link className={'link'} to={'/Tournament/' + id + "/registrations"}>{participantsLength}</Link>
            </td>
            {!completed && !ongoing_page && <td key={"registrasion" + index} className="registrasion">
                <RegisterButton/>
            </td>}
            {completed && <td key={"winner" + index} className="winner">
                <Link className={'link'} to={"#"}>{winner}</Link>
            </td>}
        </tr>
    )


}

export default TournamentStructer;