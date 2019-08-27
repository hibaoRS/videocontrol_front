import React from "react"
import {connect} from "react-redux";
import styles from "./Setting.module.css"
import axios from "axios"
import {
  Select,
  message,
  Switch,
  AutoComplete,
  Button,
  Icon,
  Popover,
  Popconfirm,
  Anchor,
  Upload,
  Input,
  Tabs,
  Modal, InputNumber
} from 'antd';
import {initIsShowAppManage, setCurrModule} from "../../../reducers/AppReducer";
import {userLogout} from "../../../reducers/UserReducer";

const Option = Select.Option;
const {Link} = Anchor;
const TabPane = Tabs.TabPane;


class Setting extends React.Component {

  selectWidth = 250

  uploadProps = {
    accept: "application/zip",
    name: 'file',
    withCredentials: true,
    action: window.serverUrl + "main.php?action=setHtml",
    onChange: info => {
      if (info.file.status === 'done') {
        let res = info.file.response;
        if (res.code === 1) {
          message.success(res.data);
        } else {
          message.error(res.data);
        }
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 文件上传失败，请稍后再试或重启系统.`);
      }
    },
  };

  constructor(props) {
    super()

    this.state = {
      disabled: props.activate !== 1,
      configs: null,
      configOptions: null,
      showControlAppManage: 0,
      previewVisible: false,
    }


    if (!props.user) {
      props.history.push("/login");
      return;
    }

    this.fetchConfigOptions()
    props.setModule("3")
  }


  setConfigsOther = (configs) => {
    let other = JSON.parse(JSON.stringify(configs.other));
    other.server_url = configs.rtmp.server_url;
    if (!configs.other1) {
      configs.other1 = other;
    }
    if (!configs.other2) {
      configs.other2 = JSON.parse(JSON.stringify(other));
    }
    if (!configs.interact_config) {
      configs.interact_config = "1";
    }
    return configs;
  }

  fetchConfigOptions = () => {
    axios.get(window.serverUrl + "main.php", {params: {action: "getConfigOptions"}}).then(res => {
      if (res.data.code === 1) {
        axios.get(window.serverUrl + "main.php", {params: {action: "getConfig"}}).then(res2 => {
          if (res2.data.code === 1) {
            let configs = this.setConfigsOther(res2.data.data.configs);
            this.setState({
              showControlAppManage: res2.data.data.showControlAppManage,
              configs: configs,
              configOptions: res.data.data,
              mainPanel: res2.data.data.mainPanel
            });
          } else if (res2.data.code === 0) {
            message.error(res2.data.data);
          } else {
            console.log(res2.data.data);
          }
        }).catch(error => console.log(error));
      } else {
        message.error("获取配置信息失败，请重新登录");
        this.props.userLogout()
      }
    }).catch(error => console.log(error));
  }


  fetchConfig = () => {
    axios.get(window.serverUrl + "main.php", {params: {action: "getConfig"}}).then(res => {
      if (res.data.code === 1) {
        let configs = this.setConfigsOther(res.data.data.configs);
        this.setState({
          showControlAppManage: res.data.data.showControlAppManage,
          configs,
          mainPanel: res.data.data.mainPanel,
        })
      } else if (res.data.code === 0) {
        message.error(res.data.data);
      } else {
        console.log(res.data.data);
      }
    }).catch(error => console.log(error));

  }

  getResourceModeScreenLength = () => {
    switch (this.state.configs.video.record.mode) {
      case "2":
        return 2;
      case "3":
        return 3;
      case "4":
        return 4;
      case "5":
        return 4;
      case "6":
        return 5;
      case "7":
        return 6;
      case "8":
        return 7;
    }
  }

  render() {


    return <div className={styles.container}>
      <div className={styles.settings}>
        <div className={styles.setting}>
          <div className={styles.title}>视频录制设置
            <a href={"#video"} className={styles.anchor}>#</a>
          </div>


          <div className={styles.content}>
            <div>
              <span>普通模式录制分辨率</span>
              <div>
                <Select
                  disabled={this.state.disabled}
                  value={this.state.configs ? this.state.configs.video.config.normal_resolution + "" : ""}
                  style={{width: this.selectWidth}}
                  onChange={val => {
                    let configs = this.state.configs
                    configs.video.config.normal_resolution = val
                    this.setState({configs})
                  }}>
                  {this.state.configOptions ? Object.entries(this.state.configOptions.video.resolution).map((entry, index) => (
                    <Option key={entry[1]}>{entry[0]}</Option>
                  )) : ""}
                </Select>
              </div>
            </div>
            <div>
              <span>普通模式录制码率大小</span>
              <div>
                <InputNumber
                  disabled={this.state.disabled} style={{width: this.selectWidth}}
                  value={this.state.configs ? this.state.configs.video.config.normal_bitrate : ""}
                  step={1000}
                  min={1000}
                  max={8000}
                  onChange={val => {
                    let configs = this.state.configs
                    configs.video.config.normal_bitrate = val
                    this.setState({
                      configs: configs
                    })
                  }}
                  placeholder="请输入码率大小"
                />
              </div>
            </div>

            <div>
              <span>资源模式录制分辨率</span>
              <div>
                <Select
                  disabled={this.state.disabled}
                  value={this.state.configs ? this.state.configs.video.config.resource_resolution + "" : ""}
                  style={{width: this.selectWidth}}
                  onChange={val => {
                    let configs = this.state.configs
                    configs.video.config.resource_resolution = val
                    this.setState({configs})
                  }}>
                  {this.state.configOptions ? Object.entries(this.state.configOptions.video.resolution).map((entry, index) => {
                    if (+entry[1] < 4) {
                      return;
                    }
                    return <Option
                      key={entry[1]}>{entry[0]}</Option>;
                  }) : ""}
                </Select>
              </div>
            </div>
            <div>
              <span>资源模式录制码率大小</span>
              <div>
                <InputNumber
                  disabled={this.state.disabled} style={{width: this.selectWidth}}
                  value={this.state.configs ? this.state.configs.video.config.resource_bitrate : ""}
                  step={1000}
                  min={1000}
                  max={4000}
                  onChange={val => {
                    let configs = this.state.configs
                    configs.video.config.resource_bitrate = val
                    this.setState({
                      configs: configs
                    })
                  }}
                  placeholder="请输入码率大小"
                />
              </div>
            </div>

            <div>
              <span>直播分辨率</span>
              <div>
                <Select
                  disabled={this.state.disabled}
                  value={this.state.configs ? this.state.configs.video.config.live_resolution + "" : ""}
                  style={{width: this.selectWidth}}
                  onChange={val => {
                    let configs = this.state.configs
                    configs.video.config.live_resolution = val
                    this.setState({configs})
                  }}>
                  {this.state.configOptions ? Object.entries(this.state.configOptions.video.resolution).map((entry, index) => {
                    if (+entry[1] < 4) {
                      return;
                    }
                    return <Option
                      key={entry[1]}>{entry[0]}</Option>;
                  }) : ""}
                </Select>
              </div>
            </div>
            <div>
              <span>直播码率大小</span>
              <div>
                <InputNumber
                  disabled={this.state.disabled} style={{width: this.selectWidth}}
                  value={this.state.configs ? this.state.configs.video.config.live_bitrate : ""}
                  step={1000}
                  min={1000}
                  max={4000}
                  onChange={val => {
                    let configs = this.state.configs
                    configs.video.config.live_bitrate = val
                    this.setState({
                      configs: configs
                    })
                  }}
                  placeholder="请输入码率大小"
                />
              </div>
            </div>


            <div>
              <span>教师端采集画面接口类型</span>
              <div>
                <Select disabled={this.state.disabled}
                        value={this.state.configs ? this.state.configs.video.adv7842_type + "" : ""}
                        style={{width: this.selectWidth}}
                        onChange={val => {
                          let configs = this.state.configs
                          configs.video.adv7842_type = val
                          this.setState({configs})
                        }}>
                  {this.state.configOptions ? Object.entries(this.state.configOptions.video.adv7842_type).map((entry, index) => (
                    <Option key={entry[1]}>{entry[0]}</Option>
                  )) : ""}
                </Select>
              </div>
            </div>

          </div>
        </div>


        <Tabs activeKey={this.state.configs ? this.state.configs.video.record.type : "0"}
              onChange={k => {
                let configs = this.state.configs;
                configs.video.record.type = k;
                configs.video.record.mode = k;
                if (k === "1") {
                  configs.video.record.mapping = {"0": 0, "1": 1}
                } else if (k === "2") {
                  configs.video.record.mapping = {
                    "0": 0,
                    "1": 1,
                    "2": 2,
                    "3": 3,
                    "4": 4,
                    "5": 5,
                  }
                }
                this.setState({configs})
              }}>
          <TabPane tab="普通录制模式" key="0">
            <div className={styles.setting}>
              <div className={styles.content}>
                <div>无需配置</div>
              </div>
            </div>

          </TabPane>
          <TabPane tab="画中画模式" key="1">
            <div className={styles.setting}>
              <div className={styles.content}>

                <div>
                  <span>主画面</span>
                  <div>
                    <Select disabled={this.state.disabled}
                            value={this.state.configs ? this.state.configs.video.record.mapping["0"] + "" : "0"}
                            style={{width: this.selectWidth}}
                            onChange={val => {
                              let configs = this.state.configs
                              if (val == configs.video.record.mapping["1"]) {
                                message.warn("主画面和附属画面不能相同");
                                return;
                              }
                              configs.video.record.mapping["0"] = val
                              this.setState({configs})
                            }}>
                      {this.state.configOptions ? Object.entries(this.state.configOptions.scene).map((entry, index) => {
                        //主播画面不可选
                        if (entry[0] === "主画面") {
                          return;
                        }
                        return (<Option key={entry[1]}>{entry[0]}</Option>);
                      }) : ""}
                    </Select>
                  </div>
                </div>


                <div>
                  <span>附属画面</span>
                  <div>
                    <Select disabled={this.state.disabled}
                            value={this.state.configs ? this.state.configs.video.record.mapping["1"] + "" : "1"}
                            style={{width: this.selectWidth}}
                            onChange={val => {
                              let configs = this.state.configs
                              if (val == configs.video.record.mapping["0"]) {
                                message.warn("主画面和附属画面不能相同");
                                return;
                              }
                              configs.video.record.mapping["1"] = val
                              this.setState({configs})
                            }}>
                      {this.state.configOptions ? Object.entries(this.state.configOptions.scene).map((entry, index) => {
                        //主播画面不可选
                        if (entry[0] === "主画面") {
                          return;
                        }
                        return (<Option key={entry[1]}>{entry[0]}</Option>);
                      }) : ""}
                    </Select>
                  </div>
                </div>


              </div>
            </div>

          </TabPane>
          <TabPane tab="资源模式" key="2">
            <div className={styles.setting}>
              <div className={styles.content}>

                <div>
                  <span>拼接类型</span>
                  <div>
                    <Select disabled={this.state.disabled}
                            value={this.state.configs ? this.state.configs.video.record.mode + "" : "2"}
                            style={{width: this.selectWidth}}
                            onChange={val => {
                              let configs = this.state.configs
                              configs.video.record.mode = val
                              this.setState({configs})
                            }}>
                      {this.state.configOptions ? Object.entries(this.state.configOptions.video.record.mode).map((entry, index) =>
                        <Option key={entry[1]}>{entry[0]}</Option>
                      ) : ""}
                    </Select>
                  </div>
                </div>

                {Array.from({length: 6}, (v, i) => i).map(k => {
                  if (!this.state.configs || k > this.getResourceModeScreenLength() - 1) {
                    return;
                  }
                  return <div>
                    <span>画面{k + 1}</span>
                    <div>
                      <Select disabled={this.state.disabled}
                              value={this.state.configs ? this.state.configs.video.record.mapping[k + ""] + "" : ""}
                              style={{width: this.selectWidth}}
                              onChange={val => {
                                let configs = this.state.configs;
                                configs.video.record.mapping[k + ""] = +val;
                                let mapping = configs.video.record.mapping;
                                let mapArray = Object.keys(mapping).map(k => mapping[k]);
                                let screenLength = this.getResourceModeScreenLength();
                                if (new Set(mapArray.slice(0, screenLength)).size != screenLength) {
                                  message.warn("拼接画面不能有相同场景");
                                  return;
                                }
                                this.setState({configs})
                              }}>
                        {this.state.configOptions ? Object.entries(this.state.configOptions.scene).map((entry, index) =>
                          <Option key={entry[1]}>{entry[0]}</Option>
                        ) : ""}
                      </Select>
                    </div>
                  </div>;
                })}

              </div>
            </div>

          </TabPane>

        </Tabs>


        <div className={styles.setting} id={"audio"}>
          <div className={styles.title}>音频设置<a href={"#audio"}
                                               className={styles.anchor}>#</a></div>
          <div className={styles.content}>
            <div>
              <span>采样率</span>
              <div>
                <Select disabled={this.state.disabled}
                        value={this.state.configs ? this.state.configs.audio.samplerate + "" : ""}
                        style={{width: this.selectWidth}}
                        onChange={val => {
                          let configs = this.state.configs
                          configs.audio.samplerate = val
                          this.setState({configs})
                        }}>
                  {this.state.configOptions ? Object.entries(this.state.configOptions.audio.samplerate).map((entry, index) => (
                    <Option key={entry[1]}>{entry[0]}</Option>
                  )) : ""}
                </Select>
              </div>
            </div>

            <div>
              <span>声道</span>
              <div>
                <Select disabled={this.state.disabled}
                        value={this.state.configs ? this.state.configs.audio.channels + "" : ""}
                        style={{width: this.selectWidth}}
                        onChange={val => {
                          let configs = this.state.configs
                          configs.audio.channels = val
                          this.setState({configs})
                        }}>
                  {this.state.configOptions ? Object.entries(this.state.configOptions.audio.channels).map((entry, index) => (
                    <Option key={entry[1]}>{entry[0]}</Option>
                  )) : ""}
                </Select>
              </div>
            </div>

          </div>
        </div>


        <div className={styles.setting} id={"serial"}>
          <div className={styles.title}>串口设置
            <a href={"#serial"} className={styles.anchor}>#</a></div>
          <div className={styles.content}>


            <div>
                    <span>
                    摄像头串口设备
                    <Popover content={(<div>用于控制摄像头</div>)}
                             placement="right">
                    <Icon className={styles.icon} type="question-circle-o"/>
                    </Popover>
                    </span>
              <div>
                <Select disabled={this.state.disabled}
                        value={this.state.configs ? this.state.configs.serial.camera_serial_dev + "" : ""}
                        style={{width: this.selectWidth}}
                        onChange={val => {
                          if (val == this.state.configs.serial.serial_dev) {
                            message.warn("摄像头串口设备和跟踪主机串口设备不可相同");
                            return;
                          }
                          let configs = this.state.configs
                          configs.serial.camera_serial_dev = val
                          this.setState({configs})
                        }}>
                  {this.state.configOptions ? Object.entries(this.state.configOptions.serial.camera_serial_dev).map((entry, index) => (
                    <Option key={entry[1]}>{entry[0]}</Option>
                  )) : ""}
                </Select>
              </div>
            </div>

            <div>
                    <span>
                    跟踪主机串口设备
                    <Popover content={(<div>用于对接跟踪主机</div>)}
                             placement="right">
                    <Icon className={styles.icon} type="question-circle-o"/>
                    </Popover>
                    </span>
              <div>
                <Select disabled={this.state.disabled}
                        value={this.state.configs ? this.state.configs.serial.serial_dev + "" : ""}
                        style={{width: this.selectWidth}}
                        onChange={val => {
                          if (val == this.state.configs.serial.camera_serial_dev) {
                            message.warn("跟踪主机串口设备和摄像头串口设备不可相同");
                            return;
                          }
                          let configs = this.state.configs
                          configs.serial.serial_dev = val
                          this.setState({configs})
                        }}>
                  {this.state.configOptions ? Object.entries(this.state.configOptions.serial.serial_dev).map((entry, index) => (
                    <Option key={entry[1]}>{entry[0]}</Option>
                  )) : ""}
                </Select>
              </div>
            </div>

            <div>
              <span>跟踪主机串口波特率</span>
              <div>
                <Select disabled={this.state.disabled}
                        value={this.state.configs ? this.state.configs.serial.bitrate_type + "" : ""}
                        style={{width: this.selectWidth}}
                        onChange={val => {
                          let configs = this.state.configs
                          configs.serial.bitrate_type = val
                          this.setState({configs})
                        }}>
                  {this.state.configOptions ? Object.entries(this.state.configOptions.serial.bitrate_type).map((entry, index) => (
                    <Option key={entry[1]}>{entry[0]}</Option>
                  )) : ""}
                </Select>
              </div>
            </div>


          </div>
        </div>


        <div className={styles.setting} id={"camera"}>
          <div className={styles.title}>摄像头地址设置<a href={"#camera"}
                                                  className={styles.anchor}>#</a></div>
          <div className={styles.content}>
            <div>
              <span>学生特写</span>
              <div>
                <Select disabled={this.state.disabled}
                        value={this.state.configs ? this.state.configs.camera.student_closeUp + "" : ""}
                        style={{width: this.selectWidth}}
                        onChange={val => {
                          let configs = this.state.configs
                          configs.camera.student_closeUp = val
                          this.setState({configs})
                        }}>
                  {this.state.configOptions ? Object.entries(this.state.configOptions.camera.value).map((entry, index) => (
                    <Option key={entry[1]}>{entry[0]}</Option>
                  )) : ""}
                </Select>
              </div>
            </div>


            <div>
              <span>教师特写</span>
              <div>
                <Select disabled={this.state.disabled}
                        value={this.state.configs ? this.state.configs.camera.teacher_closeUp + "" : ""}
                        style={{width: this.selectWidth}}
                        onChange={val => {
                          let configs = this.state.configs
                          configs.camera.teacher_closeUp = val
                          this.setState({configs})
                        }}>
                  {this.state.configOptions ? Object.entries(this.state.configOptions.camera.value).map((entry, index) => (
                    <Option key={entry[1]}>{entry[0]}</Option>
                  )) : ""}
                </Select>
              </div>
            </div>


            <div>
              <span>学生全景</span>
              <div>
                <Select disabled={this.state.disabled}
                        value={this.state.configs ? this.state.configs.camera.student_panorama + "" : ""}
                        style={{width: this.selectWidth}}
                        onChange={val => {
                          let configs = this.state.configs
                          configs.camera.student_panorama = val
                          this.setState({configs})
                        }}>
                  {this.state.configOptions ? Object.entries(this.state.configOptions.camera.value).map((entry, index) => (
                    <Option key={entry[1]}>{entry[0]}</Option>
                  )) : ""}
                </Select>
              </div>
            </div>


            <div>
              <span>教师全景</span>
              <div>
                <Select disabled={this.state.disabled}
                        value={this.state.configs ? this.state.configs.camera.teacher_panorama + "" : ""}
                        style={{width: this.selectWidth}}
                        onChange={val => {
                          let configs = this.state.configs
                          configs.camera.teacher_panorama = val
                          this.setState({configs})
                        }}>
                  {this.state.configOptions ? Object.entries(this.state.configOptions.camera.value).map((entry, index) => (
                    <Option key={entry[1]}>{entry[0]}</Option>
                  )) : ""}
                </Select>
              </div>
            </div>


            <div>
              <span>板书特写</span>
              <div>
                <Select disabled={this.state.disabled}
                        value={this.state.configs ? this.state.configs.camera.board_closeUp + "" : ""}
                        style={{width: this.selectWidth}}
                        onChange={val => {
                          let configs = this.state.configs
                          configs.camera.board_closeUp = val
                          this.setState({configs})
                        }}>
                  {this.state.configOptions ? Object.entries(this.state.configOptions.camera.value).map((entry, index) => (
                    <Option key={entry[1]}>{entry[0]}</Option>
                  )) : ""}
                </Select>
              </div>
            </div>


            <div>
              <span>自定义</span>
              <div>
                <Select disabled={this.state.disabled}
                        value={this.state.configs ? this.state.configs.camera.custom + "" : ""}
                        style={{width: this.selectWidth}}
                        onChange={val => {
                          let configs = this.state.configs
                          configs.camera.custom = val
                          this.setState({configs})
                        }}>
                  {this.state.configOptions ? Object.entries(this.state.configOptions.camera.value).map((entry, index) => (
                    <Option key={entry[1]}>{entry[0]}</Option>
                  )) : ""}
                </Select>
              </div>
            </div>


          </div>
        </div>


        <div className={styles.setting} id={"rtmp"}>
          <div className={styles.title}>RTMP直播设置<a href={"#rtmp"} className={styles.anchor}>#</a></div>
          <div className={styles.content}>

            <div>
              <span>RTMP直播分辨率</span>
              <div>
                <Select disabled={this.state.disabled}
                        value={this.state.configs ? this.state.configs.rtmp.size_type + "" : ""}
                        style={{width: this.selectWidth}}
                        onChange={val => {
                          let configs = this.state.configs
                          configs.rtmp.size_type = val
                          this.setState({configs})
                        }}>
                  {this.state.configOptions ? Object.entries(this.state.configOptions.rtmp.size_type).map((entry, index) => (
                    <Option key={entry[1]}>{entry[0]}</Option>
                  )) : ""}
                </Select>
              </div>
            </div>


            <div>
              <span>RTMP视频码率</span>
              <div>
                <Select disabled={this.state.disabled}
                        value={this.state.configs ? this.state.configs.rtmp.bitrate_type + "" : ""}
                        style={{width: this.selectWidth}}
                        onChange={val => {
                          let configs = this.state.configs
                          configs.rtmp.bitrate_type = val
                          this.setState({configs})
                        }}>
                  {this.state.configOptions ? Object.entries(this.state.configOptions.rtmp.bitrate_type).map((entry, index) => (
                    <Option key={entry[1]}>{entry[0]}</Option>
                  )) : ""}
                </Select>
              </div>
            </div>


            <div>
              <span>视频封面（实时生效）</span>
              <div>
                <Upload
                  disabled={this.state.disabled}
                  showUploadList={false}
                  accept={"image/*"}
                  withCredentials={true}
                  action={window.serverUrl + "main.php?action=setVideoCover"}
                  onChange={info => {
                    console.log(info)
                    if (info.file.status === 'done') {
                      let res = info.file.response;
                      if (res.code === 1) {
                        let configs = this.state.configs
                        configs.other.interact_live.picAddress = res.data
                        this.setState({
                          configs
                        });
                        message.success("设置成功");
                      } else {
                        message.error(res.data);
                      }
                    } else if (info.file.status === 'error') {
                      message.error(`${info.file.name} 文件上传失败，请稍后再试或重启系统.`);
                    }
                    return true;
                  }}
                >
                  <Button>
                    <Icon type="upload"/>选择图片
                  </Button>
                </Upload>
                <img onClick={() => this.setState({previewVisible: true})}
                     src={this.state.configs ? window.serverUrl + this.state.configs.other.interact_live.picAddress + "?" + Math.random() : ""}
                     style={{width: "200px", height: "120px"}}/>
                <Modal visible={this.state.previewVisible} footer={null}
                       onCancel={() => this.setState({previewVisible: false})}>
                  <img alt="图片预览" style={{width: '100%'}}
                       src={this.state.configs ? window.serverUrl + this.state.configs.other.interact_live.picAddress + "?" + Math.random() : ""}/>
                </Modal>
              </div>
            </div>
          </div>
        </div>


        <Tabs activeKey={this.state.configs ? this.state.configs.interact_config : "1"}
              onChange={k => {
                let configs = this.state.configs;
                configs.interact_config = k;
                this.setState({configs})
              }}>
          <TabPane tab={<span id={"interact_live"}>本地互动直播设置<a href={"#interact_live"}
                                                              className={styles.anchor}>#</a></span>}
                   key="1">
            <div className={styles.setting}>
              <div className={styles.content}>

                <div>
                    <span>
                    RTMP直播服务器
                    <Popover content={(<div>设置外部RTMP服务器地址</div>)}
                             placement="right">
                    <Icon className={styles.icon} type="question-circle-o"/>
                    </Popover>
                    </span>
                  <div>
                    <AutoComplete disabled={this.state.disabled}
                                  style={{width: this.selectWidth}}
                                  value={this.state.configs ? this.state.configs.other1.server_url : ""}
                                  onChange={val => {
                                    let configs = this.state.configs
                                    configs.other1.server_url = val
                                    this.setState({
                                      configs: configs,
                                      dataSource: {
                                        server_url:
                                          !val || val.indexOf('@') >= 0 ? [] : [
                                            `rtmp://${val}/live`,
                                            `${val}/live`,
                                            `rtmp://${val}`,
                                          ],
                                      }
                                    })
                                  }}
                                  dataSource={this.state.dataSource ? this.state.dataSource.server_url : []}
                                  onBlur={() => {
                                    if (this.state.configs.other1.server_url.trim() == "") {
                                      let configs = this.state.configs
                                      configs.other1.server_url = "rtmp://127.0.0.1/live"
                                      this.setState({configs})
                                    }
                                  }}
                                  placeholder="默认值rtmp://127.0.0.1/live"/>
                  </div>
                </div>


                <div>
                  <span>录播主机序列号</span>
                  <div>
                    <Input disabled={this.state.disabled} style={{width: this.selectWidth}}
                           value={this.state.configs ? this.state.configs.other1.interact_live.serial_number : ""}
                           onChange={e => {
                             let val = e.target.value
                             let configs = this.state.configs
                             configs.other1.interact_live.serial_number = val
                             this.setState({
                               configs: configs
                             })
                           }}
                           placeholder="请输入录播主机序列号"
                    />
                  </div>
                </div>


                <div>
                  <span>录播主机名称</span>
                  <div>
                    <Input disabled={this.state.disabled} style={{width: this.selectWidth}}
                           value={this.state.configs ? this.state.configs.other1.interact_live.class_room_name : ""}
                           onChange={e => {
                             let val = e.target.value
                             let configs = this.state.configs
                             configs.other1.interact_live.class_room_name = val
                             this.setState({
                               configs: configs
                             })
                           }}
                           placeholder="请输入录播主机名称"
                    />
                  </div>
                </div>


                <div>
                  <span>录播主机公网IP</span>
                  <div>
                    <Input disabled={this.state.disabled} style={{width: this.selectWidth}}
                           value={this.state.configs ? this.state.configs.other1.interact_live.ip_address : ""}
                           onChange={e => {
                             let val = e.target.value
                             let configs = this.state.configs
                             configs.other1.interact_live.ip_address = val
                             this.setState({
                               configs: configs
                             })
                           }}
                           placeholder="请输入录播主机公网IP"
                    />
                  </div>
                </div>


                <div>
                  <span>资源平台IP</span>
                  <div>
                    <Input disabled={this.state.disabled} style={{width: this.selectWidth}}
                           value={this.state.configs ? this.state.configs.other1.interact_live.resource_platform_ip : ""}
                           onChange={e => {
                             let val = e.target.value
                             let configs = this.state.configs
                             configs.other1.interact_live.resource_platform_ip = val
                             this.setState({
                               configs: configs
                             })
                           }}
                           onBlur={() => {
                             if (this.state.configs.other1.interact_live.resource_platform_ip.trim() == "") {
                               let configs = this.state.configs
                               configs.other1.interact_live.resource_platform_ip = "58.67.222.35"
                               this.setState({configs})
                             }
                           }}
                           placeholder="默认值58.67.222.35"/>
                  </div>
                </div>


                <div>
                  <span>资源平台端口</span>
                  <div>
                    <Input disabled={this.state.disabled} style={{width: this.selectWidth}}
                           value={this.state.configs ? this.state.configs.other1.interact_live.resource_platform_port : ""}
                           onChange={e => {
                             let val = e.target.value
                             let configs = this.state.configs
                             configs.other1.interact_live.resource_platform_port = val
                             this.setState({
                               configs: configs
                             })
                           }}
                           onBlur={() => {
                             if (this.state.configs.other1.interact_live.resource_platform_port.trim() == "") {
                               let configs = this.state.configs
                               configs.other1.interact_live.resource_platform_port = "8080"
                               this.setState({configs})
                             }
                           }}
                           placeholder="默认值8080"/>
                  </div>
                </div>


                <div>
                  <span>FTP服务器</span>
                  <div>
                    <AutoComplete disabled={this.state.disabled}
                                  style={{width: this.selectWidth}}
                                  value={this.state.configs ? this.state.configs.other1.ftp.server : ""}
                                  onChange={val => {
                                    let configs = this.state.configs
                                    configs.other1.ftp.server = val
                                    this.setState({
                                      configs: configs,
                                      dataSource: {
                                        ftp_server:
                                          !val || val.indexOf('@') >= 0 ? [] : [
                                            `ftp://${val}`,
                                          ],
                                      }
                                    })
                                  }}
                                  dataSource={this.state.dataSource ? this.state.dataSource.ftp_server : []}
                                  onBlur={() => {
                                    if (this.state.configs.other1.ftp.server.trim() == "") {
                                      let configs = this.state.configs
                                      configs.other1.ftp.server = "ftp://58.67.222.35"
                                      this.setState({configs})

                                    }
                                  }}
                                  placeholder="默认值ftp://58.67.222.35"/>
                  </div>
                </div>


                <div>
                  <span>端口</span>
                  <div>
                    <Input disabled={this.state.disabled} style={{width: this.selectWidth}}
                           value={this.state.configs ? this.state.configs.other1.ftp.port : ""}
                           onChange={e => {
                             let val = e.target.value
                             let configs = this.state.configs
                             configs.other1.ftp.port = val
                             this.setState({
                               configs: configs
                             })
                           }}
                           onBlur={() => {
                             if (this.state.configs.other1.ftp.port.trim() == "") {
                               let configs = this.state.configs
                               configs.other1.ftp.port = "21"
                               this.setState({configs})
                             }
                           }}
                           placeholder="默认值21"/>
                  </div>
                </div>


                <div>
                  <span>用户名</span>
                  <div>
                    <Input disabled={this.state.disabled} style={{width: this.selectWidth}}
                           value={this.state.configs ? this.state.configs.other1.ftp.user : ""}
                           onChange={e => {
                             let val = e.target.value
                             let configs = this.state.configs
                             configs.other1.ftp.user = val
                             this.setState({
                               configs: configs
                             })
                           }}
                           onBlur={() => {
                             if (this.state.configs.other1.ftp.user.trim() == "") {
                               let configs = this.state.configs
                               configs.other1.ftp.user = "vision_ftp"
                               this.setState({configs})
                             }
                           }}
                           placeholder="默认值vision_ftp"/>
                  </div>
                </div>


                <div>
                  <span>密码</span>
                  <div>
                    <Input disabled={this.state.disabled} style={{width: this.selectWidth}}
                           value={this.state.configs ? this.state.configs.other1.ftp.password : ""}
                           onChange={e => {
                             let val = e.target.value
                             let configs = this.state.configs
                             configs.other1.ftp.password = val
                             this.setState({
                               configs: configs
                             })
                           }}
                           onBlur={() => {
                             if (this.state.configs.other1.ftp.password.trim() == "") {
                               let configs = this.state.configs
                               configs.other1.ftp.password = "vision_upload"
                               this.setState({configs})
                             }
                           }}
                           placeholder="默认值vision_upload"/>
                  </div>
                </div>


                <div>
                  <span>点播端口</span>
                  <div>
                    <Input disabled={this.state.disabled} style={{width: this.selectWidth}}
                           value={this.state.configs ? this.state.configs.other1.ftp.on_demand_port : ""}
                           onChange={e => {
                             let val = e.target.value
                             let configs = this.state.configs
                             configs.other1.ftp.on_demand_port = val
                             this.setState({
                               configs: configs
                             })
                           }}
                           onBlur={() => {
                             if (this.state.configs.other1.ftp.on_demand_port.trim() == "") {
                               let configs = this.state.configs
                               configs.other1.ftp.on_demand_port = "8085"
                               this.setState({configs})
                             }
                           }}
                           placeholder="默认值8085"
                    />
                  </div>
                </div>


              </div>
            </div>

          </TabPane>
          <TabPane tab="远程互动直播设置" key="2">
            <div className={styles.setting}>
              <div className={styles.content}>

                <div>
                    <span>
                    RTMP直播服务器
                    <Popover content={(<div>设置外部RTMP服务器地址</div>)}
                             placement="right">
                    <Icon className={styles.icon} type="question-circle-o"/>
                    </Popover>
                    </span>
                  <div>
                    <AutoComplete disabled={this.state.disabled}
                                  style={{width: this.selectWidth}}
                                  value={this.state.configs ? this.state.configs.other2.server_url : ""}
                                  onChange={val => {
                                    let configs = this.state.configs
                                    configs.other2.server_url = val
                                    this.setState({
                                      configs: configs,
                                      dataSource: {
                                        server_url:
                                          !val || val.indexOf('@') >= 0 ? [] : [
                                            `rtmp://${val}/live`,
                                            `${val}/live`,
                                            `rtmp://${val}`,
                                          ],
                                      }
                                    })
                                  }}
                                  dataSource={this.state.dataSource ? this.state.dataSource.server_url : []}
                                  onBlur={() => {
                                    if (this.state.configs.other2.server_url.trim() == "") {
                                      let configs = this.state.configs
                                      configs.other2.server_url = "rtmp://127.0.0.1/live"
                                      this.setState({configs})
                                    }
                                  }}
                                  placeholder="默认值rtmp://127.0.0.1/live"/>
                  </div>
                </div>


                <div>
                  <span>录播主机序列号</span>
                  <div>
                    <Input disabled={this.state.disabled} style={{width: this.selectWidth}}
                           value={this.state.configs ? this.state.configs.other2.interact_live.serial_number : ""}
                           onChange={e => {
                             let val = e.target.value
                             let configs = this.state.configs
                             configs.other2.interact_live.serial_number = val
                             this.setState({
                               configs: configs
                             })
                           }}
                           placeholder="请输入录播主机序列号"
                    />
                  </div>
                </div>


                <div>
                  <span>录播主机名称</span>
                  <div>
                    <Input disabled={this.state.disabled} style={{width: this.selectWidth}}
                           value={this.state.configs ? this.state.configs.other2.interact_live.class_room_name : ""}
                           onChange={e => {
                             let val = e.target.value
                             let configs = this.state.configs
                             configs.other2.interact_live.class_room_name = val
                             this.setState({
                               configs: configs
                             })
                           }}
                           placeholder="请输入录播主机名称"
                    />
                  </div>
                </div>


                <div>
                  <span>录播主机公网IP</span>
                  <div>
                    <Input disabled={this.state.disabled} style={{width: this.selectWidth}}
                           value={this.state.configs ? this.state.configs.other2.interact_live.ip_address : ""}
                           onChange={e => {
                             let val = e.target.value
                             let configs = this.state.configs
                             configs.other2.interact_live.ip_address = val
                             this.setState({
                               configs: configs
                             })
                           }}
                           placeholder="请输入录播主机公网IP"
                    />
                  </div>
                </div>


                <div>
                  <span>资源平台IP</span>
                  <div>
                    <Input disabled={this.state.disabled} style={{width: this.selectWidth}}
                           value={this.state.configs ? this.state.configs.other2.interact_live.resource_platform_ip : ""}
                           onChange={e => {
                             let val = e.target.value
                             let configs = this.state.configs
                             configs.other2.interact_live.resource_platform_ip = val
                             this.setState({
                               configs: configs
                             })
                           }}
                           onBlur={() => {
                             if (this.state.configs.other2.interact_live.resource_platform_ip.trim() == "") {
                               let configs = this.state.configs
                               configs.other2.interact_live.resource_platform_ip = "58.67.222.35"
                               this.setState({configs})
                             }
                           }}
                           placeholder="默认值58.67.222.35"/>
                  </div>
                </div>


                <div>
                  <span>资源平台端口</span>
                  <div>
                    <Input disabled={this.state.disabled} style={{width: this.selectWidth}}
                           value={this.state.configs ? this.state.configs.other2.interact_live.resource_platform_port : ""}
                           onChange={e => {
                             let val = e.target.value
                             let configs = this.state.configs
                             configs.other2.interact_live.resource_platform_port = val
                             this.setState({
                               configs: configs
                             })
                           }}
                           onBlur={() => {
                             if (this.state.configs.other2.interact_live.resource_platform_port.trim() == "") {
                               let configs = this.state.configs
                               configs.other2.interact_live.resource_platform_port = "8080"
                               this.setState({configs})
                             }
                           }}
                           placeholder="默认值8080"/>
                  </div>
                </div>


                <div>
                  <span>FTP服务器</span>
                  <div>
                    <AutoComplete disabled={this.state.disabled}
                                  style={{width: this.selectWidth}}
                                  value={this.state.configs ? this.state.configs.other2.ftp.server : ""}
                                  onChange={val => {
                                    let configs = this.state.configs
                                    configs.other2.ftp.server = val
                                    this.setState({
                                      configs: configs,
                                      dataSource: {
                                        ftp_server:
                                          !val || val.indexOf('@') >= 0 ? [] : [
                                            `ftp://${val}`,
                                          ],
                                      }
                                    })
                                  }}
                                  dataSource={this.state.dataSource ? this.state.dataSource.ftp_server : []}
                                  onBlur={() => {
                                    if (this.state.configs.other2.ftp.server.trim() == "") {
                                      let configs = this.state.configs
                                      configs.other2.ftp.server = "ftp://58.67.222.35"
                                      this.setState({configs})

                                    }
                                  }}
                                  placeholder="默认值ftp://58.67.222.35"/>
                  </div>
                </div>


                <div>
                  <span>端口</span>
                  <div>
                    <Input disabled={this.state.disabled} style={{width: this.selectWidth}}
                           value={this.state.configs ? this.state.configs.other2.ftp.port : ""}
                           onChange={e => {
                             let val = e.target.value
                             let configs = this.state.configs
                             configs.other2.ftp.port = val
                             this.setState({
                               configs: configs
                             })
                           }}
                           onBlur={() => {
                             if (this.state.configs.other2.ftp.port.trim() == "") {
                               let configs = this.state.configs
                               configs.other2.ftp.port = "21"
                               this.setState({configs})
                             }
                           }}
                           placeholder="默认值21"/>
                  </div>
                </div>


                <div>
                  <span>用户名</span>
                  <div>
                    <Input disabled={this.state.disabled} style={{width: this.selectWidth}}
                           value={this.state.configs ? this.state.configs.other2.ftp.user : ""}
                           onChange={e => {
                             let val = e.target.value
                             let configs = this.state.configs
                             configs.other2.ftp.user = val
                             this.setState({
                               configs: configs
                             })
                           }}
                           onBlur={() => {
                             if (this.state.configs.other2.ftp.user.trim() == "") {
                               let configs = this.state.configs
                               configs.other2.ftp.user = "vision_ftp"
                               this.setState({configs})
                             }
                           }}
                           placeholder="默认值vision_ftp"/>
                  </div>
                </div>


                <div>
                  <span>密码</span>
                  <div>
                    <Input disabled={this.state.disabled} style={{width: this.selectWidth}}
                           value={this.state.configs ? this.state.configs.other2.ftp.password : ""}
                           onChange={e => {
                             let val = e.target.value
                             let configs = this.state.configs
                             configs.other2.ftp.password = val
                             this.setState({
                               configs: configs
                             })
                           }}
                           onBlur={() => {
                             if (this.state.configs.other2.ftp.password.trim() == "") {
                               let configs = this.state.configs
                               configs.other2.ftp.password = "vision_upload"
                               this.setState({configs})
                             }
                           }}
                           placeholder="默认值vision_upload"/>
                  </div>
                </div>


                <div>
                  <span>点播端口</span>
                  <div>
                    <Input disabled={this.state.disabled} style={{width: this.selectWidth}}
                           value={this.state.configs ? this.state.configs.other2.ftp.on_demand_port : ""}
                           onChange={e => {
                             let val = e.target.value
                             let configs = this.state.configs
                             configs.other2.ftp.on_demand_port = val
                             this.setState({
                               configs: configs
                             })
                           }}
                           onBlur={() => {
                             if (this.state.configs.other2.ftp.on_demand_port.trim() == "") {
                               let configs = this.state.configs
                               configs.other2.ftp.on_demand_port = "8085"
                               this.setState({configs})
                             }
                           }}
                           placeholder="默认值8085"
                    />
                  </div>
                </div>


              </div>
            </div>

          </TabPane>
        </Tabs>


        <div className={styles.setting} id={"misc"}>
          <div className={styles.title}>其它设置<a href={"#misc"} className={styles.anchor}>#</a>
          </div>
          <div className={styles.content}>
            <div>
              <span>监视器分辨率</span>
              <div>
                <Select disabled={this.state.disabled}
                        value={this.state.configs ? this.state.configs.main_screen.size_type + "" : ""}
                        style={{width: this.selectWidth}}
                        onChange={val => {
                          let configs = this.state.configs
                          configs.main_screen.size_type = val
                          this.setState({configs})
                        }}>
                  {this.state.configOptions ? Object.entries(this.state.configOptions.main_screen.size_type).map((entry, index) => (
                    <Option key={entry[1]}>{entry[0]}</Option>
                  )) : ""}
                </Select>
              </div>
            </div>

            <div>
              <span>默认开启自动导播功能</span>
              <div>
                <Switch disabled={this.state.disabled}
                        checked={this.state.configs ? this.state.configs.misc.auto_switch == "1" : false}
                        onChange={val => {
                          let configs = this.state.configs
                          configs.misc.auto_switch = val ? "1" : "0"
                          this.setState({configs})
                        }}
                />
              </div>
            </div>


            <div>
              <span>默认开启RTMP直播</span>
              <div>
                <Switch disabled={this.state.disabled}
                        checked={this.state.configs ? this.state.configs.misc.rtmp == "1" : false}
                        onChange={val => {
                          let configs = this.state.configs
                          configs.misc.rtmp = val ? "1" : "0"
                          this.setState({configs})
                        }}
                />
              </div>
            </div>


            {this.props.user && this.props.user.type == 1 ?
              <div>
                <span>格式化硬盘</span>
                <div>
                  <Popconfirm placement="right" title={"确认格式化整个硬盘？硬盘所有数据将销毁，此项操作不可逆，请谨慎选择"}
                              onConfirm={this.formatDisk}
                              okText="是" cancelText="否">
                    <Button disabled={this.state.disabled} type={"danger"}>格式化硬盘</Button>
                  </Popconfirm>
                </div>
              </div> : ""
            }


          </div>
        </div>


        {this.state.showControlAppManage === 1 ? (
          <div className={styles.setting} id={"appManage"}>
            <div className={styles.title}>应用管理面板控制设置（本面版中所有选项在更改后会立即生效）
              <a href={"#appManage"}
                 className={styles.anchor}>#</a>
            </div>
            <div className={styles.content}>
              <div>
                <span>是否开启应用管理控制面板（本控制面板）</span>
                <div>
                  <Switch disabled={this.state.disabled}
                          checked={this.state.showControlAppManage ? this.state.showControlAppManage == 1 : false}
                          onChange={val => {
                            val = val ? 1 : 0;
                            axios.get(window.serverUrl + "main.php", {
                              params: {
                                action: "setShowControlAppManage",
                                showControlAppManage: val
                              }
                            }).then(res => {
                              if (res.data.code) {
                                this.setState({showControlAppManage: val})
                                message.success(res.data.data)
                              } else {
                                message.error(res.data.data)
                              }
                            }).catch(e => console.log(e))
                          }}
                  />
                </div>
              </div>

              <div>
                <span>是否开启应用管理面板（应用管理标签页面）</span>
                <div>
                  <Switch disabled={this.state.disabled}
                          checked={this.props.isShowAppManage ? this.props.isShowAppManage == 1 : false}
                          onChange={val => {
                            val = val ? 1 : 0;
                            axios.get(window.serverUrl + "main.php", {
                              params: {
                                action: "setShowAppManage",
                                showAppManage: val
                              }
                            }).then(res => {
                              if (res.data.code) {
                                this.props.initIsShowAppManage(val)
                                message.success(res.data.data)
                              } else {
                                message.error("操作失败")
                              }
                            }).catch(e => console.log(e))
                          }}/>
                </div>
              </div>


              <div>
                <span>是否开启主页悬浮面板（监控页面中的悬浮面板）</span>
                <div>
                  <Switch disabled={this.state.disabled}
                          checked={this.state.mainPanel ? this.state.mainPanel.enabled == 1 : false}
                          onChange={val => {
                            val = val ? 1 : 0;
                            axios.get(window.serverUrl + "main.php", {
                              params: {
                                action: "setConfigValue",
                                configKey: "mainPanel",
                                val: val,
                                key: "enabled"
                              }
                            }).then(res => {
                              if (res.data.code) {
                                this.setState({
                                  mainPanel: {
                                    ...this.state.mainPanel,
                                    enabled: val
                                  }
                                })
                                message.success(res.data.data)
                              } else {
                                message.error(res.data.data)
                              }
                            }).catch(e => console.log(e))
                          }}/>
                </div>
              </div>

              <div>
                    <span>主页悬浮面板宽度
                    <Popover content={(
                      <div>支持单位有px、rem、em、vw、vh，不支持百分比（下同）</div>)} placement="right">
                    <Icon className={styles.icon} type="question-circle-o"/>
                    </Popover>
                    </span>
                <div>
                  <Input disabled={this.state.disabled}
                         style={{width: "110px", textAlign: "center"}}
                         onBlur={() => {
                           let width = this.state.mainPanel.width.trim();
                           if (width == "") {
                             width = "35rem"
                             this.setState({
                               mainPanel: {
                                 ...this.state.mainPanel,
                                 width
                               }
                             })
                           }
                           axios.get(window.serverUrl + "main.php", {
                             params: {
                               action: "setConfigValue",
                               configKey: "mainPanel", val: width,
                               key: "width"

                             }
                           }).then(res => {
                             if (res.data.code) {
                               message.success("操作成功")
                             } else {
                               message.error("操作失败");
                             }
                           }).catch(error => console.log(error));
                         }}
                         value={this.state.mainPanel ? this.state.mainPanel.width : ""}
                         onChange={node => this.setState({
                           mainPanel: {
                             ...this.state.mainPanel,
                             width: node.target.value
                           }
                         })}
                         placeholder="默认值35rem"/>
                </div>
              </div>


              <div>
                <span>主页悬浮面板高度</span>
                <div>
                  <Input disabled={this.state.disabled}
                         style={{width: "110px", textAlign: "center"}}
                         onBlur={() => {
                           let height = this.state.mainPanel.height.trim();
                           if (height == "") {
                             height = "80vh"
                             this.setState({
                               mainPanel: {
                                 ...this.state.mainPanel,
                                 height
                               }
                             })
                           }
                           axios.get(window.serverUrl + "main.php", {
                             params: {
                               action: "setConfigValue",
                               configKey: "mainPanel", val: height,
                               key: "height"

                             }
                           }).then(res => {
                             if (res.data.code) {
                               message.success("操作成功")
                             } else {
                               message.error("操作失败");
                             }
                           }).catch(error => console.log(error));
                         }}
                         value={this.state.mainPanel ? this.state.mainPanel.height : ""}
                         onChange={node => this.setState({
                           mainPanel: {
                             ...this.state.mainPanel,
                             height: node.target.value
                           }
                         })}
                         placeholder="默认值80vh"/>
                </div>
              </div>

              <div>
                <span>上传自定义页面压缩包</span>
                <div>
                  <Upload disabled={this.state.disabled} {...this.uploadProps}>
                    <Button>
                      <Icon type="upload"/>点击选择文件上传
                    </Button>
                  </Upload>
                </div>
              </div>
            </div>
          </div>

        ) : ""}


        <div className={styles.control}>
          <Button disabled={this.state.disabled}
                  onClick={this.fetchConfig}>放弃配置</Button>
          <Button disabled={this.state.disabled} type="primary"
                  onClick={this.handleSave}>保存配置</Button>
          <Popconfirm placement="right" title={"确认恢复默认配置？注意此操作不可逆"}
                      onConfirm={this.handleRestore}
                      okText="是" cancelText="否">
            <Button disabled={this.state.disabled} type={"danger"}
            >恢复默认配置</Button>
          </Popconfirm>
        </div>

      </div>


      <div style={{margin: "0 2rem", float: "right"}}>
        <Anchor>
          <Link href="#video" title="视频录制设置"/>
          <Link href="#audio" title="音频设置"/>
          <Link href="#serial" title="串口设置"/>
          <Link href="#camera" title="摄像头地址设置"/>
          <Link href="#rtmp" title=" RTMP&nbsp;直播设置"/>
          <Link href="#interact_live" title="互动直播设置"/>
          {/*<Link href="#main_screen" title="本地监视器设置"/>*/}
          <Link href="#misc" title="其他设置"/>
          {this.state.showControlAppManage === 1 ? (
            <Link href="#appManage" title="应用管理面板控制设置"/>
          ) : ""}
        </Anchor>
      </div>
    </div>
  }

  object2Array = obj => {
    let result = [];
    for (let k in obj) {
      result.push(obj[k])
    }
    return result
  }

  handleSave = () => {

    //判断摄像头设置是否相同
    if (!this.isAllDiff(this.object2Array(this.state.configs.camera))) {
      window.location.href = "/setting#camera";
      message.warn("摄像头控制中的所有地址取值必须不相同");
      return;
    }


    const hide = message.loading('保存配置中...', 0);
    this.setState({disabled: true});


    //初始化本地或远程互动直播设置
    let configs = this.state.configs;
    if (configs.interact_config == "1") {
      configs.other = JSON.parse(JSON.stringify(configs.other1));
    } else if (configs.interact_config == "2") {
      configs.other = JSON.parse(JSON.stringify(configs.other2));
    }
    configs.rtmp.server_url = configs.other.server_url;
    console.log(configs);

    axios.get(window.serverUrl + "main.php", {
      params: {
        action: "setConfig",
        configs: JSON.stringify(configs)
      }
    }).then(res => {

      this.setState({disabled: false});
      hide();

      if (res.data.code === 1) {
        message.success("操作成功")
      } else if (res.data.code === 0) {
        message.error(res.data.data)
      } else {
        message.error("操作失败，请稍后再试")
        console.log(res.data.data);
      }
    }).catch(error => console.log(error));

  }

  handleRestore = () => {
    const hide = message.loading('恢复默认配置中...', 0);
    this.setState({disabled: true})

    axios.get(window.serverUrl + "main.php", {
      params: {
        action: "reStoreDefault"
      }
    }).then(res => {
      this.setState({disabled: false});
      hide();
      if (res.data.code === 1) {
        this.fetchConfig();
        message.success("操作成功")
      } else if (res.data.code === 0) {
        message.error(res.data.data)
      } else {
        message.error("操作失败，请稍后再试")
        console.log(res.data.data);
      }
    }).catch(error => console.log(error));


  }


  formatDisk = () => {
    axios.get(window.serverUrl + "main.php?action=formatDisk").then(res => {
      if (res.data.code == 1) {
        message.success("操作成功");
      } else {
        message.error(res.data.data)
      }
    }).catch(e => console.log(e))
  }

  shouldComponentUpdate() {
    return true;
  }

  checkFileName = (name) => {
    let regex = /[<>\\/|:"*?\s]+/i;
    if (!regex.test(name)) {
      if (name.length > 80) {
        message.error("名字过长");
        return false;
      }
      return true;
    } else {
      message.error("文件目录名不能包括以下字符： / \\ * ? < > | 空格");
      return false;
    }

  }

  isAllDiff = arr => {
    if (!(arr instanceof Array)) {
      return true;
    }
    for (let i = 0; i < arr.length; ++i) {
      let val = arr[i];
      for (let j = (i + 1); j < arr.length; ++j) {
        if (val == arr[j]) {
          return false;
        }
      }
    }
    return true;
  }

}

const mapStateToProps = state => {
  return {
    user: state.user.user,
    isShowAppManage: state.app.isShowAppManage,
    activate: state.app.activate
  }
}


const mapDispatchToProps = dispatch => {
  return {
    userLogout: () => dispatch(userLogout()),
    setModule: module => dispatch(setCurrModule(module)),
    initIsShowAppManage: (isShowAppManage) => dispatch(initIsShowAppManage(isShowAppManage))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Setting)