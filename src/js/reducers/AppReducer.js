//action types
const SET_CURR_MODULE = "SET_CURR_MODULE"
const INIT_IS_SHOW_APPMANAGE = "INIT_IS_SHOW_APPMANAGE"
const SET_ACTIVATION_STATE = "SET_ACTIVATION_STATE"

//reducer 根据action改变状态
export default (state, action) => {
    if (!state) {
        return {
            module: "0",
            isShowAppManage: 0,
            activate: sessionStorage.getItem("activate") ? sessionStorage.getItem("activate") == 1 ? 1 : 0 : 0
        };
    }

    switch (action.type) {
        case SET_CURR_MODULE:
            return {...state, module: action.module};
        case INIT_IS_SHOW_APPMANAGE:
            return {...state, isShowAppManage: action.isShowAppManage};
        case SET_ACTIVATION_STATE: {
            sessionStorage.setItem("activate", action.activate);
            return {...state, activate: action.activate};
        }
        default :
            return state

    }
}


//actions 封装好的action
export const setCurrModule = module => {
    return {
        type: SET_CURR_MODULE,
        module
    }
}

export const initIsShowAppManage = isShowAppManage => {
    return {
        isShowAppManage,
        type: INIT_IS_SHOW_APPMANAGE
    }
}

export const setActivateState = activate => {
    return {
        activate,
        type: SET_ACTIVATION_STATE
    }
}