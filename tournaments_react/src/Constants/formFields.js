const loginFields=[
    {
        labelText:"Username",
        labelFor:"Username",
        id:"username",
        name:"Username",
        type:"text",
        autoComplete:"Username",
        isRequired:true,
        placeholder:"Username"
    },
    {
        labelText:"Password",
        labelFor:"password",
        id:"password",
        name:"password",
        type:"password",
        autoComplete:"current-password",
        isRequired:true,
        placeholder:"Password"   
    }
]

const signupFields=[
    {
        labelText:"Username",
        labelFor:"username",
        id:"username",
        name:"username",
        type:"text",
        autoComplete:"username",
        isRequired:true,
        placeholder:"Username"   
    },
    {
        labelText:"Email address",
        labelFor:"email-address",
        id:"email",
        name:"email",
        type:"email",
        autoComplete:"email",
        isRequired:true,
        placeholder:"Email address"   
    },
    {
        labelText:"Password",
        labelFor:"password",
        id:"password",
        name:"password",
        type:"password",
        autoComplete:"current-password",
        isRequired:true,
        placeholder:"Password"   
    },
    {
        labelText:"First name",
        labelFor:"First name",
        id:"first_name",
        name:"First name",
        type:"First name",
        autoComplete:"First name",
        isRequired:true,
        placeholder:"First name"   
    },
    {
        labelText:"Last name",
        labelFor:"Last name",
        id:"last_name",
        name:"Last name",
        type:"Last name",
        autoComplete:"Last name",
        isRequired:true,
        placeholder:"Last name"   
    },
    {
        labelText:"Confirm Password",
        labelFor:"confirm-password",
        id:"confirm-password",
        name:"confirm-password",
        type:"password",
        autoComplete:"confirm-password",
        isRequired:true,
        placeholder:"Confirm Password"   
    }
]

const registrasionField = [
    {
        labelText:"In-game name",
        labelFor:"In-game name",
        id:"game_username",
        name:"In-game name",
        type:"text",
        autoComplete:"In-game name",
        isRequired:true,
        placeholder:"In-game name"   
    }
]

const createOrgField = [
    {
        labelText:"Organization name",
        labelFor:"Organization name",
        id:"organization_name",
        name:"Organization name",
        type:"text",
        autoComplete:"Organization name",
        isRequired:true,
        placeholder:"Organization name"   
    }
]

export {loginFields,signupFields, registrasionField, createOrgField}