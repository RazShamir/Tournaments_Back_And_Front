import {Navigate, useOutletContext} from "react-router-dom";
import {useCallback, useContext, useEffect, useMemo, useState} from "react";
import {message, Modal} from "antd";
import {submitAdminMatchResults, submitMatchResults} from "../Network/services";
import {Context} from "../Context/Context";
import styled from "@emotion/styled";

const IsOneGame = (match) => {
    return match.match_type === 1 || match.match_type === 2
}

const submitResults = async (authState,match,results) => {
    const formattedJsonString = JSON.stringify(results).replace(/"([^"]+)":/g, '"$1":');
    const body = {match_result:formattedJsonString}
    const onData = data => {
        if (!data.message) {
            return
        }
        message.success({
            content: data.message,
            duration: 2
        })
    }
     await submitMatchResults(match.match_id, body, onData, authState.token)
}


const MatchAdminStyle = styled.div`
  display: grid;
  column-gap: 16px;
  grid-template-columns: 1fr 1fr 1fr;

  div {
    background: white;
    color: black;
    font-weight: bold;
    min-height: 70px;
    display: grid;
    place-items: center;

    min-width: 150px;
    transition: .2s linear;

    span {
      font-size: 16px;
      padding-block: 4px;
    }

    p {
      padding: 0;
      margin: 0;
    }

    border: 3px solid transparent;
    cursor:pointer;
  }

  .selected-tie {
    background: white;
    color: orange;
    border: 3px solid orange;
  }

  .selected-win {
    background: rgba(87, 236, 87, 0.2);
    color: white;
    border: 3px solid rgba(87, 236, 87, 0.8);

    :hover {
      background: rgba(87, 236, 87, 0.5);
      color: white;
    }
  }

  .selected-lose {
    background: rgba(238, 7, 7, 0.2);
    color: white;
    border: 3px solid #ee0707;

    :hover {
      background: rgba(238, 7, 7, 0.5);
      color: white;
    }
  }

  .unselected-tie {
    :hover {
      background: rgba(255, 155, 41, 1);
      color: white;
    }
  }

  row-gap: 32px;

  .submit {
    grid-column: 1 / -1;
    background: rgb(62, 66, 189);
    color: white;
    font-weight: bold;
    font-size: 24px;
    border: 1px solid white;
    width: 50%;
    margin-inline: auto;
    padding: 8px;
    padding-block:16px;
    transition: .2s linear;
    cursor: pointer;
    :hover {
      background: rgb(37, 40, 134);
    }
  }

  width: 80%;
`

const MatchAdminPage = styled.div`
    min-height: 50vh;
    display: grid;
    place-items: center;
`
export default function MatchAdmin() {

    const { state:authState } = useContext(Context)
    const { match } = useOutletContext()

    const [result,setResult]= useState(
        !match.winner  ? 1 : match.winner === match.participant_one.username ? 0 : 2
    ) // 0 - p1, 1-tie, 2 -p2

    const onPromptSubmit = () => {
        const p1 = match.participant_one.username
        const p2 = match.participant_two.username
        const winner = result === 0 ? p1 :  result === 2 ? p2 : null;
        const content = winner ?  `You are about to declare ${winner} as winner` : `You are about to declare tie between ${p1} and ${p2}`

        const results = {
            winner,
            tie: winner === null
        }

        const onData = (data) => {
            message.info(data.message) // update success message
        }
        Modal.confirm({
           content,
           onOk: async () => {
               await submitAdminMatchResults(match.match_id, match.tournament_id,results,onData,authState.token)
           }
       })
    }

    const round_over = match.rounds.end_at !== undefined && match.rounds.end_at !== null
    return <MatchAdminPage>
      <MatchAdminStyle className={'match-admin'}>
            <div onClick={() => setResult(0)}  className={result === 0 ? "selected-win" : result === 1 ? "selected-tie" : "selected-lose" }>
               <p>{match.participant_one.username}</p>
                {result === 0 ?  <span>Winner</span>  : result === 2 ?  <span>Loser</span> :  <span>Tie</span>}
            </div>
            <div onClick={() => setResult(1)} className={result === 1 ? "selected-tie" : "unselected-tie" }>
                <p>Tie</p>
            </div>
            <div  onClick={() => setResult(2)}  className={result === 2 ? "selected-win" : result === 1 ? "selected-tie" : "selected-lose"} >
                <p>{match.participant_two.username}</p>
                {result === 2 ?  <span>Winner</span>  : result === 0 ?  <span>Loser</span> : <span>Tie</span>}
            </div>
          <button className={'submit' + (round_over  ? " disabled-button" : "")} disabled={ round_over } onClick={onPromptSubmit}>Submit</button>
        </MatchAdminStyle>
    </MatchAdminPage>
}