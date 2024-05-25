import {useOutletContext} from "react-router-dom";
import {Children, useCallback, useContext, useEffect, useState} from "react";
import CheckCircleFilled from '@ant-design/icons/CheckCircleFilled'
import UncheckedCircleFilled from '@ant-design/icons/CloseCircleFilled'
import './tournamentpage.css'
import {useParticipants} from "../../Hooks";
import {Context} from "../../Context/Context";

export default function TournamentRegistrations() {
    const {tournament,registration_status} = useOutletContext()
    const {state:authState} = useContext(Context)
    const participants = useParticipants(tournament.id,registration_status,authState)

    const schedules = [{time: new Date()}, {time: new Date()}, {time: new Date()}, {time: new Date()}]

    const phase1Date = new Date()

    const RegistrationsTable = useCallback(({ phase, schedules, date }) => {
        if (!participants) return null;
        return (
            <div className={'schedule-table variation'}>
                <h2 style={{ marginInline: 'auto' }}>Registrations</h2>
                <hr style={{ width: '100%' }} />
                <div className={'row'}>
                    <h4>Player</h4>
                    <h4>Checked in</h4>
                </div>
                {Children.toArray(
                    participants.map((registration, index) => (
                        <div className={'schedule-table-row'}>
                            <div className={'details'}>
                                <div className={'num ' + (registration.checked_in ? 'checked_in' : 'unchecked')}>
                                    {registration.username}
                                </div>
                                <div>
                                    {registration.checked_in ? (
                                        <CheckCircleFilled style={{ color: 'green' }} />
                                    ) : (
                                        <UncheckedCircleFilled style={{ color: '#bd3333' }} />
                                    )}
                                </div>
                            </div>
                            {index < participants.length - 1 && <div className={'hr'} />}
                        </div>
                    ))
                )}
            </div>
        );
    }, [participants]);

    return (
        <div className={'tournament-registrations'}>

            <RegistrationsTable phase={1} schedules={schedules} date={phase1Date}/>
        </div>
    )

}