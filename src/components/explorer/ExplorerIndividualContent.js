import React, {Component} from "react";
import {connect} from "react-redux";
import {Redirect, Route, Switch} from "react-router-dom";

import {Layout, Menu, Skeleton} from "antd";
import "antd/es/layout/style/css";
import "antd/es/menu/style/css";
import "antd/es/skeleton/style/css";

import {fetchIndividualIfNecessary} from "../../modules/metadata/actions";
import {LAYOUT_CONTENT_STYLE} from "../../styles/layoutContent";
import {matchingMenuKeys, renderMenuItem} from "../../utils/menu";
import {urlPath, withBasePath} from "../../utils/url";

import SitePageHeader from "../SitePageHeader";
import IndividualOverview from "./IndividualOverview";


const withURLPrefix = (individual, page) => withBasePath(`data/explorer/individuals/:individual/${page}`);

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
            selectedTab: "overview",
        };
    }

    fetchIndividualData() {
        const individualID = this.props.match.params.individual || null;
        if (!individualID || !this.props.metadataService) return;
        this.props.fetchIndividual(individualID);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!prevProps.metadataService && this.props.metadataService) {
            // We loaded metadata service, so we can load individual data now
            this.fetchIndividualData();
        }
    }

    componentDidMount() {
        this.fetchIndividualData();
    }

    render() {
        const individualID = this.props.match.params.individual || null;
        const individualInfo = this.props.individuals[individualID] || {};
        const individual = individualInfo.data;

        const overviewUrl = withURLPrefix(individualID, "overview");
        const biosamplesUrl = withURLPrefix(individualID, "biosamples");
        const experimentsUrl = withURLPrefix(individualID, "experiments");
        const individualMenu = [
            {url: overviewUrl, style: {marginLeft: "4px"}, text: "Overview",},
            {url: biosamplesUrl, text: "Biosamples",},
            // TODO: Only if data type available / experiments present?
            {url: experimentsUrl, text: "Experiments"},
        ];

        const selectedKeys = this.props.nodeInfo
            ? matchingMenuKeys(individualMenu, urlPath(this.props.nodeInfo.CHORD_URL))
            : [];

        return <>
            <SitePageHeader title={(individual || {}).id || "Loading..."} withTabBar={true} onBack={() => {}} footer={
                <Menu mode="horizontal" style={MENU_STYLE} selectedKeys={selectedKeys}>
                    {individualMenu.map(renderMenuItem)}
                </Menu>
            } />
            <Layout>
                <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                    {(individual && !individualInfo.isFetching) ? <Switch>
                        <Route path={overviewUrl}><IndividualOverview individual={individual} /></Route>
                        <Route path={biosamplesUrl}><div /></Route>
                        <Route path={experimentsUrl}><div /></Route>
                        <Redirect to={overviewUrl} />
                    </Switch> : <Skeleton />}
                </Layout.Content>
            </Layout>
        </>;
    }
}

const mapStateToProps = state => ({
    nodeInfo: state.nodeInfo.data,
    metadataService: state.services.metadataService,
    individuals: state.individuals.itemsByID,
});

const mapDispatchToProps = dispatch => ({
    fetchIndividual: individualID => dispatch(fetchIndividualIfNecessary(individualID)),
})

export default connect(mapStateToProps, mapDispatchToProps)(ExplorerIndividualContent);
