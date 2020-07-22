import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {PageHeader, Skeleton, Typography} from "antd";
import "antd/es/page-header/style/css";
import "antd/es/skeleton/style/css";
import "antd/es/typography/style/css";

import {withBasePath} from "../../utils/url";

class ServiceDetail extends Component {
    render() {
        // TODO: 404
        const serviceInfo = this.props.serviceInfoByArtifact[this.props.match.params.artifact] || null;
        const chordServiceInfo = this.props.chordServicesByArtifact[this.props.match.params.artifact] || null;
        const loading = !(serviceInfo || chordServiceInfo);

        console.log(serviceInfo, chordServiceInfo, loading);

        return loading ? <Skeleton /> : <>
            <PageHeader title={serviceInfo.name}
                        onBack={() => this.props.history.push(withBasePath("dashboard"))}>
                <Typography.Header level={4}>Service Info</Typography.Header>
                <pre>{JSON.stringify(serviceInfo, null, 2)}</pre>
                <Typography.Header level={4}>CHORD Service Configuration</Typography.Header>
                <pre>{JSON.stringify(chordServiceInfo, null, 2)}</pre>
            </PageHeader>
        </>;
    }
}

ServiceDetail.propTypes = {
    serviceInfoByArtifact: PropTypes.objectOf(PropTypes.object),  // TODO
    chordServicesByArtifact: PropTypes.objectOf(PropTypes.object),  // TODO
};

const mapStateToProps = state => ({
    serviceInfoByArtifact: state.services.itemsByArtifact,
    chordServicesByArtifact: state.chordServices.itemsByArtifact,
});

export default connect(mapStateToProps)(ServiceDetail);
