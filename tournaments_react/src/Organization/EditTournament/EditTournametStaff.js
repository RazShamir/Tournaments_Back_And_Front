import {Children, useCallback, useContext, useEffect, useState} from "react";
import {Context} from "../../Context/Context";
import {
    createOrganizationAdmin,
    createTournamentAdmin,
    getOrganizationStaff,
    getTournamentStaff,
    getUsers
} from "../../Network/services";
import {message, Modal} from "antd";
import {InfinitySpin} from "react-loader-spinner";
import {Link, useParams} from "react-router-dom";
import {UserListModal} from "../OrganizationStaff";

export default function EditTournamentStaff() {


    const {Tid} = useParams()
    const {state: authState} = useContext(Context)

    const [tournamentStaff,setTournamentStaff] = useState(undefined)
    const [users,setUsers] = useState(undefined)


    useEffect(() => {
        if(!authState.userDetails || !authState.userDetails.organization) return
        async function fetchStaff() {
            const onData = data => {
                setTournamentStaff(data)
            }
            await getTournamentStaff(Tid,onData,(e) => {
                setTournamentStaff(null)
            },authState.token)
        }
        fetchStaff()
    }, [authState]);


    const TournamnetControls = useCallback(() => {
        return <div>
            <button className={"add-button"} onClick={async () => {


                const onAdminAdded = (msg, user) => {
                    message.success(msg)
                    setTournamentStaff([...tournamentStaff, {
                        user
                    }])
                }
                const addStaff = async ({user}) => {
                    await createTournamentAdmin(
                        authState.userDetails.organization.id,
                        Tid,
                        {
                            "user_name": user.username,
                            "user_id": user.id
                        }, (msg) => {
                            onAdminAdded(msg,user)
                        }, authState.token)
                }
                const openModal = (users) => {

                    console.log(users)
                    Modal.info({
                        icon:null,
                        content: <UserListModal organizationAdmins={false} addStaff={addStaff} userList={users}/>
                    })
                }
                const onData = ({admins,organizer}) => {
                    setUsers(admins)
                    openModal(admins)
                }
                if(!users) {
                    await getOrganizationStaff(authState.userDetails.organization.id, onData,
                        (e) => {message.error(e.message)},authState.token)
                }else {
                    openModal(users)
                }
            }}>Add tournament admin</button>

        </div>
    },[authState,tournamentStaff])

    if(tournamentStaff === undefined) {
        return <div className={"center spaced"}>
            <InfinitySpin
                width='200'
                color="#ffffff"
            />
        </div>
    }
    if(tournamentStaff === null) {
        return <div>
            There was a problem. please try again later
        </div>
    }

    return <div className={"edit-staff"}>
        <div>
            Staff list
        </div>

        <div className="staff-list-grid"> {/* Add the .staff-list-grid class to the container */}
            {tournamentStaff.map(admin => (
                <div key={admin.user.id}> {/* You should also provide a unique key for each list item */}
                    {admin.user.username}
                </div>
            ))}
        </div>
        <TournamnetControls/>
    </div>
}