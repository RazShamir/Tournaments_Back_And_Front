import { useState, useContext } from 'react';
import { signupFields } from "../../Constants/formFields"
import FormAction from "./FormAction";
import {Link, useNavigate} from 'react-router-dom';
import {message} from "antd";
import {createAccount} from "../../Network/services";
import {Context} from "../../Context/Context";




const fields = signupFields;
let fieldsState = {};

fields.forEach(field => fieldsState[field.id] = '');

export default function Signup() {
    const [signupState, setSignupState] = useState(fieldsState);
    const navigate = useNavigate();
    const { dispatch } = useContext(Context);

    const handleChange = (e) => setSignupState({ ...signupState, [e.target.id]: e.target.value });

    const confirmPassword = () => {

        return (signupState['confirm-password'] === signupState.password)
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (confirmPassword()){
            createAccount(signupState,data => {
                if(!data.access) {
                    if(data.detail)
                        message.info(data.detail)
                    else {
                        let entries = Object.entries(data)
                        let problems = entries.map(([fieldName, error]) => fieldName.toUpperCase() + ": " + error).join('\n')
                        message.error({
                            content:problems,
                            duration:3
                        })
                    }
                    return
                }
                dispatch({
                    type: "LOGIN",
                    payload: {token: data.access, user: signupState.username}
                })
                navigate("/")
            })
        }
        else {
            alert("confirm password!")
        }
    }



    return (
        <form className="form-auth" onSubmit={handleSubmit}>
                {
                    fields.map(field =>
                        <div className={'form-auth-field'}>
                            <label>{field.labelText}</label>
                        <input
                            className={'form-auth-input'}
                            key={field.id}
                            onChange={handleChange}
                            value={signupState[field.id]}
                            id={field.id}
                            name={field.name}
                            type={field.type}
                            required={field.isRequired}
                            placeholder={field.placeholder}
                        />
                        </div>

                    )
                }
                <FormAction handleSubmit={handleSubmit} text="Signup" />

            <div className={'bottom-link'}>Already have an account? <b><Link to ={'/login'}>Login now</Link></b></div>
        </form>
    )
}