import React from "react";
import {InputNumber} from "antd";

export default class IpConfig extends React.Component {

    render() {
        this.addrArray=this.props.value==="无"?["0","0","0","0"]:this.props.value.split(".");
        return (
            <div>
                {this.props.editable
                    ? (<div>
                            <InputNumber defaultValue={0} min={0} max={255}
                                         value={this.addrArray[0]}
                                         onChange={this.handleChange.bind(this, 0)}/>.
                            <InputNumber defaultValue={0} min={0} max={255}
                                         value={this.addrArray[1]}
                                         onChange={this.handleChange.bind(this, 1)}/>.
                            <InputNumber defaultValue={0} min={0} max={255}
                                         value={this.addrArray[2]}
                                         onChange={this.handleChange.bind(this, 2)}/>.
                            <InputNumber defaultValue={0} min={0} max={255}
                                         value={this.addrArray[3]}
                                         onChange={this.handleChange.bind(this, 3)}/>
                        </div>
                    )
                    : this.props.value
                }
            </div>
        );
    }

    handleChange = (index, val) => {
        if (val >= 0 && val <= 255) {

            let addrArray = this.addrArray
            let addr = "";
            for (let i = 0; i < 4; i++) {
                if (index === i) {
                    addr += val;
                    addrArray[i] = val
                } else {
                    addr += addrArray[i]
                }
                if (i !== 3) {
                    addr += "."
                }
            }

            this.props.onChange(addr)
        }

    }

}
