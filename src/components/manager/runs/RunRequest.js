import React, {Component} from "react";

import {Descriptions, List} from "antd";

import "antd/es/descriptions/style/css";
import "antd/es/list/style/css";

import WorkflowListItem from "../WorkflowListItem";

class RunRequest extends Component {
    render() {
        const details = (this.props.run || {}).details || {};
        return (
            <Descriptions bordered>
                <Descriptions.Item label={"Parameters"} span={3}>
                    <pre style={{margin: 0}}>{
                        JSON.stringify(details.request.workflow_params, null, 4)
                    }</pre>
                </Descriptions.Item>
                <Descriptions.Item label={"Workflow Type"}>
                    {details.request.workflow_type}
                </Descriptions.Item>
                <Descriptions.Item label={"Workflow Type Version"}>
                    {details.request.workflow_type_version}
                </Descriptions.Item>
                <Descriptions.Item label={"Workflow URL"}>
                    <a href={details.request.workflow_url} target="_blank" rel="nofollow">
                        {details.request.workflow_url}
                    </a>
                </Descriptions.Item>
                <Descriptions.Item label="Workflow">
                    <List itemLayout="vertical">
                        <List.Item>
                            <WorkflowListItem workflow={details.request.tags.workflow_metadata}
                                              selectable={false}
                                              onClick={() => {}} />
                        </List.Item>
                    </List>
                </Descriptions.Item>
            </Descriptions>
        );
    }
}

export default RunRequest;
