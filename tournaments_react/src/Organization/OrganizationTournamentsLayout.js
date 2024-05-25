import {Link, Outlet, useLocation, useNavigate, useParams} from "react-router-dom";
import {DatePicker, message, Modal} from "antd";
import {useContext} from "react";
import HistoryNavbar from "../HistoryNavbar/HistoryNavbar";
import {Context} from "../Context/Context";
import {createTournament} from "../Network/services";
import {useUserRegistrations} from "../Hooks";




const OrganizationTournamentsLayout = () => {
    const  { mode} = useParams()
    const {state:authState} = useContext(Context)
    const navigate = useNavigate()
    const location = useLocation()
    const registrationsContext = useUserRegistrations(authState)

    return (
    <>
    {!(location.pathname.toLowerCase() === '/org' || location.pathname.toLowerCase().includes("staff")) && <>

        <nav className='tournaments-select'>
                <Link className={mode === "all" ?  'selected-link'  : 'link'} to={"/org/admin/Tournaments/all"}>Most Relevant</Link>
                <Link className={mode === 'upcoming' ?  'selected-link'  : 'link'} to={"/org/admin/Tournaments/upcoming"}>Upcoming</Link>
                <Link className={mode === 'ongoing'  ?  'selected-link'  : 'link'} to={"/org/admin/Tournaments/ongoing"}>Ongoing</Link>
                <Link className={mode === 'completed'   ?  'selected-link'  : 'link'} to={"/org/admin/Tournaments/completed"}>Completed</Link>
        </nav>

        <HistoryNavbar/>

        {location.pathname.toLowerCase().includes('tournaments') && <div className={'createTournament-link'}>
            <a onClick={() => {



                Modal.confirm({
                    bodyStyle:{width:'100%',display:'grid',placeItems:'start',overflowX:'auto'},
                    title:authState.userDetails.organization.organization_name + ": Create new tournament",
                    okText:"Create",
                    cancelText:"Cancel",
                    content: <form className={'tournament-form'} id={'tournament-form'}>
                        <div className={'form-auth-field'}>
                            <label>Tournament name</label>
                            <input name={'name'} placeholder={"Enter Tournament name"}
                                style={{border:'1px solid lightgray'}}
                               className={'input-auth'}/>
                            <div className={'form-auth-field'}>
                                <label>Tournament Type</label>
                                <select name={'type'} className={'select'}>
                                    <option name={'SWISS_BO_1'} value={1}>SWISS_BO 1</option>
                                    <option name={'SWISS_BO_2'} value={3}>SWISS_BO 3</option>
                                </select>
                            </div>
                            <div className={'form-auth-field'}>
                                <label>Tournament Date</label>
                                <input name={'start_time'} id={'start_time'} type={'datetime-local'} />
                            </div>
                        </div>
                    </form>,
                    onOk: async () => {
                        const form = document.getElementById("tournament-form")
                        const tournament = Object.fromEntries( new FormData(form).entries() )
                        tournament.organization_id = authState.userDetails.organization.id
                        tournament.type = parseInt(tournament.type)

                        const selectedDate = new Date(tournament.start_time)

                        if( selectedDate.getTime() < new Date().getTime()) {
                            message.info("You must select a date in the future")
                            return;
                        }

                        tournament.start_time = selectedDate.toISOString()

                        const onData = data => {
                            message.success({
                                content:data.message,
                                duration:2
                            })
                            setTimeout(() => {
                                navigate("/Tournament/" + data.id + "/admin")
                            }, 250)
                        }
                        await createTournament(tournament,onData,authState.token)
                    }
                })
                setTimeout(() => {
                    // Get a reference to the input element by its ID
                    const startTimeInput = document.getElementById('start_time');
                    if(!startTimeInput) return
                    // Get the current date and time as an ISO string (e.g., "2023-01-15T15:00")
                    const currentDateTime = new Date(); // Slice to remove seconds and milliseconds
                    // Set the minimum value for the input field to the current date and time
                    startTimeInput.setAttribute('min', currentDateTime.toISOString().slice(0,16));
                },100)
            }}>Create Tournament</a>
        </div>}</>}

        <div className="App">
            <header className="App-header">
                <Outlet context={registrationsContext} />
            </header>
        </div>
    </>
)
}

export default OrganizationTournamentsLayout