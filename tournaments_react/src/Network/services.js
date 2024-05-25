import {message} from "antd";
import {get, post, put} from "./index";
import {useEffect, useState} from "react";



const onErrorDefault = (error) =>{
    alert("Error")
    message.error(error.message)
}

// AUTH //
export const authenticateUser = (loginState, onData) => {
    return post("auth/login", loginState, onData, onErrorDefault);
}

export const getUsers = (onData,token) => {
    return get("auth/users", onData, onErrorDefault,token);
}
export const createAccount = (signupState, onData) => {
    return post("auth/signup", signupState, onData, onErrorDefault);
}

export const getUserTournamentRegistrations = (onData,token) => {
   return get(`tournaments/registered_tournaments`, onData, () => {}, token)
}
// MATCH //
export const submitMatchResults = (match_id, results, onData, token) => {
    return post(`match/${match_id}/submit`,results, onData, onErrorDefault,token)
}

export const submitAdminMatchResults = (match_id,tournament_id,results,onData,token) => {
    return post(`tournament/${tournament_id}/match/${match_id}/set_result`,results, onData, onErrorDefault,token)
}

// TOURNAMENT //
export const getTournament = (Tid,onData ,onError) => {
    return get(`tournament/${Tid}`,onData,onError ?? onErrorDefault)
}
export const getTournamentMaxRounds = (Tid,onData ,onError) => {
    return get(`tournament/${Tid}/max_rounds`,onData,onError ?? onErrorDefault)
}
export const tournamentCheckIn = (Tid,onData, token) => {
    return put(`tournament/${Tid}/checkin`, undefined, onData,onErrorDefault,token)
}
export const registerToTournament = (Tid, participant, onData, token) => {
    return post(`tournament/${Tid}/register`, participant, onData, onErrorDefault, token)
}
export const unregisterFromTournament = (Tid, onData, token) => {
    return post(`tournament/${Tid}/unregister`,undefined, onData, onErrorDefault, token)
}
export const unregisterParticipantsFromTournament = (Tid, participants, onData, token) => {
    //participants = {participants_ids: [...]}
    return post(`tournament/${Tid}/unregister_participants`,participants, onData, onErrorDefault, token)
}

export const getTournamentParticipants = (Tid, onData) => {
    return get(`tournament/${Tid}/participants`, onData,() => {})
}

export const getTournamentConflicts = (Tid,onData,token) => {
    return get(`tournament/${Tid}/admin/match_conflicts`,onData,(e) =>{},token)
}

export const createTournament = (tournament,onData,token) => {
    return post("tournament/create", tournament, onData, onErrorDefault, token)
}
export const editTournament = (Tid, tournament, onData, token) => {
    return put(`tournament/${Tid}/update`,tournament,onData,onErrorDefault,token)
}

export const startTournament = (Tid, onData, token) =>{
    return post(`tournament/${Tid}/start`,undefined, onData,onErrorDefault, token)
}

export const endTournament = (Tid, onData, token) =>{
    return post(`tournament/${Tid}/end`,undefined, onData,onErrorDefault, token)
}
export const startTournamentNextRound = (Tid, onData, token) =>{
    return post(`tournament/${Tid}/startround`,undefined, onData,onErrorDefault, token)
}
export const getTournamentRounds =  (Tid, onData, token) => {
    return get(`tournament/${Tid}/pairings`,onData,onErrorDefault,token)
}


// ORGANIZATION //
export const createOrganization = (tournament, onData,token) => {
    return post('org/new',tournament, onData, onErrorDefault, token)
}

export const createOrganizationAdmin = (organization_id, user,onData,token) => {
    return post(`org/${organization_id}/admin/new`,user, onData, onErrorDefault, token)
}

export const createTournamentAdmin = (organization_id,tournament_id, user,onData,token) => {
    return post(`org/${organization_id}/tournament/${tournament_id}/admin/new`,user, onData, onErrorDefault, token)
}


export const getOrganizationStaff = (organization_id,onData,onError,token) => {
    return get(`org/${organization_id}/admin/list`, onData, onError, token)
}

export const getTournamentStaff = (tournament_id,onData,onError,token) => {
    return get(`tournament/${tournament_id}/admin/list`, onData, onError, token)
}


export const getTournamentsByOrganization = (orgId, mode, onData) => {
    return get(`tournaments_by_org/` + orgId + (mode ? ("/" + mode) : ""), onData, onErrorDefault)
}
