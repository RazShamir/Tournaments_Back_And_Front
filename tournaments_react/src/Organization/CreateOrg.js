import FormAction from "../Auth/AuthViews/FormAction";
import { useState } from "react";
import { useContext } from "react";
import { createOrgField } from "../Constants/formFields";
import { useNavigate } from "react-router-dom";
import {message} from "antd";
import {Context} from "../Context/Context";
import {createOrganization} from "../Network/services";

const fields = createOrgField;
let fieldsState = {};
fields.forEach(field => fieldsState[field.id] = '');

export default function CreateOrg(props) {
    const [createOrgState, setCreateOrgState] = useState(fieldsState);
    const { state: authState,dispatch } = useContext(Context);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCreateOrgState({ ...createOrgState, [e.target.id]: e.target.value })
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const onData = data => {
            if(!data.extra) {
                message.error({content:data.message, duration:2})
                return
            }
            message.success({
                content:data.message,
                duration:2
            })
            dispatch({type:"SET_ORGANIZATION",payload: data.extra})
            navigate("/org")
        }
        createOrganization(createOrgState, onData, authState.token)
    }

        return (
            <form className="form-auth" onSubmit={handleSubmit}>
                    {
                        fields.map(field => <div className={'form-auth-field'}>
                            <label>{field.labelText}</label>
                            <input
                                className={'input-auth'}
                                key={field.id}
                                onChange={handleChange}
                                value={createOrgState[field.id]}
                                id={field.id}
                                name={field.name}
                                type={field.type}
                                required={field.isRequired}
                                placeholder={field.placeholder}
                            />
                            </div>
    
                        )
                    }
                <FormAction handleSubmit={handleSubmit} text="create your organization" />
            </form>
        )
}