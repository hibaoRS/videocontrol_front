import React from "react"
import styles from "./FileExporter.module.css"
import {Icon} from "antd";

export default class File extends React.PureComponent {
    render() {
        return (
            <div className={styles.file} {...this.props}>
                <Icon type={"picture"}/>
                {this.props.children}
            </div>
        )
    }
}