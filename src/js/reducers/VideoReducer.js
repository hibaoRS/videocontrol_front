//action types
const MAIN_INIT = "main_init"
const MAIN_PLAY = "main_play"
const MAIN_SWITCH = "main_switch"


//reducer 根据action改变状态
export default (state, action) => {
    if (!state) {
        return {main: {indexes: [], index: 0}, play: false}
    }

    switch (action.type) {
        case MAIN_INIT:
            return {main: {...state.main, ...action.main}, play: false}
        case MAIN_PLAY:
            return {...state, play: action.play}
        case MAIN_SWITCH:
            let indexes = state.main.indexes
            let index = action.index
            let oldIndex = state.main.index;
            [indexes[oldIndex], indexes[index]] = [indexes[index], indexes[oldIndex]];

            return {...state, main: {...state.main, indexes}, play: false}
        default :
            return state
    }
}


//actions 封装好的action
export const initMain = main => {
    return {
        type: MAIN_INIT,
        main
    }
}

export const play = play => {
    return {
        type: MAIN_PLAY,
        play
    }
}

export const switchMain = index => {
    return {
        type: MAIN_SWITCH,
        index
    }
}
