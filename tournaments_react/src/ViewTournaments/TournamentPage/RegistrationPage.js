import { useParams } from "react-router-dom";
import Header from "../../Auth/AuthViews/Header";
import Register from "./Registration";

export default function RegistrationPage() {
    const {Tid} = useParams()
    return (
        <>
            <Header
                heading="Register to tournament"/>
            <Register Tid={Tid}/>
        </>
    )
}