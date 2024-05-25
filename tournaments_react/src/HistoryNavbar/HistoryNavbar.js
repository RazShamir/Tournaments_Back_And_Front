import {Link, useLocation, useOutletContext, useParams} from "react-router-dom";
import {useCallback, useContext, useEffect, useMemo} from "react";
import {v4} from 'uuid'
import {Context} from "../Context/Context";

const entryPoint = "/Org"

const exclude_paths = ['/admin/edit/']

export default function HistoryNavbar({ excluded_path = false }) {

    const {Tid} = useParams()

    const {state:authState} = useContext(Context)

    const context = useOutletContext()

    const location = useLocation()



    const Links = useCallback(() => {
        if (!excluded_path)
            for (let exclude of exclude_paths)
                if(location.pathname.includes(exclude)) return null
        const links = []
        links.push(<Link key={v4()} to={"/Org"}>{authState?.userDetails?.organization.organization_name}</Link>)
        links.push(<div>/</div>)
        if(location.pathname === "/org/admin/staff") {
            links.push(<Link key={v4()} to={"/org/admin/staff"}>Staff</Link>)
            links.push(<div>/</div>)
        }
        else if(location.pathname !== entryPoint) {
            links.push(<Link key={v4()} to={"/org/admin/Tournaments/all"}>Tournaments</Link>)
            links.push(<div>/</div>)
        }
        if(location.pathname.includes("/Tournament/")) {
            links.push(<Link  key={v4()} to={`/Tournament/${Tid}/admin`}>{context.tournament.name}</Link>)
            links.push(<div>/</div>)
        }
        if(location.pathname.includes("dashboard")) {
            links.push(<Link  key={v4()} to={`/Tournament/${Tid}/admin/dashboard`}>Dashboard</Link>)
            links.push(<div>/</div>)
        }
        if(location.pathname.includes("/admin/edit/")) {
            const components = location.pathname.split("/")
            const last = components[components.length-1]
            links.push(<Link  key={v4()} to={`/Tournament/${Tid}/admin/edit/` + last}>{last}</Link>)
            links.push(<div>/</div>)
        }
        return <><nav className={'history-navbar'}> { links } </nav><br/></>
    },[location,authState])

    return <Links/>
}