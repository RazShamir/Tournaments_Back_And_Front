import styled from "@emotion/styled";

import HomeMaxRounded from '@mui/icons-material/HomeMaxRounded'

export const LinkStyle = styled.a`
  background: orange;
  color: white;
  cursor: pointer;
  font-weight: bold;
  border-radius: 8px;
  padding: 4px;


  transition: .2s ease-in-out;

  :hover {
    background: #a9770c;
    color:whitesmoke;
  }
`

export const StartTournamentRowStyle = styled.div`
    display:flex;
    flex-direction: column;
    row-gap: 8px;
    span {
      font-weight: bold;
    }
`


export const ConflictList  = styled.div`
  width: 100%;
  row-gap: 16px;
  display: flex;
  flex-direction: column;
  h4 {
    text-align: start;
  }
`
export const ConflictRow = styled.div`
  display: flex;
  flex-direction: row;
  width: 25%;
  min-width: 100px;
  align-items: center;
  max-width: 250px;
  font-size: 16px;
  justify-content: space-around;

  .resolve {
    padding-inline: 4px;
    color: white;
    cursor: pointer;
    font-size: 14px;
    padding-block: 2px;
    border-radius: 4px;
    padding-bottom: 4px;
    margin-left: 8px;
    margin-block: auto;
    transition: background-color .2s linear;
    background-color: #1c74cb;

    &:hover {
      background-color: #1d5e9a;
    }
  }

`