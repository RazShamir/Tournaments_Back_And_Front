import {useOutletContext} from "react-router-dom";
import {DatePicker, message} from "antd";
import {Modal} from 'antd'
import {useContext, useEffect, useState} from "react";
import styled from "@emotion/styled";
import dayjs from 'dayjs'
import {editTournament} from "../../Network/services";
import {Context} from "../../Context/Context";
const range = (start, end) => {
    const result = [];
    for (let i = start; i < end; i++) {
        result.push(i);
    }
    return result;
};
const disabledDate = (current) => {
    // Can not select days before today and today
    return current < dayjs().endOf('day').add(-1,'days');
};
const updatePublishProp = (authState, Tid,published) => {
    const onData = data => {
        if(data.message) {
            message.error({content:data.message, duration:2})
            return
        }
        message.success({
            content:!published ? "Tournament published saved successfully" :"Tournament unpublished saved successfully",
            duration:2
        })
    }
    editTournament(Tid,{published},onData, authState.token)
}


const updateStartTime = async (authState, Tid,start_time) => {
    const onData = data => {
        if(data.message) {
            message.error({content:data.message, duration:2})
            return
        }
        message.success({
            content: "Tournament start time updated successfully",
            duration:2
        })
    }
    await editTournament(Tid,{start_time},onData, authState.token)
}


const PropertyBar = styled.div`
  display: flex;
  align-items: center;
  column-gap: 4px;
  padding: 12px;
  justify-content: space-around;
  border: 1px solid #4f4f4f;
  width: 50%;
  border-radius: 4px;
  margin-inline: auto;

  a {
    color: white;
    background: orange;
    padding: 4px;
    border:1px solid white;
    border-radius: 4px;
    padding-inline: 8px;
    cursor: pointer;
    font-weight: bold;
    transition: .1s linear;
  }

  a:hover {
    background: #8d5d06;
  }
`
const disabledDateTime = () =>  {
    const now = new Date()
    return {
        disabledHours: () => range(0, now.getHours()),
        disabledMinutes: () => [],
        disabledSeconds: () => [],
    };
}

const disabledRangeTime = (_, type) => {
    if (type === 'start') {
        return {
            disabledHours: () => range(0, 60).splice(4, 20),
            disabledMinutes: () => range(30, 60),
            disabledSeconds: () => [55, 56],
        };
    }
    return {
        disabledHours: () => range(0, 60).splice(20, 4),
        disabledMinutes: () => range(0, 31),
        disabledSeconds: () => [55, 56],
    };
}

export default function EditTournamentGeneral() {
    const { tournament, setTournament } = useOutletContext()
    const {state :authState} = useContext(Context)
    const [startTime,setStartTime] = useState()
    useEffect(() => {
        console.log(startTime)
    }, [startTime]);
    return <div>
        <h1>General</h1>
        <PropertyBar>
            <span>{!tournament.published ? "This tournament is not published yet" : "This tournament is published"}</span>
            <a onClick={() => {
                updatePublishProp(authState,tournament.id,!tournament.published)
                setTournament({...tournament,published:!tournament.published})
            }}>{tournament.published ? "Unpublish" : "Publish"}</a>
        </PropertyBar>

        <br/>

        <PropertyBar>
            <DatePicker
                disabledDate={disabledDate}
                disabledTime={disabledDateTime}
                showTime onChange={(e) => {
                if(e && e['$d']) setStartTime(e['$d'])
            }} />
            <br/>
            <a onClick={() => {
                Modal.confirm({
                    content: "Are you sure you want to change the start time",
                    okText: "Yes",
                    onOk:async () => {
                        await updateStartTime(authState,tournament.id,startTime)
                        setTournament({...tournament, start_time: startTime})
                    }
                })
            }}>Change start time</a>
        </PropertyBar>

    </div>
}