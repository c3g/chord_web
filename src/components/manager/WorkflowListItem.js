import React, {Component} from "react";
import PropTypes from "prop-types";

import {List, Tag} from "antd";
import "antd/es/list/style/css";
import "antd/es/tag/style/css";

import {FileOutlined, FontSizeOutlined, MenuOutlined, NumberOutlined, RightOutlined} from "@ant-design/icons";

import {nop, workflowPropTypesShape} from "../../utils";

const TYPE_TAG_DISPLAY = {
    file: {
        color: "volcano",
        icon: <FileOutlined />
    },
    enum: {
        color: "blue",
        icon: <MenuOutlined />
    },
    number: { // TODO: Break into int and float?
        color: "green",
        icon: <NumberOutlined />
    },
    string: {
        color: "purple",
        icon: <FontSizeOutlined />
    }
};

const ioTagWithType = (key, ioType, content) => {
    const tagDisplay = TYPE_TAG_DISPLAY[ioType.replace("[]", "")];
    return <Tag key={key} color={tagDisplay.color}>{tagDisplay.icon} {content}</Tag>;
};

class WorkflowListItem extends Component {
    render() {
        const typeTag = <Tag key={this.props.workflow.data_type}>{this.props.workflow.data_type}</Tag>;

        const inputs = this.props.workflow.inputs.map(i =>
            ioTagWithType(i.id, i.type, (i.type.startsWith("file") ? i.extensions.join(" / ") : i.id)
                + (i.type.endsWith("[]") ? " array" : "")));

        const inputExtensions = Object.fromEntries(this.props.workflow.inputs
            .filter(i => i.type.startsWith("file"))
            .map(i => [i.id, i.extensions[0]]));  // TODO: What to do with more than one?

        const outputs = this.props.workflow.outputs.map(o => {
            let formattedOutput = o.value;

            [...o.value.matchAll(/{(.*)}/g)].forEach(([_, id]) => {
                formattedOutput = formattedOutput.replace(`{${id}}`, {
                    ...inputExtensions,
                    "": o.hasOwnProperty("map_from_input") ? inputExtensions[o.map_from_input] : undefined
                }[id]);
            });

            return ioTagWithType(o.id, o.type, formattedOutput + (o.type.endsWith("[]") ? " array" : ""));
        });

        return (
            <List.Item>
                <List.Item.Meta
                    title={
                        this.props.selectable
                            ? <a onClick={() => (this.props.onClick || nop)()}>
                                {typeTag} {this.props.workflow.name}
                                <RightOutlined style={{marginLeft: "0.3rem"}} /></a>
                            : <span>{typeTag} {this.props.workflow.name}</span>}
                    description={this.props.workflow.description || ""} />

                <div style={{marginBottom: "12px"}}>
                    <span style={{fontWeight: "bold", marginRight: "1em"}}>Inputs:</span>
                    {inputs}
                </div>

                <div>
                    <span style={{fontWeight: "bold", marginRight: "1em"}}>Outputs:</span>
                    {outputs}
                </div>
            </List.Item>
        );
    }
}

WorkflowListItem.propTypes = {
    workflow: workflowPropTypesShape,
    selectable: PropTypes.bool,
    onClick: PropTypes.func
};

export default WorkflowListItem;
