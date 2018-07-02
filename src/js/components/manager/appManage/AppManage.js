import React from "react";
import axios from "axios"
import {connect} from "react-redux";
import {setCurrModule} from "../../../reducers/AppReducer";
import "bootstrap/dist/css/bootstrap-theme.min.css"
import $ from "jquery"

class AppManage extends React.Component {


    constructor(props) {

        window.$ = $
        super();

        if (!props.user) {
            props.history.push("/login");
            return;
        }

        props.setModule("5")
        this.state = {
            html: ""
        }
    }

    componentWillMount() {
        axios.post(window.serverUrl + "main.php?action=getHtml").then((res) => {
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


    render() {
        return (
            <div dangerouslySetInnerHTML={{__html: this.state.html}}/>
        );
    }

}

const mapDispatchToProps = dispatch => {
    return {

        setModule: module => dispatch(setCurrModule(module))
    }
}


const mapStateToProps = state => {
    return {
        user: state.user.user
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AppManage)