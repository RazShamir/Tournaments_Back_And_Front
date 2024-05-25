import {useOutletContext, useParams} from "react-router-dom";
import {useContext, useMemo, useState} from "react";

import DOMPurify from "dompurify";
import {message} from "antd";
import {editTournament} from "../../Network/services";
import {Context} from "../../Context/Context";
export default function EditTournamentDesc() {

    const { Tid} = useParams()
    const {state : authState} = useContext(Context)

    const { tournament,setTournament } = useOutletContext()
    const [details, setDetails] = useState(tournament.details)
    const onDetailsChanged = (e) => {
         setDetails(e.target.value)
    }
    const onSubmitDetails = (e) => {
        e.preventDefault();
        const body = Object.fromEntries( new FormData(e.target).entries() )
        const onData = data => {
            if(data.message) {
                message.error({content:data.message, duration:2})
                return
            }
            setTournament({...tournament , details:data.details})
            message.success({
                content:"Tournament details saved successfully",
                duration:2
            })
        }
        editTournament(Tid, body, onData, authState.token)
    }

    const detailsFormatted = useMemo(() => details.replaceAll("\n", "<br/>"),[details])

    return <div className={'edit-page'}>
        <h1>Details</h1>
        <a target="_blank" href={"https://www.w3schools.com/html/default.asp"} style={{textDecoration:'none', color:'#00A0FF'}}>Markdown</a>
        <br/>
        <br/>

        <form className={'details'} onSubmit={onSubmitDetails}>
            <textarea name={'details'}  defaultValue={tournament.details} className={'details-text-area'} onInput={onDetailsChanged}>
            </textarea>
            <br/>
            <button className={'save-button'}>Save</button>
        </form>

        <p>Preview</p>
        <div className={'preview'} dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(detailsFormatted)}}></div>
    </div>
}