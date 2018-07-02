import React from "react"
import Flv from "./Flv";

export default class VideoPlayer extends React.PureComponent {

    changeUrl = (url) => {
        this.player.initPlayer(url)
    }


    render() {
        return (
            <Flv
                ref={node => this.player = node}
                changeUrl={this.props.changeUrl}
                onClick={this.props.onClick}
                videoProps={{
                    poster: require("../../../static/images/nosignal.png"),
                    autoPlay: "autoplay",
                    // muted: "muted",
                }}
                style={{width: "100%", height: "100%", objectFit: "fill"}}
                flvConfig={{
                    hasAudio: !!this.props.url.endsWith("6.flv"),
                    // hasAudio: false,
                    hasVideo: true,
                    url: this.props.url,
                    type: "flv",
                    isLive: true,
                }}
                config={{
                    fixAudioTimestampGap: false,
                    enableWorker: false,
                    enableStashBuffer: true,
                    stashInitialSize: 300,
                    autoCleanupSourceBuffer: true
                }}

            />
        );
    }
}