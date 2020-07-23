import React, {Component, createRef} from "react";
import {connect} from "react-redux";
import fetch from "cross-fetch";

class ServiceLog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: ""
        };
        this.fetchLog = this.fetchLog.bind(this);
        this.containerDiv = createRef();
    }

    componentDidMount() {
        const artifact = this.props.match.params.artifact;
        const logName = this.props.match.params.log;
        const log = ((this.props.serviceLogs.itemsByArtifact[artifact] || {}).logs || {})[logName];

        this.fetchLog(log).catch(console.error);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const oldArtifact = prevProps.match.params.artifact;
        const oldLogName = prevProps.match.params.log;
        const artifact = this.props.match.params.artifact;
        const logName = this.props.match.params.log;

        if (oldArtifact !== artifact || oldLogName !== logName) {
            this.fetchLog(log).catch(console.error);
        }
    }

    async fetchLog(path) {
        const r = await fetch(path);
        if (r.ok) {
            const data = await r.text();
            this.setState({data}, () => {
                const div = this.containerDiv.current;
                div.scrollTop = div.scrollHeight;
            });
        } else {
            throw r;
        }
    }

    render() {
        return <div style={{maxHeight: "calc(100vh - 48px)", overflow: "auto"}} ref={this.containerDiv}>
            <pre>{this.state.data}</pre>
        </div>;
    }
}

const mapStateToProps = state => ({
    serviceLogs: state.logs.service,
    loadingAuthDependentData: state.auth.isFetchingDependentData,
});

export default connect(mapStateToProps)(ServiceLog);
