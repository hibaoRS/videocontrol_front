import React from 'react';
import flvjs from 'flv.js/dist/flv.min';
// import flvjs from 'flv.js';
import "../../../static/css/icon/iconfont.css"


/**
 * react component wrap flv.js
 */
class Flv extends React.PureComponent {


    fullScreen = false

    constructor(props) {
        super()
        this.state = {url: props.flvConfig.url}
    }

    initFlv = ($video) => {
        if ($video) {
            this.video = $video
            this.initPlayer();
        }
    }



    componentWillUnmount() {
        if (this.cleanBuff) {
            clearInterval(this.cleanBuff)
        }
        this.destroyPlayer()
    }


    /**
     * 销毁播放器
     */
    destroyPlayer = () => {
        if (this.state.flvPlayer) {
            this.state.flvPlayer.pause();
            this.state.flvPlayer.unload();
            this.state.flvPlayer.detachMediaElement();
            this.state.flvPlayer.destroy();
            this.video.pause();
            this.setState({flvPlayer: null})
        }
    }

    /**
     * 初始化播放器
     *
     */
    initPlayer = (url) => {
        if (!this.props.flvConfig.url && !url) {
            return;
        }
        if (flvjs.isSupported()) {
            //日志控制
            // flvjs.LoggingControl.enableVerbose = false
            // flvjs.LoggingControl.enableWarn = false

            let flvPlayer = flvjs.createPlayer({
                ...this.props.flvConfig,
                url: url ? url : this.props.flvConfig.url
            }, this.props.config)
            flvPlayer.attachMediaElement(this.video);
            flvPlayer.load();
            flvPlayer.play();
            flvPlayer.play();
            this.video.play()	;
            this.setState({flvPlayer})
            flvPlayer.on(flvjs.Events.ERROR, this.destroyPlayer)
            setTimeout(this.jumpToEndBuffer, 5000);
        }
    }


    componentDidMount() {
        this.cleanBuff = setInterval(this.jumpToEndBuffer, 3 * 60 * 1000)
    }

    jumpToEndBuffer = () => {
        if(this.props.flvConfig.url.endsWith("6.flv")){
            return;
        }
        if (this.video) {
            let buffered = this.video.buffered
            if (buffered.length > 0) {
                let end = buffered.end(0)
                if (end - this.video.currentTime >= 3) {
                    this.video.currentTime = end - 3
                }
            }
            setTimeout(()=>{
                if(this.state.flvPlayer){
                    this.state.flvPlayer.play()
                }
            },500)
        }
    }


    onContextMnenu = (event) => {
        event.preventDefault()
    }


    handleDoubleClick = () => {
        if (this.fullScreen) {
            this.exitFullscreen()
        } else {
            this.requestFullScreen()
        }

    }


    //请求全屏
    requestFullScreen = () => {
        if (this.video.requestFullscreen) {
            this.video.requestFullscreen();
        } else if (this.video.mozRequestFullScreen) {
            this.video.mozRequestFullScreen();
        } else if (this.video.webkitRequestFullScreen) {
            this.video.webkitRequestFullScreen();
        }
        this.fullScreen = true
    }

    exitFullscreen = () => {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        }
        this.fullScreen = false
    }


    render() {
        const {className, style, videoProps} = this.props;
        return (
            <video
                onClick={this.props.onClick.bind(this, this.state.flvPlayer ?
                    this.state.flvPlayer._mediaDataSource.url : this.props.flvConfig.url)}
                onDoubleClick={this.handleDoubleClick} onContextMenu={this.onContextMnenu}
                controls={!!this.props.flvConfig.url.endsWith("6.flv")}
                {...videoProps}
                className={className}
                style={Object.assign({
                    width: '100%',
                }, style)}
                ref={this.initFlv}>
                您的浏览器版本过旧，不能播放此视频，请升级您的浏览器
                http://192.168.242.131/live2?app=live&stream=0
            </video>
        )
    }
}


export default Flv