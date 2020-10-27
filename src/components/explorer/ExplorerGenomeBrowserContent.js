import React, {Component, createRef} from "react";
import PropTypes from "prop-types";

import {Layout, Typography, Table, Divider} from "antd";
import "antd/es/layout/style/css";

import igv from "igv/js";

import {LAYOUT_CONTENT_STYLE} from "../../styles/layoutContent";

class ExplorerGenomeBrowserContent extends Component {
    constructor(props) {
        super(props);

        this.browser = null;
        this.igvContainer = createRef();
        this.igvOptions = this.igvOptions.bind(this);
        this.configureBrowser = this.configureBrowser.bind(this);
        this.getMatches = this.getMatches.bind(this);

        // Column configuration for match table
        this.columns = [
            {
                title: "Chromosome",
                dataIndex: "chromosome",
            },
            {
                title: "Start",
                dataIndex: "start",
            },
            {
                title: "End",
                dataIndex: "end",
            },
            {
                title: "Reference Bases",
                dataIndex: "ref",
            },
            {
                title: "Alternate Bases",
                dataIndex: "alt",
            },
            {
                title: "Action",
                render: (text, variant) => (<a onClick={() => this.changeLocus(variant)}>Show variant</a>)
            },
        ];
    }

    static formatMatchLocation(match) {
        return `chr${match.chromosome}:${match.start}-${match.end}`;
    }

    getMatches() {
        return ((this.props.results || {})[this.props.variantTable] || {}).matches || [];
    }

    igvOptions() {
        const matches = this.getMatches();
        return {
            genome: this.props.referenceGenome || "hg19",
            locus: matches
                ? ExplorerGenomeBrowserContent.formatMatchLocation(matches[0])
                : undefined,
            minimumBases: 40,
            tracks: [
                {
                    type: "variant",
                    sourceType: "bento",
                    format: "vcf",
                    variants: matches,
                    variantSetId: this.props.variantTable,
                    name: "Variant Search",
                    height: 100,
                    squishedCallHeight: 1,
                    expandedCallHeight: 10,
                    displayMode: "expanded",
                    visibilityWindow: 100,
                },
            ]
        };
    }

    configureBrowser(containerNode) {
        igv.createBrowser(containerNode, this.igvOptions()).then(browser => this.browser = browser);
    }

    componentDidMount() {
        this.configureBrowser(this.igvContainer.current
            || document.getElementById("igv-container"));
    }

    changeLocus(match) {
        if (!this.browser) return;
        this.browser.search(ExplorerGenomeBrowserContent.formatMatchLocation(match));
    }

    render() {
        return <Layout>
            <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                <Typography.Title level={4}>Variant Visualizer</Typography.Title>
                <div id="igv-container" />
                <Divider orientation="left">Match List</Divider>
                <Table
                    columns={this.columns}
                    dataSource={this.getMatches()}
                    pagination={{pageSize: 10}}
                    scroll={{y: 200}}
                />
            </Layout.Content>
        </Layout>;
    }
}

ExplorerGenomeBrowserContent.propTypes = {
    // TODO: Some system for standardizing/translating these
    referenceGenome: PropTypes.oneOf(["hg19", "hg37", "hg38"]),
    results: PropTypes.object,  // TODO: More specific
    variantTable: PropTypes.string,  // TODO: Is this the best system?
};

export default ExplorerGenomeBrowserContent;
