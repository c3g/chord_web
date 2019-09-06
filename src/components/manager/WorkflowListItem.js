import React, {Component} from "react";
import PropTypes from "prop-types";

import {Icon, List, Tag} from "antd";

import "antd/es/icon/style/css";
import "antd/es/list/style/css";
import "antd/es/tag/style/css";

const TYPE_TAG_DISPLAY = {
    file: {
        color: "volcano",
        icon: "file"
    },
    enum: {
        color: "blue",
        icon: "menu"
    },
    number: { // TODO: Break into int and float?
        color: "green",
        icon: "number"
    },
    string: {
        color: "purple",
        icon: "font-size"
    }
};

class WorkflowListItem extends Component {
    render() {
        const typeTags = this.props.workflow.data_types.map(dt => <Tag key={dt}>{dt}</Tag>);

        const inputs = this.props.workflow.inputs.map(i =>
            <Tag key={i.id} color={TYPE_TAG_DISPLAY[i.type].color}>
                <Icon type={TYPE_TAG_DISPLAY[i.type].icon} /> {i.type === "file" ? i.extensions.join(" / ") : i.id}
            </Tag>
        );

        const inputExtensions = {};
        this.props.workflow.inputs.forEach(i => {
            if (i.type !== "file") return;
            inputExtensions[i.id] = i.extensions[0];  // TODO: What to do with more than one?
        });

        const outputs = this.props.workflow.outputs.map(o => {
            const inputIDs = o.matchAll(/{(.*)}/);
            let formattedOutput = o;

            [...inputIDs].forEach(([_, id]) =>
                formattedOutput = formattedOutput.replace(`{${id}}`, inputExtensions[id]));

            return (
                <Tag color="volcano" key={o}>
                    <Icon type="file" /> {formattedOutput}
                </Tag>
            );
        });

        // TODO: Assembly ID should output too

        return (
            <>
                <List.Item.Meta
                    title={<span>{typeTags} {this.props.workflow.name}</span>}
                    description={this.props.workflow.description || ""} />

                <div style={{marginBottom: "12px"}}>
                    <span style={{fontWeight: "bold", marginRight: "1em"}}>Inputs:</span>
                    {inputs}
                </div>

                <div>
                    <span style={{fontWeight: "bold", marginRight: "1em"}}>Outputs:</span>
                    {outputs}
                </div>
            </>
        );
    }
}

WorkflowListItem.propTypes = {
    workflow: PropTypes.shape({
        name: PropTypes.string,
        description: PropTypes.string,
        data_types: PropTypes.arrayOf(PropTypes.string),
        inputs: PropTypes.arrayOf(PropTypes.shape({
            type: PropTypes.string,
            id: PropTypes.string,
            extensions: PropTypes.arrayOf(PropTypes.string)  // File type only
        })),
        outputs: PropTypes.arrayOf(PropTypes.string)  // TODO: This is going to change
    })
};

export default WorkflowListItem;
