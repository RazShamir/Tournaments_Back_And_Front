import Header from "../../Auth/AuthViews/Header";
import Schedual from "./Schedual";
import { useParams } from "react-router-dom";

const SchedualPage = (props) => {
    const {Tid} = useParams()
return (
    <>
        <Header
            heading="Schedual page"
        />
        <Schedual Tid={Tid}/>
    </>
)
}

export default SchedualPage