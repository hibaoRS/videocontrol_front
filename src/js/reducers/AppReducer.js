//action types
const SET_CURR_MODULE = "SET_CURR_MODULE"
const INIT_IS_SHOW_APPMANAGE = "INIT_IS_SHOW_APPMANAGE"

//reducer 根据action改变状态
export default (state, action) => {
    if (!state) {
        return {module: "0", isShowAppManage: 0}
    }

    switch (action.type) {
        case SET_CURR_MODULE:
            return {...state, module: action.module}
        case INIT_IS_SHOW_APPMANAGE:
            return {...state, isShowAppManage: action.isShowAppManage}
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

export const initIsShowAppManage = (isShowAppManage) => {
    return {
        isShowAppManage,
        type: INIT_IS_SHOW_APPMANAGE
    }
}