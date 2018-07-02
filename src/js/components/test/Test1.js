import React from "react"
import VideoPlayer from "../flv/VideoPlayer";

export default class Test1 extends React.Component {


    constructor() {
        super()

        let videos = []
        for (let i = 0; i < 5; i++) {
            videos.push((<div key={i} style={{width: "200px", height: "120px"}}><VideoPlayer
                url={"http://192.168.137.1/videocontrol/videos/" + i + ".mp4"} index={i}/></div>))
        }
        console.log(videos[2])
        this.state = {videos};
    }

    switch = (a,b) => {
        let videos = this.state.videos;
        [videos[a], videos[b]] = [videos[b], videos[a]]
        this.setState({videos: videos})
    }



    render() {

        return (
            <div>
                {this.state.videos.map((w) => w)}
                <button onClick={this.switch.bind(this,2,3)}>switch</button>
                <button onClick={this.switch.bind(this,1,4)}>switch</button>
                <button onClick={this.switch.bind(this,4,2)}>switch</button>
            </div>
        );
    }
}