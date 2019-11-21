import React, {Component} from "react";
import {connect} from "react-redux";

import Run from "./Run";

class RunDetailContent extends Component {
    render() {
        return <Run run={this.props.runDetails[this.props.match.params.id] || null} />;
    }
}

const mapStateToProps = state => ({
    runDetails: state.runs.itemDetails
});

export default connect(mapStateToProps)(RunDetailContent);
