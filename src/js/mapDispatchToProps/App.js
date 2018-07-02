import {setCurrModule} from "../reducers/AppReducer";

export const setModule= dispatch=>{
    return{
        setModule:module=>dispatch(setCurrModule(module))
    }
}