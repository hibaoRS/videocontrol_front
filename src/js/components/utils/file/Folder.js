import React from "react"
import styles from "./FileExporter.module.css"
import {Icon} from "antd";

export default class Folder extends React.PureComponent {
    render() {
        return (
            <div className={styles.file} {...this.props}>
                <Icon type={"folder"}/>
                {this.props.children}
            </div>

        )
    }
}