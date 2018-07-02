import React from "react";
import axios from "axios";
import {message, Button, DatePicker, TimePicker, Card} from "antd";
import moment from "moment";

export default class TimeSetting extends React.Component {


    constructor() {
        super()
        this.state = {
            systemTime: 0,
            date: moment().format('YYYY-MM-DD'),
            time: moment().format('HH:mm:ss')
        }
        this.getSystemTime()
    }

    componentDidMount() {
        this.getTimeInterval = setInterval(this.getSystemTime, 1000)
    }

    componentWillUnmount() {
        if (this.getTimeInterval) {
            clearInterval(this.getTimeInterval)
        }
    }

    getSystemTime = () => {
        axios.get(window.serverUrl + "other.php?action=getTime").then(res => {
            if (res.data.code === 1) {
                this.setState({systemTime: res.data.data})
            }
        }).catch(e => console.log(e))
    }

    getDateTimeString = (datetime) => {
        if (datetime == 0) {
            return "未检测到系统时间";
        }
        return moment(parseInt(datetime) * 1000).utcOffset(0).format("YYYY-MM-DD HH:mm:ss")
    }

    addZero = (string) => {
        if (string.length === 1) {
            return "0" + string;
        } else {
            return string;
        }
    }

    render() {
        return (

            <div style={{display: "flex"}}>
                <Card title="当前系统时间">
                    <span>{this.getDateTimeString(this.state.systemTime)}</span>
                </Card>
                <Card title="更改系统时间">
                    <div>
                        <DatePicker onChange={(var1, date) => this.setState({date})} defaultValue={moment()}
                                    format={"YYYY-MM-DD"}/>
                        <TimePicker onChange={(var1, time) => this.setState({time})} defaultValue={moment()}/>
                        <Button onClick={this.handleSaveTime}>保存更改</Button>
                    </div>
                </Card>
            </div>
        );
    }

    handleSaveTime = () => {
        axios.get(window.serverUrl + "other.php", {
            params: {
                action: "setTime",
                datetime: this.state.date + " " + this.state.time
            }
        }).then(res => {
            if (res.data.code === 1) {
                message.success(res.data.data)
                this.getSystemTime()
            } else {
                message.error(res.data.data)
            }

        }).catch(e => console.log(e))
    }

}
