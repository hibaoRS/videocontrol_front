import React from "react"
import styles from "./VideoManager.module.css"
import {setModule} from "../../../mapDispatchToProps/App";
import {connect} from "react-redux";
import {getUser} from "../../../mapStateToProps/User";
import "video-react/dist/video-react.css"
import {BigPlayButton, ControlBar, PlaybackRateMenuButton, Player} from "video-react";

import {Table, Icon, Popconfirm, Button, notification, Popover, Progress} from 'antd';
import {message} from "antd/lib/index";
import axios from "axios/index";


class VideoManager extends React.Component {


    columns = [
        {
            title: '文件名',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => {
                let component;
                if (record.type) {
                    //文件
                    component = (
                        <span style={{cursor: 'pointer'}}
                              onClick={this.openVideo.bind(this, record.relativePath)}>
                <Icon style={{color: "#27488a"}} type={"video-camera"}/>&nbsp;{record.name}
            </span>
                    )
                } else {
                    //文件夹
                    component = (
                        <span>
                <Icon style={{color: "#EBAB2A"}} type={"folder"}/>&nbsp;{record.name}
            </span>
                    )
                }
                return component;
            },
        },
        {
            title: "文件大小",
            key: "size",
            render: record => {
                return record.type ? (
                    <span style={{marginRight: "5px"}}>{record.size}</span>
                ) : "";
            }
        },
        {
            title: '操作',
            key: 'action',
            render: record => {
                let component;
                if (record.type) {
                    component = (
                        <span>
                        <span style={{marginRight: "5px"}}>
                            {this.state.ftpStatus.status[0] != "100" && record.relativePath == this.state.ftpStatus.relativePath ? (
                                (
                                    <Popover
                                        style={{width: 500}}
                                        content={(
                                            <div>
                                                <p>文件：</p><p>{this.state.ftpStatus.relativePath}</p>
                                                <p>进度：
                                                    <Progress percent={this.state.ftpStatus.status[0]} status="active"/>
                                                </p>
                                                <p>速度：{this.state.ftpStatus.status[11]}b/s</p>
                                            </div>
                                        )}
                                        title="上传状态"
                                        trigger="hover"
                                    >
                                        <Button size={"small"} type="primary" icon={"loading"} >上传中</Button>
                                    </Popover>
                                )
                            ) : record.exist || (this.state.ftpStatus.status[0] == "100" && record.relativePath == this.state.ftpStatus.relativePath) ?
                                (
                                    <Button size={"small"} type="primary">已上传</Button>
                                )
                                : (<Button size={"small"}
                                           onClick={() => {
                                               axios.get(window.serverUrl + "main.php", {
                                                   params: {
                                                       action: "ftpUpload",
                                                       "relativePath": record.relativePath
                                                   }
                                               }).then(res => {
                                                   if (res.data.code) {
                                                       this.getFiles();
                                                       let status = this.state.ftpStatus.status;
                                                       status[0] = "0";
                                                       this.setState({
                                                           ftpStatus: {
                                                               status,
                                                               relativePath: record.relativePath
                                                           }
                                                       });
                                                       message.warn(res.data.data)
                                                   } else {
                                                       message.error(res.data.data);
                                                   }
                                               }).catch(error => console.log(error));

                                           }}>上传</Button>)}

                        </span>

                         <Button size={"small"}
                                 onClick={() => window.open(window.location.protocol + "//" + window.videoUrl + record.relativePath + "?1")}>
                             下载
                         </Button>

                            {this.props.user.type == 1 ?
                                <Popconfirm placement="right" title={"确认删除该文件？"}
                                            okText="是" cancelText="否"
                                            onConfirm={this.deleteFile.bind(this, record.relativePath)}>
                                    <Button style={{marginLeft: "7px"}} size={"small"}>删除</Button>
                                </Popconfirm> : ""
                            }
                    </span>);
                }
                else {
                    if (this.props.user.type == 1) {
                        component = (
                            <Popconfirm placement="right" title={"确认删除整个文件夹？"}
                                        okText="是" cancelText="否"
                                        onConfirm={this.deleteFile.bind(this, record.relativePath)}>
                                <Button size={"small"}>删除</Button>
                            </Popconfirm>);
                    }

                }
                return component;
            }
            ,
        }
    ];


    constructor(props) {
        super();

        this.state = {src: "", data: [], ftpStatus: {status: []}}
        if (!props.user) {
            props.history.push("/login");
            return;
        }
        props.setModule("1")
        this.getFiles()
    }


    getFtpStatus = () => {
        axios.get(window.serverUrl + "main.php", {params: {action: "ftpStatus"}}).then(res => {
            if (res.data.code) {
                this.setState({ftpStatus: res.data.data})
            }
        }).catch(error => console.log(error));
    }

    componentDidMount() {
        this.getFtpStatus()
        this.ftpStatusInterval = setInterval(this.getFtpStatus, 3000)
    }


    componentWillUnmount() {
        clearInterval(this.ftpStatusInterval)
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.src != prevState.src) {
            this.refs.player.load();
        }
    }


    openVideo = (relativeUrl) => {
        this.setState({src: window.location.protocol + "//" + window.videoUrl + relativeUrl})
        // console.log(relativeUrl)
        // this.setState({src: "http://192.168.1.100/videocontrol/videos/" + relativeUrl})
        // this.setState({src:"http://192.168.1.1000/disk" + relativeUrl})
    }


    getFiles = () => {
        axios.get(window.serverUrl + "main.php", {params: {action: "getFiles"}}).then(res => {
            if (res.data.code) {
                this.setState({data: res.data.data})
            } else {
                message.error("获取文件列表失败");
            }
        }).catch(error => console.log(error));
    }

    deleteFile = (relativePath) => {
        if (this.props.user.type != 1) {
            message.error("非法操作");
            return;
        }

        axios.get(window.serverUrl + "main.php", {params: {action: "deleteFile", relativePath}}).then(res => {
            if (res.data.code) {
                message.success("操作成功");
                this.getFiles();
            } else {
                message.error(res.data.data);
            }
        }).catch(error => console.log(error));
    }

    render() {
        return (
            <div className={styles.main}>
                <div className={styles.videoContainer}>
                    <Player ref="player" autoPlay={true} controls={true} muted={false} preload={"auto"}>
                        <source src={this.state.src}/>
                        <BigPlayButton position="center"/>
                        <ControlBar>
                            <PlaybackRateMenuButton
                                rates={[5, 2, 1, 0.5, 0.1]}
                                order={7.1}
                            />
                        </ControlBar>
                    </Player>
                </div>
                <div className={styles.fileContainer}>
                    <Table columns={this.columns} dataSource={this.state.data}/>
                </div>
            </div>)
    }
}


export default connect(getUser, setModule)(VideoManager)