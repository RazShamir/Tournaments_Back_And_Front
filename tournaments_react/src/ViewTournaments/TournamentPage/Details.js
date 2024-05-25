import DOMPurify from "dompurify";
import {useOutletContext} from "react-router-dom";
import {useMemo} from "react";




const getTournamentTypeName = (type) => {
    if(type === 1) {
        return "Best of one"
    } else {
        return "Best of three"
    }
}
const Details = () => {
    const {tournament} = useOutletContext()
    const details = useMemo(() => tournament.details.replaceAll("\n", "<br/>"),[tournament])
    return (
        <div className={"details-page"}>
            <div className={'details-box'} dangerouslySetInnerHTML={{__html:DOMPurify.sanitize(details)}}/>
            <div className={"info-box"}>
                <div className={'info-line'}>{tournament.name}</div>
                <div className={'info-line'}>Start Time:  {new Date(tournament.start_time).toLocaleDateString("he-IL")}</div>
                <div className={'info-line'}>Type: {getTournamentTypeName(tournament.type)}</div>

            </div>
        </div>
    )
}

    
    export default Details