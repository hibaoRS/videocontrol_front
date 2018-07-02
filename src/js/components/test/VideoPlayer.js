import React from "react"
import videojs from "video.js"
import "video.js/dist/video-js.css"
import "videojs-flash"

export default class VideoPlayer extends React.Component {


    componentDidMount() {
        const videoJsOptions = {
            autoplay: true,
            controls: true,
            sources: [{
                type: 'rtmp/flv'
            }],
            type: "application/x-shockwave-flash",
            poster: require("./static/images/logo.png"),
            preload: "auto",
            muted: false,
            errorDisplay: false,
            width:500,
            height:400
        };
        videojs.options.flash.swf = require("./static/video-js.swf");

        this.player = videojs(this.videoNode, {...videoJsOptions, ...this.props});

    }


    componentWillUnmount() {
        if (this.player) {
            this.player.dispose()
        }
    }


    render() {
        return (
            <div data-vjs-player>
                <video
                       ref={node => this.videoNode = node}
                       className={"video-js"}>
                </video>
            </div>
        )
    }
}


