import React, {Component} from "react";
import {connect} from "react-redux";

import Run from "./Run";

class RunDetailContent extends Component {
    render() {
        return <Run run={this.props.runsByID[this.props.match.params.id] || null} />;
    }
}

const mapStateToProps = state => ({
    runsByID: state.runs.itemsByID
});

export default connect(mapStateToProps)(RunDetailContent);
