import React from "react"
import axios from "axios"
import {Chart, Tooltip, Axis, Area, Line, StackBar, Coord, Legend} from 'viser-react';
import moment from "moment"
import {connect} from "react-redux";
import styles from "./SystemState.module.css"
import {Affix, Alert, Button, Input, Popconfirm} from "antd";
import {message} from "antd/lib/index";
import {userLogout} from "../../../reducers/UserReducer";
import {setActivateState, setCurrModule} from "../../../reducers/AppReducer";
import IpInfo from "./IpInfo";
import TimeSetting from "./TimeSetting";

const DataSet = require('@antv/data-set');

class SystemState extends React.Component {

    constructor(props) {
        super();
        this.state = {
            cpuData: [],
            memoryData: [],
            memoryTotal: "",
            memoryUsed: "",
            activateCode: "",
            devicesData: [],
            productId: ""
        }


        if (!props.user) {
            props.history.push("/login");
            return;
        }


        props.setModule("4")


        this.updateInterval = 3000;
        this.beginDay = new Date();
        this.getDevicesInfo();
        this.getCpuInfo();
        this.getProductId();
    }


    componentDidMount() {
        this.timer = setInterval(this.getCpuInfo, this.updateInterval);
    }


    getProductId = () => {
        axios.get(window.serverUrl + "main.php", {
            params: {action: "productId"}
        }).then(
            ({data}) => {
                if (data.code === 1) {
                    this.setState({productId: data.data});
                } else {
                    this.setState({productId: "获取设备序列号失败，请重启后再试"});
                }
            }
        );
    }


    getCpuInfo = () => {
        axios.get(window.serverUrl + "system.php", {params: {action: "getInfo", command: "cpu"}}).then(res => {
            if (res.data.code === 1) {
                let cpuData = this.state.cpuData
                this.beginDay = new Date(this.beginDay.getTime() + this.updateInterval)
                cpuData.push(
                    {
                        cpu: res.data.data.cpuPercent,
                        time: moment(this.beginDay.getTime()).format('HH:mm:ss')
                    })
                if (cpuData.length > 50) {
                    cpuData = cpuData.reverse();
                    cpuData.pop();
                    cpuData.reverse();
                }
                let memoryData = this.state.memoryData

                memoryData.push(
                    {
                        memory: res.data.data.memoryPercent,
                        time: moment(this.beginDay.getTime()).format('HH:mm:ss')
                    })
                if (memoryData.length > 50) {
                    memoryData = memoryData.reverse();
                    memoryData.pop();
                    memoryData.reverse();
                }
                this.setState({
                    ...this.state,
                    cpuData,
                    memoryData,
                    memoryUsed: res.data.data.memoryUse,
                    memoryTotal: res.data.data.memoryAll
                })
            } else {
                console.log(res.data.data)
            }

        }).catch(error => console.log(error))
    }


    convertToG = (sizeWidthU) => {

        let size = parseFloat(sizeWidthU.substr(0, sizeWidthU.length - 1));


        if (sizeWidthU.endsWith("M")) {
            size = size / 1024;
        } else if (sizeWidthU.endsWith("T")) {
            size = size * 1024;
        }

        return Math.round(size * 100) / 100;
    }


    getDevicesInfo = () => {
        axios.get(window.serverUrl + "system.php", {params: {action: "getInfo", command: "devices"}}).then(res => {
            if (res.data.code === 1) {
                let devices = [];
                let data = res.data.data;
                for (let name in data) {
                    let all = this.convertToG(data[name].all);
                    let used = this.convertToG(data[name].use);
                    devices.push({name, all, "已使用": used, "未使用": Math.round((all - used) * 100) / 100})
                }

                const dv = new DataSet.View().source(devices);
                dv.transform({
                    type: 'fold',
                    fields: ['已使用', '未使用'],
                    key: '硬盘名',
                    value: '大小',
                    retains: ['name'],
                });
                this.setState({devicesData: dv.rows})
            } else {
                console.log(res.data.data)
            }
        }).catch(error => console.log(error))
    }


    componentWillUnmount() {
        this.timer && clearTimeout(this.timer)
    }


