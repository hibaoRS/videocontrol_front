//action types
const USER_LOGIN = "user_login"
const USER_LOGOUT = "user_logout"


//reducer 根据action改变状态
export default (state, action) => {
    if (!state) {
        let user = sessionStorage.getItem("user")
        return {user: user ? JSON.parse(user) : null}
    }

    switch (action.type) {
        case USER_LOGIN:
            //去除密码
            delete action.user.password
            sessionStorage.setItem("user", JSON.stringify(action.user))
            return {user: action.user}

        case USER_LOGOUT:
            sessionStorage.removeItem("login")
            sessionStorage.removeItem("user");
            window.location.href = "/login"
            return {user: null};
        default :
            return state
    }
}


//actions 封装好的action
export const userLogin = user => {
    return {
        type: USER_LOGIN,
        user
    }
}

export const userLogout = () => {
    return {
        type: USER_LOGOUT
    }
}

