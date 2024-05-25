import { useState, React } from 'react';
import { loginFields } from "../../Constants/formFields";
import FormAction from "./FormAction";
import {Link, useNavigate} from 'react-router-dom';
import { useContext } from 'react';
import { message } from 'antd'
import {authenticateUser} from "../../Network/services";
import {Context} from "../../Context/Context";

const fields = loginFields;
let fieldsState = {};
fields.forEach(field => fieldsState[field.id] = '');

export default function Login() {
    const [loginState, setLoginState] = useState(fieldsState);
    const navigate = useNavigate();
    const { dispatch } = useContext(Context);

    const handleChange = (e) => {
        setLoginState({ ...loginState, [e.target.id]: e.target.value })
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        authenticateUser(loginState,data => {
            if(!data.access) {// Error - no token returned
                message.error({
                    content:data.detail,
                    duration: 2
                })
                return;
            }

            message.success({
                content:"Logged in succesfully",
                duration: 2
            })
            dispatch({
                type: "LOGIN",
                payload: {token: data.access, user: data.username}
                // TODO: send username from API
            })
            navigate("/")
        })
    }


    return (
        <form className={'form-auth'} onSubmit={handleSubmit}>
                {
                    fields.map(field =>
                        <div className={'form-auth-field'}>
                        <label>{field.labelText}</label>
                        <input
                            className={'input-auth'}
                            key={field.id}
                            onChange={handleChange}
                            value={loginState[field.id]}
                            id={field.id}
                            name={field.name}
                            type={field.type}
                            required={field.isRequired}
                            placeholder={field.placeholder}
                        />
                        </div>
                    )
                }
            { /* <FormExtra /> */ }
            <FormAction handleSubmit={handleSubmit} text="Login" />

            <div className={'bottom-link'}>Dont have an account? <b><Link to ={'/signup'}>Sign up now</Link></b></div>
        </form>
    )
}