    render() {
        return (
            <div className={styles.container}>

                <div className={styles.title}>
                    设备状态
                </div>
                <div style={{marginBottom: "20px"}}>

                    {this.props.activate === 1 ? (<div>
                        <Alert message="设备已激活，所有功能已开启" type="success"/>
                    </div>) : (<div>
                        <Alert message="设备未激活或超过使用有效期，仅部分功能可用，若需获取完整功能，请联系设备提供商获取设备激活码激活" type="error"/>
                    </div>)}

                    {!this.props.expiryTime || this.props.expiryTime < 26000000000 ?
                        <div style={{marginLeft: "15px", marginTop: "5px", display: "flex", alignItems: "center"}}>
                            <span style={{fontSize: "18px", fontWeight: "600"}}>激活码：</span>
                            <Input
                                value={this.state.activateCode}
                                onChange={(node) => {
                                    this.setState({activateCode: node.target.value})
                                }}
                                style={{
                                    fontSize: "20px",
                                    fontWeight: "bold",
                                    minWidth: "620px",
                                    width: "620px",
                                    textAlign: "center",
                                    margin: "0 10px"
                                }} maxLength={48}/>
                            <Button type="primary" onClick={() => {
                                axios.get(window.serverUrl + "main.php", {
                                    params: {action: "activate", "activateCode": this.state.activateCode}
                                }).then(
                                    ({data}) => {
                                        if (data.code === 1) {
                                            message.success(data.data.msg, 5)
                                            this.props.setActivateState({
                                                activate: 1,
                                                expiryTime: data.data.expiryTime,
                                                activateTime: data.data.activateTime,
                                            });
                                        } else {
                                            message.warn(data.data, 3)
                                        }
                                    }
                                );
                            }}>{this.props.activate === 1 ? "继续" : "立即"}激活</Button>
                        </div> : ""}


                    <div style={{
                        margin: "5px 15px",
                        fontSize: "17px"
                    }}>
                        <div>设备序列号：{this.state.productId}</div>
                        <div>激活时间：{!this.props.activateTime || this.props.activateTime == 0 ? "无" : moment(parseInt(this.props.activateTime) * 1000).format("YYYY-MM-DD")}</div>
                        <div>有效期至：{!this.props.expiryTime || this.props.expiryTime == 0 ? "尚未激活" : this.props.expiryTime > 26000000000 ? "永久有效" : moment(parseInt(this.props.expiryTime) * 1000).format("YYYY-MM-DD")}</div>
                        <div>硬件版本：v1.2.0</div>
                        <div>软件版本：v1.2.0</div>

                    </div>
                </div>

                <div className={styles.title}>
                    网络状态信息
                </div>
                <IpInfo/>

                <div className={styles.title}>
                    设备系统时间
                </div>
                <TimeSetting/>

                <div className={styles.title}>
                    CPU使用情况
                </div>

                <Chart forceFit
                       height={250}
                       data={this.state.cpuData} scale={[{
                    dataKey: 'cpu',
                    alias: 'CPU使用率', // 定义别名
                    min: 0,
                    max: 100,
                    formatter: (val) => {
                        return val + '%';
                    },
                }]}>
                    <Tooltip
                        crosshairs={{
                            type: 'cpu',
                            label: {
                                formatter: function (val) {
                                    return val + ' %'; // 格式化坐标轴显示文本
                                }
                            }
                        }}/>
                    <Axis dataKey='cpu' title={{offset: 64,}}/>
                    <Axis dataKey='time' label={null}/>
                    <Line position="time*cpu" size={2}/>
                    <Area position="time*cpu"/>
                </Chart>

                <div className={styles.title}>
                    内存使用情况
                </div>
                <Chart forceFit
                       height={250}
                       data={this.state.memoryData}
                       scale={[{
                           dataKey: 'memory',
                           alias: '内存使用率', // 定义别名
                           min: 0,
                           max: 100,
                           formatter: (val) => {
                               return val + '%';
                           },
                       }]}>
                    <Tooltip
                        crosshairs={{
                            type: 'memory',
                            label: {
                                formatter: function (val) {
                                    return val + ' %'; // 格式化坐标轴显示文本
                                }
                            }
                        }}
                        itemTpl={'<li data-index={index}><span style="background-color:{color};width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:8px;">' +
                        '</span>{name}: {value}<br/><br/></span>已使用：' + this.state.memoryUsed + 'M<br/>总内存：' + this.state.memoryTotal + 'M</li>'}/>
                    <Axis dataKey='memory' title={{offset: 64,}}/>
                    <Axis dataKey='time' label={null}/>
                    <Line position="time*memory" size={2}/>
                    <Area position="time*memory"/>
                </Chart>


                <div className={styles.title}>
                    磁盘使用情况
                </div>
                <Chart
                    forceFit
                    width={window.innerWidth - 20}
                    height={this.state.devicesData.length * 50}
                    data={this.state.devicesData}
                    scale={[{
                        dataKey: '大小',
                        formatter: (val) => {
                            return val + ' G';
                        },
                        min: 0
                    }]}>
                    <Coord type="rect" direction="LB"/>
                    <Tooltip/>
                    <Legend/>
                    <Axis dataKey="name" label={{offset: 12}}/>
                    <StackBar position="name*大小" color="硬盘名"/>
                </Chart>

                <Affix className={styles.control} offsetBottom={10}>
                    <div className={styles.buttons}>
                        <Popconfirm title="确认注销登录？" placement="left" onConfirm={this.logout} okText="是"
                                    cancelText="否">
                            <Button size={"small"}>注销登录</Button>
                        </Popconfirm>

                        <Popconfirm placement="left" title={"确认关机？若正在录制，此操作会自动停止录制"} onConfirm={this.powerOff}
                                    okText="是" cancelText="否">
                            <Button style={{marginTop: "7px"}} size={"small"} type="danger">关闭系统</Button><br/>
                        </Popconfirm>

                        <Popconfirm placement="leftBottom" title={"确认重启？若正在录制，此操作会自动停止录制"} onConfirm={this.reboot}
                                    okText="是" cancelText="否">
                            <Button style={{marginTop: "7px"}} size={"small"}
                                    type="primary">重启系统</Button>
                        </Popconfirm>
                    </div>


                </Affix>
            </div>
        );
    }

    logout = () => {
        message.success("注销登录成功")
        this.props.userLogout()
    }

    powerOff = () => {
        axios.get(window.serverUrl + "main.php", {params: {action: "powerOff"}});
        message.success("操作成功")
    }

    reboot = () => {
        axios.get(window.serverUrl + "main.php", {params: {action: "reboot"}});
        message.success("操作成功")
    }


}

const mapStateToProps = state => {
    return {
        user: state.user.user,
        activate: state.app.activate,
        expiryTime: state.app.expiryTime,
        activateTime: state.app.activateTime,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        userLogout: () => dispatch(userLogout()),
        setModule: module => dispatch(setCurrModule(module)),
        setActivateState: activateState => dispatch(setActivateState(activateState))
    }
}


export default connect(mapStateToProps, mapDispatchToProps)(SystemState)