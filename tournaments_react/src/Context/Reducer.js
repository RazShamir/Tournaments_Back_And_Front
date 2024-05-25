

export const isOrganizationAdministrator = (userDetails) => {
    return userDetails && userDetails.administration && userDetails.administration.length > 0
}
const Reducer = (state, action) => {
    switch (action.type) {
        case "LOGIN":
            localStorage.setItem("username", action.payload.user);
            localStorage.setItem("accessToken", action.payload.token);
            return {
                ...state,
                isAuthenticated: true,
                user: action.payload.user,
                token: action.payload.token
            };
        case "SET_USER":
            action.payload.isTournamentAdmin  = (tournament_id) => {
                if(action.payload.is_staff || action.payload.is_superuser) return true // staff or superuser
                if(action.payload.organization && action.payload.organization.organizer_id === action.payload.id) return true // user is organization organizer
                // user is organization admin -> check if he administrates this tournament
                const all_tournaments =  action.payload.administration?.reduce((prev,next) => {
                    return [...prev, ...next.managing_tournaments]
                },[])
                return all_tournaments &&
                    all_tournaments.length > 0 && all_tournaments.find(t => t.tournament_id === tournament_id)
            }
            if(isOrganizationAdministrator(action.payload)) {
                action.payload.organization = action.payload.administration[0].organization
            }
            console.log(action.payload)
            return  {
                ...state,
                userDetails: action.payload
            }
        case "SET_ORGANIZATION":
            return  {
                ...state,
                userDetails: {
                    ...state.userDetails,
                    organization:action.payload
                }
            }
        case "LOGOUT":
            localStorage.clear();
            return {
                ...state,
                isAuthenticated: false,
                user: null,
                userDetails:undefined
            };
        default:
            return state;
    }
};

export default Reducer;