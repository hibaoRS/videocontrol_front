import React from "react";
import axios from "axios"

import styles from "./Login.module.css"
import "../../../static/css/customBootstrap.css"
import {Button, FormControl, Modal, FormGroup, Overlay, Tooltip} from "react-bootstrap"
import {connect} from "react-redux";
import {userLogin} from "../../reducers/UserReducer";
import {getUser} from "../../mapStateToProps/User";
import {message} from "antd"

class Login extends React.PureComponent {

    constructor(props) {
        super();


        this.state = {
            values: {},
            errors: {},
            show: true,
            showModal: false
        };
        this.targets = {};

        if (props.user) {
            props.history.push("/");
        }



    }

    componentDidMount() {
        window.addEventListener("resize", this.onWindowResize1);
        window.addEventListener("resize", this.onWindowResize2);
        window.addEventListener("keypress", this.onKeyPressed);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.onWindowResize1);
        window.removeEventListener("resize", this.onWindowResize2);
        window.removeEventListener("keypress", this.onKeyPressed);
    }

    onKeyPressed = (event) => {
        if (event.key === "Enter") {
            if (this.state.showModal) {
                this.setState({showModal: false})
            } else {
                this.handleLogin()
            }
        }
    }


    onWindowResize1 = () => {
        this.setState({show: !this.state.show});
    }


    onWindowResize2 = () => {
        this.setState({show: !this.state.show});
    };


    closeMessage = () => {
        this.setState({showModal: false})
    }


    handleLogin = () => {
        axios.get(window.serverUrl + "manager.php", {params: {...this.state.values, action: "login"}}).then((res) => {
            if (res.data.code === 1) {
                this.props.userLogin(res.data.data)
                this.props.history.push("/")
                message.success("登录成功");
            } else if (res.data.code === -1) {
                //校验失败，显示校验错误信息
                this.setState({errors: res.data.data})
            } else if (res.data.code === 0) {
                this.setState({showModal: true, msg: res.data.data});
            }else{
                message.error("网络错误");
            }
        }).catch((error) => {
            console.log(error)
        });
    }

    handleName = (event) => {
        this.setState({values: {...this.state.values, name: event.target.value}, errors: {...this.errors, name: null}})
    }

    handlePassword = (event) => {
        this.setState({
            values: {...this.state.values, password: event.target.value},
            errors: {...this.errors, password: null}
        })
    }


    render() {


        return (
            <div className={styles.main}>
                <div className={styles.container}>
                    <div className={styles.titleContainer}>
                        <img alt={"logo"} height={"40rem"} src={require("../../../static/images/logo.png")}/>
                        <span className={styles.title}>海豹录播系统登录</span>
                    </div>
                    <br/><br/>
                    <div>
                        <span>管理员账号</span>
                        <FormGroup validationState={this.state.errors.name != null ? "error" : null}>
                            <FormControl ref={node => this.targets.name = node} onChange={this.handleName}
                                         value={this.state.values.name || ""}
                                         placeholder={"请输入管理员账号"}
                                         className={styles.input}
                                         type="text"/>
                            <Overlay animation={false} show={this.state.show && this.state.errors.name != null}
                                     target={this.targets.name}
                                     placement={"right"}>
                                <Tooltip id={"nameTip"} bsClass={"customTooltip"}>{this.state.errors.name}</Tooltip>
                            </Overlay>
                        </FormGroup>
                    </div>
                    <br/>
                    <div>
                        <span>管理员密码</span>
                        <FormGroup validationState={this.state.errors.password != null ? "error" : null}>
                            <FormControl ref={node => this.targets.password = node} onChange={this.handlePassword}
                                         value={this.state.values.password || ""}
                                         placeholder={"请输入管理员密码"} className={styles.input}
                                         type={"password"}/>

                            <Overlay animation={false} show={this.state.show && this.state.errors.password != null}
                                     target={this.targets.password}
                                     placement={"right"}>
                                <Tooltip id={"passwordTip"}
                                         bsClass={"customTooltip"}>{this.state.errors.password}</Tooltip>
                            </Overlay>
                        </FormGroup>
                    </div>
                    <br/>
                    <div>
                        <Button onClick={this.handleLogin}>登录</Button>
                    </div>


                    <Modal bsSize={"sm"} show={this.state.showModal} onHide={this.closeMessage}>
                        <Modal.Header closeButton>
                            <Modal.Title>登录失败</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {this.state.msg}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button onClick={this.closeMessage}>确定</Button>
                        </Modal.Footer>
                    </Modal>
                </div>
            </div>
        );
    }
}

const mapDispatchToProps = dispatch => {
    return {
        userLogin: user => dispatch(userLogin(user))
    }
}


export default connect(getUser, mapDispatchToProps)(Login);