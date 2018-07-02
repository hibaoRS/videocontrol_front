import React from "react";
import VideoPlayer from "../../../VideoPlayer";

export default class TestFlash extends React.Component {

    render() {
        return (
            <div style={{display:"flex"}}>
                <div >
                    <VideoPlayer sources={[{
                        src: 'rtmp://192.168.1.104:1935/live/6',
                        type: 'rtmp/flv'
                    }]}/>
                </div>
                <div>
                    <VideoPlayer sources={[{
                        src: 'rtmp://192.168.1.104:1935/live/6',
                        type: 'rtmp/flv'
                    }]}/>
                </div>
                <div >
                    <VideoPlayer sources={[{
                        src: 'rtmp://192.168.1.104:1935/live/6',
                        type: 'rtmp/flv'
                    }]}/>
                </div>
                <div >
                    <VideoPlayer sources={[{
                        src: 'rtmp://192.168.1.104:1935/live/6',
                        type: 'rtmp/flv'
                    }]}/>
                </div>
            </div>

        );
    }

}