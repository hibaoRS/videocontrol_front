import React from "react";

import styles from "./Test.module.css"
import VideoPlayer from "../../../VideoPlayer";

export default class Test extends React.Component{

    render(){
        const videoJsOptions = {
            src: "rtmp://cp67126.edgefcs.net/ondemand/&mp4:mediapm/ovp/content/test/video/spacealonehd_sounas_640_300.mp4",
            width: 400,
            height: 300,
        };
        return (
            <div className={styles.main}>
                <div className={styles.left}></div>
                <div className={styles.right1}></div>
                <div className={styles.right2}></div>
                <div className={styles.right3}></div>
                <div className={styles.right4}></div>
            </div>
        );

    }
}