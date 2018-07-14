import React from "react";
import styles from "./Main.module.css"
import axios from "axios";
import * as layouts from "../config/layouts";
import {Button, Icon, Input, InputNumber, Switch, Select, Slider} from "antd"
import VideoPlayer from "./flv/VideoPlayer";
import {connect} from "react-redux";
import {switchMain} from "../reducers/VideoReducer";
import {setCurrModule} from "../reducers/AppReducer";
import {message} from "antd";
import {userLogout} from "../reducers/UserReducer";
import {setActivateState} from "../reducers/AppReducer";
import * as Utils from "../utils/Utils"
import InfiniteScroll from "react-infinite-scroll-component";
import $ from "jquery";

const Option = Select.Option;


class Main extends React.Component {

    names = ["学生特写", "教师特写", "学生全景", "教师全景", "板书特写", "课件画面", "主播"];
    keys = ["student_closeUp", "teacher_closeUp", "student_panorama", "teacher_panorama", "board_closeUp", "custom",];

    standbyPlayers = [];
    hideStandbyTimeouts = [];

    onHandleRecord = false;
    onHandleSwitch = false;
    onHandlePause = false;
    onHandleLive = false;

    actionTimeout = 700

    constructor(props) {
        super()

        window.$ = $
        this.state = {
            cameraPresetMode: false,
            menuExpand: false,
            monitor_styles: [],
            mainPanel: [],
            layoutName: "",
            recording: 0,
            living: 0,
            liveTimeCount: 0,
            recordTimeCount: 0,
            autoSwitch: 1,
            lastPauseTime: 0,
            pausedTime: 0,
            pause: 0,
            livedTime: 0,
            recordedTime: 0,
            signal: ["255", "255", "255", "255", "255", "255"],
            showStandbys: new Array(3).fill(false),
            standbyUrls: [],
            newStandbyUrls: [],
            onHandleRecord: false,
            onHandleSwitch: false,
            onHandlePause: false,
            onHandleLive: false,
        }

        if (!props.user) {
            props.history.push("/login");
            return;
        }

        props.setModule("0")
        this.getSystemState();
        this.getSignals();
    }


    getSystemState = () => {
        axios.get(window.serverUrl + "system.php", {params: {action: "recordLiveState"}}).then(res => {
            if (res.data.code) {
                let data = res.data.data
                /** let data = {
                    living: 1,
                    recording: 0,
                    autoSwitch: 0,
                    recordTime: 0,
                    liveTime: 1500090
                }**/

                if (data.liveTime == 0) {
                    data.liveTime = new Date().getTime();
                    axios.get(window.serverUrl + "main.php", {params: {action: "initLiveTime", time: data.liveTime}});
                }

                this.setState({
                    living: data.living,
                    recording: data.recording,
                    autoSwitch: data.autoSwitch,
                    recordTime: data.recordTime,
                    liveTime: data.liveTime,
                    lastPauseTime: data.lastPauseTime,
                    pausedTime: data.pausedTime,
                    pause: data.pause
                });

                if (data.living) {
                    this.startLiveTimer();
                } else {
                    this.stopLiveTimer();
                }
                if (data.recording) {
                    this.startRecordTimer();
                } else {
                    this.stopRecordTimer();
                }
            } else {
                message.error("初始化失败，请重新登录或重启系统");
                this.props.userLogout()
            }
        }).catch(error => console.log(error));
    }


    componentDidMount() {
        if (this.props.user)
            this.initConfig()

        //设置定时刷新
        this.refreshInterval = setInterval(this.refresh, 1000 * 60 * 60);
        //获取信号信息
        this.getSignalsInterval = setInterval(this.getSignals, 7000);
        //获取激活状态
        this.getActivateState();
    }

    componentWillMount() {
        //主页控制面板
        axios.post(window.serverUrl + "main.php?action=getHtmlMain").then((res) => {
            if (res.data.code) {
                let html = res.data.data;
                let extractscript = /<script>([\s\S]+)<\/script>/gi.exec(html);
                if (extractscript) {
                    html = html.replace(extractscript[0], "");
                    window.eval(extractscript[1]);
                }
                this.setState({html})
            }
        }).catch((e) => {
            console.log(e)
        })
    }

    componentWillUnmount() {
        if (this.liveTimer) {
            clearInterval(this.liveTimer)
        }
        if (this.recordTimer) {
            clearInterval(this.recordTimer)
        }
        //清除定时刷新
        clearInterval(this.refreshInterval)
        clearInterval(this.getSignalsInterval)

    }


    getActivateState = () => {
        axios.get(window.serverUrl + "main.php?action=getActivateState").then(({data}) => {
            if (data.code === 1) {
                this.props.setActivateState({
                    activate: data.data.activate ,
                    expiryTime: data.data.expiryTime,
                    activateTime: data.data.activateTime,
                });
            } else {
                this.props.setActivateState({
                    activate: 0,
                    expiryTime: 0,
                    activateTime: 0,
                });
            }
        })
    }


