import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Layout, Skeleton, Typography} from "antd";
import "antd/es/layout/style/css";
import "antd/es/skeleton/style/css";
import "antd/es/typography/style/css";

import SitePageHeader from "../SitePageHeader";

import {withBasePath} from "../../utils/url";
import {LAYOUT_CONTENT_STYLE} from "../../styles/layoutContent";

class ServiceDetail extends Component {
    render() {
        // TODO: 404
        const serviceInfo = this.props.serviceInfoByArtifact[this.props.match.params.artifact] || null;
        const bentoServiceInfo = this.props.bentoServicesByArtifact[this.props.match.params.artifact] || null;
        const loading = !(serviceInfo && bentoServiceInfo);

        return loading ? <Skeleton /> : <>
            <SitePageHeader title={serviceInfo.name}
                        onBack={() => this.props.history.push(withBasePath("dashboard"))} />
            <Layout>
                <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                    <Typography.Title level={4}>Service Info</Typography.Title>
                    <pre>{JSON.stringify(serviceInfo, null, 2)}</pre>
                    <Typography.Title level={4}>Bento Service Configuration</Typography.Title>
                    <pre>{JSON.stringify(bentoServiceInfo, null, 2)}</pre>
                </Layout.Content>
            </Layout>
        </>;
    }
}

ServiceDetail.propTypes = {
    serviceInfoByArtifact: PropTypes.objectOf(PropTypes.object),  // TODO
    bentoServicesByArtifact: PropTypes.objectOf(PropTypes.object),  // TODO
};

const mapStateToProps = state => ({
    serviceInfoByArtifact: state.services.itemsByArtifact,
    bentoServicesByArtifact: state.chordServices.itemsByArtifact,
});

export default connect(mapStateToProps)(ServiceDetail);
