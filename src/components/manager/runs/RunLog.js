import React, {Component} from "react";
import PropTypes from "prop-types";

import fetch from "cross-fetch";

import {Descriptions, Skeleton} from "antd";

import "antd/es/descriptions/style/css";
import "antd/es/skeleton/style/css";

const resourceLoadError = resource => `An error was encountered while loading ${resource}`;

class RunLog extends Component {
    constructor(props) {
        super(props);

        this.loadResource = this.loadResource.bind(this);

        this.state = {
            stdout: null,
            stderr: null
        };
    }

    async componentDidMount() {
        await Promise.all([
            this.loadResource("stdout", this.props.details.run_log.stdout),
            this.loadResource("stderr", this.props.details.run_log.stderr)
        ]);
    }

    async loadResource(resource, url) {
        try {
            // TODO: Auth / proper url stuff
            const r = await fetch(url);
            this.setState({[resource]: r.ok ? await r.text() : resourceLoadError(resource)});
        } catch (e) {
            console.error(e);
            this.setState({[resource]: resourceLoadError(resource)});
        }
    }

    render() {
        const details = this.props.details || {};
        return (
            <Descriptions bordered style={{overflow: "auto"}}>
                <Descriptions.Item label="Command" span={3}>
                    <span style={{fontFamily: "monospace", fontSize: "12px"}}>{details.run_log.cmd}</span>
                </Descriptions.Item>
                <Descriptions.Item label="Name" span={2}>
                    {details.run_log.name}
                </Descriptions.Item>
                <Descriptions.Item label="Exit Code" span={1}>
                    {details.run_log.exit_code === null ? "N/A" : details.run_log.exit_code}
                </Descriptions.Item>
                <Descriptions.Item label={<span style={{fontFamily: "monospace"}}>stdout</span>} span={3}>
                    {this.state.stdout !== null ? <pre style={{fontSize: "12px", whiteSpace: "break-spaces"}}>{
                        this.state.stdout}</pre> : <Skeleton paragraph={false} />}
                </Descriptions.Item>
                <Descriptions.Item label={<span style={{fontFamily: "monospace"}}>stderr</span>} span={3}>
                    {this.state.stderr !== null ? <pre style={{fontSize: "12px", whiteSpace: "break-spaces"}}>{
                        this.state.stderr}</pre> : <Skeleton paragraph={false} />}
                </Descriptions.Item>
            </Descriptions>
        );
    }
}

RunLog.propTypes = {
    details: PropTypes.shape({
        run_log: PropTypes.shape({
            exit_code: PropTypes.number,
            stdout: PropTypes.string,
            stderr: PropTypes.string
        })
    })
};

export default RunLog;
