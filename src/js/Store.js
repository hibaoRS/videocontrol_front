import { combineReducers, createStore} from "redux";
import VideoReducer from "./reducers/VideoReducer";
import UserReducer from "./reducers/UserReducer";
import AppReducer from "./reducers/AppReducer";

const reducer = combineReducers({
        video: VideoReducer,
        user:UserReducer,
        app:AppReducer
    }
)

export default createStore(reducer)