
const get = (endpoint,onData,onError,token = null) => {
    return fetch( "http://localhost:8000/api/" + endpoint,
        {
            method: 'GET',
            headers: token ? {
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + token
            } :  { 'Content-Type': 'application/json' },
        }).then(response => response.json())
        .then(data => {
            if(data.code && data.code === "token_not_valid") {
                localStorage.removeItem('accessToken')
                window.location.reload()
            }
            return data
        })
        .then(onData)
        .catch(onError)
}

const post = (endpoint,body,onData,onError, token = null) => {
    return fetch("http://localhost:8000/api/" + endpoint,
        {
            method: 'POST',
            headers: token ? {
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + token,
            } :  { 'Content-Type': 'application/json' },
            body: body ? JSON.stringify(body) : undefined
        }).then(response => response.json())
        .then(data => {
            if(data.code && data.code === "token_not_valid") {
                localStorage.removeItem('accessToken')
                window.location.reload()
            }
            return data
        })
        .then(onData)
        .catch(onError)
}

const put = (endpoint,body,onData,onError, token = null) => {
    return fetch("http://localhost:8000/api/" + endpoint,
        {
            method: 'PUT',
            headers: token ? {
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + token,
            } :  { 'Content-Type': 'application/json' },
            body: body ? JSON.stringify(body) : undefined
        }).then(response => response.json())
        .then(data => {
            if(data.code && data.code === "token_not_valid") {
                localStorage.removeItem('accessToken')
                window.location.reload()
            }
            return data
        })
        .then(onData)
        .catch(onError)
}

export { get, post,put }