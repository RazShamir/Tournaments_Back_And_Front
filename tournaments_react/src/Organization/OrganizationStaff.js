import {Children, useCallback, useContext, useEffect, useState} from "react";
import {createOrganizationAdmin, getOrganizationStaff, getUsers} from "../Network/services";
import {Context} from "../Context/Context";
import {InfinitySpin} from "react-loader-spinner";
import {Link} from "react-router-dom";
import {message, Modal} from "antd";
import HistoryNavbar from "../HistoryNavbar/HistoryNavbar";



export const UserListModal = ({userList, addStaff, organizationAdmins = true}) => {

    const [filteredUserList, setFilteredUserList] = useState(userList)

    const filterUsers = (prefix) => {
        if(!prefix || prefix.length < 1) {
            setFilteredUserList(userList)
            return
        }
        if(organizationAdmins) {
            setFilteredUserList(userList.filter(user => user.username.toLowerCase().includes(prefix.toLowerCase())))
        } else {
            setFilteredUserList(userList.filter(user => user.user.username.toLowerCase().includes(prefix.toLowerCase())))
        }
    }
    return  <ul className={"staff-list"}>
            <input className={"search-bar"} placeholder={"Search user"} onInput={(e) => filterUsers(e.target.value)}/>
            {Children.toArray( filteredUserList.map(user => <button
                onClick={() => {
                    Modal.confirm({
                        content:
                            organizationAdmins ?
                            `Add ${user.username} as  Organization admin`
                        : `Add ${user.user.username} as Tournament admin`,
                        onOk:async  () => await addStaff(user)
                    })
                }}
            >
                {organizationAdmins ? user.username : user.user.username}
            </button>))}
        </ul>
}
export default function OrganizationStaff() {

    const {state: authState} = useContext(Context)

    const [organizationStaff,setOrganizationStaff] = useState(undefined)
    const [organizer,setOrganizer] = useState(undefined)

    const [users,setUsers] = useState(undefined)


    useEffect(() => {
        if(!authState.userDetails || !authState.userDetails.organization) return
            async function fetchStaff() {
                const onData = data => {
                    const {organizer, admins} = data
                    setOrganizationStaff(admins)
                    setOrganizer(organizer)
                }
                await getOrganizationStaff(authState.userDetails.organization.id,onData,(e) => {
                    setOrganizationStaff(null)
                    setOrganizer(null)
                },authState.token)
            }
            fetchStaff()
    }, [authState]);

    const OrganizerControls = useCallback(() => {
        if(authState.userDetails.id !== organizer?.id) return null
        return <div>
            <button className={"add-button"} onClick={async () => {
                const openModal = (users) => {
                    const onAdminAdded = (msg, user) => {
                        message.success(msg)
                        setOrganizationStaff([...organizationStaff, {
                            user
                        }])
                        // ourModal?.destroy()
                    }
                    const addStaff = async (user) => {
                        await createOrganizationAdmin(authState.userDetails.organization.id,{
                            "user_name": user.username,
                            "user_id": user.id
                        }, (msg) => {
                            onAdminAdded(msg,user)
                        },authState.token)
                    }

                     Modal.info({
                        icon:null,
                        content: <UserListModal userList={users}
                                                addStaff={addStaff}
                                                setOrganizationStaff={setOrganizationStaff}
                                                organizationStaff={organizationStaff}/>
                    })
                }
                const onData = users => {
                    setUsers(users)
                    openModal(users)
                }
                if(!users) {
                    await getUsers(onData,authState.token)
                } else {
                    openModal(users)
                }
            }}>Add organization admin</button>

        </div>
    },[authState,organizer])

    if(organizationStaff === undefined || organizer === undefined) {
        return <div className={"center spaced"}>
            <InfinitySpin
                width='200'
                color="#ffffff"
                />
        </div>
    }
    if(organizationStaff === null || organizer === null) {
        return <div>
            There was a problem. please try again later <Link to={"/org"}>Back to Organization page</Link>
        </div>
    }

    return <div>
        <HistoryNavbar excluded_path/>
        <br/>
        <br/>
        <div className={"Organizer-header"}>
            Organizer:  {organizer.username}
        </div>
        <div className={"Staff-header"}>
            Staff list:
        </div>
        <div className="staff-list-grid"> {/* Add the .staff-list-grid class to the container */}
            {organizationStaff.map(admin => (
                <div key={admin.user.id}> {/* You should also provide a unique key for each list item */}
                    {admin.user.username}
                </div>
            ))}
        </div>
        <OrganizerControls/>
    </div>
}