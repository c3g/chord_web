import React, {Component} from "react";
import {connect} from "react-redux";

import {Card, Layout, Skeleton} from "antd";
import "antd/es/card/style/css";
import "antd/es/layout/style/css";
import "antd/es/skeleton/style/css";

import {fetchIndividualIfNecessary} from "../../modules/metadata/actions";
import {LAYOUT_CONTENT_STYLE} from "../../styles/layoutContent";


const INDIVIDUAL_CARD_TABS = [
    {key: "overview", tab: "Overview"},
    {key: "biosamples", tab: "Biosamples"},
    {key: "experiments", tab: "Experiments"},  // TODO: Only if data type available / experiments present?
];


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

        return <Layout>
            <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                {(individual && !individualInfo.isFetching) ? (
                    <Card title={`Individual: ${individual.id}`}
                          tabList={INDIVIDUAL_CARD_TABS}
                          activeTabKey={this.state.selectedTab} />
                ) : <Skeleton />}
            </Layout.Content>
        </Layout>;
    }
}

const mapStateToProps = state => ({
    metadataService: state.services.metadataService,
    individuals: state.individuals.itemsByID,
});

const mapDispatchToProps = dispatch => ({
    fetchIndividual: individualID => dispatch(fetchIndividualIfNecessary(individualID)),
})

export default connect(mapStateToProps, mapDispatchToProps)(ExplorerIndividualContent);
