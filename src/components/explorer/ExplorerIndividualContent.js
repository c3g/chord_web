import React, {Component} from "react";
import {connect} from "react-redux";
import {Redirect, Route, Switch} from "react-router-dom";

import PropTypes from "prop-types";
import ReactRouterPropTypes from "react-router-prop-types/dist/index";

import {Layout, Menu, Skeleton} from "antd";
import "antd/es/layout/style/css";
import "antd/es/menu/style/css";
import "antd/es/skeleton/style/css";

import {fetchIndividualIfNecessary} from "../../modules/metadata/actions";
import {individualPropTypesShape, nodeInfoDataPropTypesShape} from "../../propTypes";
import {LAYOUT_CONTENT_STYLE} from "../../styles/layoutContent";
import {matchingMenuKeys, renderMenuItem} from "../../utils/menu";
import {urlPath, withBasePath} from "../../utils/url";

import SitePageHeader from "../SitePageHeader";
import IndividualOverview from "./IndividualOverview";
import IndividualBiosamples from "./IndividualBiosamples";


const withURLPrefix = (individual, page) => withBasePath(`data/explorer/individuals/${individual}/${page}`);

const MENU_STYLE = {
    marginLeft: "-24px",
    marginRight: "-24px",
    marginTop: "-12px"
};


class ExplorerIndividualContent extends Component {
    constructor(props) {
        super(props);

        this.fetchIndividualData = this.fetchIndividualData.bind(this);

        this.state = {
            backUrl: null,
            selectedTab: "overview",
        };
    }

    fetchIndividualData() {
        const individualID = this.props.match.params.individual || null;
        if (!individualID || !this.props.metadataService) return;
        this.props.fetchIndividualIfNecessary(individualID);
    }

    // noinspection JSCheckFunctionSignatures
    componentDidUpdate(prevProps) {
        if (!prevProps.metadataService && this.props.metadataService) {
            // We loaded metadata service, so we can load individual data now
            this.fetchIndividualData();
        }
    }

    componentDidMount() {
        const backUrl = (this.props.location.state || {}).backUrl;
        if (backUrl) this.setState({backUrl});
        this.fetchIndividualData();
    }

    render() {
        // TODO: Disease content - highlight what was found in search results?

        const individualID = this.props.match.params.individual || null;
        const individualInfo = this.props.individuals[individualID] || {};
        const individual = individualInfo.data;

        const overviewUrl = withURLPrefix(individualID, "overview");
        const biosamplesUrl = withURLPrefix(individualID, "biosamples");
        const individualMenu = [
            {url: overviewUrl, style: {marginLeft: "4px"}, text: "Overview",},
            {url: biosamplesUrl, text: "Biosamples & Experiments",},
        ];

        const selectedKeys = this.props.nodeInfo
            ? matchingMenuKeys(individualMenu, urlPath(this.props.nodeInfo.CHORD_URL))
            : [];

        return <>
            <SitePageHeader title={(individual || {}).id || "Loading..."}
                            withTabBar={true}
                            onBack={this.state.backUrl
                                ? (() => this.props.history.push(this.state.backUrl)) : undefined}
                            footer={
                                <Menu mode="horizontal" style={MENU_STYLE} selectedKeys={selectedKeys}>
                                    {individualMenu.map(renderMenuItem)}
                                </Menu>
                            } />
            <Layout>
                <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                    {(individual && !individualInfo.isFetching) ? <Switch>
                        <Route path={overviewUrl.replace(":", "\\:")}>
                            <IndividualOverview individual={individual} />
                        </Route>
                        <Route path={biosamplesUrl.replace(":", "\\:")}>
                            <IndividualBiosamples individual={individual} />
                        </Route>
                        <Redirect to={overviewUrl.replace(":", "\\:")} />
                    </Switch> : <Skeleton />}
                </Layout.Content>
            </Layout>
        </>;
    }
}

ExplorerIndividualContent.propTypes = {
    nodeInfo: nodeInfoDataPropTypesShape,
    metadataService: PropTypes.object,  // TODO
    individuals: PropTypes.objectOf(individualPropTypesShape),

    fetchIndividualIfNecessary: PropTypes.func,

    location: ReactRouterPropTypes.location.isRequired,
    match: ReactRouterPropTypes.match.isRequired,
};

const mapStateToProps = state => ({
    nodeInfo: state.nodeInfo.data,
    metadataService: state.services.metadataService,
    individuals: state.individuals.itemsByID,
});

export default connect(mapStateToProps, {fetchIndividualIfNecessary})(ExplorerIndividualContent);
