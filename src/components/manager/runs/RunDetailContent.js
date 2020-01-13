import React, {Component} from "react";
import {connect} from "react-redux";

import {Skeleton} from "antd";
import "antd/es/skeleton/style/css";

import Run from "./Run";

class RunDetailContent extends Component {
    render() {
        // TODO: 404
        const run = this.props.runsByID[this.props.match.params.id] || null;
        const loading = run === null || (run || {details: null}).details === null;
        return loading
            ? <div style={{marginTop: "12px", marginLeft: "24px", marginRight: "24px"}}><Skeleton /></div>
            : <Run run={run}
                   tab={this.props.match.params.tab}
                   onChangeTab={key => this.props.history.push(`/data/manager/runs/${run.run_id}/${key}`)}
                   onBack={() => this.props.history.push("/data/manager/runs")} />;
    }
}

const mapStateToProps = state => ({
    runsByID: state.runs.itemsByID
});

export default connect(mapStateToProps)(RunDetailContent);
