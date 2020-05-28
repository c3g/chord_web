import React, {Component} from "react";
import {connect} from "react-redux";

import {Card, Skeleton} from "antd";
import "antd/es/card/style/css";
import "antd/es/skeleton/style/css";

import {fetchIndividualIfNecessary} from "../../modules/metadata/actions";


const INDIVIDUAL_CARD_TABS = [
    {key: "overview", tab: "Overview"},
    {key: "biosamples", tab: "Biosamples"},
    {key: "experiments", tab: "Experiments"},  // TODO: Only if data type available / experiments present?
];


class ExplorerIndividualContent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedTab: "overview",
        };
    }

    componentDidMount() {
        // TODO: Fetch individual if necessary
        const individualID = this.props.match.params.individual || null;
        console.log(individualID);
        if (!individualID) return;
        this.props.fetchIndividual(individualID);
    }

    render() {
        const individualID = this.props.match.params.individual || null;
        const individualInfo = this.props.individuals[individualID] || {};

        if (!individualID || !individualInfo.data || individualInfo.isFetching) {
            // TODO: Nicer
            return <Skeleton />;
        }

        const individual = individualInfo.data;

        return <Card title={`Individual: ${individual.id}`}
                     tabList={INDIVIDUAL_CARD_TABS}
                     activeTabKey={this.state.selectedTab} />;
    }
}

const mapStateToProps = state => ({
    individuals: state.individuals.itemsByID,
});

const mapDispatchToProps = dispatch => ({
    fetchIndividual: individualID => dispatch(fetchIndividualIfNecessary(individualID)),
})

export default connect(mapStateToProps, mapDispatchToProps)(ExplorerIndividualContent);
