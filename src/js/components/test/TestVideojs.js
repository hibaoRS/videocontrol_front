import React from "react"
import videojs from "video.js"
import "video.js/dist/video-js.css"

export default class TestVideojs extends React.Component {


    componentDidMount() {
        const videoJsOptions = {
            autoplay: true,
            controls: true,
            sources: [{
                type: 'video/map4'
            }],
            preload: "auto",
            muted: false,
            errorDisplay: false,
            fluid:true
        };

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