    getSignals = () => {
        axios.get(window.serverUrl + "main.php?action=getSignals").then(res => {
            if (res.data.code === 1) {
                let signal = res.data.data.signal;
                if (!Utils.isArrayEquals(this.state.signal, signal)) {
                    this.setState({signal})
                }
            }
        }).catch(e => console.log(e))
    }

    refresh = () => {
        window.location.href = window.location.href
    }

    myLiveTimer = () => {
        if (this.state.living) {
            this.setState({livedTime: new Date().getTime() - this.state.liveTime})
        }
    }
    myRecordTimer = () => {
        if (this.state.recording && !this.state.pause) {
            this.setState({recordedTime: new Date().getTime() - this.state.recordTime - this.state.pausedTime})
        }
    }

    startLiveTimer() {
        if (this.liveTimer) {
            clearInterval(this.liveTimer)
        }
        this.liveTimer = setInterval(this.myLiveTimer, 1000)
    }

    stopLiveTimer() {
        if (this.liveTimer) {
            clearInterval(this.liveTimer)
            this.setState({livedTime: 0})
        }
    }

    startRecordTimer() {
        if (this.recordTimer) {
            clearInterval(this.recordTimer)
        }
        this.recordTimer = setInterval(this.myRecordTimer, 1000)

    }

    stopRecordTimer() {
        if (this.recordTimer) {
            clearInterval(this.recordTimer)
            this.setState({recordedTime: 0})
        }
    }


    getTimeString = (time) => {
        let date = new Date();
        date.setTime(time);
        let hours = date.getUTCHours() + "";
        let seconds = date.getUTCSeconds() + "";
        let minutes = date.getUTCMinutes() + "";


        hours = this.addZero(hours);
        seconds = this.addZero(seconds);
        minutes = this.addZero(minutes);

        return hours + ":" + minutes + ":" + seconds;
    }


    addZero = (string) => {
        if (string.length === 1) {
            return "0" + string;
        } else {
            return string;
        }
    }


    changeLayout = ({layoutName, urls}) => {

        if (layoutName !== this.state.layoutName) {
            let styles = layouts[layoutName];
            //let index = styles[styles.length - 1].index
            //urls未传入，代表更换布局；urls传入，直接初始化
            // let indexes = [];
            if (urls) {
                // urls = [
                //     "http://172.16.15.226/live2?app=live&stream=6&a=6.flv",
                //     "http://172.16.15.226/live2?app=live&stream=6&a=6.flv",
                //     "http://172.16.15.226/live2?app=live&stream=6&a=6.flv",
                //     "http://172.16.15.226/live2?app=live&stream=6&a=6.flv",
                //     "http://172.16.15.226/live2?app=live&stream=6&a=6.flv",
                //     "http://172.16.15.226/live2?app=live&stream=6&a=6.flv",
                //     "http://172.16.15.226/live2?app=live&stream=6&a=6.flv",
                // ]
                // urls=["http://192.168.1.222/6.flv"]
                //     this.props.switchMain(index)
                //     this.props.initMain({index: index})
                // } else {
                //     for (let i = 0; i < 10; i++) {
                //         indexes[i] = i;
                //     }

                // console.log(layoutName)

                let myUrls = Array(10);

                switch (layoutName) {
                    case "layout_default": {
                        myUrls[0] = urls[6]
                        myUrls[1] = urls[0]
                        myUrls[4] = urls[3]
                        myUrls[5] = urls[4]
                        myUrls[3] = urls[2]
                        myUrls[6] = urls[5];
                        myUrls[2] = urls[1];
                        break;
                    }

                    case "layout_one": {
                        myUrls[0] = urls[6]
                        break;
                    }

                    case "layout_left_right": {
                        myUrls[0] = urls[6]
                        myUrls[1] = urls[0]
                        myUrls[2] = urls[1]
                        break;
                    }
                    case "layout_center": {
                        myUrls[3] = urls[6]
                        myUrls[0] = urls[0]
                        myUrls[1] = urls[1]
                        myUrls[2] = urls[2]
                        myUrls[4] = urls[4]
                        myUrls[5] = urls[5]
                        myUrls[6] = urls[3]
                        break;
                    }
                    case "layout_nine": {
                        myUrls[0] = urls[6];
                        myUrls[8] = urls[5]
                        myUrls[7] = urls[2]
                        myUrls[2] = urls[3]
                        myUrls[5] = urls[4]
                        myUrls[4] = urls[1]
                        myUrls[1] = urls[0]
                        break;
                    }
                    default:
                        break;
                }

                // console.log(myUrls)

                this.urls = myUrls

                // this.props.initMain({index: index, indexes})
            }
            this.setState({monitor_styles: styles, layoutName: layoutName});
        }
    }


    initConfig() {
        axios.get(window.serverUrl + "main.php", {params: {action: "getConfig"}}).then(res => {
            if (res.data.code) {
                let urls = res.data.data.video_urls
                this.changeLayout({
                    layoutName: this.isPhone() && !sessionStorage.getItem("change") ? "layout_one" : res.data.data.layout,
                    urls: urls
                })
                this.setState({
                    ...this.state, ...res.data.data,
                    newStandbyUrls: [...res.data.data.standbyUrls]
                    /**
                     sectionTime: res.data.data.sectionTime,
                     configs: res.data.data.configs,
                     recordName: res.data.data.recordName,
                     standbyUrls: res.data.data.standbyUrls
                     **/
                })
            } else {
                console.log(res.data.data);
            }
        }).catch(error => console.log(error));
    }


