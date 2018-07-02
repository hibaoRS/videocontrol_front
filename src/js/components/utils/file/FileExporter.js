import React from "react"
import styles from "./FileExporter.module.css"
import axios from "axios/index";
import Folder from "./Folder";
import File from "./File";


export default class FileExporter extends React.PureComponent {

    state = {
        currDir: "",
        files: []
    }

    constructor() {
        super()
        this.openDir(this.state.currDir)
    }


    openDir = (dirPath, isReturnRoot) => {
        let path = isReturnRoot === true ? "" : this.state.currDir + "/" + dirPath;
        axios.get(window.serverUrl + "main.php", {params: {action: "getFiles", filePath: path}}).then((res) => {
            if (res.data.code === 1) {
                this.setState({files: res.data.data.files, currDir: res.data.data.path})
            } else if (res.data.code === 0) {
                console.log(res.data.data)
            }
        }).catch((error) => {
            console.log(error)
        });
    }


    render() {
        return (
            <div className={styles.main}>
                <span>当前路径：{!this.state.currDir?"/":this.state.currDir}</span>
                {this.state.files.map(({type, name}, index) => {
                    if (name === ".") {
                        return (<Folder onClick={this.openDir.bind(this, name, true)}
                                        key={index}>根目录</Folder>);
                    } else if (name === "..") {
                        console.log(this.state.currDir)
                        return (!(this.state.currDir == "/" || this.state.currDir == "") ?
                            <Folder onClick={this.openDir.bind(this, name)}
                                    key={index}>上一级目录</Folder> : "");
                    }
                    if (type === "dir") {
                        return (<Folder onClick={this.openDir.bind(this, name)}
                                        key={index}>{name}</Folder>)
                    } else if (type === "file") {
                        return (<File onClick={this.props.openVideo.bind(this, this.state.currDir+"/"+name)} key={index}>{name}</File>);
                    }

                })}
            </div>)
    }
}