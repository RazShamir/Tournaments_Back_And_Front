import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {Context} from "../../Context/Context";

export default function Logout() {
    const { dispatch } = useContext(Context);
    const navigate = useNavigate();
    dispatch({
        type: "LOGOUT"
        })
    navigate("/")
}