import {Link, Outlet, useLocation, useParams} from "react-router-dom";
import './match.css'
import {useContext, useEffect} from "react";
import {InfinitySpin} from "react-loader-spinner";
import {useMatch} from "../Hooks";
import { Context } from "../Context/Context";
import styled from "@emotion/styled";
import ArrowLeft from '@ant-design/icons/ArrowLeftOutlined'


export const ErrorMessage = styled.div`
  padding-block:32px;
  font-weight: bold;
  color:#bd3333;
`

export default function MatchLayout({admin}) {

    const {Mid} = useParams()
    const {state: authState} = useContext(Context)
    const {match, errorMessage,setErrorMessage} = useMatch(authState,Mid)

    useEffect(() => {
        if(!match) return
        const isTournamentAdmin = authState.userDetails?.isTournamentAdmin && authState.userDetails.isTournamentAdmin(match?.tournament_id)
        if(!isTournamentAdmin && (admin && authState.userDetails && !authState.userDetails.is_staff))
            setErrorMessage("You are not authorized to view this page")
    }, [authState,admin,match]);

    return <div>
        <div className="App">
            <header className="App-header">
                <div> {( (match === undefined || authState.userDetails === undefined) && !errorMessage) ? <div style={{minHeight:'100%', display:'grid',placeItems:'center'}}>
                    <InfinitySpin
                        width='200'
                        color="#ffffff"
                    />
                </div>  : errorMessage ? <ErrorMessage>{errorMessage}</ErrorMessage> : match === null ? <div>Match Not found</div> : (null===authState.userDetails) ? <div>You must be logged to view this page</div> :  <Outlet context={{match}} />} </div>

                {match && <div className={'flex-col'}><ArrowLeft/><Link className={'link'} to={`/Tournament/${match.tournament_id}/pairings`}>Back to pairings</Link></div>}
            </header>
        </div>
    </div>
}