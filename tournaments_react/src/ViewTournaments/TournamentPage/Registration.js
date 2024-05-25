import { registrasionField } from "../../Constants/formFields";
import FormAction from "../../Auth/AuthViews/FormAction";
import React ,{ useCallback} from "react";
import { useContext } from "react";
import {message} from "antd";
import {useOutletContext} from "react-router-dom";
import {registerToTournament, unregisterFromTournament} from "../../Network/services";
import {Context} from "../../Context/Context";

const fields = registrasionField;
let fieldsState = {};
fields.forEach(field => fieldsState[field.id] = '');

export default function Register(props) {
    const { state: authState } = useContext(Context);
    const  { registrationsContext,registration_status ,tournament} = useOutletContext()
    const { unregister, register} = registrationsContext

    const handleSubmit = (e) => {
        e.preventDefault();
        const game_username = e.target[0].value
        const onData = response => {
            if(response.data) {
                register(response.data)
                message.success({content: "Registered successfully",duration:2})
                localStorage.setItem("in-game-name", game_username)
            } else {
                message.error("You must be signed in to register to this tournament")
            }
        }
        registerToTournament(props.Tid, { game_username }, onData,authState.token)
    }
    const handleSubmitUnregister = (e) => {
        e.preventDefault();
        const onData = response => {
            if(response.message) {
                unregister(props.Tid)
                message.success({content: "Un Registered successfully",duration:2})
            }
        }
        unregisterFromTournament(props.Tid,onData,authState.token);
    }

        const FormBody = useCallback(() => {
            const registered = registration_status.registered;
                return <div>
                    <form className={'form-auth'} onSubmit={handleSubmit}>
                        <div className="-space-y-px">
                            {
                                React.Children.toArray( fields.map(field =>
                                    <div className={'form-auth-field'}>
                                        <label>{field.labelText}</label>
                                        <input
                                            disabled={registered}
                                            key={field.id}
                                            className={'input-auth'}
                                            id={field.id}
                                            defaultValue={localStorage.getItem("in-game-name")}
                                            name={field.name}
                                            type={field.type}
                                            required={field.isRequired}
                                            placeholder={field.placeholder}
                                        />
                                    </div>
                                ))
                            }
                        </div>
                        <FormAction  text="Register" />
                    </form>

                    {registered &&  <form className={'form-auth'} onSubmit={handleSubmitUnregister}>
                        <button type={"submit"} style={{background:'#bd3333'}}>Unregister</button>
                    </form>}
                    </div>
        },[registration_status,props])

    if(tournament.end_time) {
        return <div>This tournament has ended</div>
    }

        return <FormBody/>
}