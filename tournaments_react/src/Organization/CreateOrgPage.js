import Header from "../Auth/AuthViews/Header";
import CreateOrg from "./CreateOrg";

export default function CreateOrgPage() {
    return (
        <>
            <h2 className={"CreateOrgHeader"}>Create your organization</h2>
            <CreateOrg />
        </>
    )
}