import Header from "../../Auth/AuthViews/Header";
import Details from "./Details";
import { useParams } from "react-router-dom";
import {useOutletContext} from "react-router-dom";


const DetailsPage = () => {
    const {Tid} = useParams()
    const {tournament} = useOutletContext()
return (
    <>
        <br/><br/>
        <Details Tid={Tid}/>
    </>
)
}

export default DetailsPage