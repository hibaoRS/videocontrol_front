import React from "react";


import {message, Table, Popconfirm} from 'antd';
import IpConfig from "./IpConfig";
import axios from "axios";


export default class IpInfo extends React.Component {

    constructor(props) {
        super(props);
        this.columns = [{
            title: '网口名称',
            dataIndex: 'name',
            // width: '25%',
            render: (text, record) => this.renderColumns(text, record, 'name'),
        }, {
            title: 'IP地址',
            align: "center",
            dataIndex: 'ip',
            // width: '15%',
            render: (text, record) => this.renderColumns(text, record, 'ip'),
        }, {
            title: '子网掩码',
            align: "center",
            dataIndex: 'mask',
            // width: '40%',
            render: (text, record) => this.renderColumns(text, record, 'mask'),
        }, {
            title: '默认网关',
            align: "center",
            dataIndex: 'gateway',
            // width: '40%',
            render: (text, record) => this.renderColumns(text, record, 'gateway'),
        }, {
            title: '操作',
            align: "center",
            dataIndex: 'operation',
            render: (text, record) => {
                const {editable} = record;
                return (
                    <div className="editable-row-operations">
                        {
                            editable ?
                                <span>
                                    <Popconfirm title="确认保存配置?" okText={"确认"} cancelText={"取消"}
                                                onConfirm={() => this.save(record.key)}>
                  <a style={{marginRight: "10px"}}>保存配置</a>
                                    </Popconfirm>
                      <Popconfirm title="确认放弃配置?" okText={"确认"} cancelText={"取消"}
                                  onConfirm={() => this.cancel(record.key)}>
                      <a>放弃配置</a>
                      </Popconfirm>
                      </span>
                                : <a onClick={() => this.edit(record.key)}>配置</a>
                        }
                    </div>
                );
            },
        }];
        this.state = {data: [], editing: [false, false]};
        this.cacheData = [];
        this.getIp("{\"code\":1,\"data\":{\"eth0\":{\"ip\":\"\",\"mask\":\"\",\"gateway\":\"\"},\"eth1\":{\"ip\":\"\",\"mask\":\"\",\"gateway\":\"\"}}}")
    }


    componentDidMount() {
        this.getIpInterVal = setInterval(this.getIp, 1000 * 60 * 5)
    }

    componentWillUnmount() {
        if (this.getIpInterVal) {
            clearInterval(this.getIpInterVal)
        }
    }


    getIp = () => {
        let editing = false;
        for (let i = 0; i < this.state.editing.length; i++) {
            if (this.state.editing[i]) {
                editing = true;
                break;
            }
        }
        if (!editing) {
            axios.get(window.serverUrl + "other.php?action=getIp").then(res => {
                if (res.data.code === 1) {
                    let data = []
                    Object.entries(res.data.data).map((val, index) => {
                        data.push({
                            key: index,
                            name: val[0],
                            ip: val[1].ip || "无",
                            mask: val[1].mask || "无",
                            gateway: val[1].gateway || "无",
                        });
                    });
                    this.cacheData = data.map(item => ({...item}));
                    this.setState({data})
                }
            }).catch(e => console.log(e));
        }

    }


    renderColumns(text, record, column) {

        return (
            <IpConfig
                editable={record.editable && column !== "name"}
                value={text}
                onChange={value => this.handleChange(value, record.key, column)}
            />
        );
    }

    handleChange(value, key, column) {
        const newData = [...this.state.data];
        const target = newData.filter(item => key === item.key)[0];
        if (target) {
            target[column] = value;
            this.setState({data: newData});
        }
    }

    edit(key) {
        const newData = [...this.state.data];
        const target = newData.filter(item => key === item.key)[0];
        if (target) {
            target.editable = true;
            let editing = this.state.editing
            editing[key] = true;
            this.setState({data: newData, editing});
        }
    }

    save(key) {
        const newData = [...this.state.data];
        const target = newData.filter(item => key === item.key)[0];
        if (target) {
            axios.get(window.serverUrl + "other.php", {
                params:
                    {
                        action: "setIp",
                        dev: target.name,
                        ip: target.ip,
                        mask: target.mask,
                        gateway: target.gateway,
                    }
            }).then((res) => {
                if (res.data.code === 1) {
                    delete target.editable;
                    let editing = this.state.editing
                    editing[key] = false;
                    this.setState({data: newData, editing});
                    this.cacheData = newData.map(item => ({...item}))
                    this.getIp();
                    message.success(res.data.data)
                } else {
                    message.error(res.data.data)
                }

            }).catch(e => console.log(e))

        }
    }

    cancel(key) {
        const newData = [...this.state.data];
        const target = newData.filter(item => key === item.key)[0];
        if (target) {
            Object.assign(target, this.cacheData.filter(item => key === item.key)[0]);
            delete target.editable;
            let editing = this.state.editing
            editing[key] = false;
            this.setState({data: newData, editing});
        }
    }

    render() {
        return <Table pagination={false} bordered dataSource={this.state.data} columns={this.columns}/>;
    }


}