    isPhone = () => {
        if (/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent)) {
            return true;
        } else {
            return false;
        }

    }
    //
    // switch = (index) => {
    //     let oldIndex = this.props.main.index;
    //     [this.urls[oldIndex], this.urls[index]] = [this.urls[index], this.urls[oldIndex]];
    // }


    //显示备播设置
    showStandby = (standbyIndex, flag) => {
        if (flag && this.hideStandbyTimeouts[standbyIndex]) {
            clearTimeout(this.hideStandbyTimeouts[standbyIndex])
        }
        let showStandbys = this.state.showStandbys
        showStandbys[standbyIndex] = flag
        this.setState({showStandbys})
    }

    hideStandby = (standbyIndex, flag) => {
        this.hideStandbyTimeouts[standbyIndex] = setTimeout(this.showStandby.bind(this, standbyIndex, flag), 3000);
    }

    standbyPlay = (standbyIndex) => {
        let standbyUrls = [...this.state.standbyUrls]
        standbyUrls[standbyIndex] = this.state.newStandbyUrls[standbyIndex]

        axios.get(window.serverUrl + "main.php", {
            params: {
                action: "setStandByUrl",
                index: standbyIndex,
                url: this.state.newStandbyUrls[standbyIndex]
            }
        }).then((res) => {
            if (res.data.code == 1) {
                if (this.state.standbyUrls[standbyIndex]) {
                    this.standbyPlayers[standbyIndex].changeUrl(this.state.newStandbyUrls[standbyIndex]);
                }
                this.setState({standbyUrls})
            }
        }).catch(e => console.log(e))
    }

    changeStandbyUrls = (standbyIndex, node) => {
        let val = node.target.value
        let newStandbyUrls = this.state.newStandbyUrls
        newStandbyUrls[standbyIndex] = val
        this.setState({newStandbyUrls})
    }

    setStandbyPlayer = (standbyIndex, node) => {
        if (node && !this.standbyPlayers[standbyIndex]) {
            this.standbyPlayers[standbyIndex] = node
        }
    }
    closeStandby = (standbyIndex) => {
        let standbyUrls = [...this.state.standbyUrls]
        let newStandbyUrls = [...this.state.newStandbyUrls]

        if (standbyUrls[standbyIndex] || newStandbyUrls[standbyIndex]) {
            newStandbyUrls[standbyIndex] = ""
            standbyUrls[standbyIndex] = ""
            axios.get(window.serverUrl + "main.php", {
                params: {
                    action: "setStandByUrl",
                    index: standbyIndex,
                    url: ""
                }
            }).then((res) => {
                if (res.data.code == 1) {
                    this.setState({standbyUrls, newStandbyUrls})
                }
            }).catch(e => console.log(e))
        }
        this.showStandby(standbyIndex, false)

    }

    render() {
        let standbyIndex = -1;
        return (
            <div>
                <div className={styles.monitors}>
                    {this.state.mainPanel.enabled == 1 ? (<div className={styles.menuContainer}>
                        <div className={styles.menu} onClick={this.handleMenuExpand}/>
                        <div
                            style={{display: this.state.menuExpand ? "block" : "none"}}
                            className={styles.menuContent}>
                            <InfiniteScroll
                                style={{
                                    width: this.state.mainPanel.width,
                                    height: this.state.mainPanel.height
                                }}>
                                <div dangerouslySetInnerHTML={{__html: this.state.html}}/>
                            </InfiniteScroll>
                        </div>
                    </div>) : ""}

                    {this.state.monitor_styles.map((style, i) => {
                        let index;
                        if (i <= 6 && this.urls[i]) {
                            index = parseInt(this.urls[i].substr(-5, 1))
                        }
                        let titleName = !!this.urls[i] ? this.names[this.urls[i].substr(-5, 1)] : "备播";
                        if (titleName === "备播") {
                            standbyIndex = standbyIndex + 1
                        }
                        let isStandby = titleName === "备播" && standbyIndex >= 0 && standbyIndex <= 2

                        return this.state.monitor_styles.length - 1 !== i ? (
                            <div className={styles.monitor} key={i} style={{...style}}>
                                <div
                                    onMouseEnter={isStandby ? this.showStandby.bind(this, standbyIndex, true) : undefined}
                                    onMouseLeave={isStandby ? this.hideStandby.bind(this, standbyIndex, false) : undefined}
                                    className={styles.title}>
                                    <div>{titleName}</div>
                                    {titleName === "备播" && this.state.showStandbys[standbyIndex] === true ?
                                        <div style={{marginLeft: "3px", display: "flex", flexDirection: "row"}}>
                                            <Input
                                                onChange={this.changeStandbyUrls.bind(this, standbyIndex)}
                                                value={this.state.newStandbyUrls[standbyIndex]} placeholder={"请输入备播url"}
                                                style={{width: "9vw", height: "20px"}}/>
                                            <Button onClick={this.standbyPlay.bind(this, standbyIndex)}
                                                    style={{width: "45px", height: "20px"}}
                                                    size={"small"}>播放</Button>
                                            <Icon onClick={this.closeStandby.bind(this, standbyIndex)} type="close"
                                                  className={styles.hideStandby}/>
                                        </div>
                                        : ""}
                                </div>

                                {(isStandby && !!this.state.standbyUrls[standbyIndex])
                                || (this.state.living && (((this.urls[i] && (this.state.signal[index] !== "255")))
                                    || index === 6)) ?
                                    <VideoPlayer
                                        ref={isStandby ? this.setStandbyPlayer.bind(this, standbyIndex) : undefined}
                                        onClick={this.switchMonitorMain} index={i}
                                        url={isStandby && !!this.state.standbyUrls[standbyIndex] ? this.state.standbyUrls[standbyIndex] : this.urls[i]}/> : ""}
                            </div>
                        ) : ""
                    })}
                </div>
                <div className={styles.content}>
                    <div>
                        <span>录制控制</span>
                        <div>
                            <div>
                                <div>
                                    <Button disabled={this.props.activate !== 1 || this.state.onHandleRecord}
                                            onClick={this.handleRecord}>
                                        <i className={this.state.recording ? "iconfont icon-stop" : "iconfont icon-circle"}
                                           style={{color: this.state.recording ? "#00FF00" : "red"}}/>
                                        &nbsp;&nbsp;{this.state.recording ? "停止录制" : "开始录制"}
                                    </Button>
                                </div>
                                <div>
                                    <Button
                                        disabled={this.props.activate !== 1 || !this.state.recording || this.state.onHandlePause}
                                        onClick={this.handlePauseRecord}
                                        icon={this.state.recording ? this.state.pause ? "caret-right" : "pause" : "pause"}>
                                        {this.state.recording ? this.state.pause ? "继续录制" : "暂停录制" : "暂停录制"}
                                    </Button>
                                </div>
                            </div>
                            <div style={{margin: ".4rem", display: "flex", alignItems: "center"}}>
                                <Switch
                                    disabled={this.props.activate !== 1 || this.state.onHandleSwitch}
                                    onClick={this.handleSwitch} checked={this.state.autoSwitch == 1}
                                    checkedChildren="自动模式" unCheckedChildren="手动模式" defaultChecked/>
                                <div style={{
                                    textAlign: "center",
                                    display: "inline-block",
                                    margin: ".2rem 0",
                                    fontSize: "1.6rem"
                                }}>
                                    已录制时间<br/>{this.state.recording ?
                                    this.getTimeString(this.state.recordedTime)
                                    : "00:00:00"}
                                </div>
                            </div>
                        </div>
                    </div>


                    <div>
                        <span>摄像头控制</span>
                        <div>
                            <div style={{
                                display: "flex",
                                flexDirection: "column",
                                width: "72px",
                                alignItems: "center"
                            }}>
                                <Button
                                    shape="circle"
                                    style={{border: "none"}}
                                    disabled={this.props.activate !== 1}
                                    onMouseDown={this.startCameraMove.bind(this, "2")}
                                    onMouseUp={this.stopCameraMove}
                                    className={styles.cameraControlButton}
                                    icon="caret-up"/>
                                <div>
                                    <Button
                                        shape="circle"
                                        style={{border: "none"}}
                                        disabled={this.props.activate !== 1}
                                        className={styles.cameraControlButton}
                                        onMouseDown={this.startCameraMove.bind(this, "4")}
                                        onMouseUp={this.stopCameraMove}
                                        icon="caret-left"/>
                                    <Button
                                        shape="circle"
                                        style={{border: "none"}}
                                        disabled={this.props.activate !== 1}
                                        className={styles.cameraControlButton}
                                        onClick={() => {
                                            axios.get(window.serverUrl + "main.php", {
                                                params: {
                                                    action: "cameraControl",
                                                    addr: this.state.configs.camera[this.keys[parseInt(this.state.camera_control.currCamera) - 1 + ""]],
                                                    cmd: "0",
                                                    value: "0",
                                                }
                                            }).then(res => {
                                                if (res.data.code) {
                                                    axios.get(window.serverUrl + "main.php", {
                                                        params: {
                                                            action: "setCameraValue",
                                                            camera: this.state.camera_control.currCamera,
                                                            zoom_speed: 2,
                                                            focal_length: 0,
                                                        }
                                                    }).then(res => {
                                                        if (res.data.code) {
                                                            let camera_control = this.state.camera_control;
                                                            camera_control[this.state.camera_control.currCamera].zoom_speed = 2;
                                                            camera_control[this.state.camera_control.currCamera].focal_length = 0;
                                                            this.setState({camera_control})
                                                        }
                                                    })
                                                } else {
                                                    message.error(res.data.data);
                                                }
                                            }).catch(error => console.log(error));
                                        }}
                                        icon="reload"/>
                                    <Button
                                        shape="circle"
                                        style={{border: "none"}}
                                        disabled={this.props.activate !== 1}
                                        className={styles.cameraControlButton}
                                        onMouseDown={this.startCameraMove.bind(this, "5")}
                                        onMouseUp={this.stopCameraMove}
                                        icon="caret-right"/>
                                </div>
                                <Button
                                    shape="circle"
                                    style={{border: "none"}}
                                    disabled={this.props.activate !== 1}
                                    className={styles.cameraControlButton}
                                    onMouseDown={this.startCameraMove.bind(this, "3")}
                                    onMouseUp={this.stopCameraMove}
                                    icon="caret-down"/>
                            </div>

                            <div style={{
                                marginRight: "8px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center"
                            }}>
                                <div>
                                    <span>&nbsp;摄&nbsp;像&nbsp;头&nbsp; </span>
                                    <Select
                                        disabled={this.props.activate !== 1}
                                        size={"small"}
                                        value={this.state.configs ? this.state.camera_control.currCamera : ""}
                                        style={{marginLeft: "2px", width: "93px"}}
                                        onChange={(val) => {

                                            axios.get(window.serverUrl + "main.php", {
                                                params: {
                                                    action: "setConfigValue",
                                                    configKey: "camera_control",
                                                    val: val,
                                                    key: "currCamera"
                                                }
                                            }).then(res => {
                                                if (res.data.code) {
                                                    this.setState({
                                                        camera_control: {
                                                            ...this.state.camera_control,
                                                            currCamera: val
                                                        }
                                                    })
                                                } else {
                                                    message.error("操作失败")
                                                }
                                            }).catch(e => console.log(e))
                                        }}>

                                        <Option key={"1"}>学生特写</Option>
                                        <Option key={"2"}>教师特写</Option>
                                        <Option key={"3"}>学生全景</Option>
                                        <Option key={"4"}>教师全景</Option>
                                        <Option key={"5"}>板书特写</Option>
                                        <Option key={"6"}>自定义</Option>
                                    </Select>
                                </div>
                                <div style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center"
                                }}>
                                    <span>焦距大小</span>
                                    <Slider
                                        disabled={this.props.activate !== 1}
                                        max={1023}
                                        value={this.state.camera_control
                                            ? this.state.camera_control[this.state.camera_control.currCamera].focal_length
                                            : 0}
                                        onChange={val => {
                                            let camera_control = this.state.camera_control;
                                            camera_control[this.state.camera_control.currCamera].focal_length = val;
                                            this.setState({camera_control})
                                        }}
                                        onAfterChange={(val) => {
                                            axios.get(window.serverUrl + "main.php", {
                                                params: {
                                                    action: "cameraControl",
                                                    addr: this.state.configs.camera[this.keys[parseInt(this.state.camera_control.currCamera) - 1 + ""]],
                                                    cmd: "6",
                                                    value: val + "",
                                                }
                                            }).then(res => {
                                                if (res.data.code) {
                                                    axios.get(window.serverUrl + "main.php", {
                                                        params: {
                                                            action: "setCameraValue",
                                                            camera: this.state.camera_control.currCamera,
                                                            focal_length: val,
                                                            zoom_speed: this.state.camera_control[this.state.camera_control.currCamera].zoom_speed,
                                                        }
                                                    })
                                                } else {
                                                    message.error(res.data.data);
                                                }
                                            }).catch(error => console.log(error));
                                        }}
                                        style={{width: "90px", margin: "0", marginLeft: "8px"}}/>
                                </div>
                                <div style={{
                                    display: "flex", flexDirection: "row", alignItems: "center"
                                }}>
                                    <span>变焦速度</span>
                                    <Slider
                                        disabled={this.props.activate !== 1}
                                        min={2} max={7}
                                        value={this.state.camera_control
                                            ? this.state.camera_control[this.state.camera_control.currCamera].zoom_speed
                                            : 2}
                                        onChange={val => {
                                            let camera_control = this.state.camera_control;
                                            camera_control[this.state.camera_control.currCamera].zoom_speed = val;
                                            this.setState({camera_control})
                                        }}
                                        onAfterChange={(val) => {
                                            axios.get(window.serverUrl + "main.php", {
                                                params: {
                                                    action: "cameraControl",
                                                    addr: this.state.configs.camera[this.keys[parseInt(this.state.camera_control.currCamera) - 1 + ""]],
                                                    cmd: "7",
                                                    value: val + "",
                                                }
                                            }).then(res => {
                                                if (res.data.code) {
                                                    axios.get(window.serverUrl + "main.php", {
                                                        params: {
                                                            action: "setCameraValue",
                                                            camera: this.state.camera_control.currCamera,
                                                            zoom_speed: val,
                                                            focal_length: this.state.camera_control[this.state.camera_control.currCamera].focal_length,
                                                        }
                                                    })
                                                } else {
                                                    message.error(res.data.data);
                                                }
                                            }).catch(error => console.log(error));
                                        }}

                                        style={{width: "90px", margin: "0", marginLeft: "8px"}}/>
                                </div>
                            </div>

                            <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                                <div>
                                    <Button
                                        disabled={this.props.activate !== 1}
                                        style={{
                                            color: this.state.cameraPresetMode ? "red" : "",
                                            borderColor: this.state.cameraPresetMode ? "red" : ""
                                        }}
                                        onClick={() => this.setState({cameraPresetMode: !this.state.cameraPresetMode})}
                                        size={"small"} shape="circle">+</Button>
                                </div>
                                <div>
                                    <Button
                                        disabled={this.props.activate !== 1}
                                        onClick={this.setCameraPreset.bind(this, "0")}
                                        style={{
                                            color: this.state.cameraPresetMode ? "red" : "",
                                            borderColor: this.state.cameraPresetMode ? "red" : ""
                                        }}
                                        size={"small"}
                                        shape="circle">
                                        1
                                    </Button>
                                    <Button
                                        disabled={this.props.activate !== 1}
                                        onClick={this.setCameraPreset.bind(this, "1")}
                                        style={{
                                            color: this.state.cameraPresetMode ? "red" : "",
                                            borderColor: this.state.cameraPresetMode ? "red" : ""
                                        }}
                                        size={"small"}
                                        shape="circle">
                                        2
                                    </Button>
                                    <Button
                                        disabled={this.props.activate !== 1}
                                        onClick={this.setCameraPreset.bind(this, "2")}
                                        style={{
                                            color: this.state.cameraPresetMode ? "red" : "",
                                            borderColor: this.state.cameraPresetMode ? "red" : ""
                                        }}
                                        size={"small"}
                                        shape="circle">
                                        3
                                    </Button>
                                </div>
                                <div>
                                    <Button
                                        disabled={this.props.activate !== 1}
                                        onClick={this.setCameraPreset.bind(this, "3")}
                                        style={{
                                            color: this.state.cameraPresetMode ? "red" : "",
                                            borderColor: this.state.cameraPresetMode ? "red" : ""
                                        }}
                                        size={"small"}
                                        shape="circle">
                                        4
                                    </Button>
                                    <Button
                                        disabled={this.props.activate !== 1}
                                        onClick={this.setCameraPreset.bind(this, "4")}
                                        style={{
                                            color: this.state.cameraPresetMode ? "red" : "",
                                            borderColor: this.state.cameraPresetMode ? "red" : ""
                                        }}
                                        size={"small"}
                                        shape="circle">
                                        5
                                    </Button>
                                    <Button
                                        disabled={this.props.activate !== 1}
                                        onClick={this.setCameraPreset.bind(this, "5")}
                                        style={{
                                            color: this.state.cameraPresetMode ? "red" : "",
                                            borderColor: this.state.cameraPresetMode ? "red" : ""
                                        }}
                                        size={"small"}
                                        shape="circle">
                                        6
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div>
                        <span>课程设置</span>
                        <div style={{maxWidth: "200px"}}>
                            <div>
                                <span>课程名</span>
                                <Input disabled={this.props.activate !== 1 || this.state.recording == 1}
                                       style={{minWidth: "90px", maxWidth: "150px"}}
                                       onBlur={() => {
                                           let recordName = this.state.recordName.trim();
                                           if (recordName == "") {
                                               recordName = "课程"
                                               this.setState({recordName})
                                           }
                                           axios.get(window.serverUrl + "main.php", {
                                               params: {
                                                   action: "setRecordName",
                                                   name: recordName
                                               }
                                           }).then(res => {
                                               if (res.data.code) {
                                                   message.success("设置课程名成功")
                                               } else {
                                                   message.error(res.data.data);
                                               }
                                           }).catch(error => console.log(error));
                                       }}
                                       value={this.state.recordName ? this.state.recordName : ""}
                                       onChange={(node) => {
                                           let val = node.target.value
                                           if (this.checkFileName(val)) {
                                               this.setState({recordName: val})
                                           }
                                       }}
                                       placeholder="默认值课程"/>
                            </div>


                            <div>
                                <span>课程分段时长</span>

                                <InputNumber disabled={this.props.activate !== 1 || this.state.recording == 1}
                                             style={{width: "60px"}}
                                             defaultValue={45}
                                             min={30}
                                             max={60}
                                             onChange={
                                                 sectionTime => {
                                                     if (this.state.recording === 1) {
                                                         message.error("录制中不能更改课程分段时长")
                                                         return;
                                                     }
                                                     if (sectionTime >= 30 && sectionTime <= 60) {
                                                         this.handleSectionTimeChange(sectionTime)
                                                     }
                                                 }
                                             }
                                             value={this.state.sectionTime}/>分钟
                            </div>

                        </div>
                    </div>


                    <div style={{width: "13vw", minWidth: "113px"}}>
                        <span>直播控制</span>
                        <div>
                            <div>
                                <Button
                                    disabled={this.state.onHandleLive}
                                    onClick={this.handleLive}><i
                                    className={this.state.living ? "iconfont icon-stop" : "iconfont icon-circle"}
                                    style={{color: this.state.living ? "#00FF00" : "red"}}/>{this.state.living ? "停止直播" : "开启直播"}
                                </Button>
                            </div>
                            <div style={{margin: ".4rem", display: "flex", alignItems: "center"}}>
                                <div style={{
                                    textAlign: "center",
                                    display: "inline-block",
                                    margin: ".2rem 0",
                                    fontSize: "1.6rem"
                                }}>
                                    已直播时间<br/>{this.state.living ?
                                    this.getTimeString(this.state.livedTime)
                                    : "00:00:00"}
                                </div>
                            </div>
                        </div>
                    </div>


                    <div>
                        <span>布局控制</span>
                        <div style={{maxWidth: "270px"}}>
                            <Button onClick={this.setLayout.bind(this, "layout_default")}>默认布局</Button>
                            <Button onClick={this.setLayout.bind(this, "layout_center")}>中间布局</Button>
                            <Button onClick={this.setLayout.bind(this, "layout_left_right")}>左右布局</Button>
                            <Button
                                onClick={this.setLayout.bind(this, "layout_nine")}> 九&nbsp;&nbsp;布&nbsp;&nbsp;局 </Button>
                            <Button
                                onClick={this.setLayout.bind(this, "layout_one")}> 仅&nbsp;&nbsp;主&nbsp;&nbsp;播 </Button>
                        </div>
                    </div>


                </div>

            </div>
        );
    }

    setLayout = (layout_name) => {
        if (!sessionStorage.getItem("change")) {
            sessionStorage.setItem("change", "1")
        }
        axios.get(window.serverUrl + "main.php", {params: {action: "setLayout", layout_name}}).then(res => {
            if (res.data.code) {
                window.location.href = window.location.href
            } else {
                message.error("操作失败，请重新登录后再试");
            }
        }).catch(error => console.log(error));
    }


    checkFileName = (name) => {
        let regex = /[<>\\/|:"*?\s]+/i;
        if (!regex.test(name)) {
            if (name.length > 80) {
                message.error("名字过长");
                return false;
            }
            return true;
        } else {
            message.error("文件目录名不能包括以下字符： / \\ * ? < > | 空格");
            return false;
        }

    }

    handlePauseRecord = () => {
        if (this.state.recording) {
            if (this.onHandlePause) {
                return;
            }
            this.onHandlePause = true
            this.setState({onHandlePause: true})

            if (this.state.pause) {
                //继续录制
                axios.get(window.serverUrl + "main.php", {
                    params: {
                        action: "stopPause"
                        , time: new Date().getTime()
                    }
                }).then(res => {

                    if (res.data.code) {
                        this.getSystemState();
                    } else {
                        message.error("操作失败，请刷新页面或重启系统");
                    }
                }).catch(error => console.log(error));
            } else {
                //暂停录制
                axios.get(window.serverUrl + "main.php", {
                    params: {
                        action: "startPause"
                        , time: new Date().getTime()
                    }
                }).then(res => {

                    if (res.data.code) {
                        this.getSystemState();
                    } else {
                        message.error("操作失败，请刷新页面或重启系统");
                    }
                }).catch(error => console.log(error));
            }
            setTimeout(() => {
                this.onHandlePause = false
                this.setState({onHandlePause: false})
            }, this.actionTimeout)

        }
    }

    handleRecord = () => {
        if (this.onHandleRecord) {
            return;
        }
        this.onHandleRecord = true
        this.setState({onHandleRecord: true})

        if (this.state.recording) {
            axios.get(window.serverUrl + "main.php", {params: {action: "stopRecord"}}).then(res => {
                if (res.data.code) {
                    this.getSystemState();
                } else {
                    message.error("操作失败");
                }
            }).catch(error => console.log(error));
        } else {
            axios.get(window.serverUrl + "main.php", {
                params: {
                    action: "startRecord"
                    , time: new Date().getTime()
                }
            }).then(res => {
                if (res.data.code) {
                    this.getSystemState();
                } else {
                    message.error("操作失败");
                }
            }).catch(error => console.log(error));
        }


        setTimeout(() => {
            this.onHandleRecord = false
            this.setState({onHandleRecord: false})
        }, this.actionTimeout)

    }

    handleLive = () => {
        if (this.onHandleLive) {
            return;
        }
        this.onHandleLive = true
        this.setState({onHandleLive: true})
        if (this.state.living) {
            axios.get(window.serverUrl + "main.php", {params: {action: "stopLive"}}).then(res => {
                if (res.data.code) {
                    this.getSystemState();
                } else {
                    message.error("操作失败");
                }
            }).catch(error => console.log(error));
        } else {
            axios.get(window.serverUrl + "main.php", {
                params: {
                    action: "startLive"
                    , time: new Date().getTime()
                }
            }).then(res => {
                if (res.data.code) {
                    // this.refresh();
                    this.getSystemState();
                } else {
                    message.error("操作失败");
                }
            }).catch(error => console.log(error));
        }


        setTimeout(() => {
            this.onHandleLive = false
            this.setState({onHandleLive: false})
        }, this.actionTimeout)
    }


    handleSectionTimeChange = (sectionTime) => {
        if (this.state.recording === 1) {
            message.error("录制中不能更改课程分段时长")
        } else {
            axios.get(window.serverUrl + "main.php", {
                params: {
                    action: "setSectionTime",
                    sectionTime
                }
            }).then(res => {
                if (res.data.code === 1) {
                    this.setState({sectionTime})
                    // message.success(res.data.data)
                } else {
                    message.error(res.data.data)
                }
            }).catch((error) => {
                console.log(error)
            })
        }
    }


    handleSwitch = () => {
        if (this.onHandleSwitch) {
            return;
        }
        this.onHandleSwitch = true
        this.setState({onHandleSwitch: true})

        if (this.state.autoSwitch) {
            axios.get(window.serverUrl + "main.php", {params: {action: "manualSwitch"}}).then(res => {
                if (res.data.code) {
                    this.setState({autoSwitch: 0})
                } else {
                    message.error("操作失败");
                }
            }).catch(error => console.log(error));
        } else {
            axios.get(window.serverUrl + "main.php", {params: {action: "autoSwitch"}}).then(res => {
                if (res.data.code) {
                    this.setState({autoSwitch: 1})
                } else {
                    message.error("操作失败");
                }
            }).catch(error => console.log(error));
        }

        setTimeout(() => {
            this.onHandleSwitch = false
            this.setState({onHandleSwitch: false})
        }, this.actionTimeout / 2)

    }


    switchMonitorMain = (url, ev) => {
        ev.preventDefault();
        let chn = url.substr(-5, 1)
        if (!this.state.autoSwitch && chn < 6) {
            axios.get(window.serverUrl + "main.php", {params: {action: "switchMain", chn: chn + ""}}).then(res => {
                // if (res.data.code != 1) {
                //     //message.error("操作失败，请重新登录或重启系统");
                // }
            }).catch(error => console.log(error));
        }

    }


    handleMenuExpand = () => {
        this.setState({menuExpand: !this.state.menuExpand})
    }

    moveCamera = (cmd, cameraSpeed) => {
        axios.get(window.serverUrl + "main.php", {
            params: {
                action: "cameraControl",
                addr: this.state.configs.camera[this.keys[parseInt(this.state.camera_control.currCamera) - 1 + ""]],
                cmd: cmd,
                value: cameraSpeed + "",
            }
        }).then(res => {
            if (!res.data.code) {
                message.error(res.data.data);
            }
        }).catch(error => console.log(error));
    }


    startCameraMove = cmd => {
        let cameraSpeed = 10;
        if (this.startCameraMoveInterval) {
            clearInterval(this.startCameraMoveInterval);
        }
        //先立马调用一次
        this.moveCamera(cmd, cameraSpeed);
        this.startCameraMoveInterval = setInterval(() => {
            if (cameraSpeed < 18) {
                cameraSpeed += 1;
            }
            this.moveCamera(cmd, cameraSpeed);
        }, 400)
    };

    stopCameraMove = () => {
        clearInterval(this.startCameraMoveInterval);
        axios.get(window.serverUrl + "main.php", {
            params: {
                action: "cameraControl",
                addr: this.state.configs.camera[this.keys[parseInt(this.state.camera_control.currCamera) - 1 + ""]],
                cmd: "1",
                value: "0",
            }
        }).then(res => {
            if (!res.data.code) {
                message.error(res.data.data);
            }
        }).catch(error => console.log(error));
    }


    setCameraPreset = value => {
        //设置预置位
        if (this.state.cameraPresetMode) {
            axios.get(window.serverUrl + "main.php", {
                params: {
                    action: "cameraControl",
                    addr: this.state.configs.camera[this.keys[parseInt(this.state.camera_control.currCamera) - 1 + ""]],
                    cmd: "8",
                    value: value,
                }
            }).then(res => {
                if (!res.data.code) {
                    message.error(res.data.data);
                }
            }).catch(error => console.log(error));
        }
        //加载预置位
        else {
            axios.get(window.serverUrl + "main.php", {
                params: {
                    action: "cameraControl",
                    addr: this.state.configs.camera[this.keys[parseInt(this.state.camera_control.currCamera) - 1 + ""]],
                    cmd: "9",
                    value: value,
                }
            }).then(res => {
                if (!res.data.code) {
                    message.error(res.data.data);
                }
            }).catch(error => console.log(error));
        }
    }

}

const mapStateToProps = state => {
    return {
        // main: state.video.main,
        user: state.user.user,
        activate: state.app.activate
    }
}


const mapDispatchToProps = dispatch => {
    return {
        // initMain: main => dispatch(initMain(main)),
        // switchMain: index => dispatch(switchMain(index)),
        // play: isPlay => dispatch(play(isPlay)),
        setModule: module => dispatch(setCurrModule(module)),
        userLogout: () => dispatch(userLogout()),
        setActivateState: activateState => dispatch(setActivateState(activateState))
    }
}


export default connect(mapStateToProps, mapDispatchToProps)(Main)
