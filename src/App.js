import React from "react";
import "babel-polyfill"
import "antd/dist/antd.min.css"

import moment from "moment"
import "moment/locale/zh-cn"
import Main from "./js/components/Main";
import styles from "./App.module.css"
import {Link, Route, withRouter} from "react-router-dom";
import Setting from "./js/components/manager/setting/Setting";
import VideoManager from "./js/components/manager/video/VideoManager";
import SystemState from "./js/components/manager/systemState/SystemState";
import UserManager from "./js/components/manager/user/UserManager";
import Login from "./js/components/login_logout/Login";
import {Alert, Icon, Layout, Menu} from "antd";
import AppManage from "./js/components/manager/appManage/AppManage";
import axios from "axios/index";
import {initIsShowAppManage} from "./js/reducers/AppReducer";
import {connect} from "react-redux";

const {Header, Content} = Layout;


moment.locale("zh-cn");

const routes = [
    {
        path: "/",
        component: Main,
        exact: true
    },
    {
        path: "/setting",
        component: Setting
    },
    {
        path: "/video",
        component: VideoManager
    },
    {
        path: "/state",
        component: SystemState
    },
    {
        path: "/user",
        component: UserManager
    },
    {
        path: "/login",
        component: Login
    }
]


class App extends React.Component {

    constructor(props) {
        super();
        this.state = {
            showHeader: true
        };

        axios.get(window.serverUrl + "main.php", {
            params: {
                action: "getShowAppManage"
            }
        }).then(res => {
            if (res.data.code === 1) {
                if (res.data.data === 1) {
                    props.initIsShowAppManage(1)
                }
            }
        }).catch(error => console.log(error))
    }


    render() {
        if (routes.length === 6 && this.props.isShowAppManage) {
            routes.push({
                path: "/appManage",
                component: AppManage
            })
        }

        return (
            <Layout className={styles.layout} id={"video"}>
                <Header style={{display: !!this.props.user ? "block" : "none"}} className={styles.header}>
                    <div className={styles.logo}/>
                    {this.props.activate!==1 ? (<Alert
                        message="设备未激活，仅部分功能可用"
                        type="warning"
                        closeText="前往激活页面"
                        style={{
                            zIndex: 1000, float: "right", width: "300px", height: "3.5rem", margin: "0 2rem 0 0"
                        }}
                        onClose={() => {
                            this.props.history.push("/state");
                        }}
                    />) : ""}
                    <Menu theme={"light"}
                          selectedKeys={[this.props.module]}
                          mode="horizontal"
                          className={styles.menu}>
                        <Menu.Item key="0">
                            <Link to={"/"}/>
                            <Icon type="desktop"/>
                            <span>监控</span>
                        </Menu.Item>
                        <Menu.Item key="1">
                            <Link to={"/video"}/>
                            <Icon type="video-camera"/>
                            <span>录像管理</span>
                        </Menu.Item>

                        <Menu.Item key="2">
                            <Link to={"/user"}/>
                            <Icon type="team"/>
                            <span>用户管理</span>
                        </Menu.Item>

                        <Menu.Item key="3">
                            <Link to={"/setting"}/>
                            <Icon type="setting"/>
                            <span>设置</span>
                        </Menu.Item>

                        <Menu.Item key="4">
                            <Link to={"/state"}/>
                            <Icon type="line-chart"/>
                            <span>系统状态</span>
                        </Menu.Item>


                        {this.props.isShowAppManage === 1 ? (<Menu.Item key="5">
                            <Link to={"/appManage"}/>
                            <Icon type="appstore-o"/>
                            <span>应用管理</span>
                        </Menu.Item>) : ""}
                    </Menu>

                </Header>

                <Content>
                    {routes.map((route, i) => (
                        <Route key={i}   {...route}/>
                    ))}
                </Content>
            </Layout>

        );
    }
}

const mapStateToProps = state => {
    return {
        module: state.app.module,
        user: state.user.user,
        isShowAppManage: state.app.isShowAppManage,
        activate: state.app.activate,
    }
}


const mapDispatchToProps = dispatch => {
    return {
        initIsShowAppManage: (isShowAppManage) => dispatch(initIsShowAppManage(isShowAppManage))
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App))