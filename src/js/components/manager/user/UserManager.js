import React from "react"
import {Popconfirm, Table} from "antd"
import axios from "axios/index";
import styles from "./UserManager.module.css";
import {message, Form, Icon, Input, Button} from 'antd';
import {connect} from "react-redux";
import {getUser} from "../../../mapStateToProps/User";
import {setModule} from "../../../mapDispatchToProps/App";

const FormItem = Form.Item;


class UserManager extends React.PureComponent {

    constructor(props) {
        super();
        if (!props.user) {
            props.history.push("/login");
            return;
        }

        props.setModule("2")
        this.getUsers();
    }


    columns = [{
        title: 'id',
        dataIndex: 'id'
    }, {
        title: '管理员名',
        dataIndex: 'name'
    }, {
        title: '管理员密码',
        dataIndex: 'password'
    }, {
        title: '管理员类型',
        dataIndex: 'type'
    }, {
        title: '操作',
        key: "action",
        render: (text, record) => (
            <Popconfirm title="确认删除该管理员?" onConfirm={this.delteManager.bind(this, record.id)} okText="确认"
                        cancelText="取消">
                <a href="#">删除</a>
            </Popconfirm>
        ),
    }


    ];


    state = {
        "data": []
    }

    getUsers = () => {
        axios.get(window.serverUrl + "manager.php", {params: {action: "list"}}).then((res) => {
            if (res.data.code === 1) {
                let temp = [];
                res.data.data.map((val, i) => {
                    val["key"] = i;
                    val["type"] = val["type"] == 1 ? "超级管理员" : "普通管理员"
                    temp[i] = val
                })
                this.setState({data: temp})
            } else {
                console.log(res.data.data)
            }
        }).catch((error) => {
            console.log(error)
        });
    }


    delteManager = (id) => {
        axios.get(window.serverUrl + "manager.php", {params: {action: "delete", id}}).then((res) => {
            if (res.data.code === 1) {
                this.getUsers()
            } else if (res.data.code === 0) {
                message.error(res.data.data);

            }
            else {
                console.log(res.data.data)
            }
        }).catch((error) => {
            console.log(error)
        });
    }


    handleSubmit = (e) => {
        e.preventDefault();


        axios.get(window.serverUrl + "manager.php", {
            params:
                {
                    action: "add", name: this.props.form.getFieldValue("name")
                    , password: this.props.form.getFieldValue("password")
                }
        }).then((res) => {
            if (res.data.code === 1) {
                this.getUsers();
                message.success("添加成功");
            } else if (res.data.code === 0) {
                message.error(res.data.data);
            } else if (res.data.code === -1) {
                message.error("管理员账号或密码不能为空");
            }
        }).catch((error) => {
            console.log(error)
        });
    }

    handleUpdateSubmit = (e) => {
        e.preventDefault();
        if (!this.props.user) {
            message.error("操作失败，请重新登录后再试");
            return;
        }

        if (this.props.form.getFieldValue("repeatUpdatePassword") !== this.props.form.getFieldValue("updatePassword")) {
            message.error("两次新管理员密码输入不一致");
            return;
        }


        axios.get(window.serverUrl + "manager.php", {
            params:
                {
                    action: "update",
                    id: this.props.user.id,
                    oldPassword: this.props.form.getFieldValue("oldPassword"),
                    name: this.props.form.getFieldValue("updateName")
                    ,
                    password: this.props.form.getFieldValue("updatePassword")
                }
        }).then((res) => {
            if (res.data.code === 1) {
                this.getUsers();
                message.success("修改成功");
            } else if (res.data.code === 0) {
                message.error(res.data.data);
            } else if (res.data.code === -1) {
                message.error("新管理员账号或密码不能为空");
            }
        }).catch((error) => {
            console.log(error)
        });

    }


    render() {

        const {getFieldDecorator} = this.props.form;

        return (
            <div className={styles.main}>
                <div style={{display: this.props.user && this.props.user.type == 1 ? "block" : "none"}}
                     className={styles.list}>
                    <div className={styles.title}>管理员列表</div>
                    <Table columns={this.columns}
                           dataSource={this.state.data}/>
                </div>

                <div className={styles.edit}>
                    <div style={{display: this.props.user && this.props.user.type == 1 ? "block" : "none"}}>
                        <div className={styles.title}>添加管理员</div>
                        <Form onSubmit={this.handleSubmit} className="login-form">
                            <FormItem>
                                {getFieldDecorator('name', {
                                    rules: [{required: true, message: '请输入管理员名'}],
                                })(
                                    <Input prefix={<Icon type="user" style={{color: 'rgba(0,0,0,.25)'}}/>}
                                           placeholder="管理员账号"/>
                                )}
                            </FormItem>
                            <FormItem style={{marginTop: "-0.9rem"}}>
                                {getFieldDecorator('password', {
                                    rules: [{required: true, message: '请输入管理员密码'}],
                                })(
                                    <Input prefix={<Icon type="lock" style={{color: 'rgba(0,0,0,.25)'}}/>}
                                           type="password" placeholder="管理员密码"/>
                                )}
                            </FormItem>
                            <FormItem style={{marginTop: "-0.9rem"}}>
                                <Button type="primary" htmlType="submit" className="login-form-button">
                                    添加
                                </Button>
                            </FormItem>
                        </Form>

                    </div>
                    <div className={styles.update}>
                        <div className={styles.title}>修改当前管理员信息</div>
                        <Form onSubmit={this.handleUpdateSubmit} className="login-form">
                            <FormItem>
                                {getFieldDecorator('updateName', {
                                    rules: [{required: true, message: '请输入新管理员名'}],
                                    initialValue: this.props.user ? this.props.user.name : ""
                                })(
                                    <Input prefix={<Icon type="user" style={{color: 'rgba(0,0,0,.25)'}}/>}
                                           placeholder="新管理员账号"/>
                                )}
                            </FormItem>

                            <FormItem style={{marginTop: "-0.9rem"}}>
                                {getFieldDecorator('oldPassword', {
                                    rules: [{required: true, message: '请输入旧管理员密码'}],
                                })(
                                    <Input prefix={<Icon type="lock" style={{color: 'rgba(0,0,0,.25)'}}/>}
                                           type="password" placeholder="旧管理员密码"/>
                                )}
                            </FormItem>

                            <FormItem style={{marginTop: "-0.9rem"}}>
                                {getFieldDecorator('updatePassword', {
                                    rules: [{required: true, message: '请输入新管理员密码'}],
                                })(
                                    <Input prefix={<Icon type="lock" style={{color: 'rgba(0,0,0,.25)'}}/>}
                                           type="password" placeholder="新管理员密码"/>
                                )}
                            </FormItem>


                            <FormItem style={{marginTop: "-0.9rem"}}>
                                {getFieldDecorator('repeatUpdatePassword', {
                                    rules: [{required: true, message: '请重复输入新管理员密码'}],
                                })(
                                    <Input prefix={<Icon type="lock" style={{color: 'rgba(0,0,0,.25)'}}/>}
                                           type="password" placeholder="重复新管理员密码"/>
                                )}
                            </FormItem>

                            <FormItem style={{marginTop: "-0.9rem"}}>
                                <Button type="primary" htmlType="submit" className="login-form-button">
                                    修改
                                </Button>
                            </FormItem>
                        </Form>
                    </div>
                </div>
            </div>)
    }
}


export default connect(getUser, setModule)(Form.create()(UserManager));
