import React, {Component, createRef} from "react";

import {Layout, Typography, Table, Divider} from "antd";
import "antd/es/layout/style/css";

import igv from "igv/js";
import variants from "../../utils/features2.json";

const ID_VARIANT = "71438220-d640-42f2-998d-e9c81adac710";

import {LAYOUT_CONTENT_STYLE} from "../../styles/layoutContent";

class ExplorerGenomeBrowserContent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            results: variants.results[ID_VARIANT],
            locus: null,
            search_id: ID_VARIANT,
            matches: [],
        };

        this.browser = null;
        this.igvContainer = createRef();
        this.igvOptions = this.igvOptions.bind(this);
        this.configureBrowser = this.configureBrowser.bind(this);

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

    componentWillMount() {
        // Configure the locus depending on the variants found
        if (!this.state.results) {
            this.setState({matches: []});
            return;
        }

        this.setState({
            matches: this.state.results.matches,
        });
        const first_match = this.state.results.matches[0];
        this.setState({locus: `chr${first_match.chromosome}:${first_match.start}-${first_match.end}`});
    }

    igvOptions() {
        return {
            genome: "hg19",  // TODO: Based on dataset
            locus: this.state.locus,
            minimumBases: 40,
            tracks: [
                {
                    type: "variant",
                    sourceType: "bento",
                    format: "vcf",
                    variants: this.state.matches,
                    variantSetId: this.state.search_id,
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

    changeLocus(variant) {
        const newLocus = `chr${variant.chromosome}:${variant.start}-${variant.end}`;
        this.setState({locus: newLocus});
        if (this.browser) this.browser.search(newLocus);
    }

    render() {
        return <Layout>
            <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                <Typography.Title level={4}> Variant Visualizer</Typography.Title>
                <div id="igv-container" />
                <Divider orientation="left"> Match List </Divider>
                <Table
                    columns={this.columns}
                    dataSource={this.state.matches}
                    pagination={{pageSize: 10}}
                    scroll={{y: 200}}
                />
            </Layout.Content>
        </Layout>;
    }
}

export default ExplorerGenomeBrowserContent;
