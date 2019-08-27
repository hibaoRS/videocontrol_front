import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';
import registerServiceWorker from './registerServiceWorker';
import "bootstrap/dist/css/bootstrap.min.css"

import App from "./App";
import {Provider} from "react-redux";
import store from "./js/Store"
import {BrowserRouter} from "react-router-dom";
import axios from "axios"
import zhCN from 'antd/lib/locale-provider/zh_CN';
import {LocaleProvider} from "antd";

axios.defaults.withCredentials = true

// window.serverUrl = "/videocontrol/";
// window.videoUrl = window.location.host + "/disk/videos/";
window.serverUrl = "http://127.0.0.1/php/videocontrol_back/";
window.videoUrl = "http://127.0.0.1/php/videocontrol_back/videos";

// window.serverUrl = "http://192.168.43.242/videocontrol/";
// window.serverUrl = "http://192.168.1.100/videocontrol/";
// window.serverUrl = "http://192.168.1.222/videocontrol/";
// window.serverUrl = "http://192.168.2.162/videocontrol/";
// window.serverUrl = "http://127.0.0.1/videocontrol/";

ReactDOM.render(
    // <Reflv
    //     url={`http://192.168.1.222/disk/videos/course/365.mp4`}
    //     // url={`http://192.168.1.222:8080/live/1.flv`}
    //     type="mp4"
    //     cors
    //     hasAudio={true}
    //     hasVideo={true}
    //     config={{
    //         enableWorker: false,
    //         enableStashBuffer: true,
    //     }}
    // />
    <Provider store={store}>
        <BrowserRouter>
            <LocaleProvider locale={zhCN}>
                <App/>
            </LocaleProvider>
        </BrowserRouter>
    </Provider>
    , document.getElementById('root'));
registerServiceWorker();
